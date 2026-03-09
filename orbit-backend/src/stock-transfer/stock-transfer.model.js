// models/StockTransfer.js
const mongoose = require("mongoose");

const stockTransferSchema = new mongoose.Schema(
  {
    transferNumber: {
      type: String,
      required: true,
      unique: true,
    },
    sourceStore: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    destinationStore: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    transferredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled", "failed"],
      default: "completed",
    },
    reason: {
      type: String,
      enum: [
        "store_transfer",
        "restock",
        "damaged_replacement",
        "customer_order",
        "inventory_balancing",
        "bulk_transfer",
        "other",
      ],
      default: "store_transfer",
    },
    notes: {
      type: String,
      trim: true,
    },
    // Stock levels before and after
    sourceStockBefore: Number,
    sourceStockAfter: Number,
    destStockBefore: Number,
    destStockAfter: Number,
    // Tracking
    transferredAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    cancellationReason: String,
  },
  {
    timestamps: true,
  },
);

// Indexes
stockTransferSchema.index({ transferNumber: 1 });
stockTransferSchema.index({ sourceStore: 1, transferredAt: -1 });
stockTransferSchema.index({ destinationStore: 1, transferredAt: -1 });
stockTransferSchema.index({ product: 1 });
stockTransferSchema.index({ status: 1 });
stockTransferSchema.index({ transferredAt: -1 });

const StockTransfer = mongoose.model("StockTransfer", stockTransferSchema);
module.exports = StockTransfer;
