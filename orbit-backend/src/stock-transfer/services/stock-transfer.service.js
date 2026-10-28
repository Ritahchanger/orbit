// services/stockTransfer.service.js
const { findProductById, findProducts } = require("../../products");
const StockTransfer = require("../models/stock-transfer.model");

const mongoose = require("mongoose");
const { findInventoryItem, newInventoryItem } = require("../../store-inventory");
const { countStores, findStores } = require("../../stores");
const { findUsers } = require("../../user");

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

      if (!businessId) {
        throw new Error("Business context is required for stock transfers");
      }

      const ownedStores = await countStores({
        _id: { $in: [sourceStoreId, destinationStoreId] },
        businessId,
      }).session(session);
      if (ownedStores !== 2) {
        throw new Error("Both stores must belong to your business");
      }

      // 🔥 SOURCE INVENTORY
      const sourceInventory = await findInventoryItem({
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
      let destInventory = await findInventoryItem({
        store: destinationStoreId,
        product: productId,
        businessId,
      }).session(session);

      if (!destInventory) {
        const product = await findProductById(productId, { session });

        if (!product) {
          throw new Error("Product not found");
        }

        destInventory = newInventoryItem({
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
  async getTransferHistory(filters = {}, page = 1, limit = 20, businessId) {
    const { search } = filters;

    const query = {
      businessId,
      ...(filters.sourceStore && { sourceStore: filters.sourceStore }),
      ...(filters.destinationStore && {
        destinationStore: filters.destinationStore,
      }),
      ...(filters.product && { product: filters.product }),
      ...(filters.status && { status: filters.status }),
    };

    // Date filter
    if (filters.fromDate || filters.toDate) {
      // toDate is a calendar day: include all of it
      const toDate = filters.toDate ? new Date(filters.toDate) : null;
      if (toDate && /^\d{4}-\d{2}-\d{2}$/.test(filters.toDate)) {
        toDate.setUTCHours(23, 59, 59, 999);
      }
      query.transferredAt = {
        ...(filters.fromDate && { $gte: new Date(filters.fromDate) }),
        ...(toDate && { $lte: toDate }),
      };
    }

    // 🔍 SEARCH
    if (search) {
      const regex = new RegExp(
        String(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );

      const [products, stores, users] = await Promise.all([
        findProducts(
          {
            businessId,
            $or: [{ name: regex }, { sku: regex }],
          },
          { select: "_id" },
        ),

        findStores({
          businessId,
          $or: [{ name: regex }, { code: regex }],
        }).select("_id"),

        findUsers({
          businessId,
          email: regex,
        }).select("_id"),
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

    // Totals for the whole filtered set (not just this page)
    const [agg] = await StockTransfer.aggregate([
      {
        $match: {
          ...query,
          businessId: new mongoose.Types.ObjectId(businessId),
          ...(query.sourceStore && {
            sourceStore: new mongoose.Types.ObjectId(query.sourceStore),
          }),
          ...(query.destinationStore && {
            destinationStore: new mongoose.Types.ObjectId(query.destinationStore),
          }),
          ...(query.product && {
            product: new mongoose.Types.ObjectId(query.product),
          }),
        },
      },
      {
        $group: {
          _id: null,
          completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
          totalItems: { $sum: "$quantity" },
          products: { $addToSet: "$product" },
        },
      },
    ]);

    return {
      transfers,
      summary: {
        total,
        completed: agg?.completed || 0,
        pending: agg?.pending || 0,
        cancelled: agg?.cancelled || 0,
        totalItems: agg?.totalItems || 0,
        uniqueProducts: agg?.products?.length || 0,
      },
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
  async getTransferById(transferId, businessId) {
    if (!mongoose.isValidObjectId(transferId)) return null;
    return StockTransfer.findOne({ _id: transferId, businessId })
      .populate("sourceStore", "name code address")
      .populate("destinationStore", "name code address")
      .populate("product", "name sku price")
      .populate("transferredBy", "name email");
  }

  /**
   * Cancel a pending transfer
   */
  async cancelTransfer(transferId, userId, reason, businessId) {
    // NO TRANSACTIONS - removed session logic
    try {
      const transfer = mongoose.isValidObjectId(transferId)
        ? await StockTransfer.findOne({ _id: transferId, businessId })
        : null;

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
  async validateBulkTransfer(items, sourceStoreId, businessId) {
    const validationResults = {
      valid: true,
      items: [],
      errors: [],
    };

    for (const item of items) {
      const inventory = await findInventoryItem({
        store: sourceStoreId,
        product: item.productId,
        businessId,
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
    businessId,
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
            businessId,
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
