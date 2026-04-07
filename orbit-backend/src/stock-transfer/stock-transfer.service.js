// services/stockTransfer.service.js
const StoreInventory = require("../store-inventory/store-inventory.model");
const Product = require("../products/products.model");
const StockTransfer = require("../stock-transfer/stock-transfer.model");

const mongoose = require("mongoose");

class StockTransferService {
  /**
   * Transfer stock from source store to destination store
   */
  // services/stockTransfer.service.js - FIXED transferStock method

  async transferStock(data) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const {
        sourceStoreId,
        destinationStoreId,
        productId,
        quantity,
        userId,
        businessId,
        reason = "store_transfer",
        notes = "",
      } = data;

      if (!quantity || quantity <= 0) {
        throw new Error("Valid quantity is required");
      }

      if (sourceStoreId.toString() === destinationStoreId.toString()) {
        throw new Error("Source and destination stores cannot be the same");
      }

      // 🔥 SOURCE INVENTORY
      const sourceInventory = await StoreInventory.findOne({
        store: sourceStoreId,
        product: productId,
        businessId,
      }).session(session);

      if (!sourceInventory) {
        throw new Error("Product not found in source store");
      }

      if (sourceInventory.stock < quantity) {
        throw new Error(
          `Insufficient stock. Available: ${sourceInventory.stock}`,
        );
      }

      // 🔥 DEST INVENTORY
      let destInventory = await StoreInventory.findOne({
        store: destinationStoreId,
        product: productId,
        businessId,
      }).session(session);

      if (!destInventory) {
        const product = await Product.findById(productId).session(session);

        if (!product) {
          throw new Error("Product not found");
        }

        destInventory = new StoreInventory({
          store: destinationStoreId,
          product: productId,
          stock: 0,
          minStock: product.minStock || 5,
          businessId, // 🔥 MUST INCLUDE
        });
      }

      // 🔥 STOCK MOVEMENT
      sourceInventory.stock -= quantity;
      destInventory.stock += quantity;

      sourceInventory.lastTransfer = new Date();
      destInventory.lastTransfer = new Date();

      await sourceInventory.save({ session });
      await destInventory.save({ session });

      // 🔥 TRANSFER RECORD
      const transfer = new StockTransfer({
        transferNumber: await this.generateTransferNumber(),
        sourceStore: sourceStoreId,
        destinationStore: destinationStoreId,
        product: productId,
        quantity,
        transferredBy: userId,
        businessId, // 🔥 ADD THIS
        status: "completed",
        reason,
        notes,
        sourceStockBefore: sourceInventory.stock + quantity,
        sourceStockAfter: sourceInventory.stock,
        destStockBefore: destInventory.stock - quantity,
        destStockAfter: destInventory.stock,
        transferredAt: new Date(),
      });

      await transfer.save({ session });

      await session.commitTransaction();
      session.endSession();

      return {
        success: true,
        message: `Transferred ${quantity} units successfully`,
        transfer,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
  /**
   * Generate unique transfer number
   */
  async generateTransferNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    // Get count of transfers today for sequence
    const count = await StockTransfer.countDocuments({
      createdAt: {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lt: new Date().setHours(23, 59, 59, 999),
      },
    });

    const sequence = (count + 1).toString().padStart(4, "0");
    return `TRF-${year}${month}${day}-${sequence}`;
  }

