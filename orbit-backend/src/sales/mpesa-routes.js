const express = require("express");
const router = express.Router();

const mpesaController = require("./mpesa-controller");
const asyncHandler = require("../middlewares/asyncMiddleware");
const tokenValidator = require("../middlewares/tokenValidator");

const {
  initiatePaymentValidation,
  completeTransactionValidation,
  validateRequest,
} = require("../middlewares/mpesaValidation");

const recordAdminLog = require("../custom-logs/middleware/record-admin.middleware");

// ==================== PUBLIC ROUTES ====================

// M-Pesa callback (called by Safaricom)
// ❌ No admin log (external system)
router.post("/callback", asyncHandler(mpesaController.handleMpesaCallback));

// ==================== PROTECTED ROUTES ====================
router.use(tokenValidator);

// Initiate M-Pesa STK Push
router.post(
  "/initiate",
  initiatePaymentValidation,
  validateRequest,
  recordAdminLog("INITIATE_MPESA_PAYMENT"),
  asyncHandler(mpesaController.initiateMpesaPayment),
);

// Complete M-Pesa transaction
router.post(
  "/complete",
  // completeTransactionValidation,
  validateRequest,
  recordAdminLog("COMPLETE_MPESA_TRANSACTION"),
  asyncHandler(mpesaController.completeMpesaTransaction),
);

// Poll M-Pesa transaction status (read-only)
router.get(
  "/status/:checkoutRequestId",
  asyncHandler(mpesaController.pollMpesaStatus),
);

// Generate M-Pesa access token (sensitive but non-mutating)
router.get(
  "/token",
  recordAdminLog("GENERATE_MPESA_TOKEN"),
  asyncHandler(mpesaController.generateMpesaToken),
);

// Validate phone number for M-Pesa (utility, no state change)
router.post(
  "/validate-phone",
  asyncHandler(mpesaController.validateMpesaPhone),
);

module.exports = router;
