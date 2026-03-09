// models/Refund.js
const mongoose = require("mongoose");

const RefundSchema = new mongoose.Schema(
  {
    // ============ CORE IDENTIFIERS ============
    refundId: {
      type: String,
      unique: true,
      required: true,
    },

    // Link to original transaction (CRITICAL)
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
      index: true,
    },

    // Store reference (denormalized for performance)
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },

    // ============ REFUND DETAILS ============
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    method: {
      type: String,
      required: true,
      enum: ["cash", "mpesa", "bank", "original", "wallet"],
    },

    reason: {
      type: String,
      required: true,
      enum: [
        "customer_return",
        "damaged_product",
        "wrong_item",
        "duplicate_transaction",
        "technical_error",
        "customer_cancellation",
        "quality_issue",
        "missing_items",
        "other",
      ],
    },

    reasonText: {
      type: String,
      trim: true,
    },

    // ============ ITEMS BEING REFUNDED ============
    items: [
      {
        saleId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Sale",
          required: true,
        },
        sku: {
          type: String,
          required: true,
        },
        productName: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        unitPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        subtotal: {
          type: Number,
          required: true,
          min: 0,
        },
        discount: {
          type: Number,
          default: 0,
        },
        returnToStock: {
          type: Boolean,
          default: true,
        },
      },
    ],

    // ============ FINANCIAL TRACKING ============
    originalAmount: {
      type: Number,
      required: true,
    },

    remainingBalance: {
      type: Number,
      required: true,
    },

    refundStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },

    // ============ PAYMENT-SPECIFIC FIELDS ============
    cashReceivedBy: {
      type: String,
      trim: true,
    },

    mpesaRefundId: {
      type: String,
      sparse: true,
      unique: true,
    },
    mpesaReceipt: {
      type: String,
      sparse: true,
    },
    mpesaPhone: {
      type: String,
      trim: true,
    },
    mpesaTransactionDate: {
      type: String,
    },

    bankReference: {
      type: String,
      sparse: true,
    },
    bankAccount: {
      type: String,
      sparse: true,
    },
    bankName: {
      type: String,
      sparse: true,
    },

    // ============ AUDIT TRAIL ============
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    processedAt: {
      type: Date,
      default: Date.now,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    approvedAt: {
      type: Date,
    },

    // ============ METADATA ============
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    metadata: {
      ipAddress: String,
      userAgent: String,
      deviceInfo: String,
    },

    reversalTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      sparse: true,
    },

    attachments: [
      {
        filename: String,
        url: String,
        uploadedAt: Date,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ============ INDEXES ============
RefundSchema.index({ createdAt: -1 });
RefundSchema.index({ transaction: 1, createdAt: -1 });
RefundSchema.index({ storeId: 1, createdAt: -1 });
RefundSchema.index({ refundStatus: 1 });
RefundSchema.index({ processedBy: 1, createdAt: -1 });
RefundSchema.index({ method: 1, refundStatus: 1 });
RefundSchema.index({ "items.sku": 1 });
RefundSchema.index({ mpesaRefundId: 1 }, { sparse: true });
RefundSchema.index({ bankReference: 1 }, { sparse: true });

// ============ OPTIMIZED MIDDLEWARE ============

// ✅ SINGLE PRE-VALIDATE HOOK (no changes needed - perfect!)
RefundSchema.pre("validate", function (next) {
  if (!this.refundId) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    const prefix = this.method === "mpesa" ? "MPR" : "REF";
    this.refundId = `${prefix}-${timestamp}-${random}`;
  }

  if (this.reason === "other" && !this.reasonText) {
    this.reasonText = "No specific reason provided";
  }

  next();
});

// ✅ SINGLE PRE-SAVE HOOK (merged both hooks into ONE)
RefundSchema.pre("save", function (next) {
  // Calculate amount from items if not set or zero
  if (this.items?.length > 0) {
    const calculatedAmount = this.items.reduce((sum, item) => {
      return sum + (item.subtotal || item.quantity * item.unitPrice);
    }, 0);

    if (!this.amount || this.amount === 0) {
      this.amount = calculatedAmount;
    }
  }

  next();
});

// ============ VIRTUALS ============
RefundSchema.virtual("age").get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

RefundSchema.virtual("isRecent").get(function () {
  return this.age <= 7;
});

RefundSchema.virtual("totalItemsRefunded").get(function () {
  return this.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
});

// ============ INSTANCE METHODS ============
RefundSchema.methods.complete = async function () {
  this.refundStatus = "completed";
  this.processedAt = new Date();
  return this.save();
};

RefundSchema.methods.fail = async function (error) {
  this.refundStatus = "failed";
  const errorMsg = error?.message || error || "Unknown error";
  this.notes = this.notes
    ? `${this.notes}\nFailed: ${errorMsg}`
    : `Failed: ${errorMsg}`;
  return this.save();
};

RefundSchema.methods.addAttachment = function (filename, url) {
  if (!this.attachments) this.attachments = [];
  this.attachments.push({
    filename,
    url,
    uploadedAt: new Date(),
  });
  return this.save();
};

// ============ STATIC METHODS ============

// Get refunds by date range
RefundSchema.statics.getByDateRange = async function (
  startDate,
  endDate,
  storeId = null,
) {
  const query = {
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  };

  if (storeId) query.storeId = storeId;

  return this.find(query)
    .populate("transaction", "transactionId total paymentMethod")
    .populate("processedBy", "name email")
    .sort("-createdAt");
};

// Get refund summary
RefundSchema.statics.getSummary = async function (storeId = null, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const match = {
    createdAt: { $gte: startDate },
    refundStatus: "completed",
  };

  if (storeId) match.storeId = storeId;

  const result = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalRefunds: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
        averageRefund: { $avg: "$amount" },
        maxRefund: { $max: "$amount" },
        minRefund: { $min: "$amount" },
      },
    },
    {
      $project: {
        _id: 0,
        totalRefunds: 1,
        totalAmount: 1,
        averageRefund: { $round: ["$averageRefund", 2] },
        maxRefund: 1,
        minRefund: 1,
        period: `${days} days`,
      },
    },
  ]);

  return (
    result[0] || {
      totalRefunds: 0,
      totalAmount: 0,
      averageRefund: 0,
      maxRefund: 0,
      minRefund: 0,
      period: `${days} days`,
    }
  );
};

// Get refund reasons breakdown
RefundSchema.statics.getReasonBreakdown = async function (
  storeId = null,
  days = 30,
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const match = {
    createdAt: { $gte: startDate },
    refundStatus: "completed",
  };

  if (storeId) match.storeId = storeId;

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$reason",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

// Get refunds by payment method
RefundSchema.statics.getByPaymentMethod = async function (
  storeId = null,
  days = 30,
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const match = {
    createdAt: { $gte: startDate },
    refundStatus: "completed",
  };

  if (storeId) match.storeId = storeId;

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$method",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
      },
    },
    { $sort: { totalAmount: -1 } },
  ]);
};

module.exports = mongoose.model("Refund", RefundSchema);
