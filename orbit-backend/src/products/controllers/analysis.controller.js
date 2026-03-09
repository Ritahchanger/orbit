// controllers/analysis.controller.js
const globalAnalysisService = require('../services/global-product-analysis');
const storeAnalysisService = require('../services/store-inventory-analysis');

class AnalysisController {
    // Global Analysis Endpoints
    async getGlobalDashboard(req, res) {

        const data = await globalAnalysisService.getDashboardOverview();
        res.json(data);

    }

    async getGlobalLowStockAlerts(req, res) {

        const data = await globalAnalysisService.getDashboardOverview();
        res.json(data);
    }

    async getGlobalInventorySummary(req, res) {

        const data = await globalAnalysisService.getInventorySummary();
        res.json({ success: true, data });

    }

    async getTopProductsGlobal(req, res) {
        const limit = parseInt(req.query.limit) || 10;
        const data = await globalAnalysisService.getTopProductsByRevenue(limit);
        res.json({ success: true, data });
    }

    async getCategoryPerformance(req, res) {
        const data = await globalAnalysisService.getCategoryPerformance();
        res.json({ success: true, data });
    }

    // Store Analysis Endpoints
    async getStoreDashboard(req, res) {
        const { storeId } = req.params;
        const data = await storeAnalysisService.getStoreDashboard(storeId);
        res.json(data);
    }

    async getStoreInventorySummary(req, res) {
        const { storeId } = req.params;
        const data = await storeAnalysisService.getStoreInventorySummary(storeId);
        res.json({ success: true, data });
    }

    async getStoreLowStock(req, res) {
        const { storeId } = req.params;
        const data = await storeAnalysisService.getStoreLowStockAnalysis(storeId);
        res.json({ success: true, data });
    }

    async getStoreTopProducts(req, res) {
        const { storeId } = req.params;
        const limit = parseInt(req.query.limit) || 10;
        const data = await storeAnalysisService.getStoreTopProducts(storeId, limit);
        res.json({ success: true, data });

    }
}

module.exports = new AnalysisController();