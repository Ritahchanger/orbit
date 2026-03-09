// productAnalysis.api.js
import { api } from "../../api/axios-conf";

const productAnalysisApi = {
    /**
     * ============ GLOBAL PRODUCT ANALYSIS METHODS ============
     * (No storeId needed)
     */

    /**
     * 1. Global Dashboard Overview
     * GET //products-analysis/global/dashboard
     */
    getGlobalDashboard: async () => {
        const response = await api.get("/products-analysis/global/dashboard");
        return response.data;
    },

    /**
     * 2. Global Inventory Health Summary
     * GET //products-analysis/global/inventory-summary
     */
    getGlobalInventorySummary: async () => {
        const response = await api.get("/products-analysis/global/inventory-summary");
        return response.data;
    },

    /**
     * 3. Global Top Performing Products
     * GET //products-analysis/global/top-products
     */
    getGlobalTopProducts: async (limit = 10) => {
        const response = await api.get("/products-analysis/global/top-products", {
            params: { limit }
        });
        return response.data;
    },

    /**
     * 4. Global Category Performance
     * GET //products-analysis/global/category-performance
     */
    getGlobalCategoryPerformance: async () => {
        const response = await api.get("/products-analysis/global/category-performance");
        return response.data;
    },

    /**
     * 5. Global Low Stock Alerts (Optional)
     * GET //products-analysis/global/low-stock-alerts
     */
    getGlobalLowStockAlerts: async () => {
        const response = await api.get("/products-analysis/global/low-stock-alerts");
        return response.data;
    },

    /**
     * 6. Global Brand Performance (Optional)
     * GET //products-analysis/global/brand-performance
     */
    getGlobalBrandPerformance: async () => {
        const response = await api.get("/products-analysis/global/brand-performance");
        return response.data;
    },

    /**
     * ============ STORE-SPECIFIC ANALYSIS METHODS ============
     * (All require storeId as parameter)
     */

    /**
     * 1. Store Inventory Dashboard
     * GET //products-analysis/stores/:storeId/dashboard
     * @param {string} storeId - Store identifier
     */
    getStoreDashboard: async (storeId) => {
        const response = await api.get(`/products-analysis/stores/${storeId}/dashboard`);
        return response.data;
    },

    /**
     * 2. Store Inventory Health Summary
     * GET //products-analysis/stores/:storeId/inventory-summary
     * @param {string} storeId - Store identifier
     */
    getStoreInventorySummary: async (storeId) => {
        const response = await api.get(`/products-analysis/stores/${storeId}/inventory-summary`);
        return response.data;
    },

    /**
     * 3. Store Low Stock Analysis
     * GET //products-analysis/stores/:storeId/low-stock
     * @param {string} storeId - Store identifier
     */
    getStoreLowStockAnalysis: async (storeId) => {
        const response = await api.get(`/products-analysis/stores/${storeId}/low-stock`);
        return response.data;
    },

    /**
     * 4. Store Top Products
     * GET //products-analysis/stores/:storeId/top-products
     * @param {string} storeId - Store identifier
     * @param {number} limit - Number of products to return
     */
    getStoreTopProducts: async (storeId, limit = 10) => {
        const response = await api.get(`/products-analysis/stores/${storeId}/top-products`, {
            params: { limit }
        });
        return response.data;
    },

    /**
     * 5. Store Category Analysis (Optional)
     * GET //products-analysis/stores/:storeId/category-/products-analysis
     * @param {string} storeId - Store identifier
     */
    getStoreCategoryAnalysis: async (storeId) => {
        const response = await api.get(`/products-analysis/stores/${storeId}/category-/products-analysis`);
        return response.data;
    },

    /**
     * 6. Store Recommendations (Optional)
     * GET //products-analysis/stores/:storeId/recommendations
     * @param {string} storeId - Store identifier
     */
    getStoreRecommendations: async (storeId) => {
        const response = await api.get(`/products-analysis/stores/${storeId}/recommendations`);
        return response.data;
    },

    /**
     * ============ CONVENIENCE METHODS ============
     */

    /**
     * Batch fetch all global analytics data
     */
    getAllGlobalAnalytics: async () => {
        const [
            dashboard,
            inventorySummary,
            topProducts,
            categoryPerformance
        ] = await Promise.all([
            productAnalysisApi.getGlobalDashboard(),
            productAnalysisApi.getGlobalInventorySummary(),
            productAnalysisApi.getGlobalTopProducts(),
            productAnalysisApi.getGlobalCategoryPerformance()
        ]);

        return {
            dashboard,
            inventorySummary,
            topProducts,
            categoryPerformance
        };
    },

    /**
     * Batch fetch all store analytics data
     * @param {string} storeId - Store identifier
     */
    getAllStoreAnalytics: async (storeId) => {
        const [
            dashboard,
            inventorySummary,
            lowStockAnalysis,
            topProducts
        ] = await Promise.all([
            productAnalysisApi.getStoreDashboard(storeId),
            productAnalysisApi.getStoreInventorySummary(storeId),
            productAnalysisApi.getStoreLowStockAnalysis(storeId),
            productAnalysisApi.getStoreTopProducts(storeId)
        ]);

        return {
            dashboard,
            inventorySummary,
            lowStockAnalysis,
            topProducts
        };
    }
};

export default productAnalysisApi;