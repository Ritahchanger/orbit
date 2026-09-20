const mongoose = require("mongoose");

const invoiceItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, index: true },

    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },

    // What generated this invoice — an online order, a POS sale, or a
    // manually created (standalone/B2B) bill.
    type: {
      type: String,
      enum: ["order", "sale", "standalone"],
      required: true,
      index: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      default: null,
    },

    customer: {
      name: { type: String, required: true, trim: true },
      email: { type: String, trim: true, lowercase: true, default: "" },
      phone: { type: String, trim: true, default: "" },
      address: { type: String, trim: true, default: "" },
    },

    items: {
      type: [invoiceItemSchema],
      required: true,
      validate: [
        (arr) => Array.isArray(arr) && arr.length > 0,
        "Invoice must have at least one item",
      ],
    },

    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    shippingFee: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "KES" },

    status: {
      type: String,
      enum: ["draft", "issued", "paid", "overdue", "cancelled", "void"],
      default: "issued",
      index: true,
    },

    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date, default: null },
    paidAt: { type: Date, default: null },

    notes: { type: String, trim: true, default: "" },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Invoice numbers only need to be unique per business.
invoiceSchema.index({ businessId: 1, invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ businessId: 1, createdAt: -1 });
invoiceSchema.index({ order: 1 }, { sparse: true });
invoiceSchema.index({ transaction: 1 }, { sparse: true });

invoiceSchema.pre("validate", function (next) {
  if (!this.invoiceNumber) {
    this.invoiceNumber =
      "INV-" +
      Date.now().toString().slice(-8) +
      "-" +
      Math.random().toString(36).substring(2, 6).toUpperCase();
  }
  next();
});

invoiceSchema.virtual("isOverdue").get(function () {
  return (
    this.status === "issued" && !!this.dueDate && this.dueDate < new Date()
  );
});

module.exports = mongoose.model("Invoice", invoiceSchema);
