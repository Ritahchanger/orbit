// products/controllers/product-analysis.controller.js
const globalAnalysisService = require("../services/global-product-analysis.service");
const storeAnalysisService = require("../services/store-inventory-analysis.service");
const mongoose = require("mongoose");

// Optional ?storeId= narrows the global analytics to one store. Returns null
// for "all stores", or sends a 400 and returns false for a malformed id.
const readStoreFilter = (req, res) => {
  const { storeId } = req.query;
  if (!storeId || storeId === "global") return null;
  if (!mongoose.isValidObjectId(storeId)) {
    res.status(400).json({ success: false, message: "Invalid storeId" });
    return false;
  }
  return storeId;
};

class AnalysisController {
  // ─── Global Analysis ──────────────────────────────────────────────────────

  async getGlobalDashboard(req, res) {
    const { businessId } = req;
    const data = await globalAnalysisService.getDashboardOverview(businessId);
    res.json(data);
  }

  async getGlobalInventorySummary(req, res) {
    const { businessId } = req;
    const storeId = readStoreFilter(req, res);
    if (storeId === false) return;
    const data = await globalAnalysisService.getInventorySummary(
      businessId,
      storeId,
    );
    res.json({ success: true, data });
  }

  async getGlobalLowStockAlerts(req, res) {
    const { businessId } = req;
    const storeId = readStoreFilter(req, res);
    if (storeId === false) return;
    const data = await globalAnalysisService.getGlobalLowStockAlerts(
      businessId,
      storeId,
    );
    res.json(data);
  }

  async getTopProductsGlobal(req, res) {
    const { businessId } = req;
    const storeId = readStoreFilter(req, res);
    if (storeId === false) return;
    const limit = parseInt(req.query.limit) || 10;
    const data = await globalAnalysisService.getTopProductsByRevenue(
      limit,
      businessId,
      storeId,
    );
    res.json({ success: true, data });
  }

  async getCategoryPerformance(req, res) {
    const { businessId } = req;
    const storeId = readStoreFilter(req, res);
    if (storeId === false) return;
    const data = await globalAnalysisService.getCategoryPerformance(
      businessId,
      storeId,
    );
    res.json({ success: true, data });
  }

  async getGlobalStoresInventory(req, res) {
    const { businessId } = req;
    const data = await globalAnalysisService.getStoreInventoryBreakdown(businessId);
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
