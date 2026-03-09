// productAnalysis.controller.js
const productAnalysisService = require("./product-analysis.service");

const productAnalysisController = {
    /**
     * Get dashboard analytics (global or store-specific)
     */
    getDashboardAnalytics: async (req, res) => {
        const { timeRange = 'month', compare = 'true' } = req.query;
        const storeId = req.params.storeId || req.query.storeId || null;

        const result = await productAnalysisService.getDashboardAnalytics(
            timeRange,
            compare === 'true',
            storeId
        );

        res.status(200).json(result);
    },

    getGlobalLowStockAlerts: async (req, res) => {

        const result = await GlobalProductAnalysisService.getGlobalLowStockAlerts();

        res.status(200).json({
            success: true,
            message: "Global low stock alerts retrieved successfully",
            data: result
        });

    },

    getGlobalDashboard: async (req, res) => {

        const result = await GlobalProductAnalysisService.getDashboardOverview();

        res.status(200).json({
            success: true,
            message: "Global dashboard retrieved successfully",
            data: result
        });

    },
    /**
     * Get inventory summary (global or store-specific)
     */
    getInventorySummary: async (req, res) => {
        const storeId = req.params.storeId || req.query.storeId || null;
        const result = await productAnalysisService.getInventorySummary(storeId);

        res.status(200).json({
            success: true,
            data: result
        });
    },

    /**
     * Get low stock analysis (global or store-specific)
     */
    getLowStockAnalysis: async (req, res) => {
        const storeId = req.params.storeId || req.query.storeId || null;
        const result = await productAnalysisService.getLowStockAnalysis(storeId);

        res.status(200).json({
            success: true,
            data: result
        });
    },

    /**
     * Get category distribution (global or store-specific)
     */
    getCategoryDistribution: async (req, res) => {
        const storeId = req.params.storeId || req.query.storeId || null;
        const result = await productAnalysisService.getCategoryDistribution(storeId);

        res.status(200).json({
            success: true,
            data: result
        });
    },

    /**
     * Get profit margin analysis (global or store-specific)
     */
    getProfitMarginAnalysis: async (req, res) => {
        const storeId = req.params.storeId || req.query.storeId || null;
        const result = await productAnalysisService.getProfitMarginAnalysis(storeId);

        res.status(200).json({
            success: true,
            data: result
        });
    },

    /**
     * Get inventory aging report (global or store-specific)
     */
    getInventoryAgingReport: async (req, res) => {
        const storeId = req.params.storeId || req.query.storeId || null;
        const result = await productAnalysisService.getInventoryAgingReport(storeId);

        res.status(200).json({
            success: true,
            data: result
        });
    },

    /**
     * Get product recommendations (global or store-specific)
     */
    getProductRecommendations: async (req, res) => {
        const storeId = req.params.storeId || req.query.storeId || null;
        const result = await productAnalysisService.getProductRecommendations(storeId);

        res.status(200).json({
            success: true,
            data: result
        });
    },

    /**
     * Get alerts and notifications (global or store-specific)
     */
    getAlerts: async (req, res) => {
        const storeId = req.params.storeId || req.query.storeId || null;
        const result = await productAnalysisService.generateAlerts(storeId);

        res.status(200).json({
            success: true,
            data: result
        });
    },

    /**
     * Get top products (global or store-specific)
     */
    getTopProducts: async (req, res) => {
        const { by = 'revenue', limit = 10 } = req.query;
        const storeId = req.params.storeId || req.query.storeId || null;

        let result;
        if (by === 'sales') {
            result = await productAnalysisService.getTopProductsBySales(parseInt(limit), storeId);
        } else {
            result = await productAnalysisService.getTopProductsByRevenue(parseInt(limit), storeId);
        }

        res.status(200).json({
            success: true,
            data: result
        });
    },

    /**
     * Get brand performance analysis (global only)
     */
    getBrandPerformance: async (req, res) => {
        const storeId = req.params.storeId || req.query.storeId || null;
        const result = await productAnalysisService.getBrandPerformance(storeId);

        res.status(200).json({
            success: true,
            data: result
        });
    },

    /**
     * Get stock turnover analysis (global or store-specific)
     */
    getStockTurnover: async (req, res) => {
        const storeId = req.params.storeId || req.query.storeId || null;
        const result = await productAnalysisService.getStockTurnoverAnalysis(storeId);

        res.status(200).json({
            success: true,
            data: result
        });
    },

    /**
     * Get slow-moving products (global or store-specific)
     */
    getSlowMovingProducts: async (req, res) => {
        const { days = 90 } = req.query;
        const storeId = req.params.storeId || req.query.storeId || null;
        const result = await productAnalysisService.getSlowMovingProducts(parseInt(days), storeId);

        res.status(200).json({
            success: true,
            data: result
        });
    },

    /**
     * Get high-value inventory (global or store-specific)
     */
    getHighValueInventory: async (req, res) => {
        const { threshold = 1000 } = req.query;
        const storeId = req.params.storeId || req.query.storeId || null;
        const result = await productAnalysisService.getHighValueInventory(parseFloat(threshold), storeId);

        res.status(200).json({
            success: true,
            data: result
        });
    },

    /**
     * Export analysis report (global or store-specific)
     */
    exportAnalysisReport: async (req, res) => {
        const { format = 'json', type = 'full' } = req.query;
        const storeId = req.params.storeId || req.query.storeId || null;

        const result = await productAnalysisService.exportAnalysisReport(type, format, storeId);

        if (format === 'csv') {
            const filename = storeId
                ? `product-analysis-store-${storeId}.csv`
                : 'product-analysis-global.csv';

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            return res.send(result);
        }

        res.status(200).json({
            success: true,
            data: result
        });
    },

    /**
     * Get performance metrics (global or store-specific)
     */
    getPerformanceMetrics: async (req, res) => {
        const storeId = req.params.storeId || req.query.storeId || null;
        const result = await productAnalysisService.getPerformanceMetrics(storeId);

        res.status(200).json({
            success: true,
            data: result
        });
    },

    /**
     * Get store comparison analytics (global only)
     */
    getStoreComparison: async (req, res) => {
        const result = await productAnalysisService.getStoreComparison();

        res.status(200).json(result);
    },

    /**
     * Get recent restocks (global or store-specific)
     */
    getRecentRestocks: async (req, res) => {
        const { days = 7 } = req.query;
        const storeId = req.params.storeId || req.query.storeId || null;
        const result = await productAnalysisService.getRecentRestocks(parseInt(days), storeId);

        res.status(200).json({
            success: true,
            data: result
        });
    },

    /**
     * Get store dashboard analytics (store-specific)
     */
    getStoreDashboardAnalytics: async (req, res) => {
        const { timeRange = 'month', compare = 'true' } = req.query;
        const { storeId } = req.params;

        const result = await productAnalysisService.getDashboardAnalytics(
            timeRange,
            compare === 'true',
            storeId
        );

        res.status(200).json(result);
    }
};

module.exports = productAnalysisController;