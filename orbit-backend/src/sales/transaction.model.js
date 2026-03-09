const mongoose = require("mongoose");
const TransactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      sparse: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    customerName: {
      type: String,
      trim: true,
    },
    customerPhone: {
      type: String,
      trim: true,
    },
    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    saleIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sale",
      },
    ],
    itemsCount: {
      type: Number,
      default: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    totalProfit: {
      type: Number,
      required: true,
    },
    amountGiven: {
      type: Number,
      min: 0,
      default: 0,
    },
    change: {
      type: Number,
      min: 0,
      default: 0,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["cash", "mpesa", "card", "paybill", "installment", "other"],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "partial", "paid", "failed", "refunded"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled", "refunded"],
      default: "pending",
    },
    refunds: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Refund",
        },
      ],
      default: undefined,
    },
    refundedAmount: {
      type: Number,
      min: 0,
      default: undefined,
    },
    refundStatus: {
      type: String,
      enum: ["none", "partial", "full"],
      default: undefined,
    },
    lastRefundDate: {
      type: Date,
      default: undefined,
    },
    mpesaCheckoutId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    mpesaReceipt: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    mpesaPhone: {
      type: String,
      trim: true,
    },
    mpesaAmount: {
      type: Number,
      min: 0,
    },
    mpesaTransactionDate: {
      type: String,
    },
    mpesaMerchantRequestId: {
      type: String,
      sparse: true,
    },
    mpesaResultCode: {
      type: String,
    },
    mpesaResultDesc: {
      type: String,
    },
    clientId: {
      type: String,
      sparse: true,
    },
    notes: String,
    soldBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ============ SAFE REFUND METHODS ============
// ⚠️ These methods ONLY work if the fields exist - no automatic creation ⚠️

/**
 * Add a refund to a transaction
 * @param {ObjectId} refundId - The refund document ID
 * @param {Number} amount - The refund amount
 * @returns {Promise} - Saved transaction
 */
TransactionSchema.methods.addRefund = async function (refundId, amount) {
  if (!this.schema.paths.refunds) {
    console.warn("⚠️ Transaction schema doesn't have refunds field");
    return this;
  }
  if (!this.refunds) {
    this.refunds = [];
  }
  this.refunds.push(refundId);
  this.refundedAmount = (this.refundedAmount || 0) + amount;
  if (this.schema.paths.refundStatus) {
    this.refundStatus = this.refundedAmount >= this.total ? "full" : "partial";
  }
  this.lastRefundDate = new Date();
  if (this.refundedAmount >= this.total) {
    this.status = "refunded";
    this.paymentStatus = "refunded";
  }
  return this.save();
};

/**
 * Check if transaction can be refunded
 * @param {Number} amount - Optional specific amount to check
 * @returns {Boolean} - Whether refund is possible
 */
TransactionSchema.methods.canRefund = function (amount = null) {
  if (this.status === "refunded") return false;
  if (this.paymentStatus === "failed") return false;
  if (this.paymentStatus === "pending") return false;
  if (!this.refundedAmount) return true;
  const refundAmount = amount || this.total;
  const currentRefunded = this.refundedAmount || 0;
  return currentRefunded + refundAmount <= this.total;
};

/**
 * Get available refund amount
 * @returns {Number} - Amount available for refund
 */
TransactionSchema.virtual("availableRefundAmount").get(function () {
  if (!this.refundedAmount) return this.total;
  return Math.max(0, this.total - this.refundedAmount);
});

TransactionSchema.pre("save", function (next) {
  if (
    !this.transactionId &&
    this.status === "completed" &&
    this.paymentStatus === "paid"
  ) {
    let prefix = "TXN";
    if (this.paymentMethod === "mpesa") {
      prefix = "MPT";
    } else if (this.paymentMethod === "cash") {
      prefix = "CSH";
    }
    this.transactionId = `${prefix}-${Date.now().toString().slice(-8)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }
  next();
});

TransactionSchema.virtual("isCashPayment").get(function () {
  return this.paymentMethod === "cash";
});

TransactionSchema.virtual("isMpesaPayment").get(function () {
  return this.paymentMethod === "mpesa";
});

TransactionSchema.virtual("hasChange").get(function () {
  return this.paymentMethod === "cash" && this.change > 0;
});

TransactionSchema.virtual("exactPayment").get(function () {
  return this.paymentMethod === "cash" && this.amountGiven === this.total;
});

TransactionSchema.virtual("mpesaSuccess").get(function () {
  return (
    this.paymentMethod === "mpesa" &&
    this.paymentStatus === "paid" &&
    this.mpesaReceipt
  );
});

TransactionSchema.index({ paymentMethod: 1, paymentStatus: 1 });
TransactionSchema.index({ mpesaCheckoutId: 1 });
TransactionSchema.index({ mpesaReceipt: 1 });
TransactionSchema.index({ createdAt: -1 });
TransactionSchema.index({ storeId: 1, createdAt: -1 });
TransactionSchema.index({ customerPhone: 1 });
TransactionSchema.index({ isDeleted: 1, deletedAt: -1 });
module.exports = mongoose.model("Transaction", TransactionSchema);
