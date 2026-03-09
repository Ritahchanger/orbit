// transaction-delete.service.js
const Transaction = require("./transaction.model");
const Sale = require("./sales.model");
const mongoose = require("mongoose");

/**
 * Transaction Delete Service
 * Handles both soft delete and permanent delete operations
 */
const transactionDeleteService = {
  /**
   * Soft delete transactions - marks as deleted without removing from database
   * @param {Array|String} transactionIds - Single ID or array of transaction IDs
   * @param {String} deletedBy - User ID who is performing the delete
   * @returns {Object} - Result of soft delete operation
   */
  softDeleteTransactions: async (transactionIds, deletedBy = null) => {
    if (!transactionIds || transactionIds.length === 0) {
      throw new Error("No transaction IDs provided");
    }

    const ids = Array.isArray(transactionIds)
      ? transactionIds
      : [transactionIds];

    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
      throw new Error("No valid transaction IDs provided");
    }
    const transactions = await Transaction.find({
      _id: { $in: validIds },
      isDeleted: { $ne: true },
    }).lean();
    if (transactions.length === 0) {
      throw new Error("No active transactions found with the provided IDs");
    }
    const existingIds = transactions.map((t) => t._id.toString());

    const allSaleIds = transactions.reduce((acc, tx) => {
      if (tx.saleIds && tx.saleIds.length > 0) {
        acc.push(...tx.saleIds);
      }
      return acc;
    }, []);
    if (allSaleIds.length > 0) {
      await Sale.updateMany(
        { _id: { $in: allSaleIds } },
        {
          $set: {
            isDeleted: true,
            deletedAt: new Date(),
            deletedBy: deletedBy,
          },
        },
      );
    }
    const updateResult = await Transaction.updateMany(
      { _id: { $in: existingIds } },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: deletedBy,
          status: "deleted",
        },
      },
    );
    const notFoundIds = validIds.filter((id) => !existingIds.includes(id));
    return {
      success: true,
      operation: "soft_delete",
      deletedCount: updateResult.modifiedCount,
      transactionsDeleted: transactions.map((tx) => ({
        id: tx._id,
        transactionId: tx.transactionId,
        total: tx.total,
        paymentMethod: tx.paymentMethod,
        deletedAt: new Date(),
        deletedBy: deletedBy,
      })),
      salesDeletedCount: allSaleIds.length,
      notFoundIds: notFoundIds,
      message: `${updateResult.modifiedCount} transaction(s) soft deleted successfully`,
    };
  },

  /**
   * Permanently delete transactions - removes from database
   * @param {Array|String} transactionIds - Single ID or array of transaction IDs
   * @param {String} deletedBy - User ID who is performing the delete (for logging)
   * @returns {Object} - Result of permanent delete operation
   */
  permanentDeleteTransactions: async (transactionIds, deletedBy = null) => {
    // Validate input
    if (!transactionIds || transactionIds.length === 0) {
      throw new Error("No transaction IDs provided");
    }

    // Ensure transactionIds is an array
    const ids = Array.isArray(transactionIds)
      ? transactionIds
      : [transactionIds];

    // Validate ObjectIds
    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
      throw new Error("No valid transaction IDs provided");
    }

    // Find transactions to be deleted (to get their saleIds)
    const transactionsToDelete = await Transaction.find({
      _id: { $in: validIds },
    }).lean();

    if (transactionsToDelete.length === 0) {
      throw new Error("No transactions found with the provided IDs");
    }

    const existingIds = transactionsToDelete.map((t) => t._id.toString());

    // Collect all saleIds
    const allSaleIds = transactionsToDelete.reduce((acc, tx) => {
      if (tx.saleIds && tx.saleIds.length > 0) {
        acc.push(...tx.saleIds);
      }
      return acc;
    }, []);

    // REMOVE ALL SESSION/TRANSACTION CODE
    // Just do the operations directly without sessions

    // Delete associated sales first
    if (allSaleIds.length > 0) {
      await Sale.deleteMany({
        _id: { $in: allSaleIds },
      });
    }

    // Delete the transactions
    const deleteResult = await Transaction.deleteMany({
      _id: { $in: existingIds },
    });

    // Log deletion for audit (if you have an audit log)
    if (deletedBy) {
      console.log(
        `User ${deletedBy} permanently deleted ${deleteResult.deletedCount} transactions:`,
        {
          transactionIds: existingIds,
          saleIdsDeleted: allSaleIds.length,
          timestamp: new Date().toISOString(),
        },
      );
    }

    // Prepare result
    const notFoundIds = validIds.filter((id) => !existingIds.includes(id));

    return {
      success: true,
      operation: "permanent_delete",
      deletedCount: deleteResult.deletedCount,
      transactionsDeleted: transactionsToDelete.map((tx) => ({
        id: tx._id,
        transactionId: tx.transactionId,
        total: tx.total,
        paymentMethod: tx.paymentMethod,
      })),
      salesDeletedCount: allSaleIds.length,
      notFoundIds: notFoundIds,
      message: `${deleteResult.deletedCount} transaction(s) permanently deleted successfully`,
    };
  },

  /**
   * Restore soft-deleted transactions
   * @param {Array|String} transactionIds - Single ID or array of transaction IDs
   * @returns {Object} - Result of restore operation
   */
  restoreTransactions: async (transactionIds) => {
    // Validate input
    if (!transactionIds || transactionIds.length === 0) {
      throw new Error("No transaction IDs provided");
    }

    // Ensure transactionIds is an array
    const ids = Array.isArray(transactionIds)
      ? transactionIds
      : [transactionIds];

    // Validate ObjectIds
    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
      throw new Error("No valid transaction IDs provided");
    }

    // Find soft-deleted transactions
    const transactions = await Transaction.find({
      _id: { $in: validIds },
      isDeleted: true,
    }).lean();

    if (transactions.length === 0) {
      throw new Error(
        "No soft-deleted transactions found with the provided IDs",
      );
    }

    const existingIds = transactions.map((t) => t._id.toString());

    // Collect all saleIds
    const allSaleIds = transactions.reduce((acc, tx) => {
      if (tx.saleIds && tx.saleIds.length > 0) {
        acc.push(...tx.saleIds);
      }
      return acc;
    }, []);

    // REMOVE ALL SESSION/TRANSACTION CODE

    // Restore associated sales
    if (allSaleIds.length > 0) {
      await Sale.updateMany(
        { _id: { $in: allSaleIds } },
        {
          $set: {
            isDeleted: false,
            deletedAt: null,
            deletedBy: null,
          },
        },
      );
    }

    // Restore the transactions
    const updateResult = await Transaction.updateMany(
      { _id: { $in: existingIds } },
      {
        $set: {
          isDeleted: false,
          deletedAt: null,
          deletedBy: null,
          status: "completed", // Restore original status
        },
      },
    );

    return {
      success: true,
      operation: "restore",
      restoredCount: updateResult.modifiedCount,
      transactionsRestored: transactions.map((tx) => ({
        id: tx._id,
        transactionId: tx.transactionId,
      })),
      salesRestoredCount: allSaleIds.length,
      message: `${updateResult.modifiedCount} transaction(s) restored successfully`,
    };
  },
  /**
   * Get deleted transactions with pagination and filters
   * @param {Object} filters - Filter options
   * @returns {Object} - Deleted transactions and pagination info
   */
  getDeletedTransactions: async (filters = {}) => {
    const {
      page = 1,
      limit = 20,
      startDate,
      endDate,
      deletedBy,
      storeId,
      paymentMethod,
      searchTerm,
    } = filters;

    const query = { isDeleted: true };

    // Date range filter
    if (startDate || endDate) {
      query.deletedAt = {};
      if (startDate) {
        query.deletedAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.deletedAt.$lte = new Date(endDate);
      }
    }

    // Deleted by filter
    if (deletedBy) {
      query.deletedBy = deletedBy;
    }

    // Store filter
    if (storeId) {
      query.storeId = storeId;
    }

    // Payment method filter
    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    // Search by customer name, phone, or transaction ID
    if (searchTerm) {
      query.$or = [
        { customerName: { $regex: searchTerm, $options: "i" } },
        { customerPhone: { $regex: searchTerm, $options: "i" } },
        { transactionId: { $regex: searchTerm, $options: "i" } },
        { mpesaReceipt: { $regex: searchTerm, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .populate("storeId", "name location storeCode")
        .populate("soldBy", "name email")
        .populate("deletedBy", "name email")
        .populate({
          path: "saleIds",
          select: "productName sku quantity total",
          options: { limit: 3 },
        })
        .lean()
        .sort({ deletedAt: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments(query),
    ]);

    // Calculate summary
    const totalRevenue = transactions.reduce(
      (sum, tx) => sum + (tx.total || 0),
      0,
    );

    return {
      success: true,
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      summary: {
        totalDeleted: total,
        totalRevenue: totalRevenue,
        averageTransaction: total > 0 ? totalRevenue / total : 0,
      },
    };
  },

  /**
   * Clean up old deleted transactions (permanent delete after X days)
   * @param {Number} daysOld - Delete transactions older than this many days
   * @returns {Object} - Cleanup result
   */
  cleanupOldDeleted: async (daysOld = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const query = {
      isDeleted: true,
      deletedAt: { $lte: cutoffDate },
    };

    const transactionsToDelete = await Transaction.find(query).lean();

    if (transactionsToDelete.length === 0) {
      return {
        success: true,
        message: "No old deleted transactions found",
        deletedCount: 0,
      };
    }

    const transactionIds = transactionsToDelete.map((t) => t._id);
    const allSaleIds = transactionsToDelete.reduce((acc, tx) => {
      if (tx.saleIds && tx.saleIds.length > 0) {
        acc.push(...tx.saleIds);
      }
      return acc;
    }, []);

    // Delete associated sales
    if (allSaleIds.length > 0) {
      await Sale.deleteMany({
        _id: { $in: allSaleIds },
      });
    }

    // Permanently delete transactions
    const deleteResult = await Transaction.deleteMany({
      _id: { $in: transactionIds },
    });

    return {
      success: true,
      message: `Cleaned up ${deleteResult.deletedCount} old deleted transactions`,
      deletedCount: deleteResult.deletedCount,
      salesDeletedCount: allSaleIds.length,
    };
  },
};

module.exports = transactionDeleteService;
