// transaction-delete.controller.js
const transactionDeleteService = require("./transaction-delete.service");

/**
 * Transaction Delete Controller
 * Handles HTTP requests for transaction deletion operations
 */
const transactionDeleteController = {
  /**
   * Soft delete transactions
   * POST /api/transactions/soft-delete
   */
  softDeleteTransactions: async (req, res) => {
    const { transactionIds } = req.body;
    const userId = req.user?._id || req.user?.id; // Assuming user info from auth middleware

    if (!transactionIds || transactionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No transaction IDs provided",
      });
    }

    const result = await transactionDeleteService.softDeleteTransactions(
      transactionIds,
      userId,
    );

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        deletedCount: result.deletedCount,
        transactionsDeleted: result.transactionsDeleted,
        salesDeletedCount: result.salesDeletedCount,
        notFoundIds: result.notFoundIds,
      },
    });
  },

  /**
   * Permanently delete transactions
   * DELETE /api/transactions/permanent-delete
   */
  permanentDeleteTransactions: async (req, res) => {
    const { transactionIds } = req.body;
    const userId = req.user?._id || req.user?.id;

    if (!transactionIds || transactionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No transaction IDs provided",
      });
    }
    // Optional: Add confirmation check for permanent delete
    const { confirm } = req.body;
    if (!confirm || confirm !== "PERMANENT_DELETE") {
      return res.status(400).json({
        success: false,
        message:
          "Please confirm permanent deletion with confirm: 'PERMANENT_DELETE'",
      });
    }
    const result = await transactionDeleteService.permanentDeleteTransactions(
      transactionIds,
      userId,
    );
    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        deletedCount: result.deletedCount,
        transactionsDeleted: result.transactionsDeleted,
        salesDeletedCount: result.salesDeletedCount,
        notFoundIds: result.notFoundIds,
      },
    });
  },

  /**
   * Restore soft-deleted transactions
   * POST /api/transactions/restore
   */
  restoreTransactions: async (req, res) => {
    const { transactionIds } = req.body;
    if (!transactionIds || transactionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No transaction IDs provided",
      });
    }

    const result =
      await transactionDeleteService.restoreTransactions(transactionIds);
    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        restoredCount: result.restoredCount,
        transactionsRestored: result.transactionsRestored,
        salesRestoredCount: result.salesRestoredCount,
      },
    });
  },

  /**
   * Get deleted transactions with filters
   * GET /api/transactions/deleted
   */
  getDeletedTransactions: async (req, res) => {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      deletedBy: req.query.deletedBy,
      storeId: req.query.storeId,
      paymentMethod: req.query.paymentMethod,
      searchTerm: req.query.search,
    };

    const result =
      await transactionDeleteService.getDeletedTransactions(filters);

    return res.status(200).json({
      success: true,
      data: result.transactions,
      pagination: result.pagination,
      summary: result.summary,
    });
  },

  /**
   * Get single deleted transaction by ID
   * GET /api/transactions/deleted/:id
   */
  getDeletedTransactionById: async (req, res) => {
    const { id } = req.params;
    const transaction = await Transaction.findOne({
      _id: id,
      isDeleted: true,
    })
      .populate("storeId", "name location storeCode")
      .populate("soldBy", "name email")
      .populate("deletedBy", "name email")
      .populate({
        path: "saleIds",
        select: "productName sku quantity unitPrice total",
      })
      .lean();

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Deleted transaction not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: transaction,
    });
  },

  /**
   * Bulk delete operations (mix of soft and permanent based on query param)
   * DELETE /api/transactions/bulk?type=soft|permanent
   */
  bulkDeleteTransactions: async (req, res) => {
    const { transactionIds } = req.body;
    const deleteType = req.query.type || "soft"; // soft or permanent
    const userId = req.user?._id || req.user?.id;

    if (!transactionIds || transactionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No transaction IDs provided",
      });
    }

    // For permanent delete, require confirmation
    if (deleteType === "permanent") {
      const { confirm } = req.body;
      if (!confirm || confirm !== "PERMANENT_DELETE") {
        return res.status(400).json({
          success: false,
          message:
            "Please confirm permanent deletion with confirm: 'PERMANENT_DELETE'",
        });
      }
    }

    let result;
    if (deleteType === "permanent") {
      result = await transactionDeleteService.permanentDeleteTransactions(
        transactionIds,
        userId,
      );
    } else {
      result = await transactionDeleteService.softDeleteTransactions(
        transactionIds,
        userId,
      );
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        operation: result.operation,
        deletedCount: result.deletedCount,
        transactionsDeleted: result.transactionsDeleted,
        salesDeletedCount: result.salesDeletedCount,
        notFoundIds: result.notFoundIds,
      },
    });
  },

  /**
   * Clean up old deleted transactions (admin only)
   * POST /api/transactions/cleanup
   */
  cleanupOldDeleted: async (req, res) => {
    const { daysOld = 30 } = req.body;

    // Validate daysOld
    if (daysOld < 1 || daysOld > 365) {
      return res.status(400).json({
        success: false,
        message: "daysOld must be between 1 and 365",
      });
    }

    const result = await transactionDeleteService.cleanupOldDeleted(daysOld);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        deletedCount: result.deletedCount,
        salesDeletedCount: result.salesDeletedCount,
      },
    });
  },

  /**
   * Get delete statistics
   * GET /api/transactions/delete-stats
   */
  getDeleteStats: async (req, res) => {
    const stats = await Transaction.aggregate([
      {
        $match: { isDeleted: true },
      },
      {
        $group: {
          _id: {
            year: { $year: "$deletedAt" },
            month: { $month: "$deletedAt" },
            day: { $dayOfMonth: "$deletedAt" },
          },
          count: { $sum: 1 },
          totalAmount: { $sum: "$total" },
          paymentMethods: { $push: "$paymentMethod" },
        },
      },
      {
        $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 },
      },
      {
        $limit: 30,
      },
    ]);

    const totalDeleted = await Transaction.countDocuments({ isDeleted: true });
    const totalRevenueDeleted = await Transaction.aggregate([
      { $match: { isDeleted: true } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalDeleted,
        totalRevenueDeleted: totalRevenueDeleted[0]?.total || 0,
        dailyBreakdown: stats,
      },
    });
  },
};

module.exports = transactionDeleteController;
