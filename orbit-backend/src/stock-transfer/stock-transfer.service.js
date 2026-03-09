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

  async transferStock({
    sourceStoreId,
    destinationStoreId,
    productId,
    quantity,
    userId,
    reason = "store_transfer",
    notes = "",
  }) {
    try {
      // 1. Validate quantity
      if (!quantity || quantity <= 0) {
        throw new Error("Valid quantity is required");
      }

      // 2. Check if source and destination are different
      if (sourceStoreId.toString() === destinationStoreId.toString()) {
        throw new Error("Source and destination stores cannot be the same");
      }

      // 3. Get source inventory
      const sourceInventory = await StoreInventory.findOne({
        store: sourceStoreId,
        product: productId,
      });

      if (!sourceInventory) {
        throw new Error("Product not found in source store");
      }

      // 4. Check if source has enough stock
      if (sourceInventory.stock < quantity) {
        throw new Error(
          `Insufficient stock in source store. Available: ${sourceInventory.stock}`,
        );
      }

      // 5. Get or create destination inventory
      let destInventory = await StoreInventory.findOne({
        store: destinationStoreId,
        product: productId,
      });

      if (!destInventory) {
        // Create new inventory record for destination store
        const product = await Product.findById(productId);

        if (!product) {
          throw new Error("Product not found");
        }

        destInventory = new StoreInventory({
          store: destinationStoreId,
          product: productId,
          stock: 0,
          minStock: product.minStock || 5,
          // Don't set status here - let the pre-save middleware handle it
        });
      }

      // 6. Perform the transfer
      sourceInventory.stock -= quantity;
      destInventory.stock += quantity;

      // 7. Update lastTransfer timestamps
      sourceInventory.lastTransfer = new Date();
      destInventory.lastTransfer = new Date();

      // 8. Save both inventories - pre-save middleware will auto-update status
      await sourceInventory.save();
      await destInventory.save();

      // 9. Create transfer record
      const transfer = new StockTransfer({
        transferNumber: await this.generateTransferNumber(),
        sourceStore: sourceStoreId,
        destinationStore: destinationStoreId,
        product: productId,
        quantity,
        transferredBy: userId,
        status: "completed",
        reason,
        notes,
        sourceStockBefore: sourceInventory.stock + quantity,
        sourceStockAfter: sourceInventory.stock,
        destStockBefore: destInventory.stock - quantity,
        destStockAfter: destInventory.stock,
        transferredAt: new Date(),
      });

      await transfer.save();

      // 10. Populate and return result
      await transfer.populate([
        { path: "sourceStore", select: "name code" },
        { path: "destinationStore", select: "name code" },
        { path: "product", select: "name sku" },
        { path: "transferredBy", select: "name email" },
      ]);

      return {
        success: true,
        message: `Successfully transferred ${quantity} units`,
        transfer,
        sourceInventory: {
          store: sourceInventory.store,
          newStock: sourceInventory.stock,
          status: sourceInventory.status, // Now this will be correct
        },
        destinationInventory: {
          store: destInventory.store,
          newStock: destInventory.stock,
          status: destInventory.status, // Now this will be correct
        },
      };
    } catch (error) {
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
