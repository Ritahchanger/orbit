// services/business.service.js
const Business = require("../models/business.model");
const User = require("../../user/user.model");
const {
  PlanTemplate,
  Subscription,
} = require("../../subscription/model/subscription.model");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

class BusinessService {
  // ── Register new business + superadmin + subscription ──────────────────────
  async register(data) {
    const {
      businessName,
      businessType,
      registrationNumber,
      taxId,
      businessEmail,
      businessPhone,
      businessAddress,
      city,
      country,
      postalCode,
      website,
      employeeCount,
      yearEstablished,
      businessDescription,
      numberOfStores,
      subscriptionPlan,
      paymentMethod,
      adminFirstName,
      adminLastName,
      adminEmail,
      adminPhone,
      adminUsername,
      adminPassword,
    } = data;

    // Check duplicates
    const [existingEmail, existingRegNo, existingAdminEmail, existingUsername] =
      await Promise.all([
        Business.findOne({ businessEmail }),
        Business.findOne({
          registrationNumber: registrationNumber.toUpperCase(),
        }),
        User.findOne({ email: adminEmail }),
        User.findOne({ username: adminUsername }),
      ]);

    if (existingEmail)
      throw new Error("A business with this email already exists");
    if (existingRegNo)
      throw new Error(
        "A business with this registration number already exists",
      );
    if (existingAdminEmail)
      throw new Error("An account with this admin email already exists");
    if (existingUsername) throw new Error("This username is already taken");

    // Find plan first — fail early before creating anything
    const plan = await PlanTemplate.findOne({
      slug: subscriptionPlan || "professional",
    });
    if (!plan) throw new Error("Invalid subscription plan selected");

    let user, business, subscription;

    try {
      // 1. Hash + create user
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      user = await User.create({
        firstName: adminFirstName,
        lastName: adminLastName,
        email: adminEmail.toLowerCase(),
        phoneNo: adminPhone,
        password: hashedPassword,
        role: "superadmin",
        canAccessAllStores: true,
      });

      // 2. Create business
      business = await Business.create({
        businessName,
        businessType,
        registrationNumber,
        taxId,
        businessEmail,
        businessPhone,
        businessAddress,
        city,
        country,
        postalCode,
        website,
        employeeCount,
        yearEstablished,
        businessDescription,
        numberOfStores,
        subscriptionPlan: subscriptionPlan || "professional",
        paymentMethod: paymentMethod || "monthly",
        owner: user._id,
      });

      // 3. Calculate billing period
      const periodEnd =
        paymentMethod === "annual"
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      // 4. Create subscription
      subscription = await Subscription.create({
        business: business._id,
        plan: plan._id,
        planSlug: plan.slug,
        billingCycle: paymentMethod || "monthly",
        pricePaid:
          paymentMethod === "annual" ? plan.annualPrice : plan.monthlyPrice,
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
        nextBillingDate: periodEnd,
        limits: {
          maxStores: plan.maxStores,
          maxUsers: plan.maxUsers,
          maxBusinesses: plan.maxBusinesses,
        },
      });

      // 5. Link subscription to business
      business.subscription = subscription._id;
      await business.save();

      return { business, user, subscription };
    } catch (error) {
      // Manual cleanup — delete in reverse order
      if (subscription?._id)
        await Subscription.deleteOne({ _id: subscription._id });
      if (business?._id) await Business.deleteOne({ _id: business._id });
      if (user?._id) await User.deleteOne({ _id: user._id });
      throw error;
    }
  }

  // ── Get all businesses ──────────────────────────────────────────────────────
  async getAll(filters = {}) {
    const {
      status,
      isVerified,
      subscriptionPlan,
      search,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
    } = filters;

    const query = {};

    if (status) query.status = status;
    if (isVerified !== undefined) query.isVerified = isVerified;
    if (subscriptionPlan) query.subscriptionPlan = subscriptionPlan;

    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: "i" } },
        { businessEmail: { $regex: search, $options: "i" } },
        { registrationNumber: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === "asc" ? 1 : -1;

    const [businesses, total] = await Promise.all([
      Business.find(query)
        .populate("owner", "firstName lastName email phoneNo role")
        .populate(
          "subscription",
          "status planSlug billingCycle currentPeriodEnd daysUntilExpiry",
        )
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(Number(limit)),
      Business.countDocuments(query),
    ]);

    return {
      businesses,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ── Get single business by ID ───────────────────────────────────────────────
  async getById(id) {
    const business = await Business.findById(id)
      .populate("owner", "firstName lastName email phoneNo role lastLoginAt")
      .populate(
        "subscription",
        "status planSlug billingCycle pricePaid currency currentPeriodStart currentPeriodEnd nextBillingDate autoRenew limits",
      );

    if (!business) throw new Error("Business not found");
    return business;
  }

  // ── Get business by owner (user ID) ────────────────────────────────────────
  async getByOwner(userId) {
    const business = await Business.findOne({ owner: userId })
      .populate("owner", "firstName lastName email phoneNo")
      .populate(
        "subscription",
        "status planSlug billingCycle currentPeriodEnd limits",
      );

    if (!business) throw new Error("No business found for this user");
    return business;
  }

  // ── Update business ─────────────────────────────────────────────────────────
  async update(id, data) {
    const business = await Business.findById(id);
    if (!business) throw new Error("Business not found");

    // Fields that are safe to update
    const allowedFields = [
      "businessName",
      "businessType",
      "taxId",
      "businessPhone",
      "businessAddress",
      "city",
      "country",
      "postalCode",
      "website",
      "employeeCount",
      "yearEstablished",
      "businessDescription",
      "numberOfStores",
      "businessLogo",
    ];

    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        business[field] = data[field];
      }
    });

    // Email change — check it's not taken
    if (data.businessEmail && data.businessEmail !== business.businessEmail) {
      const existing = await Business.findOne({
        businessEmail: data.businessEmail,
      });
      if (existing) throw new Error("This business email is already in use");
      business.businessEmail = data.businessEmail.toLowerCase();
    }

    await business.save();
    return business;
  }

  // ── Update business status (verify, suspend, activate) ─────────────────────
  async updateStatus(id, status, reason = "") {
    const business = await Business.findById(id);
    if (!business) throw new Error("Business not found");

    const validTransitions = {
      pending: ["active", "cancelled"],
      active: ["suspended", "cancelled"],
      suspended: ["active", "cancelled"],
      cancelled: [],
    };

    if (!validTransitions[business.status].includes(status)) {
      throw new Error(
        `Cannot transition from "${business.status}" to "${status}"`,
      );
    }

    business.status = status;

    if (status === "active" && !business.isVerified) {
      business.isVerified = true;
      business.verifiedAt = new Date();
    }

    if (status === "suspended") {
      business.isSuspended = true;
      business.suspendedAt = new Date();
      business.suspensionReason = reason;
    }

    if (status === "active" && business.isSuspended) {
      business.isSuspended = false;
      business.suspendedAt = null;
      business.suspensionReason = "";
    }

    await business.save();
    return business;
  }

  // ── Delete business ─────────────────────────────────────────────────────────
  async delete(id) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const business = await Business.findById(id).session(session);
      if (!business) throw new Error("Business not found");

      // Also clean up subscription and owner user
      await Subscription.deleteOne({ business: id }).session(session);
      await User.deleteOne({ _id: business.owner }).session(session);
      await business.deleteOne({ session });

      await session.commitTransaction();
      session.endSession();

      return {
        success: true,
        message: "Business and associated data deleted successfully",
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}

module.exports = new BusinessService();
