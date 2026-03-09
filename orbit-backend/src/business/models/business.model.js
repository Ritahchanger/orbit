const mongoose = require("mongoose");
const businessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Business name is required"],
      trim: true,
      maxlength: [200, "Business name cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Business email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true },
      zipCode: { type: String, trim: true },
    },
    website: {
      type: String,
      trim: true,
    },
    logoUrl: {
      type: String,
      trim: true,
    },
    settings: {
      currency: { type: String, default: "KES" },
      timezone: { type: String, default: "Africa/Nairobi" },
      taxPercentage: { type: Number, default: 0 },
      enablePOS: { type: Boolean, default: true },
      enableEcommerce: { type: Boolean, default: true },
      allowMultipleUsers: { type: Boolean, default: true },
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // the main admin/owner
      required: true,
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // employees, managers, cashiers
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    plan: {
      type: String,
      enum: ["free", "basic", "pro", "enterprise"],
      default: "free",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);
// Indexes
businessSchema.index({ slug: 1 });
businessSchema.index({ email: 1 });
businessSchema.index({ ownerId: 1 });
businessSchema.index({ status: 1 });
// Virtual for total users
businessSchema.virtual("totalUsers").get(function () {
  return this.users ? this.users.length : 0;
});
// Pre-save middleware to generate slug
businessSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }
  this.updatedAt = new Date();
  next();
});
const Business = mongoose.model("Business", businessSchema);
module.exports = Business;
