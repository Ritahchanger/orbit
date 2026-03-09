// controllers/stockTransfer.controller.js
const StockTransferService = require("./stock-transfer.service");

exports.transferStock = async (req, res) => {
  try {
    const {
      sourceStoreId,
      destinationStoreId,
      productId,
      quantity,
      reason,
      notes,
    } = req.body;
    const userId = req.user._id;

    const result = await StockTransferService.transferStock({
      sourceStoreId,
      destinationStoreId,
      productId,
      quantity,
      userId,
      reason,
      notes,
    });

    res.json(result);
  } catch (error) {
    console.error("Transfer error:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

exports.bulkTransfer = async (req, res) => {
  try {
    const { sourceStoreId, destinationStoreId, items, reason, notes } =
      req.body;
    const userId = req.user._id;

    // Validate items first
    const validation = await StockTransferService.validateBulkTransfer(
      items,
      sourceStoreId,
    );

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: "Bulk transfer validation failed",
        validation,
      });
    }

    const result = await StockTransferService.bulkTransfer({
      sourceStoreId,
      destinationStoreId,
      items,
      userId,
      reason,
      notes,
    });

    res.json(result);
  } catch (error) {
    console.error("Bulk transfer error:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getTransferHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, ...filters } = req.query;

    const result = await StockTransferService.getTransferHistory(
      filters,
      parseInt(page),
      parseInt(limit),
    );

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Get transfer history error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getTransferById = async (req, res) => {
  try {
    const { transferId } = req.params;

    const transfer = await StockTransferService.getTransferById(transferId);

    if (!transfer) {
      return res.status(404).json({
        success: false,
        error: "Transfer not found",
      });
    }

    res.json({
      success: true,
      transfer,
    });
  } catch (error) {
    console.error("Get transfer error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.cancelTransfer = async (req, res) => {
  try {
    const { transferId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    const result = await StockTransferService.cancelTransfer(
      transferId,
      userId,
      reason,
    );

    res.json(result);
  } catch (error) {
    console.error("Cancel transfer error:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