  /**
   * Get transfer history
   */
  async getTransferHistory(filters = {}, page = 1, limit = 20) {
    const query = {};
    const { search } = filters;

    if (filters.sourceStore) query.sourceStore = filters.sourceStore;
    if (filters.destinationStore)
      query.destinationStore = filters.destinationStore;
    if (filters.product) query.product = filters.product;
    if (filters.status) query.status = filters.status;

    if (filters.fromDate || filters.toDate) {
      query.transferredAt = {};
      if (filters.fromDate)
        query.transferredAt.$gte = new Date(filters.fromDate);
      if (filters.toDate) query.transferredAt.$lte = new Date(filters.toDate);
    }

    // 🔍 SEARCH LOGIC (THE FIX)
    if (search) {
      const regex = new RegExp(search, "i");

      const [products, stores, users] = await Promise.all([
        mongoose
          .model("Product")
          .find({
            $or: [{ name: regex }, { sku: regex }],
          })
          .select("_id"),

        mongoose
          .model("Store")
          .find({
            $or: [{ name: regex }, { code: regex }],
          })
          .select("_id"),

        mongoose
          .model("User")
          .find({
            email: regex,
          })
          .select("_id"),
      ]);

      query.$or = [
        { transferNumber: regex },
        { notes: regex },
        { product: { $in: products.map((p) => p._id) } },
        { sourceStore: { $in: stores.map((s) => s._id) } },
        { destinationStore: { $in: stores.map((s) => s._id) } },
        { transferredBy: { $in: users.map((u) => u._id) } },
      ];
    }

    const skip = (page - 1) * limit;

    const [transfers, total] = await Promise.all([
      StockTransfer.find(query)
        .populate("sourceStore", "name code")
        .populate("destinationStore", "name code")
        .populate("product", "name sku")
        .populate("transferredBy", "name email")
        .sort({ transferredAt: -1 })
        .skip(skip)
        .limit(limit),

      StockTransfer.countDocuments(query),
    ]);

    return {
      transfers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get transfer by ID
   */
  async getTransferById(transferId) {
    return StockTransfer.findById(transferId)
      .populate("sourceStore", "name code address")
      .populate("destinationStore", "name code address")
      .populate("product", "name sku price")
      .populate("transferredBy", "name email");
  }

  /**
   * Cancel a pending transfer
   */
  async cancelTransfer(transferId, userId, reason) {
    // NO TRANSACTIONS - removed session logic
    try {
      const transfer = await StockTransfer.findById(transferId);

      if (!transfer) {
        throw new Error("Transfer not found");
      }

      if (transfer.status !== "pending") {
        throw new Error("Only pending transfers can be cancelled");
      }

      transfer.status = "cancelled";
      transfer.cancelledBy = userId;
      transfer.cancelledAt = new Date();
      transfer.cancellationReason = reason;

      await transfer.save();

      return {
        success: true,
        message: "Transfer cancelled successfully",
        transfer,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate bulk transfer
   */
  async validateBulkTransfer(items, sourceStoreId) {
    const validationResults = {
      valid: true,
      items: [],
      errors: [],
    };

    for (const item of items) {
      const inventory = await StoreInventory.findOne({
        store: sourceStoreId,
        product: item.productId,
      }).populate("product", "name sku");

      if (!inventory) {
        validationResults.valid = false;
        validationResults.errors.push({
          productId: item.productId,
          error: "Product not found in source store",
        });
        continue;
      }

      if (inventory.stock < item.quantity) {
        validationResults.valid = false;
        validationResults.errors.push({
          productId: item.productId,
          productName: inventory.product?.name,
          requested: item.quantity,
          available: inventory.stock,
          error: "Insufficient stock",
        });
        continue;
      }

      validationResults.items.push({
        productId: item.productId,
        productName: inventory.product?.name,
        sku: inventory.product?.sku,
        requestedQuantity: item.quantity,
        availableQuantity: inventory.stock,
        valid: true,
      });
    }

    return validationResults;
  }

  /**
   * Bulk transfer multiple products
   */
  async bulkTransfer({
    sourceStoreId,
    destinationStoreId,
    items,
    userId,
    reason = "bulk_transfer",
    notes = "",
  }) {
    // NO TRANSACTIONS - removed session logic
    try {
      const results = {
        successful: [],
        failed: [],
      };

      for (const item of items) {
        try {
          const result = await this.transferStock({
            sourceStoreId,
            destinationStoreId,
            productId: item.productId,
            quantity: item.quantity,
            userId,
            reason,
            notes: `${notes} ${item.notes || ""}`.trim(),
          });

          results.successful.push({
            productId: item.productId,
            quantity: item.quantity,
            transferId: result.transfer._id,
            transferNumber: result.transfer.transferNumber,
          });
        } catch (error) {
          results.failed.push({
            productId: item.productId,
            quantity: item.quantity,
            error: error.message,
          });
        }
      }

      return {
        success: true,
        summary: {
          total: items.length,
          successful: results.successful.length,
          failed: results.failed.length,
        },
        results,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new StockTransferService();
