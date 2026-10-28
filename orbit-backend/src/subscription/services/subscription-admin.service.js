// services/subscription-admin.service.js
// Billing operations for the platform console: listing subscriptions and
// payments across businesses, extending trials, changing plans and
// recording payments taken outside the app. Not exposed to business users.
const mongoose = require("mongoose");
const CustomError = require("../../errors/CustomError");
const { PlanTemplate, Subscription, Payment } = require("../models/subscription.model");

const DAY_MS = 24 * 60 * 60 * 1000;
// Same period lengths as sign-up (business.service register)
const CYCLE_DAYS = { monthly: 30, annual: 365 };
const STATUSES = ["trialing", "active", "past_due", "cancelled", "expired"];
const PLANS = ["starter", "professional", "enterprise"];
const CYCLES = ["monthly", "annual"];
// Ways a payment taken outside the app can be recorded from the console
const RECORDABLE_METHODS = ["mpesa", "bank_transfer", "manual"];
const PAYMENT_STATUSES = ["pending", "successful", "failed", "refunded"];
const MAX_LIMIT = 100;

const SORTS = {
  renewal: { currentPeriodEnd: 1 },
  trial: { trialEndDate: 1 },
  newest: { createdAt: -1 },
  price: { pricePaid: -1 },
};

// Nothing moves subscriptions between statuses on a schedule, so "needs
// attention" is worked out from the dates
const attentionFilter = (kind, now = new Date()) => {
  switch (kind) {
    case "trial_ending":
      return { status: "trialing", trialEndDate: { $gte: now, $lte: new Date(now.getTime() + 7 * DAY_MS) } };
    case "trial_ended":
      return { status: "trialing", trialEndDate: { $lt: now } };
    case "overdue":
      return { $or: [{ status: "past_due" }, { status: "active", currentPeriodEnd: { $lt: now } }] };
    default:
      return null;
  }
};

const pageOf = (filters, defaultLimit = 20) => {
  const page = Math.max(parseInt(filters.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(filters.limit, 10) || defaultLimit, 1), MAX_LIMIT);
  return { page, limit, skip: (page - 1) * limit };
};

const flagsFor = (sub, now = new Date()) => ({
  trialEndingSoon:
    sub.status === "trialing" &&
    sub.trialEndDate >= now &&
    sub.trialEndDate <= new Date(now.getTime() + 7 * DAY_MS),
  trialEnded: sub.status === "trialing" && sub.trialEndDate < now,
  overdue: sub.status === "past_due" || (sub.status === "active" && sub.currentPeriodEnd < now),
});

/**
 * filters: { status, plan, cycle, attention, businessIds, sort, page, limit }
 * businessIds restricts to those businesses (used by the search).
 */
