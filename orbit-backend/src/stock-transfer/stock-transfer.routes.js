// routes/stock-transfer.routes.js
const express = require("express");
const asyncHandler = require("../middlewares/asyncMiddleware");
const tokenValidator = require("../middlewares/tokenValidator");
const StockTransferControllers = require("./stock-transfer.controller");
const router = express.Router();
// All routes require authentication
router.use(tokenValidator);
/**
 * @route POST /api/v1/stock-transfers/transfer
 * @desc Transfer stock from one store to another
 * @access Private (Admin, Manager)
 */
router.post(
  "/transfer",

  asyncHandler(StockTransferControllers.transferStock),
);

/**
 * @route POST /api/v1/stock-transfers/bulk-transfer
 * @desc Bulk transfer multiple products between stores
 * @access Private (Admin, Manager)
 */
router.post(
  "/bulk-transfer",

  asyncHandler(StockTransferControllers.bulkTransfer),
);

/**
 * @route GET /api/v1/stock-transfers/history
 * @desc Get transfer history with filters
 * @access Private
 */
router.get(
  "/history",
  asyncHandler(StockTransferControllers.getTransferHistory),
);

/**
 * @route GET /api/v1/stock-transfers/:transferId
 * @desc Get single transfer by ID
 * @access Private
 */
router.get(
  "/:transferId",
  asyncHandler(StockTransferControllers.getTransferById),
);

/**
 * @route PUT /api/v1/stock-transfers/:transferId/cancel
 * @desc Cancel a pending transfer
 * @access Private (Admin only)
 */
router.put(
  "/:transferId/cancel",
  asyncHandler(StockTransferControllers.cancelTransfer),
);

module.exports = router;
