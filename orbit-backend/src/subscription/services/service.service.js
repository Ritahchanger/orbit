// services/subscription.service.js
const mongoose = require("mongoose");
const {
  PlanTemplate,
  Subscription,
  Payment,
} = require("../model/subscription.model");
const Business = require("../../business/models/business.model");

class SubscriptionService {
  // ══════════════════════════════════════════════════════
  // PLAN TEMPLATE CRUD
  // ══════════════════════════════════════════════════════

  async getAllPlans(filters = {}) {
    const {
      isActive,
      search,
      sortBy = "monthlyPrice",
      order = "asc",
    } = filters;

    const query = {};
    if (isActive !== undefined) query.isActive = isActive === "true";
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    const sort = { [sortBy]: order === "desc" ? -1 : 1 };

    const plans = await PlanTemplate.find(query).sort(sort);
    return plans;
  }

  async getPlanById(id) {
    const plan = await PlanTemplate.findById(id);
    if (!plan) throw new Error("Plan not found");
    return plan;
  }

  async getPlanBySlug(slug) {
    const plan = await PlanTemplate.findOne({ slug });
    if (!plan) throw new Error(`Plan '${slug}' not found`);
    return plan;
  }

  async createPlan(data) {
    const existing = await PlanTemplate.findOne({
      $or: [{ slug: data.slug }, { name: data.name }],
    });
    if (existing)
      throw new Error(`Plan with name/slug '${data.name}' already exists`);

    const plan = await PlanTemplate.create(data);
    return plan;
  }

  async updatePlan(id, data) {
    const allowedFields = [
      "name",
      "monthlyPrice",
      "annualPrice",
      "annualDiscountPercent",
      "currency",
      "maxStores",
      "maxUsers",
      "maxBusinesses",
      "features",
      "isPopular",
      "isActive",
      "trialDays",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (data[field] !== undefined) updates[field] = data[field];
    });

    // Check name uniqueness if changing name
    if (updates.name) {
      const conflict = await PlanTemplate.findOne({
        name: updates.name,
        _id: { $ne: id },
      });
      if (conflict)
        throw new Error(`Plan name '${updates.name}' is already taken`);
    }

