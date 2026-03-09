const mongoose = require('mongoose');
const Store = require('./store.model');
const StoreInventory = require('../store-inventory/store-inventory.model');
const Sale = require('../sales/sales.model');
const Product = require('../products/products.model');

class StoreComparisonService {
    /**
     * Get comprehensive store comparison data
     */
    async compareStores(filters = {}) {
        try {
            const {
                startDate,
                endDate,
                storeIds = [],
                metrics = ['sales', 'inventory', 'efficiency', 'growth', 'risk'],
                benchmarkType = 'average', // 'average', 'top', 'median', 'best'
                includeRanking = true,
                includeTrends = true,
                granularity = 'daily' // 'daily', 'weekly', 'monthly'
            } = filters;

            // Get active stores
            const stores = await this.getStoresForComparison(storeIds);

            if (stores.length < 2) {
                throw new Error('Need at least 2 stores for comparison');
            }

            const storeIdList = stores.map(s => s._id);

            // Execute all data collection in parallel
            const [
                salesData,
                inventoryData,
                operationalData,
                timeSeriesData,
                benchmarkData
            ] = await Promise.all([
                this.collectSalesMetrics(storeIdList, startDate, endDate),
                this.collectInventoryMetrics(storeIdList),
                this.collectOperationalMetrics(storeIdList, startDate, endDate),
                this.collectTimeSeriesData(storeIdList, startDate, endDate, granularity),
                this.calculateBenchmarks(storeIdList, startDate, endDate, benchmarkType)
            ]);

            // Calculate comprehensive metrics for each store
            const storeComparisons = stores.map(store => {
                const storeId = store._id.toString();

                return this.calculateStoreComparison(
                    store,
                    salesData[storeId] || {},
                    inventoryData[storeId] || {},
                    operationalData[storeId] || {},
                    timeSeriesData[storeId] || {},
                    benchmarkData,
                    metrics
                );
            });

            // Add rankings if requested
            if (includeRanking) {
                this.addRankings(storeComparisons, metrics);
            }

            // Calculate insights and recommendations
            const insights = this.generateInsights(storeComparisons, benchmarkData);

            return {
                timestamp: new Date(),
                filters,
                stores: storeComparisons,
                benchmarks: benchmarkData,
                insights,
                summary: this.generateComparisonSummary(storeComparisons)
            };

        } catch (error) {
            throw new Error(`Store comparison failed: ${error.message}`);
        }
    }

    /**
     * Get stores for comparison
     */
    async getStoresForComparison(storeIds = []) {
        const query = { status: 'active' };

        if (storeIds.length > 0) {
            query._id = { $in: storeIds.map(id => new mongoose.Types.ObjectId(id)) };
        }

        return Store.find(query)
            .select('_id name code address phone email manager openingHours status createdAt')
            .populate('manager', 'name email')
            .lean();
    }

