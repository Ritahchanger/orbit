const express = require("express");
const router = express.Router();

const transactionController = require("./transaction.controller");
const asyncWrapper = require("../middlewares/asyncMiddleware");
const tokenValidator = require("../middlewares/tokenValidator");
const recordAdminLog = require("../custom-logs/middleware/record-admin.middleware");

// ============ TRANSACTION ROUTES ============

router.use(tokenValidator);

// Get all transactions (SENSITIVE READ → log)
router.get(
  "/",
  recordAdminLog("VIEW_ALL_TRANSACTIONS"),
  asyncWrapper(transactionController.getAllTransactions),
);

// Get transaction by ID (SENSITIVE READ → log)
router.get(
  "/:transactionId",
  recordAdminLog("VIEW_TRANSACTION_DETAILS"),
  asyncWrapper(transactionController.getTransactionById),
);

// Get store transactions (NORMAL READ → no log)
router.get(
  "/store/:storeId",
  asyncWrapper(transactionController.getStoreTransactions),
);

// Get today's transactions summary (ANALYTICS → no log)
router.get(
  "/today/summary",
  asyncWrapper(transactionController.getTodaySummary),
);

module.exports = router;