    const plan = await PlanTemplate.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true },
    );
    if (!plan) throw new Error("Plan not found");
    return plan;
  }

  async deletePlan(id) {
    const plan = await PlanTemplate.findById(id);
    if (!plan) throw new Error("Plan not found");

    // Check if any active subscriptions use this plan
    const activeCount = await Subscription.countDocuments({
      plan: id,
      status: { $in: ["active", "trialing"] },
    });
    if (activeCount > 0) {
      throw new Error(
        `Cannot delete plan — ${activeCount} active subscription(s) are using it. Deactivate it instead.`,
      );
    }

    await PlanTemplate.findByIdAndDelete(id);
    return { deleted: true, planId: id };
  }

  // ══════════════════════════════════════════════════════
  // SUBSCRIPTION CRUD
  // ══════════════════════════════════════════════════════

  async getAllSubscriptions(filters = {}) {
    const {
      status,
      planSlug,
      billingCycle,
      search,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
    } = filters;

    const query = {};
    if (status) query.status = status;
    if (planSlug) query.planSlug = planSlug;
    if (billingCycle) query.billingCycle = billingCycle;

    const sort = { [sortBy]: order === "desc" ? -1 : 1 };
    const skip = (Number(page) - 1) * Number(limit);

    let dbQuery = Subscription.find(query)
      .populate({
        path: "business",
        select: "businessName businessEmail city status subscriptionPlan",
        ...(search && {
          match: {
            $or: [
              { businessName: { $regex: search, $options: "i" } },
              { businessEmail: { $regex: search, $options: "i" } },
            ],
          },
        }),
      })
      .populate("plan", "name slug monthlyPrice annualPrice currency")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const [subscriptions, total] = await Promise.all([
      dbQuery,
      Subscription.countDocuments(query),
    ]);

    // If search applied, filter out nulls (non-matching populated businesses)
    const results = search
      ? subscriptions.filter((s) => s.business !== null)
      : subscriptions;

    return {
      subscriptions: results,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async getSubscriptionById(id) {
    const sub = await Subscription.findById(id)
      .populate("business", "businessName businessEmail city status")
      .populate("plan", "name slug monthlyPrice annualPrice currency features");

    if (!sub) throw new Error("Subscription not found");
    return sub;
  }

  async getSubscriptionByBusiness(businessId) {
    const sub = await Subscription.findOne({ business: businessId }).populate(
      "plan",
      "name slug monthlyPrice annualPrice currency features maxStores maxUsers",
    );

    if (!sub) throw new Error("No subscription found for this business");
    return sub;
  }

  async createSubscription(data) {
    const { businessId, planId, planSlug, billingCycle, pricePaid } = data;

    // Validate business exists
    const business = await Business.findById(businessId);
    if (!business) throw new Error("Business not found");

    // Validate plan exists
    const plan = await PlanTemplate.findById(planId);
    if (!plan) throw new Error("Plan not found");

    // Check no existing subscription
    const existing = await Subscription.findOne({ business: businessId });
    if (existing)
      throw new Error(
        "Business already has a subscription — update it instead",
      );

    const isAnnual = billingCycle === "annual";
    const periodEnd = new Date(
      Date.now() + (isAnnual ? 365 : 30) * 24 * 60 * 60 * 1000,
    );

    const subscription = await Subscription.create({
      business: businessId,
      plan: planId,
      planSlug: planSlug || plan.slug,
      billingCycle,
      status: data.status || "trialing",
      pricePaid: pricePaid ?? (isAnnual ? plan.annualPrice : plan.monthlyPrice),
      currency: plan.currency || "KES",
      currentPeriodStart: new Date(),
      currentPeriodEnd: periodEnd,
      nextBillingDate: periodEnd,
      limits: {
        maxStores: plan.maxStores,
        maxUsers: plan.maxUsers,
        maxBusinesses: plan.maxBusinesses,
      },
    });

    // Link subscription to business
    await Business.findByIdAndUpdate(businessId, {
      subscription: subscription._id,
      subscriptionPlan: plan.slug,
      paymentMethod: billingCycle,
    });

    return subscription;
  }

  async updateSubscription(id, data) {
    const allowedFields = [
      "planSlug",
      "billingCycle",
      "status",
      "pricePaid",
      "currentPeriodStart",
      "currentPeriodEnd",
      "nextBillingDate",
      "autoRenew",
      "cancelledAt",
      "cancellationReason",
      "lastPaymentRef",
      "lastPaymentDate",
      "limits",
    ];

    const sub = await Subscription.findById(id);
    if (!sub) throw new Error("Subscription not found");

    const updates = {};
    allowedFields.forEach((field) => {
      if (data[field] !== undefined) updates[field] = data[field];
    });

    // If upgrading/downgrading plan, update limits snapshot
    if (data.planId) {
      const plan = await PlanTemplate.findById(data.planId);
      if (!plan) throw new Error("Plan not found");

      updates.plan = data.planId;
      updates.planSlug = plan.slug;
      updates.limits = {
        maxStores: plan.maxStores,
        maxUsers: plan.maxUsers,
        maxBusinesses: plan.maxBusinesses,
      };

      // Also update denormalized field on business
      await Business.findByIdAndUpdate(sub.business, {
        subscriptionPlan: plan.slug,
      });
    }

    // Auto-set cancelledAt when cancelling
    if (updates.status === "cancelled" && !updates.cancelledAt) {
      updates.cancelledAt = new Date();
    }

    const updated = await Subscription.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true },
    ).populate("plan", "name slug monthlyPrice annualPrice currency");

    return updated;
  }

  async cancelSubscription(id, reason = "") {
    const sub = await Subscription.findById(id);
    if (!sub) throw new Error("Subscription not found");

    if (sub.status === "cancelled")
      throw new Error("Subscription is already cancelled");

    const updated = await Subscription.findByIdAndUpdate(
      id,
      {
        $set: {
          status: "cancelled",
          cancelledAt: new Date(),
          cancellationReason: reason,
          autoRenew: false,
        },
      },
      { new: true },
    );

    return updated;
  }

  async deleteSubscription(id) {
    const sub = await Subscription.findById(id);
    if (!sub) throw new Error("Subscription not found");

    if (["active", "trialing"].includes(sub.status)) {
      throw new Error("Cannot delete an active subscription — cancel it first");
    }

    // Remove subscription ref from business
    await Business.findByIdAndUpdate(sub.business, {
      $unset: { subscription: "" },
    });

    await Subscription.findByIdAndDelete(id);
    return { deleted: true, subscriptionId: id };
  }

  // ══════════════════════════════════════════════════════
  // PAYMENT CRUD
  // ══════════════════════════════════════════════════════

  async getAllPayments(filters = {}) {
    const {
      status,
      paymentMethod,
      businessId,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
    } = filters;

    const query = {};
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (businessId) query.business = businessId;

    const sort = { [sortBy]: order === "desc" ? -1 : 1 };
    const skip = (Number(page) - 1) * Number(limit);

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate("business", "businessName businessEmail")
        .populate("subscription", "planSlug billingCycle status")
        .populate("paidBy", "firstName lastName email")
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Payment.countDocuments(query),
    ]);

    return {
      payments,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async getPaymentById(id) {
    const payment = await Payment.findById(id)
      .populate("business", "businessName businessEmail")
      .populate("subscription", "planSlug billingCycle status")
      .populate("paidBy", "firstName lastName email");

    if (!payment) throw new Error("Payment not found");
    return payment;
  }

  async createPayment(data) {
    const { businessId, subscriptionId, amount, paymentMethod, paidBy } = data;

    const [business, subscription] = await Promise.all([
      Business.findById(businessId),
      Subscription.findById(subscriptionId),
    ]);

    if (!business) throw new Error("Business not found");
    if (!subscription) throw new Error("Subscription not found");

    const payment = await Payment.create({
      business: businessId,
      subscription: subscriptionId,
      paidBy: paidBy || null,
      amount,
      currency: data.currency || "KES",
      paymentMethod,
      status: data.status || "pending",
      transactionRef: data.transactionRef || "",
      mpesaReceiptNumber: data.mpesaReceiptNumber || "",
      description: data.description || "",
      billingPeriodStart: data.billingPeriodStart || null,
      billingPeriodEnd: data.billingPeriodEnd || null,
      metadata: data.metadata || {},
    });

    // If payment is successful, update subscription's last payment tracking
    if (payment.status === "successful") {
      await Subscription.findByIdAndUpdate(subscriptionId, {
        $set: {
          lastPaymentRef: payment.transactionRef,
          lastPaymentDate: new Date(),
        },
      });
    }

    return payment;
  }

  async updatePayment(id, data) {
    const allowedFields = [
      "status",
      "transactionRef",
      "mpesaReceiptNumber",
      "description",
      "metadata",
    ];

    const payment = await Payment.findById(id);
    if (!payment) throw new Error("Payment not found");

    const updates = {};
    allowedFields.forEach((field) => {
      if (data[field] !== undefined) updates[field] = data[field];
    });

    const updated = await Payment.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true },
    );

    // If marking as successful, sync subscription
    if (updates.status === "successful") {
      await Subscription.findByIdAndUpdate(payment.subscription, {
        $set: {
          lastPaymentRef: updated.transactionRef,
          lastPaymentDate: new Date(),
          status: "active",
        },
      });
    }

    return updated;
  }

  async deletePayment(id) {
    const payment = await Payment.findById(id);
    if (!payment) throw new Error("Payment not found");

    if (payment.status === "successful") {
      throw new Error(
        "Cannot delete a successful payment — it is part of the financial record",
      );
    }

    await Payment.findByIdAndDelete(id);
    return { deleted: true, paymentId: id };
  }
}

module.exports = new SubscriptionService();