const listSubscriptions = async (filters = {}) => {
  const { page, limit, skip } = pageOf(filters);
  const now = new Date();

  const query = {};
  if (STATUSES.includes(filters.status)) query.status = filters.status;
  if (PLANS.includes(filters.plan)) query.planSlug = filters.plan;
  if (CYCLES.includes(filters.cycle)) query.billingCycle = filters.cycle;
  if (filters.businessIds) query.business = { $in: filters.businessIds };
  const attention = attentionFilter(filters.attention, now);
  if (attention) Object.assign(query, attention);

  const [subscriptions, total, byStatus, trialEnding, trialEnded, overdue] = await Promise.all([
    Subscription.find(query)
      .populate("business", "businessName businessEmail status")
      .select(
        "business planSlug billingCycle status pricePaid currency trialEndDate currentPeriodStart currentPeriodEnd nextBillingDate lastPaymentDate autoRenew limits createdAt",
      )
      .sort(SORTS[filters.sort] || SORTS.renewal)
      .skip(skip)
      .limit(limit)
      .lean(),
    Subscription.countDocuments(query),
    Subscription.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Subscription.countDocuments(attentionFilter("trial_ending", now)),
    Subscription.countDocuments(attentionFilter("trial_ended", now)),
    Subscription.countDocuments(attentionFilter("overdue", now)),
  ]);

  return {
    subscriptions: subscriptions.map((s) => ({ ...s, flags: flagsFor(s, now) })),
    counts: {
      byStatus: Object.fromEntries(STATUSES.map((s) => [s, byStatus.find((r) => r._id === s)?.count || 0])),
      attention: { trial_ending: trialEnding, trial_ended: trialEnded, overdue },
    },
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

/** filters: { status, method, businessIds, page, limit } */
const listPayments = async (filters = {}) => {
  const { page, limit, skip } = pageOf(filters, 25);

  const query = {};
  if (PAYMENT_STATUSES.includes(filters.status)) query.status = filters.status;
  if (["mpesa", "stripe", "paypal", "bank_transfer", "manual"].includes(filters.method)) {
    query.paymentMethod = filters.method;
  }
  if (filters.businessIds) query.business = { $in: filters.businessIds };

  const [payments, total] = await Promise.all([
    Payment.find(query)
      .populate("business", "businessName")
      .select("business amount currency paymentMethod status transactionRef mpesaReceiptNumber description billingPeriodStart billingPeriodEnd metadata createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Payment.countDocuments(query),
  ]);

  return { payments, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const listPlans = () =>
  PlanTemplate.find({ isActive: true })
    .select("name slug monthlyPrice annualPrice currency maxStores maxUsers trialDays")
    .sort({ monthlyPrice: 1 })
    .lean();

const subscriptionOf = async (businessId, { session } = {}) => {
  const sub = await Subscription.findOne({ business: businessId }).session(session || null);
  if (!sub) throw CustomError.notFound("This business has no subscription");
  return sub;
};

const extendTrial = async (businessId, days) => {
  const extraDays = parseInt(days, 10);
  if (!Number.isInteger(extraDays) || extraDays < 1 || extraDays > 90) {
    throw CustomError.badRequest("Extend a trial by 1 to 90 days");
  }

  const sub = await subscriptionOf(businessId);
  if (sub.status !== "trialing") {
    throw CustomError.badRequest("Only a subscription that is on trial can have its trial extended");
  }

  // An already-ended trial is extended from today, not from its old end date
  const previousEnd = sub.trialEndDate;
  const from = Math.max(previousEnd?.getTime() || 0, Date.now());
  sub.trialEndDate = new Date(from + extraDays * DAY_MS);
  await sub.save();

  return { previousEnd, trialEndDate: sub.trialEndDate, days: extraDays };
};

const changePlan = async (businessId, { planSlug, billingCycle }) => {
  if (!CYCLES.includes(billingCycle)) {
    throw CustomError.badRequest("Billing cycle must be monthly or annual");
  }
  const plan = await PlanTemplate.findOne({ slug: planSlug, isActive: true });
  if (!plan) throw CustomError.badRequest("Choose an active plan");

  const sub = await subscriptionOf(businessId);
  if (sub.planSlug === plan.slug && sub.billingCycle === billingCycle) {
    throw CustomError.badRequest("The business is already on this plan and billing cycle");
  }

  const previous = { plan: sub.planSlug, billingCycle: sub.billingCycle, price: sub.pricePaid };
  sub.plan = plan._id;
  sub.planSlug = plan.slug;
  sub.billingCycle = billingCycle;
  // The price the business is billed from now on; the current period's
  // dates are left as they are
  sub.pricePaid = billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice;
  sub.currency = plan.currency || sub.currency;
  sub.limits = { maxStores: plan.maxStores, maxUsers: plan.maxUsers, maxBusinesses: plan.maxBusinesses };
  await sub.save();

  return {
    previous,
    current: { plan: sub.planSlug, billingCycle: sub.billingCycle, price: sub.pricePaid, currency: sub.currency },
  };
};

/**
 * Records a payment taken outside the app (M-Pesa, bank transfer, cash) and
 * starts the next billing period: from the end of the current paid period if
 * it's still running, otherwise from today. Payment and subscription change
 * are saved together.
 */
const recordPayment = async (businessId, { amount, method, reference, note }, recordedBy) => {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0 || value > 100000000) {
    throw CustomError.badRequest("Enter a payment amount greater than zero");
  }
  if (!RECORDABLE_METHODS.includes(method)) {
    throw CustomError.badRequest(`Payment method must be one of: ${RECORDABLE_METHODS.join(", ")}`);
  }
  const ref = String(reference || "").trim().slice(0, 100);
  if (method !== "manual" && !ref) {
    throw CustomError.badRequest("Enter the M-Pesa receipt or bank reference");
  }
  if (ref && (await Payment.exists({ transactionRef: ref }))) {
    throw CustomError.conflict(`A payment with reference ${ref} is already recorded`);
  }

  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const sub = await subscriptionOf(businessId, { session });
      if (sub.status === "cancelled") {
        throw CustomError.badRequest("This subscription is cancelled; payments can't be recorded against it");
      }

      const now = new Date();
      const periodStart =
        sub.status === "active" && sub.currentPeriodEnd > now ? sub.currentPeriodEnd : now;
      const periodEnd = new Date(periodStart.getTime() + CYCLE_DAYS[sub.billingCycle] * DAY_MS);

      const [payment] = await Payment.create(
        [
          {
            business: sub.business,
            subscription: sub._id,
            amount: value,
            currency: sub.currency,
            paymentMethod: method,
            status: "successful",
            transactionRef: ref,
            mpesaReceiptNumber: method === "mpesa" ? ref : "",
            description:
              String(note || "").trim().slice(0, 300) ||
              `${sub.planSlug} plan, ${sub.billingCycle} (recorded in the platform console)`,
            billingPeriodStart: periodStart,
            billingPeriodEnd: periodEnd,
            metadata: { source: "platform-console", recordedBy },
          },
        ],
        { session },
      );

      sub.status = "active";
      sub.isTrialUsed = true;
      sub.currentPeriodStart = periodStart;
      sub.currentPeriodEnd = periodEnd;
      sub.nextBillingDate = periodEnd;
      sub.lastPaymentRef = ref;
      sub.lastPaymentDate = now;
      await sub.save({ session });

      result = {
        payment: payment.toObject(),
        subscription: { status: sub.status, currentPeriodStart: periodStart, currentPeriodEnd: periodEnd },
      };
    });
    return result;
  } finally {
    await session.endSession();
  }
};

module.exports = {
  listSubscriptions,
  listPayments,
  listPlans,
  extendTrial,
  changePlan,
  recordPayment,
  RECORDABLE_METHODS,
};
