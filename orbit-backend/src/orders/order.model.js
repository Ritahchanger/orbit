const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    sku: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true },

    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },

    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      default: null,
    },

    customer: {
      name: { type: String, required: true, trim: true },
      email: { type: String, trim: true, lowercase: true },
      phone: { type: String, required: true, trim: true },
    },

    shippingAddress: {
      address: { type: String, trim: true, default: "" },
      city: { type: String, trim: true, default: "" },
      country: { type: String, trim: true, default: "" },
      postalCode: { type: String, trim: true, default: "" },
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: [
        (arr) => Array.isArray(arr) && arr.length > 0,
        "Order must have at least one item",
      ],
    },

    subtotal: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "KES" },

    paymentMethod: {
      type: String,
      enum: ["cash", "mpesa", "card", "paybill", "other"],
      default: "other",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
      index: true,
    },

    source: {
      type: String,
      enum: ["storefront"],
      default: "storefront",
    },

    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      default: null,
    },

    notes: { type: String, trim: true, default: "" },

    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

orderSchema.index({ businessId: 1, createdAt: -1 });
orderSchema.index({ businessId: 1, status: 1 });

// Mirrors the transactionId generation convention used by Transaction/Business.
orderSchema.pre("validate", function (next) {
  if (!this.orderNumber) {
    this.orderNumber =
      "ORD-" +
      Date.now().toString().slice(-8) +
      "-" +
      Math.random().toString(36).substring(2, 6).toUpperCase();
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
