const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: [true, "Business name is required"],
      trim: true,
      maxlength: [100, "Business name cannot exceed 100 characters"],
    },

    businessType: {
      type: String,
      required: [true, "Business type is required"],
      trim: true,
    },

    registrationNumber: {
      type: String,
      required: [true, "Registration number is required"],
      trim: true,
      uppercase: true,
    },

    taxId: {
      type: String,
      trim: true,
      default: null,
    },

    businessEmail: {
      type: String,
      required: [true, "Business email is required"],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },

    businessPhone: {
      type: String,
      required: [true, "Business phone is required"],
      trim: true,
      match: [/^\+?[\d\s\-()]+$/, "Please enter a valid phone number"],
    },

    // ── Location ─────────────────────────────────────────────

    businessAddress: {
      type: String,
      required: [true, "Business address is required"],
      trim: true,
    },

    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },

    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
      default: "Kenya",
    },

    postalCode: {
      type: String,
      trim: true,
      default: "",
    },

    // ── Optional Info ────────────────────────────────────────

    website: {
      type: String,
      trim: true,
      default: "",
    },

    employeeCount: {
      type: String,
      enum: ["1-10", "11-50", "51-200", "201-500", "500+", ""],
      default: "",
    },

    yearEstablished: {
      type: Number,
      min: [1900, "Year cannot be before 1900"],
      max: [new Date().getFullYear(), "Year cannot be in the future"],
      default: null,
    },

    businessDescription: {
      type: String,
      required: [true, "Business description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },

    businessLogo: {
      type: String,
      default: "",
    },

    // ── Ownership ────────────────────────────────────────────

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ── Subscription (Single Source of Truth) ────────────────

    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
    },

    // ── Status ───────────────────────────────────────────────

    status: {
      type: String,
      enum: ["pending", "active", "suspended", "cancelled"],
      default: "pending",
      index: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    // ── Suspension ───────────────────────────────────────────

    isSuspended: {
      type: Boolean,
      default: false,
      index: true,
    },

    suspendedAt: {
      type: Date,
      default: null,
    },

    suspensionReason: {
      type: String,
      trim: true,
      default: "",
    },

    // ── Business Identifier (Public Safe ID) ─────────────────

    businessCode: {
      type: String,
      unique: true,
      uppercase: true,
      index: true,
    },

    // ── Soft Delete ──────────────────────────────────────────

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    // ── Settings ─────────────────────────────────────────────

    settings: {
      currency: { type: String, default: "KES" },
      timezone: { type: String, default: "Africa/Nairobi" },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

// ── Indexes ─────────────────────────────────────────────────

// Unique but allow reuse after soft delete
businessSchema.index(
  { businessEmail: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);

businessSchema.index(
  { registrationNumber: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);

// Query performance
businessSchema.index({ status: 1, isVerified: 1 });
businessSchema.index({ owner: 1, status: 1 });
businessSchema.index({ createdAt: -1 });

// ── Virtuals ────────────────────────────────────────────────

businessSchema.virtual("isActive").get(function () {
  return this.status === "active" && this.isVerified && !this.isSuspended;
});

// ── Hooks ───────────────────────────────────────────────────

// Auto-generate businessCode
businessSchema.pre("save", function (next) {
  if (!this.businessCode) {
    this.businessCode =
      "BIZ-" + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

// ── Statics ─────────────────────────────────────────────────

businessSchema.statics.findActive = function () {
  return this.find({
    status: "active",
    isVerified: true,
    isSuspended: false,
    isDeleted: false,
  });
};

businessSchema.statics.findByOwner = function (userId) {
  return this.find({ owner: userId, isDeleted: false });
};

module.exports = mongoose.model("Business", businessSchema);
