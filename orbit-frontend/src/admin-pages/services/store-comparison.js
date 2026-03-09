import { api } from "../../api/axios-conf";

const storeComparisonApi = {
    // ============ STORE COMPARISON ============

    /**
     * Compare multiple stores with detailed metrics
     * @param {Object} params - Comparison parameters
     * @returns {Promise} Comparison results
     */
    compareStores: async (params = {}) => {
        const {
            startDate,
            endDate,
            storeIds = [], // Array of store IDs or comma-separated string
            metrics = ['sales', 'inventory', 'efficiency', 'growth', 'risk'],
            benchmarkType = 'average',
            includeRanking = true,
            includeTrends = true,
            granularity = 'daily'
        } = params;

        const queryParams = {
            startDate,
            endDate,
            storeIds: Array.isArray(storeIds) ? storeIds.join(',') : storeIds,
            metrics: Array.isArray(metrics) ? metrics.join(',') : metrics,
            benchmarkType,
            includeRanking,
            includeTrends,
            granularity
        };

        // Remove undefined/null params
        Object.keys(queryParams).forEach(key => {
            if (queryParams[key] === undefined || queryParams[key] === null) {
                delete queryParams[key];
            }
        });

        const response = await api.get('/store-comparison/compare', { params: queryParams });
        return response.data;
    },

    /**
     * Get detailed drill-down analysis for a specific store
     * @param {string} storeId - Store ID
     * @param {Object} filters - Drill-down filters
     * @returns {Promise} Drill-down analysis
     */
    getStoreDrillDown: async (storeId, filters = {}) => {
        const {
            startDate,
            endDate,
            compareWith = [], // Array of store IDs to compare with
            detailLevel = 'summary'
        } = filters;

        const params = {
            startDate,
            endDate,
            compareWith: Array.isArray(compareWith) ? compareWith.join(',') : compareWith,
            detailLevel
        };

        // Remove undefined/null params
        Object.keys(params).forEach(key => {
            if (params[key] === undefined || params[key] === null) {
                delete params[key];
            }
        });

        const response = await api.get(`/store-comparison/drill-down/${storeId}`, { params });
        return response.data;
    },

    /**
     * Quick comparison of stores (lightweight)
     * @param {string|Array} storeIds - Store IDs to compare
     * @returns {Promise} Quick comparison results
     */
    getQuickComparison: async (storeIds) => {
        const storeIdsParam = Array.isArray(storeIds) ? storeIds.join(',') : storeIds;

        const response = await api.get('/store-comparison/quick', {
            params: { storeIds: storeIdsParam }
        });
        return response.data;
    },

    /**
     * Get benchmark data for all stores
     * @param {Object} params - Benchmark parameters
     * @returns {Promise} Benchmark data
     */
    getBenchmarks: async (params = {}) => {
        const {
            startDate,
            endDate,
            benchmarkType = 'average'
        } = params;

        const queryParams = { startDate, endDate, benchmarkType };

        // Remove undefined/null params
        Object.keys(queryParams).forEach(key => {
            if (queryParams[key] === undefined || queryParams[key] === null) {
                delete queryParams[key];
            }
        });

        const response = await api.get('/store-comparison/benchmarks', { params: queryParams });
        return response.data;
    },

    /**
     * Export comparison data in various formats
     * @param {Object} params - Export parameters
     * @returns {Promise} Export data with filename
     */
    exportComparison: async (params = {}) => {
        const {
            format = 'json',
            startDate,
            endDate,
            storeIds = [],
            exportType = 'full'
        } = params;

        const queryParams = {
            format,
            startDate,
            endDate,
            storeIds: Array.isArray(storeIds) ? storeIds.join(',') : storeIds,
            exportType
        };

        // Remove undefined/null params
        Object.keys(queryParams).forEach(key => {
            if (queryParams[key] === undefined || queryParams[key] === null) {
                delete queryParams[key];
            }
        });

        const response = await api.get('/store-comparison/export', {
            params: queryParams,
            responseType: format === 'json' ? 'json' : 'blob'
        });

        // Handle file downloads
        if (format !== 'json') {
            const filename = storeComparisonApi.extractFilename(response) ||
                `store-comparison-${exportType}-${Date.now()}.${format}`;

            return {
                data: response.data,
                filename,
                format
            };
        }

        return response.data;
    },

    /**
     * Get performance trends for a store
     * @param {string} storeId - Store ID
     * @param {Object} params - Trend parameters
     * @returns {Promise} Store trends data
     */
    getStoreTrends: async (storeId, params = {}) => {
        const {
            period = 'monthly',
            months = 6
        } = params;

        const response = await api.get(`/store-comparison/trends/${storeId}`, {
            params: { period, months }
        });
        return response.data;
    },

    /**
     * Compare stores by specific metric
     * @param {string} metric - Metric to compare
     * @param {Object} params - Comparison parameters
     * @returns {Promise} Metric comparison results
     */
    compareByMetric: async (metric, params = {}) => {
        const {
            storeIds = [],
            startDate,
            endDate,
            sort = 'desc'
        } = params;

        const queryParams = {
            storeIds: Array.isArray(storeIds) ? storeIds.join(',') : storeIds,
            startDate,
            endDate,
            sort
        };

        // Remove undefined/null params
        Object.keys(queryParams).forEach(key => {
            if (queryParams[key] === undefined || queryParams[key] === null) {
                delete queryParams[key];
            }
        });

        const response = await api.get(`/store-comparison/metric/${metric}`, { params: queryParams });
        return response.data;
    },

    // ============ UTILITY METHODS ============

    /**
     * Extract filename from Content-Disposition header
     * @param {Object} response - Axios response
     * @returns {string|null} Filename
     */
    extractFilename: (response) => {
        const contentDisposition = response.headers['content-disposition'];
        if (contentDisposition) {
            const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
            if (matches != null && matches[1]) {
                return matches[1].replace(/['"]/g, '');
            }
        }
        return null;
    },

    /**
     * Download file from blob data
     * @param {Blob} blobData - File blob data
     * @param {string} filename - Filename to save as
     */
    downloadFile: (blobData, filename) => {
        // Create a blob URL
        const url = window.URL.createObjectURL(new Blob([blobData]));

        // Create a temporary link element
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);

        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();

        // Clean up
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
    },

    // ============ CONVENIENCE METHODS ============

    /**
     * Compare all active stores
     * @param {Object} filters - Comparison filters
     * @returns {Promise} All stores comparison
     */
    compareAllStores: async (filters = {}) => {
        return storeComparisonApi.compareStores({
            storeIds: [], // Empty array means all stores
            ...filters
        });
    },

    /**
     * Compare specific stores with default settings
     * @param {Array} storeIds - Store IDs to compare
     * @returns {Promise} Simplified comparison
     */
    compareSelectedStores: async (storeIds) => {
        return storeComparisonApi.compareStores({
            storeIds,
            metrics: ['sales', 'inventory', 'efficiency'],
            includeRanking: true,
            includeTrends: false
        });
    },

    /**
     * Get store comparison with specific date range
     * @param {string} startDate - Start date (YYYY-MM-DD)
     * @param {string} endDate - End date (YYYY-MM-DD)
     * @param {Array} storeIds - Store IDs (optional, all if empty)
     * @returns {Promise} Date-specific comparison
     */
    compareByDateRange: async (startDate, endDate, storeIds = []) => {
        return storeComparisonApi.compareStores({
            startDate,
            endDate,
            storeIds,
            metrics: ['sales', 'inventory', 'growth']
        });
    },

    /**
     * Export comparison as CSV
     * @param {Object} params - Export parameters
     * @returns {Promise} CSV download
     */
    exportToCSV: async (params = {}) => {
        const result = await storeComparisonApi.exportComparison({
            ...params,
            format: 'csv'
        });

        if (result.data && result.filename) {
            storeComparisonApi.downloadFile(result.data, result.filename);
        }

        return result;
    },

    /**
     * Export comparison as Excel (if supported)
     * @param {Object} params - Export parameters
     * @returns {Promise} Excel download
     */
    exportToExcel: async (params = {}) => {
        const result = await storeComparisonApi.exportComparison({
            ...params,
            format: 'excel'
        });

        if (result.data && result.filename) {
            storeComparisonApi.downloadFile(result.data, result.filename);
        }

        return result;
    },

    /**
     * Get top performing stores by revenue
     * @param {number} limit - Number of stores to return
     * @param {Object} filters - Date filters
     * @returns {Promise} Top performing stores
     */
    getTopStoresByRevenue: async (limit = 10, filters = {}) => {
        const result = await storeComparisonApi.compareByMetric('revenue', {
            ...filters,
            sort: 'desc'
        });

        return {
            ...result,
            stores: result.data?.stores?.slice(0, limit) || []
        };
    },

    /**
     * Get store rankings summary
     * @param {Array} storeIds - Store IDs (optional)
     * @returns {Promise} Rankings summary
     */
    getStoreRankings: async (storeIds = []) => {
        const result = await storeComparisonApi.compareStores({
            storeIds,
            metrics: ['sales', 'inventory', 'efficiency'],
            includeRanking: true,
            includeTrends: false
        });

        // Extract rankings from each store
        const rankings = result.data?.stores?.map(store => ({
            storeId: store.storeInfo.id,
            storeName: store.storeInfo.name,
            overallRank: store.rankings?.overall?.rank || 0,
            overallPercentile: store.rankings?.overall?.percentile || '0',
            salesRank: store.rankings?.sales?.rank || 0,
            inventoryRank: store.rankings?.inventory?.rank || 0,
            efficiencyRank: store.rankings?.efficiency?.rank || 0,
            overallScore: store.overallScore || 0
        })) || [];

        return {
            success: true,
            data: {
                rankings,
                totalStores: rankings.length,
                timestamp: new Date().toISOString()
            }
        };
    },

    /**
     * Get store performance insights
     * @param {string} storeId - Store ID
     * @returns {Promise} Performance insights
     */
    getStoreInsights: async (storeId) => {
        const drillDown = await storeComparisonApi.getStoreDrillDown(storeId);

        // Extract insights from drill-down
        return {
            success: true,
            data: {
                storeInfo: drillDown.data?.storeInfo,
                strengths: drillDown.data?.analysis?.strengths || [],
                weaknesses: drillDown.data?.analysis?.weaknesses || [],
                opportunities: drillDown.data?.analysis?.opportunities || [],
                threats: drillDown.data?.analysis?.threats || [],
                recommendations: drillDown.data?.recommendations || [],
                comparison: drillDown.data?.comparison,
                timestamp: new Date().toISOString()
            }
        };
    },

    /**
     * Get store vs benchmark comparison
     * @param {string} storeId - Store ID
     * @returns {Promise} Store vs benchmark analysis
     */
    getStoreVsBenchmark: async (storeId) => {
        const [drillDown, benchmarks] = await Promise.all([
            storeComparisonApi.getStoreDrillDown(storeId),
            storeComparisonApi.getBenchmarks()
        ]);

        const storeComparison = drillDown.data?.comparison?.vsPeers;
        const benchmarkData = benchmarks.data;

        return {
            success: true,
            data: {
                storeInfo: drillDown.data?.storeInfo,
                storeMetrics: storeComparison?.metrics || {},
                benchmarkComparison: storeComparison?.vsBenchmark || {},
                benchmarkData,
                timestamp: new Date().toISOString()
            }
        };
    },

    /**
     * Get store performance over time
     * @param {string} storeId - Store ID
     * @param {string} period - Time period (daily, weekly, monthly)
     * @param {number} months - Number of months to analyze
     * @returns {Promise} Performance trends
     */
    getStorePerformanceHistory: async (storeId, period = 'monthly', months = 12) => {
        const trends = await storeComparisonApi.getStoreTrends(storeId, { period, months });

        return {
            success: true,
            data: {
                storeId,
                period,
                months,
                trends: trends.data?.trends || {},
                summary: trends.data?.summary || {},
                timestamp: new Date().toISOString()
            }
        };
    },

    /**
     * Compare two stores head-to-head
     * @param {string} storeId1 - First store ID
     * @param {string} storeId2 - Second store ID
     * @param {Object} filters - Comparison filters
     * @returns {Promise} Head-to-head comparison
     */
    compareHeadToHead: async (storeId1, storeId2, filters = {}) => {
        const result = await storeComparisonApi.compareStores({
            storeIds: [storeId1, storeId2],
            ...filters
        });

        // Structure as head-to-head comparison
        const stores = result.data?.stores || [];
        const store1 = stores.find(s => s.storeInfo.id === storeId1);
        const store2 = stores.find(s => s.storeInfo.id === storeId2);

        return {
            success: true,
            data: {
                store1,
                store2,
                comparison: {
                    revenueDifference: (store1?.metrics?.sales?.revenue || 0) - (store2?.metrics?.sales?.revenue || 0),
                    profitMarginDifference: (store1?.metrics?.sales?.profitMargin || 0) - (store2?.metrics?.sales?.profitMargin || 0),
                    inventoryValueDifference: (store1?.metrics?.inventory?.inventoryValue || 0) - (store2?.metrics?.inventory?.inventoryValue || 0),
                    overallScoreDifference: (store1?.overallScore || 0) - (store2?.overallScore || 0),
                    winner: (store1?.overallScore || 0) > (store2?.overallScore || 0) ? storeId1 : storeId2
                },
                insights: result.data?.insights,
                timestamp: new Date().toISOString()
            }
        };
    },

    // ============ BATCH OPERATIONS ============

    /**
     * Get multiple store insights at once
     * @param {Array} storeIds - Store IDs
     * @returns {Promise} Batch insights
     */
    getBatchStoreInsights: async (storeIds) => {
        const promises = storeIds.map(storeId =>
            storeComparisonApi.getStoreInsights(storeId)
        );

        const results = await Promise.all(promises);

        return {
            success: true,
            data: {
                insights: results.map(r => r.data),
                totalStores: storeIds.length,
                timestamp: new Date().toISOString()
            }
        };
    },

    /**
     * Compare multiple store pairs
     * @param {Array} storePairs - Array of store ID pairs [[id1, id2], ...]
     * @returns {Promise} Multiple head-to-head comparisons
     */
    compareMultiplePairs: async (storePairs) => {
        const promises = storePairs.map(pair =>
            storeComparisonApi.compareHeadToHead(pair[0], pair[1])
        );

        const results = await Promise.all(promises);

        return {
            success: true,
            data: {
                comparisons: results.map(r => r.data),
                totalComparisons: storePairs.length,
                timestamp: new Date().toISOString()
            }
        };
    }
};

export default storeComparisonApi;