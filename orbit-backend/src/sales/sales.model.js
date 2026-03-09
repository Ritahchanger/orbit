const mongoose = require("mongoose");
const SaleSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    productName: {
      type: String,
      required: true,
    },
    sku: {
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
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    profit: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["cash", "mpesa", "card", "paybill", "installment", "other"],
    },
    customerName: {
      type: String,
      trim: true,
      default: "No name",
    },
    customerPhone: {
      type: String,
      trim: true,
    },
    saleDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["completed", "pending", "cancelled", "refunded"],
      default: "completed",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // If you have a User model
      required: false,
    },
    transactionId: {
      type: String,
      sparse: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes for better query performance
SaleSchema.index({ saleDate: -1 });
SaleSchema.index({ productId: 1, saleDate: -1 });
SaleSchema.index({ customerName: 1 });
SaleSchema.index({ paymentMethod: 1 });
SaleSchema.index({ storeId: 1, productId: 1 });
SaleSchema.index({ status: 1 });
SaleSchema.index({ createdAt: -1 }); // For recent sales
SaleSchema.index({ storeId: 1, status: 1 }); // Store-specific status queries

// Virtual field for net amount (after discount)
SaleSchema.virtual("netAmount").get(function () {
  return this.subtotal - this.discount;
});

// Validate that discount doesn't exceed subtotal
SaleSchema.pre("validate", function (next) {
  if (this.discount > this.subtotal) {
    this.invalidate("discount", "Discount cannot exceed subtotal");
  }
  if (this.total !== this.subtotal - this.discount) {
    this.invalidate("total", "Total must equal subtotal minus discount");
  }
  next();
});

// Method to get sale summary for frontend
SaleSchema.methods.toSaleSummary = function () {
  return {
    id: this._id,
    productName: this.productName,
    sku: this.sku,
    quantity: this.quantity,
    unitPrice: this.unitPrice,
    discount: this.discount,
    total: this.total,
    paymentMethod: this.paymentMethod,
    customerName: this.customerName,
    saleDate: this.saleDate,
    createdAt: this.createdAt,
  };
};

// Static method to get sales by date range
SaleSchema.statics.getSalesByDateRange = async function (startDate, endDate) {
  return this.find({
    saleDate: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
    status: "completed",
  }).sort({ saleDate: -1 });
};

// Static method to get daily sales summary
SaleSchema.statics.getDailySalesSummary = async function (date = new Date()) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return this.aggregate([
    {
      $match: {
        saleDate: { $gte: startOfDay, $lte: endOfDay },
        status: "completed",
      },
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: "$total" },
        totalProfit: { $sum: "$profit" },
        totalItemsSold: { $sum: "$quantity" },
        totalTransactions: { $count: {} },
        averageTransaction: { $avg: "$total" },
      },
    },
  ]);
};

// Static method to get sales by product
SaleSchema.statics.getSalesByProduct = async function (productId, limit = 50) {
  return this.find({
    productId: productId,
    status: "completed",
  })
    .sort({ saleDate: -1 })
    .limit(limit)
    .populate("productId", "name sku price"); // Populate product details
};

// Static method to get top selling products
SaleSchema.statics.getTopSellingProducts = async function (
  limit = 10,
  startDate,
  endDate,
) {
  const matchStage = {
    status: "completed",
  };

  if (startDate && endDate) {
    matchStage.saleDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$productId",
        productName: { $first: "$productName" },
        totalQuantity: { $sum: "$quantity" },
        totalRevenue: { $sum: "$total" },
        totalProfit: { $sum: "$profit" },
        transactionCount: { $count: {} },
      },
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: limit },
  ]);
};

// Virtual population for product details (if you want to populate in queries)
SaleSchema.virtual("product", {
  ref: "Product",
  localField: "productId",
  foreignField: "_id",
  justOne: true,
});

// Export the model
const Sale = mongoose.model("Sale", SaleSchema);

module.exports = Sale;
