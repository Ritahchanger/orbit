// controllers/analysis.controller.js
const globalAnalysisService = require("../services/global-product-analysis");
const storeAnalysisService = require("../services/store-inventory-analysis");

class AnalysisController {
  // ─── Global Analysis ──────────────────────────────────────────────────────

  async getGlobalDashboard(req, res) {
    const { businessId } = req;
    const data = await globalAnalysisService.getDashboardOverview(businessId);
    res.json(data);
  }

  async getGlobalInventorySummary(req, res) {
    const { businessId } = req;
    const data = await globalAnalysisService.getInventorySummary(businessId);
    res.json({ success: true, data });
  }

  async getGlobalLowStockAlerts(req, res) {
    const { businessId } = req;
    const data =
      await globalAnalysisService.getGlobalLowStockAlerts(businessId);
    res.json(data);
  }

  async getTopProductsGlobal(req, res) {
    const { businessId } = req;
    const limit = parseInt(req.query.limit) || 10;
    const data = await globalAnalysisService.getTopProductsByRevenue(
      limit,
      businessId,
    );
    res.json({ success: true, data });
  }

  async getCategoryPerformance(req, res) {
    const { businessId } = req;
    const data = await globalAnalysisService.getCategoryPerformance(businessId);
    res.json({ success: true, data });
  }

  // ─── Store Analysis ───────────────────────────────────────────────────────

  async getStoreDashboard(req, res) {
    const { businessId } = req;
    const { storeId } = req.params;
    // Fixed: businessId was not passed — store service couldn't scope to business
    const data = await storeAnalysisService.getStoreDashboard(
      storeId,
      businessId,
    );
    res.json(data);
  }

  async getStoreInventorySummary(req, res) {
    const { businessId } = req;
    const { storeId } = req.params;
    const data = await storeAnalysisService.getStoreInventorySummary(
      storeId,
      businessId,
    );
    res.json({ success: true, data });
  }

  async getStoreLowStock(req, res) {
    const { businessId } = req;
    const { storeId } = req.params;
    const data = await storeAnalysisService.getStoreLowStockAnalysis(
      storeId,
      businessId,
    );
    res.json({ success: true, data });
  }

  async getStoreTopProducts(req, res) {
    const { businessId } = req; // Fixed: was missing, caused ReferenceError
    const { storeId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const data = await storeAnalysisService.getStoreTopProducts(
      storeId,
      limit,
      businessId,
    );
    res.json({ success: true, data });
  }
}

module.exports = new AnalysisController();