    /**
     * Collect sales metrics for stores
     */
    async collectSalesMetrics(storeIds, startDate, endDate) {
        const matchStage = {
            storeId: { $in: storeIds.map(id => new mongoose.Types.ObjectId(id)) },
            status: 'completed'
        };

        if (startDate && endDate) {
            matchStage.saleDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const salesAggregation = await Sale.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: "$storeId",
                    totalRevenue: { $sum: "$total" },
                    totalProfit: { $sum: "$profit" },
                    totalTransactions: { $count: {} },
                    totalItemsSold: { $sum: "$quantity" },
                    avgTransactionValue: { $avg: "$total" },
                    maxTransactionValue: { $max: "$total" },
                    minTransactionValue: { $min: "$total" },
                    revenuePerItem: { $avg: "$unitPrice" },
                    totalDiscounts: { $sum: "$discount" },
                    // Payment method breakdown
                    cashSales: {
                        $sum: { $cond: [{ $eq: ["$paymentMethod", "cash"] }, "$total", 0] }
                    },
                    digitalSales: {
                        $sum: { $cond: [{ $in: ["$paymentMethod", ["mpesa", "card", "paybill"]] }, "$total", 0] }
                    }
                }
            }
        ]);

        // Transform to object for easy lookup
        const result = {};
        salesAggregation.forEach(storeSales => {
            const storeId = storeSales._id.toString();
            result[storeId] = {
                ...storeSales,
                profitMargin: storeSales.totalRevenue > 0 ?
                    (storeSales.totalProfit / storeSales.totalRevenue * 100) : 0,
                avgItemsPerTransaction: storeSales.totalTransactions > 0 ?
                    storeSales.totalItemsSold / storeSales.totalTransactions : 0,
                discountRate: storeSales.totalRevenue > 0 ?
                    (storeSales.totalDiscounts / storeSales.totalRevenue * 100) : 0,
                digitalPaymentRatio: storeSales.totalRevenue > 0 ?
                    (storeSales.digitalSales / storeSales.totalRevenue * 100) : 0
            };
        });

        return result;
    }

    /**
     * Collect inventory metrics for stores
     */
    async collectInventoryMetrics(storeIds) {
        const inventoryAggregation = await StoreInventory.aggregate([
            {
                $match: {
                    store: { $in: storeIds.map(id => new mongoose.Types.ObjectId(id)) }
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'product',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: '$productDetails' },
            {
                $group: {
                    _id: "$store",
                    totalItems: { $sum: "$stock" },
                    totalInventoryValue: {
                        $sum: { $multiply: ["$stock", "$productDetails.price"] }
                    },
                    totalInventoryCost: {
                        $sum: { $multiply: ["$stock", "$productDetails.costPrice"] }
                    },
                    lowStockItems: {
                        $sum: { $cond: [{ $eq: ["$status", "Low Stock"] }, 1, 0] }
                    },
                    outOfStockItems: {
                        $sum: { $cond: [{ $eq: ["$status", "Out of Stock"] }, 1, 0] }
                    },
                    uniqueProducts: { $addToSet: "$product" },
                    totalStoreSold: { $sum: "$storeSold" },
                    totalStoreRevenue: { $sum: "$storeRevenue" },
                    avgStockTurnover: { $avg: { $divide: ["$storeSold", "$stock"] } }
                }
            }
        ]);

        const result = {};
        inventoryAggregation.forEach(storeInv => {
            const storeId = storeInv._id.toString();
            result[storeId] = {
                ...storeInv,
                potentialProfit: storeInv.totalInventoryValue - storeInv.totalInventoryCost,
                profitMargin: storeInv.totalInventoryCost > 0 ?
                    ((storeInv.totalInventoryValue - storeInv.totalInventoryCost) / storeInv.totalInventoryCost * 100) : 0,
                stockoutRate: storeInv.uniqueProducts.length > 0 ?
                    (storeInv.outOfStockItems / storeInv.uniqueProducts.length * 100) : 0,
                inventoryTurnover: storeInv.totalInventoryValue > 0 ?
                    storeInv.totalStoreRevenue / storeInv.totalInventoryValue : 0,
                avgDaysOfSupply: this.calculateDaysOfSupply(storeInv)
            };
        });

        return result;
    }

    /**
     * Collect operational metrics
     */
    async collectOperationalMetrics(storeIds, startDate, endDate) {
        // Get operational hours
        const stores = await Store.find({
            _id: { $in: storeIds }
        }).select('openingHours name');

        // Get sales per hour data
        const hourlySales = await Sale.aggregate([
            {
                $match: {
                    storeId: { $in: storeIds.map(id => new mongoose.Types.ObjectId(id)) },
                    status: 'completed',
                    saleDate: startDate && endDate ? {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    } : { $exists: true }
                }
            },
            {
                $group: {
                    _id: {
                        storeId: "$storeId",
                        hour: { $hour: "$saleDate" },
                        dayOfWeek: { $dayOfWeek: "$saleDate" }
                    },
                    totalRevenue: { $sum: "$total" },
                    transactionCount: { $count: {} }
                }
            }
        ]);

        const result = {};
        stores.forEach(store => {
            const storeId = store._id.toString();
            const storeSales = hourlySales.filter(s => s._id.storeId.toString() === storeId);

            result[storeId] = {
                operationalHours: this.calculateOperationalHours(store.openingHours),
                peakHours: this.identifyPeakHours(storeSales),
                efficiencyMetrics: this.calculateOperationalEfficiency(storeSales, store.openingHours),
                daysOperational: this.getDaysOperational(store.openingHours)
            };
        });

        return result;
    }

    /**
     * Collect time series data for trend analysis
     */
    async collectTimeSeriesData(storeIds, startDate, endDate, granularity = 'daily') {
        let dateFormat, period;

        switch (granularity) {
            case 'daily':
                dateFormat = '%Y-%m-%d';
                period = 'day';
                break;
            case 'weekly':
                dateFormat = '%Y-%U';
                period = 'week';
                break;
            case 'monthly':
                dateFormat = '%Y-%m';
                period = 'month';
                break;
            default:
                dateFormat = '%Y-%m-%d';
                period = 'day';
        }

        const timeSeriesAgg = await Sale.aggregate([
            {
                $match: {
                    storeId: { $in: storeIds.map(id => new mongoose.Types.ObjectId(id)) },
                    status: 'completed',
                    saleDate: startDate && endDate ? {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    } : { $exists: true }
                }
            },
            {
                $group: {
                    _id: {
                        storeId: "$storeId",
                        period: { $dateToString: { format: dateFormat, date: "$saleDate" } }
                    },
                    revenue: { $sum: "$total" },
                    profit: { $sum: "$profit" },
                    transactions: { $count: {} },
                    itemsSold: { $sum: "$quantity" },
                    avgTransactionValue: { $avg: "$total" }
                }
            },
            { $sort: { '_id.period': 1 } }
        ]);

        const result = {};
        storeIds.forEach(storeId => {
            result[storeId.toString()] = {
                [period]: timeSeriesAgg
                    .filter(ts => ts._id.storeId.toString() === storeId.toString())
                    .map(ts => ({
                        period: ts._id.period,
                        revenue: ts.revenue,
                        profit: ts.profit,
                        transactions: ts.transactions,
                        itemsSold: ts.itemsSold,
                        avgTransactionValue: ts.avgTransactionValue
                    }))
            };
        });

        return result;
    }

    /**
     * Calculate benchmarks across stores
     */
    async calculateBenchmarks(storeIds, startDate, endDate, benchmarkType = 'average') {
        // Get aggregated data for all stores
        const salesData = await this.collectSalesMetrics(storeIds, startDate, endDate);
        const inventoryData = await this.collectInventoryMetrics(storeIds);

        const allMetrics = storeIds.map(storeId => {
            const storeIdStr = storeId.toString();
            return {
                storeId: storeIdStr,
                revenue: salesData[storeIdStr]?.totalRevenue || 0,
                profit: salesData[storeIdStr]?.totalProfit || 0,
                profitMargin: salesData[storeIdStr]?.profitMargin || 0,
                inventoryValue: inventoryData[storeIdStr]?.totalInventoryValue || 0,
                inventoryTurnover: inventoryData[storeIdStr]?.inventoryTurnover || 0,
                transactionCount: salesData[storeIdStr]?.totalTransactions || 0,
                avgTransactionValue: salesData[storeIdStr]?.avgTransactionValue || 0
            };
        });

        return {
            type: benchmarkType,
            metrics: this.calculateBenchmarkMetrics(allMetrics, benchmarkType),
            topPerformers: this.identifyTopPerformers(allMetrics),
            underPerformers: this.identifyUnderPerformers(allMetrics)
        };
    }

    /**
     * Calculate store comparison metrics
     */
    calculateStoreComparison(store, sales, inventory, operations, timeSeries, benchmarks, metrics) {
        const comparison = {
            storeInfo: {
                id: store._id,
                name: store.name,
                code: store.code,
                address: store.address,
                manager: store.manager,
                status: store.status,
                age: this.calculateStoreAge(store.createdAt)
            },
            metrics: {},
            scores: {},
            trends: {},
            vsBenchmark: {}
        };

        // Sales metrics
        if (metrics.includes('sales')) {
            comparison.metrics.sales = {
                revenue: sales.totalRevenue || 0,
                profit: sales.totalProfit || 0,
                profitMargin: sales.profitMargin || 0,
                transactions: sales.totalTransactions || 0,
                avgTransactionValue: sales.avgTransactionValue || 0,
                itemsSold: sales.totalItemsSold || 0,
                avgItemsPerTransaction: sales.avgItemsPerTransaction || 0,
                discountRate: sales.discountRate || 0,
                digitalPaymentRatio: sales.digitalPaymentRatio || 0
            };
        }

        // Inventory metrics
        if (metrics.includes('inventory')) {
            comparison.metrics.inventory = {
                totalItems: inventory.totalItems || 0,
                inventoryValue: inventory.totalInventoryValue || 0,
                inventoryCost: inventory.totalInventoryCost || 0,
                potentialProfit: inventory.potentialProfit || 0,
                inventoryProfitMargin: inventory.profitMargin || 0,
                lowStockItems: inventory.lowStockItems || 0,
                outOfStockItems: inventory.outOfStockItems || 0,
                uniqueProducts: inventory.uniqueProducts?.length || 0,
                stockoutRate: inventory.stockoutRate || 0,
                inventoryTurnover: inventory.inventoryTurnover || 0,
                avgDaysOfSupply: inventory.avgDaysOfSupply || 0
            };
        }

        // Efficiency metrics
        if (metrics.includes('efficiency')) {
            comparison.metrics.efficiency = {
                operationalHours: operations.operationalHours || 0,
                revenuePerHour: sales.totalRevenue / (operations.operationalHours || 1),
                transactionsPerHour: sales.totalTransactions / (operations.operationalHours || 1),
                inventoryEfficiency: inventory.inventoryTurnover || 0,
                staffEfficiency: this.calculateStaffEfficiency(sales, operations),
                spaceEfficiency: this.calculateSpaceEfficiency(sales, store)
            };
        }

        // Growth metrics
        if (metrics.includes('growth') && timeSeries.daily) {
            comparison.metrics.growth = this.calculateGrowthMetrics(timeSeries.daily);
        }

        // Risk metrics
        if (metrics.includes('risk')) {
            comparison.metrics.risk = {
                dependencyScore: this.calculateDependencyScore(sales, inventory),
                stockoutRisk: inventory.stockoutRate || 0,
                profitabilityRisk: this.calculateProfitabilityRisk(sales),
                marketRisk: this.calculateMarketRisk(sales, benchmarks)
            };
        }

        // Calculate scores (0-100 scale)
        comparison.scores = this.calculateStoreScores(comparison.metrics, benchmarks);

        // Calculate trends
        comparison.trends = this.calculateStoreTrends(timeSeries);

        // Compare against benchmarks
        comparison.vsBenchmark = this.compareAgainstBenchmark(comparison.metrics, benchmarks);

        // Overall score
        comparison.overallScore = this.calculateOverallScore(comparison.scores, metrics);

        return comparison;
    }

    /**
     * Add rankings to store comparisons
     */
    addRankings(storeComparisons, metrics) {
        // For each metric, add ranking
        metrics.forEach(metric => {
            const sorted = [...storeComparisons].sort((a, b) => {
                const aValue = this.getMetricValue(a, metric);
                const bValue = this.getMetricValue(b, metric);
                return bValue - aValue; // Descending order
            });

            sorted.forEach((store, index) => {
                const storeIndex = storeComparisons.findIndex(s => s.storeInfo.id.toString() === store.storeInfo.id.toString());
                if (storeIndex !== -1) {
                    storeComparisons[storeIndex].rankings = storeComparisons[storeIndex].rankings || {};
                    storeComparisons[storeIndex].rankings[metric] = {
                        rank: index + 1,
                        total: sorted.length,
                        percentile: ((sorted.length - index) / sorted.length * 100).toFixed(1)
                    };
                }
            });
        });

        // Overall ranking
        const sortedOverall = [...storeComparisons].sort((a, b) => b.overallScore - a.overallScore);
        sortedOverall.forEach((store, index) => {
            const storeIndex = storeComparisons.findIndex(s => s.storeInfo.id.toString() === store.storeInfo.id.toString());
            if (storeIndex !== -1) {
                storeComparisons[storeIndex].rankings.overall = {
                    rank: index + 1,
                    total: sortedOverall.length,
                    percentile: ((sortedOverall.length - index) / sortedOverall.length * 100).toFixed(1)
                };
            }
        });
    }

    /**
     * Generate insights from comparison data
     */
    generateInsights(storeComparisons, benchmarks) {
        const insights = {
            topPerformers: [],
            improvementAreas: [],
            anomalies: [],
            recommendations: []
        };

        // Identify top performers
        storeComparisons.forEach(store => {
            if (store.rankings?.overall?.percentile >= 80) {
                insights.topPerformers.push({
                    store: store.storeInfo.name,
                    score: store.overallScore,
                    strengths: this.identifyStrengths(store)
                });
            }

            // Identify improvement areas
            if (store.rankings?.overall?.percentile <= 40) {
                insights.improvementAreas.push({
                    store: store.storeInfo.name,
                    score: store.overallScore,
                    weaknesses: this.identifyWeaknesses(store)
                });
            }

            // Identify anomalies (e.g., high revenue but low profit margin)
            if (this.hasAnomalies(store)) {
                insights.anomalies.push({
                    store: store.storeInfo.name,
                    anomaly: this.describeAnomaly(store)
                });
            }
        });

        // Generate recommendations
        insights.recommendations = this.generateRecommendations(storeComparisons, benchmarks);

        return insights;
    }

    /**
     * Generate comparison summary
     */
    generateComparisonSummary(storeComparisons) {
        const summary = {
            totalStores: storeComparisons.length,
            averageScores: {},
            bestPerforming: null,
            worstPerforming: null,
            metricRanges: {}
        };

        // Calculate averages
        const metrics = ['sales', 'inventory', 'efficiency', 'risk'];
        metrics.forEach(metric => {
            const values = storeComparisons
                .map(s => s.scores[metric]?.overall || 0)
                .filter(v => v > 0);

            if (values.length > 0) {
                summary.averageScores[metric] = values.reduce((a, b) => a + b, 0) / values.length;
            }
        });

        // Find best and worst
        const sortedByScore = [...storeComparisons].sort((a, b) => b.overallScore - a.overallScore);
        if (sortedByScore.length > 0) {
            summary.bestPerforming = {
                store: sortedByScore[0].storeInfo.name,
                score: sortedByScore[0].overallScore
            };
            summary.worstPerforming = {
                store: sortedByScore[sortedByScore.length - 1].storeInfo.name,
                score: sortedByScore[sortedByScore.length - 1].overallScore
            };
        }

        // Calculate ranges
        metrics.forEach(metric => {
            const values = storeComparisons
                .map(s => s.metrics[metric]?.revenue || s.metrics[metric]?.inventoryValue || 0)
                .filter(v => v > 0);

            if (values.length > 0) {
                summary.metricRanges[metric] = {
                    min: Math.min(...values),
                    max: Math.max(...values),
                    average: values.reduce((a, b) => a + b, 0) / values.length
                };
            }
        });

        return summary;
    }

    /**
     * Get drill-down data for specific store
     */
    async getStoreDrillDown(storeId, filters = {}) {
        try {
            const {
                startDate,
                endDate,
                compareWith = [], // Other stores to compare with
                detailLevel = 'summary' // 'summary', 'detailed', 'diagnostic'
            } = filters;

            // Get store details
            const store = await Store.findById(storeId)
                .populate('manager', 'name email phone')
                .lean();

            if (!store) {
                throw new Error('Store not found');
            }

            // Get comparison stores if specified
            const comparisonStores = compareWith.length > 0 ?
                await this.getStoresForComparison(compareWith) : [];

            // Collect all data for this store
            const [
                salesMetrics,
                inventoryMetrics,
                operationalMetrics,
                timeSeriesData,
                productPerformance,
                categoryPerformance,
                hourlyPerformance,
                benchmarkData
            ] = await Promise.all([
                this.collectSalesMetrics([storeId], startDate, endDate),
                this.collectInventoryMetrics([storeId]),
                this.collectOperationalMetrics([storeId], startDate, endDate),
                this.collectTimeSeriesData([storeId], startDate, endDate, 'daily'),
                this.getStoreProductPerformance(storeId, startDate, endDate),
                this.getStoreCategoryPerformance(storeId, startDate, endDate),
                this.getStoreHourlyPerformance(storeId, startDate, endDate),
                this.calculateBenchmarks([storeId, ...compareWith.map(id => new mongoose.Types.ObjectId(id))], startDate, endDate)
            ]);

            // Calculate comparison if other stores provided
            let comparison = {};
            if (comparisonStores.length > 0) {
                comparison = await this.compareStores({
                    startDate,
                    endDate,
                    storeIds: [storeId, ...compareWith],
                    metrics: ['sales', 'inventory', 'efficiency'],
                    includeRanking: true
                });
            }

            // Build drill-down response
            const drillDown = {
                storeInfo: {
                    ...store,
                    metrics: {
                        sales: salesMetrics[storeId.toString()] || {},
                        inventory: inventoryMetrics[storeId.toString()] || {},
                        operations: operationalMetrics[storeId.toString()] || {}
                    }
                },
                performance: {
                    trends: timeSeriesData[storeId.toString()] || {},
                    products: productPerformance,
                    categories: categoryPerformance,
                    hourly: hourlyPerformance
                },
                analysis: {
                    strengths: this.identifyStoreStrengths(salesMetrics[storeId.toString()], inventoryMetrics[storeId.toString()]),
                    weaknesses: this.identifyStoreWeaknesses(salesMetrics[storeId.toString()], inventoryMetrics[storeId.toString()]),
                    opportunities: this.identifyOpportunities(store, salesMetrics[storeId.toString()], benchmarkData),
                    threats: this.identifyThreats(store, salesMetrics[storeId.toString()], benchmarkData)
                },
                recommendations: this.generateStoreRecommendations(
                    store,
                    salesMetrics[storeId.toString()],
                    inventoryMetrics[storeId.toString()],
                    benchmarkData
                )
            };

            // Add comparison data if available
            if (comparison.stores) {
                drillDown.comparison = {
                    vsPeers: comparison.stores.find(s => s.storeInfo.id.toString() === storeId.toString()),
                    benchmarks: comparison.benchmarks,
                    ranking: comparison.stores.find(s => s.storeInfo.id.toString() === storeId.toString())?.rankings
                };
            }

            return drillDown;

        } catch (error) {
            throw new Error(`Drill-down failed: ${error.message}`);
        }
    }

    // ========== HELPER METHODS ==========

    calculateStoreAge(createdAt) {
        const now = new Date();
        const created = new Date(createdAt);
        const diffTime = Math.abs(now - created);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    calculateOperationalHours(openingHours) {
        let totalHours = 0;
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

        days.forEach(day => {
            if (openingHours[day]?.open && openingHours[day]?.close) {
                const openTime = this.parseTime(openingHours[day].open);
                const closeTime = this.parseTime(openingHours[day].close);
                totalHours += (closeTime - openTime) / (1000 * 60 * 60);
            }
        });

        return totalHours;
    }

    parseTime(timeStr) {
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);

        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    }

    identifyPeakHours(hourlySales) {
        if (!hourlySales || hourlySales.length === 0) return [];

        const hourRevenue = {};
        hourlySales.forEach(sale => {
            const hour = sale._id.hour;
            hourRevenue[hour] = (hourRevenue[hour] || 0) + sale.totalRevenue;
        });

        // Get top 3 hours
        return Object.entries(hourRevenue)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([hour, revenue]) => ({ hour: parseInt(hour), revenue }));
    }

    calculateOperationalEfficiency(hourlySales, openingHours) {
        // Calculate revenue per operational hour
        const totalRevenue = hourlySales.reduce((sum, sale) => sum + sale.totalRevenue, 0);
        const operationalHours = this.calculateOperationalHours(openingHours);

        return {
            revenuePerHour: operationalHours > 0 ? totalRevenue / operationalHours : 0,
            utilizationRate: this.calculateUtilizationRate(hourlySales, openingHours)
        };
    }

    calculateUtilizationRate(hourlySales, openingHours) {
        // Calculate what percentage of operational hours have sales
        const hoursWithSales = new Set(hourlySales.map(s => s._id.hour)).size;
        const totalOperationalHours = Math.floor(this.calculateOperationalHours(openingHours));

        return totalOperationalHours > 0 ? (hoursWithSales / totalOperationalHours) * 100 : 0;
    }

    getDaysOperational(openingHours) {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        return days.filter(day => openingHours[day]?.open && openingHours[day]?.close).length;
    }

    calculateDaysOfSupply(inventoryData) {
        const avgDailySales = inventoryData.totalStoreSold / 30; // Assuming 30 days
        return avgDailySales > 0 ? inventoryData.totalItems / avgDailySales : 0;
    }

    calculateStaffEfficiency(salesData, operationsData) {
        // Simplified - in reality you'd need staff data
        const revenue = salesData.totalRevenue || 0;
        const operationalHours = operationsData.operationalHours || 1;
        return revenue / operationalHours; // Revenue per operational hour
    }

    calculateSpaceEfficiency(salesData, store) {
        // Simplified - assumes address.building has size info
        const revenue = salesData.totalRevenue || 0;
        // This is a placeholder - you'd need actual square footage data
        return revenue; // Revenue per square foot (if you had the data)
    }

    calculateGrowthMetrics(timeSeriesData) {
        if (!timeSeriesData || timeSeriesData.length < 2) {
            return { revenueGrowth: 0, profitGrowth: 0, transactionGrowth: 0 };
        }

        const firstPeriod = timeSeriesData[0];
        const lastPeriod = timeSeriesData[timeSeriesData.length - 1];

        const revenueGrowth = firstPeriod.revenue > 0 ?
            ((lastPeriod.revenue - firstPeriod.revenue) / firstPeriod.revenue) * 100 : 0;

        const profitGrowth = firstPeriod.profit > 0 ?
            ((lastPeriod.profit - firstPeriod.profit) / firstPeriod.profit) * 100 : 0;

        const transactionGrowth = firstPeriod.transactions > 0 ?
            ((lastPeriod.transactions - firstPeriod.transactions) / firstPeriod.transactions) * 100 : 0;

        return {
            revenueGrowth,
            profitGrowth,
            transactionGrowth,
            compoundGrowthRate: this.calculateCAGR(timeSeriesData)
        };
    }

    calculateCAGR(timeSeriesData) {
        if (timeSeriesData.length < 2) return 0;

        const firstValue = timeSeriesData[0].revenue;
        const lastValue = timeSeriesData[timeSeriesData.length - 1].revenue;
        const periods = timeSeriesData.length - 1;

        if (firstValue <= 0) return 0;

        return (Math.pow(lastValue / firstValue, 1 / periods) - 1) * 100;
    }

    calculateDependencyScore(salesData, inventoryData) {
        // Calculate how dependent store is on few products
        // Simplified - in reality you'd need product-level sales data
        const uniqueProducts = inventoryData.uniqueProducts?.length || 1;
        const totalRevenue = salesData.totalRevenue || 1;

        // Lower score = more diversified
        return Math.min(100, (uniqueProducts / 100) * 100); // Normalized score
    }

    calculateProfitabilityRisk(salesData) {
        const profitMargin = salesData.profitMargin || 0;
        if (profitMargin < 10) return 80; // High risk if margin < 10%
        if (profitMargin < 20) return 50; // Medium risk if margin < 20%
        return 20; // Low risk
    }

    calculateMarketRisk(salesData, benchmarks) {
        // Compare store performance against benchmarks
        const storeRevenue = salesData.totalRevenue || 0;
        const benchmarkRevenue = benchmarks.metrics?.average?.revenue || 0;

        if (benchmarkRevenue === 0) return 50; // Neutral

        const deviation = Math.abs(storeRevenue - benchmarkRevenue) / benchmarkRevenue;
        return Math.min(100, deviation * 100); // Higher deviation = higher risk
    }

    calculateStoreScores(metrics, benchmarks) {
        const scores = {};

        // Sales score (0-100)
        if (metrics.sales) {
            scores.sales = this.calculateSalesScore(metrics.sales, benchmarks);
        }

        // Inventory score
        if (metrics.inventory) {
            scores.inventory = this.calculateInventoryScore(metrics.inventory, benchmarks);
        }

        // Efficiency score
        if (metrics.efficiency) {
            scores.efficiency = this.calculateEfficiencyScore(metrics.efficiency, benchmarks);
        }

        // Risk score (lower is better)
        if (metrics.risk) {
            scores.risk = this.calculateRiskScore(metrics.risk);
        }

        return scores;
    }

    calculateSalesScore(salesMetrics, benchmarks) {
        let score = 0;
        const weights = {
            profitMargin: 0.3,
            revenueGrowth: 0.25,
            transactionValue: 0.2,
            digitalPayments: 0.15,
            discountRate: 0.1
        };

        // Profit margin component
        const targetMargin = 25; // Target profit margin
        const marginScore = Math.min(100, (salesMetrics.profitMargin / targetMargin) * 100);
        score += marginScore * weights.profitMargin;

        // Revenue growth (simplified)
        const growthScore = salesMetrics.revenueGrowth > 0 ?
            Math.min(100, salesMetrics.revenueGrowth * 2) : 0;
        score += growthScore * weights.revenueGrowth;

        // Transaction value
        const avgTransactionBenchmark = benchmarks.metrics?.average?.avgTransactionValue || 100;
        const transactionScore = salesMetrics.avgTransactionValue > 0 ?
            Math.min(100, (salesMetrics.avgTransactionValue / avgTransactionBenchmark) * 100) : 0;
        score += transactionScore * weights.transactionValue;

        // Digital payments (higher is better)
        const digitalScore = Math.min(100, salesMetrics.digitalPaymentRatio * 2);
        score += digitalScore * weights.digitalPayments;

        // Discount rate (lower is better)
        const discountScore = Math.max(0, 100 - (salesMetrics.discountRate * 2));
        score += discountScore * weights.discountRate;

        return Math.round(score);
    }

    calculateInventoryScore(inventoryMetrics, benchmarks) {
        let score = 0;
        const weights = {
            turnover: 0.3,
            stockoutRate: 0.25,
            daysOfSupply: 0.2,
            lowStock: 0.15,
            potentialProfit: 0.1
        };

        // Inventory turnover (higher is better)
        const turnoverBenchmark = benchmarks.metrics?.average?.inventoryTurnover || 4;
        const turnoverScore = inventoryMetrics.inventoryTurnover > 0 ?
            Math.min(100, (inventoryMetrics.inventoryTurnover / turnoverBenchmark) * 100) : 0;
        score += turnoverScore * weights.turnover;

        // Stockout rate (lower is better)
        const stockoutScore = Math.max(0, 100 - inventoryMetrics.stockoutRate);
        score += stockoutScore * weights.stockoutRate;

        // Days of supply (optimal range 15-30 days)
        let daysSupplyScore = 0;
        if (inventoryMetrics.avgDaysOfSupply >= 15 && inventoryMetrics.avgDaysOfSupply <= 30) {
            daysSupplyScore = 100;
        } else if (inventoryMetrics.avgDaysOfSupply < 15) {
            daysSupplyScore = (inventoryMetrics.avgDaysOfSupply / 15) * 100;
        } else {
            daysSupplyScore = Math.max(0, 100 - ((inventoryMetrics.avgDaysOfSupply - 30) / 30) * 100);
        }
        score += daysSupplyScore * weights.daysOfSupply;

        // Low stock items (lower is better)
        const lowStockScore = inventoryMetrics.uniqueProducts > 0 ?
            Math.max(0, 100 - (inventoryMetrics.lowStockItems / inventoryMetrics.uniqueProducts) * 100) : 100;
        score += lowStockScore * weights.lowStock;

        // Potential profit margin
        const profitScore = Math.min(100, inventoryMetrics.inventoryProfitMargin);
        score += profitScore * weights.potentialProfit;

        return Math.round(score);
    }

    calculateEfficiencyScore(efficiencyMetrics, benchmarks) {
        let score = 0;
        const weights = {
            revenuePerHour: 0.4,
            utilizationRate: 0.3,
            spaceEfficiency: 0.3
        };

        // Revenue per hour
        const revenuePerHourBenchmark = benchmarks.metrics?.average?.revenuePerHour || 100;
        const revenueScore = efficiencyMetrics.revenuePerHour > 0 ?
            Math.min(100, (efficiencyMetrics.revenuePerHour / revenuePerHourBenchmark) * 100) : 0;
        score += revenueScore * weights.revenuePerHour;

        // Utilization rate
        score += efficiencyMetrics.utilizationRate * weights.utilizationRate;

        // Space efficiency (simplified)
        const spaceScore = Math.min(100, efficiencyMetrics.spaceEfficiency / 1000); // Assuming 1000 is good benchmark
        score += spaceScore * weights.spaceEfficiency;

        return Math.round(score);
    }

    calculateRiskScore(riskMetrics) {
        // Lower score is better (less risk)
        let riskScore = 0;
        const weights = {
            dependency: 0.3,
            stockout: 0.25,
            profitability: 0.25,
            market: 0.2
        };

        riskScore += (100 - riskMetrics.dependencyScore) * weights.dependency;
        riskScore += (100 - riskMetrics.stockoutRisk) * weights.stockout;
        riskScore += (100 - riskMetrics.profitabilityRisk) * weights.profitability;
        riskScore += (100 - riskMetrics.marketRisk) * weights.market;

        return Math.round(riskScore);
    }

    calculateOverallScore(scores, metrics) {
        const weights = {
            sales: 0.35,
            inventory: 0.3,
            efficiency: 0.25,
            risk: 0.1
        };

        let totalWeight = 0;
        let weightedSum = 0;

        metrics.forEach(metric => {
            if (scores[metric]) {
                weightedSum += scores[metric] * (weights[metric] || 0.25);
                totalWeight += (weights[metric] || 0.25);
            }
        });

        return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
    }

    calculateStoreTrends(timeSeriesData) {
        const trends = {
            revenue: 'stable',
            profit: 'stable',
            transactions: 'stable',
            direction: 'neutral'
        };

        if (!timeSeriesData.daily || timeSeriesData.daily.length < 10) {
            return trends;
        }

        const recentData = timeSeriesData.daily.slice(-10); // Last 10 periods
        const revenueTrend = this.analyzeTrend(recentData.map(d => d.revenue));
        const profitTrend = this.analyzeTrend(recentData.map(d => d.profit));
        const transactionTrend = this.analyzeTrend(recentData.map(d => d.transactions));

        trends.revenue = revenueTrend.trend;
        trends.profit = profitTrend.trend;
        trends.transactions = transactionTrend.trend;
        trends.direction = this.determineOverallDirection([revenueTrend, profitTrend, transactionTrend]);
        trends.growthRate = revenueTrend.growthRate;

        return trends;
    }

    analyzeTrend(data) {
        if (data.length < 2) return { trend: 'stable', growthRate: 0 };

        const firstHalf = data.slice(0, Math.floor(data.length / 2));
        const secondHalf = data.slice(Math.floor(data.length / 2));

        const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

        const growthRate = avgFirst > 0 ? ((avgSecond - avgFirst) / avgFirst) * 100 : 0;

        let trend = 'stable';
        if (growthRate > 10) trend = 'growing';
        else if (growthRate > 5) trend = 'slightly growing';
        else if (growthRate < -10) trend = 'declining';
        else if (growthRate < -5) trend = 'slightly declining';

        return { trend, growthRate };
    }

    determineOverallDirection(trends) {
        const weights = { growing: 1, slightlyGrowing: 0.5, stable: 0, slightlyDeclining: -0.5, declining: -1 };
        const trendValues = trends.map(t => weights[t.trend] || 0);
        const average = trendValues.reduce((a, b) => a + b, 0) / trendValues.length;

        if (average > 0.3) return 'positive';
        if (average < -0.3) return 'negative';
        return 'neutral';
    }

    compareAgainstBenchmark(storeMetrics, benchmarks) {
        const comparison = {};

        Object.keys(storeMetrics).forEach(category => {
            comparison[category] = {};
            Object.keys(storeMetrics[category]).forEach(metric => {
                const storeValue = storeMetrics[category][metric];
                const benchmarkValue = benchmarks.metrics?.average?.[metric] ||
                    benchmarks.metrics?.[category]?.[metric] || 0;

                if (benchmarkValue === 0) {
                    comparison[category][metric] = 'no benchmark';
                } else {
                    const difference = storeValue - benchmarkValue;
                    const percentage = (difference / benchmarkValue) * 100;

                    comparison[category][metric] = {
                        value: storeValue,
                        benchmark: benchmarkValue,
                        difference,
                        percentage: Math.round(percentage * 100) / 100,
                        status: this.getComparisonStatus(percentage, metric)
                    };
                }
            });
        });

        return comparison;
    }

    getComparisonStatus(percentage, metric) {
        // Define thresholds for different metrics
        const thresholds = {
            profitMargin: { good: 10, warning: -5 },
            revenue: { good: 20, warning: -10 },
            inventoryTurnover: { good: 15, warning: -10 },
            stockoutRate: { good: -20, warning: 10 } // Lower is better
        };

        const threshold = thresholds[metric] || { good: 15, warning: -10 };

        if (percentage >= threshold.good) return 'exceeding';
        if (percentage >= threshold.warning) return 'meeting';
        return 'below';
    }

    // Additional methods for product and category performance
    async getStoreProductPerformance(storeId, startDate, endDate) {
        const matchStage = {
            storeId: new mongoose.Types.ObjectId(storeId),
            status: 'completed'
        };

        if (startDate && endDate) {
            matchStage.saleDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        return Sale.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: "$productId",
                    productName: { $first: "$productName" },
                    sku: { $first: "$sku" },
                    totalSold: { $sum: "$quantity" },
                    totalRevenue: { $sum: "$total" },
                    totalProfit: { $sum: "$profit" },
                    avgPrice: { $avg: "$unitPrice" },
                    transactionCount: { $count: {} }
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 20 }
        ]);
    }

    async getStoreCategoryPerformance(storeId, startDate, endDate) {
        const matchStage = {
            storeId: new mongoose.Types.ObjectId(storeId),
            status: 'completed'
        };

        if (startDate && endDate) {
            matchStage.saleDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // First get sales with product IDs, then join with products to get categories
        const sales = await Sale.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: "$productId",
                    totalRevenue: { $sum: "$total" },
                    totalSold: { $sum: "$quantity" }
                }
            }
        ]);

        if (sales.length === 0) return [];

        const productIds = sales.map(s => s._id);
        const products = await Product.find(
            { _id: { $in: productIds } },
            '_id category'
        ).lean();

        // Create a map for quick lookup
        const productCategoryMap = {};
        products.forEach(p => {
            productCategoryMap[p._id.toString()] = p.category;
        });

        // Aggregate by category
        const categoryPerformance = {};
        sales.forEach(sale => {
            const category = productCategoryMap[sale._id.toString()] || 'Uncategorized';
            if (!categoryPerformance[category]) {
                categoryPerformance[category] = {
                    totalRevenue: 0,
                    totalSold: 0,
                    productCount: 0
                };
            }
            categoryPerformance[category].totalRevenue += sale.totalRevenue;
            categoryPerformance[category].totalSold += sale.totalSold;
            categoryPerformance[category].productCount++;
        });

        // Convert to array and sort
        return Object.entries(categoryPerformance)
            .map(([category, data]) => ({
                category,
                ...data,
                avgRevenuePerProduct: data.totalRevenue / data.productCount
            }))
            .sort((a, b) => b.totalRevenue - a.totalRevenue);
    }

    async getStoreHourlyPerformance(storeId, startDate, endDate) {
        const matchStage = {
            storeId: new mongoose.Types.ObjectId(storeId),
            status: 'completed'
        };

        if (startDate && endDate) {
            matchStage.saleDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        return Sale.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        hour: { $hour: "$saleDate" },
                        dayOfWeek: { $dayOfWeek: "$saleDate" }
                    },
                    totalRevenue: { $sum: "$total" },
                    transactionCount: { $count: {} },
                    avgTransactionValue: { $avg: "$total" }
                }
            },
            {
                $group: {
                    _id: "$_id.hour",
                    hour: { $first: "$_id.hour" },
                    totalRevenue: { $sum: "$totalRevenue" },
                    avgRevenue: { $avg: "$totalRevenue" },
                    transactionCount: { $sum: "$transactionCount" },
                    avgTransactionValue: { $avg: "$avgTransactionValue" }
                }
            },
            { $sort: { hour: 1 } }
        ]);
    }

    // ... rest of the helper methods for insights and recommendations
    identifyStrengths(store) {
        const strengths = [];

        if (store.scores?.sales >= 80) {
            strengths.push('Strong sales performance');
        }
        if (store.scores?.inventory >= 80) {
            strengths.push('Excellent inventory management');
        }
        if (store.scores?.efficiency >= 80) {
            strengths.push('High operational efficiency');
        }
        if (store.metrics?.sales?.profitMargin >= 25) {
            strengths.push('High profit margins');
        }
        if (store.metrics?.inventory?.stockoutRate <= 5) {
            strengths.push('Low stockout rate');
        }

        return strengths.length > 0 ? strengths : ['Consistent performance across metrics'];
    }

    identifyWeaknesses(store) {
        const weaknesses = [];

        if (store.scores?.sales <= 40) {
            weaknesses.push('Sales performance needs improvement');
        }
        if (store.scores?.inventory <= 40) {
            weaknesses.push('Inventory management issues');
        }
        if (store.metrics?.sales?.profitMargin <= 10) {
            weaknesses.push('Low profit margins');
        }
        if (store.metrics?.inventory?.stockoutRate >= 20) {
            weaknesses.push('High stockout rate');
        }
        if (store.metrics?.efficiency?.revenuePerHour <= 50) {
            weaknesses.push('Low revenue per operational hour');
        }

        return weaknesses.length > 0 ? weaknesses : ['No major weaknesses identified'];
    }

    hasAnomalies(store) {
        // Check for anomalies like high revenue but low profit
        if (store.metrics?.sales?.revenue > 10000 && store.metrics?.sales?.profitMargin < 10) {
            return true;
        }

        // High inventory value but low sales
        if (store.metrics?.inventory?.inventoryValue > 5000 && store.metrics?.sales?.revenue < 1000) {
            return true;
        }

        return false;
    }

    describeAnomaly(store) {
        if (store.metrics?.sales?.revenue > 10000 && store.metrics?.sales?.profitMargin < 10) {
            return 'High revenue with low profit margin - check pricing or cost structure';
        }

        if (store.metrics?.inventory?.inventoryValue > 5000 && store.metrics?.sales?.revenue < 1000) {
            return 'High inventory investment with low sales - consider inventory optimization';
        }

        return 'Performance pattern deviation detected';
    }

    generateRecommendations(storeComparisons, benchmarks) {
        const recommendations = [];

        storeComparisons.forEach(store => {
            if (store.scores?.sales <= 40) {
                recommendations.push({
                    store: store.storeInfo.name,
                    area: 'Sales',
                    recommendation: 'Focus on increasing average transaction value and improving profit margins',
                    priority: 'high'
                });
            }

            if (store.metrics?.inventory?.stockoutRate >= 15) {
                recommendations.push({
                    store: store.storeInfo.name,
                    area: 'Inventory',
                    recommendation: 'Improve stock management to reduce stockouts. Consider increasing min stock levels',
                    priority: 'high'
                });
            }

            if (store.metrics?.efficiency?.revenuePerHour <= 40) {
                recommendations.push({
                    store: store.storeInfo.name,
                    area: 'Operations',
                    recommendation: 'Optimize store hours or staffing during peak periods',
                    priority: 'medium'
                });
            }
        });

        // General recommendations based on benchmarks
        const avgProfitMargin = benchmarks.metrics?.average?.profitMargin || 0;
        if (avgProfitMargin < 15) {
            recommendations.push({
                store: 'All Stores',
                area: 'Pricing',
                recommendation: 'Consider reviewing pricing strategy to improve overall profit margins',
                priority: 'medium'
            });
        }

        return recommendations;
    }

    // Methods for store drill-down analysis
    identifyStoreStrengths(salesMetrics, inventoryMetrics) {
        const strengths = [];

        if (salesMetrics?.profitMargin >= 25) {
            strengths.push('High profit margins');
        }
        if (inventoryMetrics?.stockoutRate <= 5) {
            strengths.push('Excellent product availability');
        }
        if (salesMetrics?.digitalPaymentRatio >= 60) {
            strengths.push('Strong adoption of digital payments');
        }
        if (inventoryMetrics?.inventoryTurnover >= 4) {
            strengths.push('Efficient inventory turnover');
        }

        return strengths;
    }

    identifyStoreWeaknesses(salesMetrics, inventoryMetrics) {
        const weaknesses = [];

        if (salesMetrics?.profitMargin <= 10) {
            weaknesses.push('Low profit margins');
        }
        if (inventoryMetrics?.stockoutRate >= 20) {
            weaknesses.push('Frequent stockouts');
        }
        if (salesMetrics?.discountRate >= 15) {
            weaknesses.push('High discount rate affecting profitability');
        }
        if (inventoryMetrics?.inventoryTurnover <= 2) {
            weaknesses.push('Slow inventory turnover');
        }

        return weaknesses;
    }

    identifyOpportunities(store, salesMetrics, benchmarks) {
        const opportunities = [];

        // Compare against benchmarks
        if (salesMetrics?.profitMargin < (benchmarks.metrics?.average?.profitMargin || 20)) {
            opportunities.push('Improve profit margins to match benchmark');
        }

        if (salesMetrics?.digitalPaymentRatio < 50) {
            opportunities.push('Increase digital payment adoption');
        }

        if (store.address?.city === 'Nairobi' && salesMetrics?.totalRevenue < 10000) {
            opportunities.push('Expand market share in high-potential Nairobi market');
        }

        return opportunities;
    }

    identifyThreats(store, salesMetrics, benchmarks) {
        const threats = [];

        if (salesMetrics?.profitMargin <= 5) {
            threats.push('Unsustainable profit levels');
        }

        if (salesMetrics?.totalRevenue < (benchmarks.metrics?.average?.revenue || 0) * 0.5) {
            threats.push('Falling significantly behind peer performance');
        }

        // Market-specific threats
        if (store.address?.city === 'Nairobi') {
            threats.push('High competition in Nairobi market');
        }

        return threats;
    }

    generateStoreRecommendations(store, salesMetrics, inventoryMetrics, benchmarks) {
        const recommendations = [];

        // Profitability recommendations
        if (salesMetrics?.profitMargin < 15) {
            recommendations.push({
                category: 'Pricing',
                action: 'Review pricing strategy',
                details: 'Consider price adjustments or cost reduction to improve margins',
                impact: 'high',
                timeframe: 'short-term'
            });
        }

        // Inventory recommendations
        if (inventoryMetrics?.stockoutRate >= 10) {
            recommendations.push({
                category: 'Inventory',
                action: 'Optimize stock levels',
                details: `Increase minimum stock levels for fast-moving items. Currently experiencing ${inventoryMetrics.stockoutRate}% stockout rate`,
                impact: 'high',
                timeframe: 'immediate'
            });
        }

        // Operational recommendations
        if (salesMetrics?.avgTransactionValue < (benchmarks.metrics?.average?.avgTransactionValue || 100)) {
            recommendations.push({
                category: 'Sales',
                action: 'Increase basket size',
                details: 'Implement upselling strategies or bundle offers',
                impact: 'medium',
                timeframe: 'short-term'
            });
        }

        // Digital transformation
        if (salesMetrics?.digitalPaymentRatio < 40) {
            recommendations.push({
                category: 'Technology',
                action: 'Promote digital payments',
                details: 'Offer incentives for digital payment adoption',
                impact: 'medium',
                timeframe: 'medium-term'
            });
        }

        return recommendations;
    }

    calculateBenchmarkMetrics(allMetrics, benchmarkType) {
        const result = {
            average: {},
            median: {},
            top: {},
            bottom: {}
        };

        if (allMetrics.length === 0) return result;

        // Calculate for each metric
        const metricNames = ['revenue', 'profit', 'profitMargin', 'inventoryValue', 'inventoryTurnover'];

        metricNames.forEach(metric => {
            const values = allMetrics.map(m => m[metric]).filter(v => v !== undefined);
            if (values.length === 0) return;

            // Average
            result.average[metric] = values.reduce((a, b) => a + b, 0) / values.length;

            // Median
            const sorted = [...values].sort((a, b) => a - b);
            result.median[metric] = sorted[Math.floor(sorted.length / 2)];

            // Top (90th percentile)
            result.top[metric] = sorted[Math.floor(sorted.length * 0.9)];

            // Bottom (10th percentile)
            result.bottom[metric] = sorted[Math.floor(sorted.length * 0.1)];
        });

        // Return based on requested type
        switch (benchmarkType) {
            case 'average': return { average: result.average };
            case 'median': return { median: result.median };
            case 'top': return { top: result.top };
            case 'bottom': return { bottom: result.bottom };
            default: return result;
        }
    }

    identifyTopPerformers(allMetrics) {
        if (allMetrics.length === 0) return [];

        // Identify top 20% performers
        const sortedByRevenue = [...allMetrics].sort((a, b) => b.revenue - a.revenue);
        const topCount = Math.max(1, Math.floor(sortedByRevenue.length * 0.2));

        return sortedByRevenue.slice(0, topCount).map(m => ({
            storeId: m.storeId,
            revenue: m.revenue,
            profitMargin: m.profitMargin
        }));
    }

    identifyUnderPerformers(allMetrics) {
        if (allMetrics.length === 0) return [];

        // Identify bottom 20% performers
        const sortedByRevenue = [...allMetrics].sort((a, b) => a.revenue - b.revenue);
        const bottomCount = Math.max(1, Math.floor(sortedByRevenue.length * 0.2));

        return sortedByRevenue.slice(0, bottomCount).map(m => ({
            storeId: m.storeId,
            revenue: m.revenue,
            profitMargin: m.profitMargin
        }));
    }

    getMetricValue(storeComparison, metric) {
        switch (metric) {
            case 'sales':
                return storeComparison.metrics.sales?.revenue || 0;
            case 'inventory':
                return storeComparison.metrics.inventory?.inventoryValue || 0;
            case 'efficiency':
                return storeComparison.metrics.efficiency?.revenuePerHour || 0;
            case 'growth':
                return storeComparison.metrics.growth?.revenueGrowth || 0;
            case 'risk':
                return storeComparison.metrics.risk?.dependencyScore || 0;
            default:
                return storeComparison.overallScore || 0;
        }
    }
}

module.exports = new StoreComparisonService();