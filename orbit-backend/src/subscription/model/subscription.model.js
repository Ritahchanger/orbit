// models/subscription/subscription.model.js
const mongoose = require("mongoose");

// ── Plan Template ─────────────────────────────────────────────────────────────

const planTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Plan name is required"],
      unique: true,
      trim: true,
      enum: ["Starter", "Professional", "Enterprise"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      enum: ["starter", "professional", "enterprise"],
    },
    monthlyPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    annualPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    annualDiscountPercent: {
      type: Number,
      default: 20,
    },
    currency: {
      type: String,
      default: "KES",
      uppercase: true,
      trim: true,
    },
    maxStores: {
      type: Number,
      required: true,
      default: 2,
      // -1 = unlimited
    },
    maxUsers: {
      type: Number,
      required: true,
      default: 5,
    },
    maxBusinesses: {
      type: Number,
      required: true,
      default: 1,
    },
    features: {
      type: [String],
      default: [],
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    trialDays: {
      type: Number,
      default: 14,
    },
  },
  { timestamps: true },
);

// ── Subscription ──────────────────────────────────────────────────────────────

const subscriptionSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      unique: true,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlanTemplate",
      required: true,
    },
    planSlug: {
      type: String,
      required: true,
      enum: ["starter", "professional", "enterprise"],
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "annual"],
      required: true,
      default: "monthly",
    },
    status: {
      type: String,
      enum: ["trialing", "active", "past_due", "cancelled", "expired"],
      default: "trialing",
      index: true,
    },

    // Price snapshot at time of purchase
    pricePaid: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "KES",
      uppercase: true,
    },

    // Trial
    trialStartDate: {
      type: Date,
      default: Date.now,
    },
    trialEndDate: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
    isTrialUsed: {
      type: Boolean,
      default: false,
    },

    // Billing period
    currentPeriodStart: {
      type: Date,
      default: Date.now,
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancellationReason: {
      type: String,
      trim: true,
      default: "",
    },

    // Payment tracking
    lastPaymentRef: {
      type: String,
      default: "",
    },
    lastPaymentDate: {
      type: Date,
      default: null,
    },
    nextBillingDate: {
      type: Date,
      default: null,
    },

    // Limits snapshot so mid-cycle plan changes don't affect current period
    limits: {
      maxStores: { type: Number, default: 2 },
      maxUsers: { type: Number, default: 5 },
      maxBusinesses: { type: Number, default: 1 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  },
);

// ── Payment History ───────────────────────────────────────────────────────────

const paymentSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "KES",
      uppercase: true,
    },
    paymentMethod: {
      type: String,
      enum: ["mpesa", "stripe", "paypal", "bank_transfer", "manual"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "successful", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    transactionRef: {
      type: String,
      trim: true,
      default: "",
    },
    mpesaReceiptNumber: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    billingPeriodStart: {
      type: Date,
      default: null,
    },
    billingPeriodEnd: {
      type: Date,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

// ── Indexes ───────────────────────────────────────────────────────────────────

subscriptionSchema.index({ business: 1 });
subscriptionSchema.index({ currentPeriodEnd: 1 }); // renewal cron
subscriptionSchema.index({ nextBillingDate: 1 }); // billing cron

paymentSchema.index({ business: 1 });
paymentSchema.index({ subscription: 1 });
paymentSchema.index({ transactionRef: 1 });
paymentSchema.index({ createdAt: -1 });

planTemplateSchema.index({ slug: 1 });
planTemplateSchema.index({ isActive: 1 });

// ── Virtuals ──────────────────────────────────────────────────────────────────

subscriptionSchema.virtual("isActive").get(function () {
  return (
    ["active", "trialing"].includes(this.status) &&
    this.currentPeriodEnd > new Date()
  );
});

subscriptionSchema.virtual("daysUntilExpiry").get(function () {
  const diff = this.currentPeriodEnd - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

subscriptionSchema.virtual("isExpiringSoon").get(function () {
  return this.daysUntilExpiry <= 7 && this.daysUntilExpiry > 0;
});

// ── Statics ───────────────────────────────────────────────────────────────────

subscriptionSchema.statics.findExpiring = function (withinDays = 7) {
  const cutoff = new Date(Date.now() + withinDays * 24 * 60 * 60 * 1000);
  return this.find({
    status: { $in: ["active", "trialing"] },
    currentPeriodEnd: { $lte: cutoff },
    autoRenew: false,
  });
};

subscriptionSchema.statics.findDueForRenewal = function () {
  return this.find({
    status: "active",
    autoRenew: true,
    nextBillingDate: { $lte: new Date() },
  });
};

// ── Models ────────────────────────────────────────────────────────────────────

const PlanTemplate = mongoose.model("PlanTemplate", planTemplateSchema);
const Subscription = mongoose.model("Subscription", subscriptionSchema);
const Payment = mongoose.model("Payment", paymentSchema);

module.exports = { PlanTemplate, Subscription, Payment };
