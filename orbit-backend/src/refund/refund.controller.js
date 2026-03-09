// controllers/refund.controller.js
const refundService = require("./refund.service");

class RefundController {
  /**
   * Process a refund
   * POST /api/v1/refunds
   */
  async processRefund(req, res) {
    const refundData = {
      ...req.body,
      processedBy: req.user._id, // From auth middleware
    };

    const result = await refundService.processRefund(refundData);

    return res.status(201).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  }

  /**
   * Check if transaction can be refunded
   * GET /api/v1/refunds/check/:transactionId
   */
  async checkRefundEligibility(req, res) {
    const { transactionId } = req.params;
    const { amount } = req.query;

    const result = await refundService.canRefundTransaction(
      transactionId,
      amount ? parseFloat(amount) : null,
    );

    return res.status(200).json(result);
  }

  /**
   * Get refund by ID
   * GET /api/v1/refunds/:refundId
   */
  async getRefund(req, res) {
    const { refundId } = req.params;
    const result = await refundService.getRefundById(refundId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  }

  /**
   * Get refunds by transaction
   * GET /api/v1/refunds/transaction/:transactionId
   */
  async getRefundsByTransaction(req, res) {
    const { transactionId } = req.params;
    const result = await refundService.getRefundsByTransaction(transactionId);

    return res.status(200).json(result);
  }

  /**
   * Get refunds by store
   * GET /api/v1/refunds/store/:storeId
   */
  async getRefundsByStore(req, res) {
    const { storeId } = req.params;
    const { page, limit, ...filters } = req.query;

    const result = await refundService.getRefundsByStore(
      storeId,
      parseInt(page) || 1,
      parseInt(limit) || 20,
      filters,
    );

    return res.status(200).json(result);
  }

  /**
   * Get refund summary
   * GET /api/v1/refunds/summary
   */
  async getRefundSummary(req, res) {
    const { storeId, days } = req.query;
    const result = await refundService.getRefundSummary(
      storeId,
      parseInt(days) || 30,
    );

    return res.status(200).json(result);
  }

  /**
   * Approve refund
   * PUT /api/v1/refunds/:refundId/approve
   */
  async approveRefund(req, res) {
    const { refundId } = req.params;
    const result = await refundService.approveRefund(refundId, req.user._id);

    return res.status(200).json(result);
  }
}

module.exports = new RefundController();
