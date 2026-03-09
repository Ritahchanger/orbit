// routes/refund.routes.js
const express = require("express");

const router = express.Router();

const refundController = require("./refund.controller");

const asyncWrapper = require("../middlewares/asyncMiddleware");

const tokenValidator = require("../middlewares/tokenValidator");

const recordAdminLog = require("../custom-logs/middleware/record-admin.middleware");

// All refund routes require authentication
router.use(tokenValidator);

// Refund operations
router.post(
  "/",
  recordAdminLog("PROCESS_REFUND"),
  asyncWrapper(refundController.processRefund),
);

router.get(
  "/check/:transactionId",
  asyncWrapper(refundController.checkRefundEligibility),
);

router.get("/:refundId", asyncWrapper(refundController.getRefund));

router.get(
  "/transaction/:transactionId",
  asyncWrapper(refundController.getRefundsByTransaction),
);
router.get("/store/:storeId", asyncWrapper(refundController.getRefundsByStore));

router.get("/summary", asyncWrapper(refundController.getRefundSummary));

router.put(
  "/:refundId/approve",
  recordAdminLog("APPROVE_REFUND"),
  asyncWrapper(refundController.approveRefund),
);

module.exports = router;
