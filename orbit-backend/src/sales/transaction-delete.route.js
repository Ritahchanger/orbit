const express = require("express");
const router = express.Router();

const transactionDeleteController = require("./transaction-delete.controller");
const asyncWrapper = require("../middlewares/asyncMiddleware");
const tokenValidator = require("../middlewares/tokenValidator");
const authorize = require("../middlewares/authorizeMiddleware");
const recordAdminLog = require("../custom-logs/middleware/record-admin.middleware");

// ==================== AUTH ====================
router.use(tokenValidator);

// ==================== TRANSACTION DELETE ROUTES ====================

// Soft delete transactions
router.post(
  "/soft-delete",
  authorize(["transactions.delete"]),
  recordAdminLog("SOFT_DELETE_TRANSACTIONS"),
  asyncWrapper(transactionDeleteController.softDeleteTransactions),
);

// Permanent delete transactions
router.delete(
  "/permanent-delete",
  authorize(["transactions.delete.permanent"]),
  recordAdminLog("PERMANENT_DELETE_TRANSACTIONS"),
  asyncWrapper(transactionDeleteController.permanentDeleteTransactions),
);

// Restore soft-deleted transactions
router.post(
  "/restore",
  authorize(["transactions.restore"]),
  recordAdminLog("RESTORE_TRANSACTIONS"),
  asyncWrapper(transactionDeleteController.restoreTransactions),
);

// Get deleted transactions (read-only)
router.get(
  "/deleted",
  // authorize(["transactions.view.deleted"]),
  asyncWrapper(transactionDeleteController.getDeletedTransactions),
);

// Get single deleted transaction (read-only)
router.get(
  "/deleted/:id",
  authorize(["transactions.view.deleted"]),
  asyncWrapper(transactionDeleteController.getDeletedTransactionById),
);

// Bulk delete transactions
router.delete(
  "/bulk",
  authorize(["transactions.delete"]),
  recordAdminLog("BULK_DELETE_TRANSACTIONS"),
  asyncWrapper(transactionDeleteController.bulkDeleteTransactions),
);

// Cleanup old deleted transactions
router.post(
  "/cleanup",
  authorize(["admin.cleanup"]),
  recordAdminLog("CLEANUP_OLD_DELETED_TRANSACTIONS"),
  asyncWrapper(transactionDeleteController.cleanupOldDeleted),
);

// Get delete statistics (read-only)
router.get(
  "/delete-stats",
  authorize(["transactions.view.stats"]),
  asyncWrapper(transactionDeleteController.getDeleteStats),
);

module.exports = router;
