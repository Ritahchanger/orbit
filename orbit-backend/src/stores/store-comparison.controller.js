const StoreComparisonService = require('./stores-comparison.service');
class StoreComparisonController {
    /**
     * Compare multiple stores
     * GET /api/v1/store-comparison/compare
     */
    compareStores = async (req, res) => {
        const {
            startDate,
            endDate,
            storeIds,
            metrics,
            benchmarkType,
            includeRanking,
            includeTrends,
            granularity
        } = req.query;

        // Convert query parameters
        const filters = {
            startDate,
            endDate,
            storeIds: storeIds ? storeIds.split(',') : [],
            metrics: metrics ? metrics.split(',') : ['sales', 'inventory', 'efficiency', 'growth', 'risk'],
            benchmarkType: benchmarkType || 'average',
            includeRanking: includeRanking !== 'false',
            includeTrends: includeTrends !== 'false',
            granularity: granularity || 'daily'
        };

        // Validate date range if both dates provided
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({
                success: false,
                error: 'Start date cannot be after end date'
            });
        }

        const comparisonResult = await StoreComparisonService.compareStores(filters);

        res.status(200).json({
            success: true,
            data: comparisonResult,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Get store drill-down analysis
     * GET /api/v1/store-comparison/drill-down/:storeId
     */
    getStoreDrillDown = async (req, res) => {
        const { storeId } = req.params;
        const {
            startDate,
            endDate,
            compareWith,
            detailLevel
        } = req.query;

        const filters = {
            startDate,
            endDate,
            compareWith: compareWith ? compareWith.split(',') : [],
            detailLevel: detailLevel || 'summary'
        };

        if (!storeId) {
            return res.status(400).json({
                success: false,
                error: 'Store ID is required'
            });
        }

        const drillDownData = await StoreComparisonService.getStoreDrillDown(storeId, filters);

        res.status(200).json({
            success: true,
            data: drillDownData,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Get quick store comparison (lightweight)
     * GET /api/v1/store-comparison/quick
     */
    getQuickComparison = async (req, res) => {
        const { storeIds } = req.query;

        if (!storeIds) {
            return res.status(400).json({
                success: false,
                error: 'At least one store ID is required'
            });
        }

        const storeIdArray = storeIds.split(',');

        if (storeIdArray.length < 2) {
            return res.status(400).json({
                success: false,
                error: 'Need at least 2 stores for comparison'
            });
        }

        // Set last 30 days as default period
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const filters = {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            storeIds: storeIdArray,
            metrics: ['sales', 'inventory'],
            includeRanking: true,
            includeTrends: false
        };

        const comparisonResult = await StoreComparisonService.compareStores(filters);

        res.status(200).json({
            success: true,
            data: {
                summary: comparisonResult.summary,
                stores: comparisonResult.stores.map(store => ({
                    id: store.storeInfo.id,
                    name: store.storeInfo.name,
                    overallScore: store.overallScore,
                    rankings: store.rankings,
                    keyMetrics: {
                        revenue: store.metrics.sales?.revenue || 0,
                        profitMargin: store.metrics.sales?.profitMargin || 0,
                        inventoryValue: store.metrics.inventory?.inventoryValue || 0
                    }
                }))
            },
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Get benchmark data for all stores
     * GET /api/v1/store-comparison/benchmarks
     */
    getBenchmarks = async (req, res) => {
        const {
            startDate,
            endDate,
            benchmarkType = 'average'
        } = req.query;

        // Get all active stores
        const stores = await StoreComparisonService.getStoresForComparison([]);

        if (stores.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No active stores found'
            });
        }

        const storeIds = stores.map(s => s._id);
        const benchmarkData = await StoreComparisonService.calculateBenchmarks(
            storeIds,
            startDate,
            endDate,
            benchmarkType
        );

        res.status(200).json({
            success: true,
            data: {
                benchmarkType,
                storeCount: stores.length,
                period: startDate && endDate ? `${startDate} to ${endDate}` : 'All time',
                metrics: benchmarkData.metrics,
                topPerformers: benchmarkData.topPerformers,
                underPerformers: benchmarkData.underPerformers
            },
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Export comparison data
     * GET /api/v1/store-comparison/export
     */
    exportComparison = async (req, res) => {
        const {
            format = 'json',
            startDate,
            endDate,
            storeIds,
            exportType = 'full' // 'full', 'summary', 'benchmarks'
        } = req.query;

        const filters = {
            startDate,
            endDate,
            storeIds: storeIds ? storeIds.split(',') : [],
            metrics: ['sales', 'inventory', 'efficiency', 'growth', 'risk'],
            includeRanking: true,
            includeTrends: true
        };

        const comparisonResult = await StoreComparisonService.compareStores(filters);

        let exportData;
        let filename;

        switch (exportType) {
            case 'summary':
                exportData = {
                    summary: comparisonResult.summary,
                    insights: comparisonResult.insights,
                    timestamp: comparisonResult.timestamp
                };
                filename = `store-comparison-summary-${Date.now()}`;
                break;

            case 'benchmarks':
                exportData = {
                    benchmarks: comparisonResult.benchmarks,
                    timestamp: comparisonResult.timestamp
                };
                filename = `store-benchmarks-${Date.now()}`;
                break;

            default:
                exportData = comparisonResult;
                filename = `store-comparison-full-${Date.now()}`;
        }

        switch (format) {
            case 'json':
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
                return res.send(JSON.stringify(exportData, null, 2));

            case 'csv':
                // This would require CSV conversion logic
                // For now, return JSON with a note
                return res.status(200).json({
                    success: true,
                    message: 'CSV export feature coming soon',
                    data: exportData
                });

            default:
                return res.status(400).json({
                    success: false,
                    error: 'Unsupported export format. Use "json" or "csv"'
                });
        }
    }

    /**
     * Get store performance trends
     * GET /api/v1/store-comparison/trends/:storeId
     */
    getStoreTrends = async (req, res) => {
        const { storeId } = req.params;
        const {
            period = 'monthly', // 'daily', 'weekly', 'monthly'
            months = 6
        } = req.query;

        if (!storeId) {
            return res.status(400).json({
                success: false,
                error: 'Store ID is required'
            });
        }

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - parseInt(months));

        const timeSeriesData = await StoreComparisonService.collectTimeSeriesData(
            [new mongoose.Types.ObjectId(storeId)],
            startDate,
            endDate,
            period
        );

        const trends = timeSeriesData[storeId] || {};

        res.status(200).json({
            success: true,
            data: {
                storeId,
                period,
                months,
                trends,
                summary: this.calculateTrendsSummary(trends[period] || [])
            },
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Compare stores by specific metric
     * GET /api/v1/store-comparison/metric/:metric
     */
    compareByMetric = async (req, res) => {
        const { metric } = req.params;
        const {
            storeIds,
            startDate,
            endDate,
            sort = 'desc'
        } = req.query;

        const validMetrics = ['revenue', 'profit', 'profitMargin', 'inventoryValue', 'inventoryTurnover', 'efficiency'];

        if (!validMetrics.includes(metric)) {
            return res.status(400).json({
                success: false,
                error: `Invalid metric. Valid metrics: ${validMetrics.join(', ')}`
            });
        }

        const filters = {
            startDate,
            endDate,
            storeIds: storeIds ? storeIds.split(',') : [],
            metrics: ['sales', 'inventory', 'efficiency'],
            includeRanking: false,
            includeTrends: false
        };

        const comparisonResult = await StoreComparisonService.compareStores(filters);

        // Extract and sort by specific metric
        const storesWithMetric = comparisonResult.stores
            .map(store => {
                let value;
                switch (metric) {
                    case 'revenue':
                        value = store.metrics.sales?.revenue || 0;
                        break;
                    case 'profit':
                        value = store.metrics.sales?.profit || 0;
                        break;
                    case 'profitMargin':
                        value = store.metrics.sales?.profitMargin || 0;
                        break;
                    case 'inventoryValue':
                        value = store.metrics.inventory?.inventoryValue || 0;
                        break;
                    case 'inventoryTurnover':
                        value = store.metrics.inventory?.inventoryTurnover || 0;
                        break;
                    case 'efficiency':
                        value = store.metrics.efficiency?.revenuePerHour || 0;
                        break;
                    default:
                        value = 0;
                }

                return {
                    storeId: store.storeInfo.id,
                    storeName: store.storeInfo.name,
                    storeCode: store.storeInfo.code,
                    [metric]: value,
                    overallScore: store.overallScore
                };
            })
            .sort((a, b) => sort === 'asc' ? a[metric] - b[metric] : b[metric] - a[metric]);

        res.status(200).json({
            success: true,
            data: {
                metric,
                sort,
                totalStores: storesWithMetric.length,
                stores: storesWithMetric,
                summary: {
                    average: storesWithMetric.reduce((sum, store) => sum + store[metric], 0) / storesWithMetric.length,
                    max: Math.max(...storesWithMetric.map(store => store[metric])),
                    min: Math.min(...storesWithMetric.map(store => store[metric])),
                    median: this.calculateMedian(storesWithMetric.map(store => store[metric]))
                }
            },
            timestamp: new Date().toISOString()
        });
    }

    // Helper methods
    calculateTrendsSummary(trendsData) {
        if (!trendsData || trendsData.length === 0) {
            return {
                totalRevenue: 0,
                totalProfit: 0,
                avgRevenue: 0,
                avgProfit: 0,
                growthRate: 0,
                volatility: 0
            };
        }

        const revenues = trendsData.map(t => t.revenue);
        const profits = trendsData.map(t => t.profit);

        const totalRevenue = revenues.reduce((a, b) => a + b, 0);
        const totalProfit = profits.reduce((a, b) => a + b, 0);
        const avgRevenue = totalRevenue / revenues.length;
        const avgProfit = totalProfit / profits.length;

        // Calculate growth rate (first vs last period)
        const growthRate = revenues.length > 1 ?
            ((revenues[revenues.length - 1] - revenues[0]) / revenues[0]) * 100 : 0;

        // Calculate volatility (standard deviation)
        const revenueStdDev = Math.sqrt(
            revenues.map(x => Math.pow(x - avgRevenue, 2))
                .reduce((a, b) => a + b) / revenues.length
        );

        return {
            totalRevenue,
            totalProfit,
            avgRevenue,
            avgProfit,
            growthRate: parseFloat(growthRate.toFixed(2)),
            volatility: parseFloat((revenueStdDev / avgRevenue * 100).toFixed(2)),
            periods: trendsData.length
        };
    }

    calculateMedian(values) {
        if (values.length === 0) return 0;

        const sorted = [...values].sort((a, b) => a - b);
        const middle = Math.floor(sorted.length / 2);

        if (sorted.length % 2 === 0) {
            return (sorted[middle - 1] + sorted[middle]) / 2;
        }

        return sorted[middle];
    }
}

module.exports = new StoreComparisonController();