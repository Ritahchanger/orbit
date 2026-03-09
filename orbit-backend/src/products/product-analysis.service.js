// productAnalysis.service.js
const Product = require("./products.model");
const mongoose = require("mongoose");
const Store = require("../stores/store.model"); // Assuming you have a Store model

const StoreInventory = require("../store-inventory/store-inventory.model");
const ANALYSIS_CATEGORIES = {
    SALES: 'sales',
    INVENTORY: 'inventory',
    PERFORMANCE: 'performance',
    CATEGORY: 'category',
    FINANCIAL: 'financial',
    SEASONAL: 'seasonal'
};

class ProductAnalysisService {

    /**
     * Get comprehensive product dashboard analytics (global or store-specific)
     */
    async getDashboardAnalytics(timeRange = 'month', compareWithPrevious = true, storeId = null) {
        const timeFrame = this.getTimeFrame(timeRange);
        const previousTimeFrame = this.getTimeFrame(timeRange, true);

        // If storeId is provided, add store filter
        const storeFilter = storeId ? { store: storeId } : {};

        const [
            inventorySummary,
            topProducts,
            lowStockProducts,
            categoryDistribution,
            performanceMetrics,
            recentRestocks,
            storeDetails
        ] = await Promise.all([
            this.getInventorySummary(storeId),
            this.getTopProductsByRevenue(5, storeId),
            this.getLowStockAnalysis(storeId),
            this.getCategoryDistribution(storeId),
            this.getPerformanceMetrics(storeId),
            this.getRecentRestocks(7, storeId),
            storeId ? this.getStoreDetails(storeId) : Promise.resolve(null)
        ]);

        return {
            success: true,
            data: {
                inventorySummary,
                topProducts,
                lowStockAlert: lowStockProducts,
                categoryDistribution,
                performanceMetrics,
                recentRestocks,
                alerts: await this.generateAlerts(storeId),
                store: storeDetails,
                scope: storeId ? 'store' : 'global'
            }
        };
    }

    /**
     * Get inventory summary statistics (global or store-specific)
     */
    async getInventorySummary(storeId = null) {
        const matchStage = storeId ? { $match: { store: storeId } } : { $match: {} };

        const results = await Product.aggregate([
            matchStage,
            {
                $group: {
                    _id: null,
                    totalProducts: { $sum: 1 },
                    totalStock: { $sum: "$stock" },
                    totalValue: { $sum: { $multiply: ["$costPrice", "$stock"] } },
                    averageStock: { $avg: "$stock" },
                    totalItemsSold: { $sum: "$totalSold" },
                    totalRevenue: { $sum: "$totalRevenue" },
                    avgPrice: { $avg: "$price" },
                    avgCostPrice: { $avg: "$costPrice" },
                    lowStockCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $lte: ["$stock", "$minStock"] },
                                        { $gt: ["$stock", 0] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    outOfStockCount: {
                        $sum: {
                            $cond: [{ $eq: ["$stock", 0] }, 1, 0]
                        }
                    },
                    featuredProducts: {
                        $sum: {
                            $cond: [{ $eq: ["$isFeatured", true] }, 1, 0]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalProducts: 1,
                    totalStock: 1,
                    totalValue: { $round: ["$totalValue", 2] },
                    averageStock: { $round: ["$averageStock", 2] },
                    totalItemsSold: 1,
                    totalRevenue: { $round: ["$totalRevenue", 2] },
                    avgPrice: { $round: ["$avgPrice", 2] },
                    avgCostPrice: { $round: ["$avgCostPrice", 2] },
                    lowStockCount: 1,
                    outOfStockCount: 1,
                    inStockCount: {
                        $subtract: [
                            "$totalProducts",
                            { $add: ["$lowStockCount", "$outOfStockCount"] }
                        ]
                    },
                    featuredProducts: 1,
                    avgProfitMargin: {
                        $round: [{
                            $avg: {
                                $cond: [
                                    { $gt: ["$costPrice", 0] },
                                    {
                                        $multiply: [
                                            {
                                                $divide: [
                                                    { $subtract: ["$price", "$costPrice"] },
                                                    "$costPrice"
                                                ]
                                            },
                                            100
                                        ]
                                    },
                                    null
                                ]
                            }
                        }, 2]
                    }
                }
            }
        ]);

        const summary = results[0] || this.getDefaultSummary();

        // Add store-specific context if applicable
        if (storeId) {
            const store = await Store.findById(storeId).select('name code').lean();
            summary.store = store;
        }

        return summary;
    }

    /**
     * Get top products by revenue (global or store-specific)
     */
    async getTopProductsByRevenue(limit = 10, storeId = null) {
        const query = storeId ? { store: storeId } : {};

        return await Product.find(query)
            .sort({ totalRevenue: -1 })
            .limit(limit)
            .select('name sku price costPrice stock totalSold totalRevenue isFeatured status category store')
            .populate('store', 'name code')
            .lean()
            .then(products => products.map(p => ({
                ...p,
                profit: p.totalRevenue - (p.costPrice * p.totalSold),
                profitMargin: p.costPrice > 0 ?
                    ((p.price - p.costPrice) / p.costPrice * 100).toFixed(2) : 0,
                inventoryValue: p.costPrice * p.stock
            })));
    }

    /**
     * Get top products by sales volume (global or store-specific)
     */
    async getTopProductsBySales(limit = 10, storeId = null) {
        const query = storeId ? { store: storeId } : {};

        return await Product.find(query)
            .sort({ totalSold: -1 })
            .limit(limit)
            .select('name sku price totalSold totalRevenue stock status store')
            .populate('store', 'name code')
            .lean();
    }

    /**
     * Get low stock analysis (global or store-specific)
     */
    async getLowStockAnalysis(storeId = null) {
        const baseQuery = {
            $expr: { $lte: ["$stock", "$minStock"] },
            status: { $in: ["active", "Low Stock"] }
        };

        const query = storeId ? { ...baseQuery, store: storeId } : baseQuery;

        const lowStockProducts = await Product.find(query)
            .sort({ stock: 1 })
            .select('name sku stock minStock price costPrice status lastRestock store')
            .populate('store', 'name code')
            .lean()
            .then(products => products.map(p => ({
                ...p,
                deficit: p.minStock - p.stock,
                restockValue: (p.minStock - p.stock) * p.costPrice,
                severity: this.getStockSeverity(p.stock, p.minStock)
            })));

        const summary = lowStockProducts.reduce((acc, product) => ({
            totalProducts: acc.totalProducts + 1,
            totalDeficit: acc.totalDeficit + product.deficit,
            totalRestockValue: acc.totalRestockValue + product.restockValue,
            criticalCount: acc.criticalCount + (product.severity === 'critical' ? 1 : 0),
            warningCount: acc.warningCount + (product.severity === 'warning' ? 1 : 0)
        }), {
            totalProducts: 0,
            totalDeficit: 0,
            totalRestockValue: 0,
            criticalCount: 0,
            warningCount: 0
        });

        // Add store details if single store
        if (storeId && lowStockProducts.length > 0) {
            const store = await Store.findById(storeId).select('name code').lean();
            summary.store = store;
        }

        return {
            summary,
            products: lowStockProducts
        };
    }

    /**
     * Get category distribution and performance (global or store-specific)
     */

    async getCategoryDistribution(storeId = null) {
        // Create match stage - FIXED ObjectId creation
        let matchStage = { $match: {} };

        if (storeId) {
            try {
                // Use the proper way to create ObjectId
                const storeObjectId = new mongoose.Types.ObjectId(storeId);
                matchStage = { $match: { store: storeObjectId } };
            } catch (error) {
                console.error('Invalid store ID:', storeId, error);
                // Return empty data for invalid store ID
                if (storeId) {
                    const store = await Store.findById(storeId).select('name code').lean();
                    return {
                        categories: [],
                        store,
                        totals: {
                            totalStock: 0,
                            totalRevenue: 0
                        }
                    };
                }
                return [];
            }
        }

        // First, get totals for percentages
        const totalsPipeline = [matchStage, {
            $group: {
                _id: null,
                totalAllStock: { $sum: "$stock" },
                totalAllRevenue: { $sum: "$totalRevenue" }
            }
        }];

        const totals = await Product.aggregate(totalsPipeline);
        const totalStock = totals[0]?.totalAllStock || 0;
        const totalRevenue = totals[0]?.totalAllRevenue || 0;

        // Then get category data - handle null categories
        const categoryPipeline = [
            matchStage,
            {
                $group: {
                    _id: {
                        $ifNull: ["$category", "Uncategorized"]
                    },
                    count: { $sum: 1 },
                    totalStock: { $sum: "$stock" },
                    totalValue: { $sum: { $multiply: ["$costPrice", "$stock"] } },
                    totalRevenue: { $sum: "$totalRevenue" },
                    totalSold: { $sum: "$totalSold" },
                    avgPrice: { $avg: "$price" },
                    avgProfitMargin: {
                        $avg: {
                            $cond: [
                                { $and: [{ $gt: ["$costPrice", 0] }, { $gt: ["$price", 0] }] },
                                {
                                    $multiply: [
                                        {
                                            $divide: [
                                                { $subtract: ["$price", "$costPrice"] },
                                                "$costPrice"
                                            ]
                                        },
                                        100
                                    ]
                                },
                                0
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    category: "$_id",
                    _id: 0,
                    count: 1,
                    totalStock: 1,
                    totalValue: { $round: ["$totalValue", 2] },
                    totalRevenue: { $round: ["$totalRevenue", 2] },
                    totalSold: 1,
                    avgPrice: { $round: ["$avgPrice", 2] },
                    avgProfitMargin: { $round: ["$avgProfitMargin", 2] },
                    stockPercentage: {
                        $cond: [
                            { $gt: [totalStock, 0] },
                            { $round: [{ $multiply: [{ $divide: ["$totalStock", totalStock] }, 100] }, 2] },
                            0
                        ]
                    },
                    revenuePercentage: {
                        $cond: [
                            { $gt: [totalRevenue, 0] },
                            { $round: [{ $multiply: [{ $divide: ["$totalRevenue", totalRevenue] }, 100] }, 2] },
                            0
                        ]
                    }
                }
            },
            { $sort: { totalRevenue: -1 } }
        ];

        const categories = await Product.aggregate(categoryPipeline);

        console.log(`Found ${categories.length} categories for store ${storeId || 'global'}`);

        // Add store details if single store
        if (storeId) {
            const store = await Store.findById(storeId).select('name code').lean();
            return {
                categories,
                store,
                totals: {
                    totalStock,
                    totalRevenue
                }
            };
        }

        return categories;
    }

    /**
     * Get product performance metrics (global or store-specific)
     */
    async getPerformanceMetrics(storeId = null) {
        const matchStage = storeId ? { $match: { store: storeId } } : { $match: {} };

        const metrics = await Product.aggregate([
            matchStage,
            {
                $group: {
                    _id: null,
                    avgTurnoverRate: {
                        $avg: {
                            $cond: [
                                { $gt: ["$stock", 0] },
                                { $divide: ["$totalSold", "$stock"] },
                                0
                            ]
                        }
                    },
                    avgStockToSalesRatio: {
                        $avg: {
                            $cond: [
                                { $gt: ["$totalSold", 0] },
                                { $divide: ["$stock", "$totalSold"] },
                                0
                            ]
                        }
                    },
                    avgGMROI: {
                        $avg: {
                            $cond: [
                                { $gt: [{ $multiply: ["$costPrice", "$stock"] }, 0] },
                                {
                                    $divide: [
                                        {
                                            $multiply: [
                                                { $subtract: ["$price", "$costPrice"] },
                                                "$totalSold"
                                            ]
                                        },
                                        { $multiply: ["$costPrice", "$stock"] }
                                    ]
                                },
                                0
                            ]
                        }
                    },
                    avgSellThroughRate: {
                        $avg: {
                            $cond: [
                                { $gt: ["$stock", 0] },
                                {
                                    $divide: [
                                        "$totalSold",
                                        { $add: ["$stock", "$totalSold"] }
                                    ]
                                },
                                0
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    avgTurnoverRate: { $round: ["$avgTurnoverRate", 2] },
                    avgStockToSalesRatio: { $round: ["$avgStockToSalesRatio", 2] },
                    avgGMROI: { $round: ["$avgGMROI", 2] },
                    avgSellThroughRate: {
                        $round: [{ $multiply: ["$avgSellThroughRate", 100] }, 2]
                    }
                }
            }
        ]);

        const result = metrics[0] || {
            avgTurnoverRate: 0,
            avgStockToSalesRatio: 0,
            avgGMROI: 0,
            avgSellThroughRate: 0
        };

        // Add store details if single store
        if (storeId) {
            const store = await Store.findById(storeId).select('name code').lean();
            result.store = store;
        }

        return result;
    }

    /**
     * Get recent restocks (global or store-specific)
     */
    async getRecentRestocks(days = 7, storeId = null) {
        const date = new Date();
        date.setDate(date.getDate() - days);

        const query = {
            lastRestock: { $gte: date }
        };

        if (storeId) {
            query.store = storeId;
        }

        return await Product.find(query)
            .sort({ lastRestock: -1 })
            .select('name sku stock lastRestock costPrice minStock store')
            .populate('store', 'name code')
            .lean()
            .then(products => products.map(p => ({
                ...p,
                daysSinceRestock: Math.floor(
                    (new Date() - new Date(p.lastRestock)) / (1000 * 60 * 60 * 24)
                )
            })));
    }

    /**
     * Generate alerts and notifications (global or store-specific)
     */
    async generateAlerts(storeId = null) {
        const alerts = [];

        const query = storeId ? { store: storeId } : {};

        // Low stock alerts
        const lowStockProducts = await Product.find({
            ...query,
            $expr: { $lte: ["$stock", "$minStock"] },
            status: { $in: ["active", "Low Stock"] }
        }).select('name sku stock minStock').lean();

        lowStockProducts.forEach(product => {
            alerts.push({
                type: 'stock',
                level: product.stock === 0 ? 'critical' : 'warning',
                message: `${product.name} (${product.sku}) is ${product.stock === 0 ? 'out of stock' : 'low on stock'}`,
                product: product.name,
                sku: product.sku,
                currentStock: product.stock,
                requiredStock: product.minStock,
                deficit: product.minStock - product.stock,
                action: 'restock'
            });
        });

        // High inventory value alerts
        const highValueQuery = { ...query };
        const highValueProducts = await Product.find(highValueQuery)
            .sort({ inventoryValue: -1 })
            .limit(5)
            .select('name sku stock costPrice inventoryValue')
            .lean();

        highValueProducts.forEach(product => {
            if (product.inventoryValue > 10000) { // Threshold
                alerts.push({
                    type: 'inventory_value',
                    level: 'info',
                    message: `${product.name} has high inventory value ($${product.inventoryValue.toLocaleString()})`,
                    product: product.name,
                    sku: product.sku,
                    value: product.inventoryValue,
                    action: 'review'
                });
            }
        });

        // Slow moving products (no sales but high stock)
        const slowMovingQuery = {
            ...query,
            totalSold: 0,
            stock: { $gt: 10 }
        };

        const slowMovingProducts = await Product.find(slowMovingQuery)
            .select('name sku stock price costPrice')
            .lean();

        slowMovingProducts.forEach(product => {
            alerts.push({
                type: 'slow_moving',
                level: 'warning',
                message: `${product.name} has high stock but no sales`,
                product: product.name,
                sku: product.sku,
                stock: product.stock,
                inventoryValue: product.costPrice * product.stock,
                action: 'promote_or_discount'
            });
        });

        return alerts;
    }

    /**
     * Get profit margin analysis (global or store-specific)
     */
    async getProfitMarginAnalysis(storeId = null) {
        const matchStage = storeId ? { $match: { store: storeId, costPrice: { $gt: 0 } } } :
            { $match: { costPrice: { $gt: 0 } } };

        const analysis = await Product.aggregate([
            matchStage,
            {
                $project: {
                    name: 1,
                    sku: 1,
                    price: 1,
                    costPrice: 1,
                    profit: { $subtract: ["$price", "$costPrice"] },
                    profitMargin: {
                        $multiply: [
                            {
                                $divide: [
                                    { $subtract: ["$price", "$costPrice"] },
                                    "$costPrice"
                                ]
                            },
                            100
                        ]
                    },
                    category: 1,
                    status: 1,
                    totalSold: 1,
                    totalProfit: {
                        $multiply: [
                            { $subtract: ["$price", "$costPrice"] },
                            "$totalSold"
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    avgProfitMargin: { $avg: "$profitMargin" },
                    minProfitMargin: { $min: "$profitMargin" },
                    maxProfitMargin: { $max: "$profitMargin" },
                    totalProfit: { $sum: "$totalProfit" },
                    products: {
                        $push: {
                            name: "$name",
                            sku: "$sku",
                            profitMargin: { $round: ["$profitMargin", 2] },
                            profit: { $round: ["$profit", 2] },
                            totalProfit: { $round: ["$totalProfit", 2] },
                            category: "$category"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    avgProfitMargin: { $round: ["$avgProfitMargin", 2] },
                    minProfitMargin: { $round: ["$minProfitMargin", 2] },
                    maxProfitMargin: { $round: ["$maxProfitMargin", 2] },
                    totalProfit: { $round: ["$totalProfit", 2] },
                    topProfitable: {
                        $slice: [
                            {
                                $filter: {
                                    input: {
                                        $sortArray: {
                                            input: "$products",
                                            sortBy: { totalProfit: -1 }
                                        }
                                    },
                                    as: "product",
                                    cond: { $gt: ["$$product.totalProfit", 0] }
                                }
                            },
                            5
                        ]
                    },
                    lowMarginProducts: {
                        $slice: [
                            {
                                $filter: {
                                    input: {
                                        $sortArray: {
                                            input: "$products",
                                            sortBy: { profitMargin: 1 }
                                        }
                                    },
                                    as: "product",
                                    cond: { $lt: ["$$product.profitMargin", 10] }
                                }
                            },
                            5
                        ]
                    }
                }
            }
        ]);

        const result = analysis[0] || {
            avgProfitMargin: 0,
            minProfitMargin: 0,
            maxProfitMargin: 0,
            totalProfit: 0,
            topProfitable: [],
            lowMarginProducts: []
        };

        if (storeId) {
            const store = await Store.findById(storeId).select('name code').lean();
            result.store = store;
        }

        return result;
    }

    /**
     * Get inventory aging report (global or store-specific)
     */
    async getInventoryAgingReport(storeId = null) {
        const matchStage = storeId ? { $match: { store: storeId } } : { $match: {} };

        return await Product.aggregate([
            matchStage,
            {
                $project: {
                    name: 1,
                    sku: 1,
                    stock: 1,
                    costPrice: 1,
                    lastRestock: 1,
                    daysInInventory: {
                        $floor: {
                            $divide: [
                                { $subtract: [new Date(), "$lastRestock"] },
                                1000 * 60 * 60 * 24
                            ]
                        }
                    },
                    inventoryValue: { $multiply: ["$costPrice", "$stock"] }
                }
            },
            {
                $bucket: {
                    groupBy: "$daysInInventory",
                    boundaries: [0, 30, 60, 90, 180, 365],
                    default: "Over 365 days",
                    output: {
                        count: { $sum: 1 },
                        totalValue: { $sum: "$inventoryValue" },
                        totalStock: { $sum: "$stock" },
                        products: {
                            $push: {
                                name: "$name",
                                sku: "$sku",
                                stock: "$stock",
                                daysInInventory: "$daysInInventory",
                                value: "$inventoryValue"
                            }
                        }
                    }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);
    }

    /**
     * Get product recommendations (global or store-specific)
     */
    async getProductRecommendations(storeId = null) {
        const recommendations = {
            restock: [],
            discount: [],
            promote: [],
            phaseOut: []
        };

        const query = storeId ? { store: storeId } : {};

        // Products to restock
        const restockQuery = {
            ...query,
            $expr: { $lte: ["$stock", "$minStock"] },
            status: { $in: ["active", "Low Stock"] }
        };

        const restockProducts = await Product.find(restockQuery)
            .sort({ totalSold: -1 })
            .limit(5)
            .select('name sku stock minStock totalSold costPrice')
            .lean();

        recommendations.restock = restockProducts;

        // Products to consider for discount
        const discountQuery = {
            ...query,
            stock: { $gt: 20 },
            totalSold: { $lt: 10 },
            status: "active"
        };

        const discountCandidates = await Product.find(discountQuery)
            .sort({ stock: -1 })
            .limit(5)
            .select('name sku stock price totalSold')
            .lean();

        recommendations.discount = discountCandidates;

        // Products to promote
        const promoteQuery = {
            ...query,
            totalSold: { $gt: 50 },
            profitPerUnit: { $gt: 20 },
            isFeatured: false
        };

        const promoteProducts = await Product.find(promoteQuery)
            .sort({ totalSold: -1 })
            .limit(5)
            .select('name sku totalSold profitPerUnit price')
            .lean();

        recommendations.promote = promoteProducts;

        // Products to consider phasing out
        const phaseOutQuery = {
            ...query,
            totalSold: 0,
            stock: { $gt: 0 },
            lastRestock: { $lt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) }
        };

        const phaseOutProducts = await Product.find(phaseOutQuery)
            .sort({ inventoryValue: -1 })
            .limit(5)
            .select('name sku stock costPrice inventoryValue lastRestock')
            .lean();

        recommendations.phaseOut = phaseOutProducts;

        return recommendations;
    }

    /**
     * Get store comparison analytics
     */
    async getStoreComparison() {
        const storeStats = await Product.aggregate([
            {
                $group: {
                    _id: "$store",
                    totalProducts: { $sum: 1 },
                    totalStock: { $sum: "$stock" },
                    totalValue: { $sum: { $multiply: ["$costPrice", "$stock"] } },
                    totalRevenue: { $sum: "$totalRevenue" },
                    totalSold: { $sum: "$totalSold" },
                    lowStockCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $lte: ["$stock", "$minStock"] },
                                        { $gt: ["$stock", 0] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    outOfStockCount: {
                        $sum: {
                            $cond: [{ $eq: ["$stock", 0] }, 1, 0]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "stores",
                    localField: "_id",
                    foreignField: "_id",
                    as: "storeDetails"
                }
            },
            {
                $unwind: "$storeDetails"
            },
            {
                $project: {
                    storeId: "$_id",
                    storeName: "$storeDetails.name",
                    storeCode: "$storeDetails.code",
                    totalProducts: 1,
                    totalStock: 1,
                    totalValue: { $round: ["$totalValue", 2] },
                    totalRevenue: { $round: ["$totalRevenue", 2] },
                    totalSold: 1,
                    lowStockCount: 1,
                    outOfStockCount: 1,
                    inventoryHealth: {
                        $cond: [
                            { $gt: ["$totalProducts", 0] },
                            {
                                $round: [{
                                    $multiply: [{
                                        $divide: [
                                            { $subtract: ["$totalProducts", { $add: ["$lowStockCount", "$outOfStockCount"] }] },
                                            "$totalProducts"
                                        ]
                                    }, 100]
                                }, 2]
                            },
                            0
                        ]
                    }
                }
            },
            { $sort: { totalRevenue: -1 } }
        ]);

        return {
            success: true,
            data: {
                stores: storeStats,
                summary: {
                    totalStores: storeStats.length,
                    totalProducts: storeStats.reduce((sum, store) => sum + store.totalProducts, 0),
                    totalRevenue: storeStats.reduce((sum, store) => sum + store.totalRevenue, 0),
                    avgInventoryHealth: storeStats.length > 0 ?
                        storeStats.reduce((sum, store) => sum + store.inventoryHealth, 0) / storeStats.length : 0
                }
            }
        };
    }


    /**
     * Get store details
     */
    async getStoreDetails(storeId) {
        return await Store.findById(storeId)
            .select('name code address phone email status')
            .lean();
    }


    /**
     * Helper method to get stock severity
     */
    getStockSeverity(stock, minStock) {
        if (stock === 0) return 'critical';
        if (stock <= minStock * 0.5) return 'high';
        if (stock <= minStock) return 'warning';
        return 'healthy';
    }

    /**
     * Helper method to calculate growth percentage
     */
    calculateGrowth(current, previous) {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous * 100).toFixed(2);
    }

    /**
     * Helper method to get time frame
     */
    getTimeFrame(range, previous = false) {
        const now = new Date();
        const start = new Date();

        switch (range) {
            case 'day':
                start.setDate(now.getDate() - (previous ? 2 : 1));
                start.setHours(0, 0, 0, 0);
                break;
            case 'week':
                start.setDate(now.getDate() - (previous ? 14 : 7));
                break;
            case 'month':
                start.setMonth(now.getMonth() - (previous ? 2 : 1));
                break;
            case 'quarter':
                start.setMonth(now.getMonth() - (previous ? 6 : 3));
                break;
            case 'year':
                start.setFullYear(now.getFullYear() - (previous ? 2 : 1));
                break;
            default:
                start.setMonth(now.getMonth() - 1);
        }

        const end = new Date(start);
        switch (range) {
            case 'day':
                end.setDate(end.getDate() + 1);
                break;
            case 'week':
                end.setDate(end.getDate() + 7);
                break;
            case 'month':
                end.setMonth(end.getMonth() + 1);
                break;
            case 'quarter':
                end.setMonth(end.getMonth() + 3);
                break;
            case 'year':
                end.setFullYear(end.getFullYear() + 1);
                break;
            default:
                end.setMonth(end.getMonth() + 1);
        }

        return { start, end };
    }

    /**
     * Get default summary when no data exists
     */
    getDefaultSummary() {
        return {
            totalProducts: 0,
            totalStock: 0,
            totalValue: 0,
            averageStock: 0,
            totalItemsSold: 0,
            totalRevenue: 0,
            avgPrice: 0,
            avgCostPrice: 0,
            lowStockCount: 0,
            outOfStockCount: 0,
            inStockCount: 0,
            featuredProducts: 0,
            avgProfitMargin: 0
        };
    }


    /**
 * Get brand performance analysis (global or store-specific)
 */
    async getBrandPerformance(storeId = null) {
        const matchStage = storeId ? { $match: { store: storeId } } : { $match: {} };

        const brandPerformance = await Product.aggregate([
            matchStage,
            {
                $group: {
                    _id: "$brand",
                    count: { $sum: 1 },
                    totalStock: { $sum: "$stock" },
                    totalValue: { $sum: { $multiply: ["$costPrice", "$stock"] } },
                    totalRevenue: { $sum: "$totalRevenue" },
                    totalSold: { $sum: "$totalSold" },
                    avgPrice: { $avg: "$price" },
                    avgProfitMargin: {
                        $avg: {
                            $cond: [
                                { $and: [{ $gt: ["$costPrice", 0] }, { $gt: ["$price", 0] }] },
                                {
                                    $multiply: [
                                        {
                                            $divide: [
                                                { $subtract: ["$price", "$costPrice"] },
                                                "$costPrice"
                                            ]
                                        },
                                        100
                                    ]
                                },
                                0
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    brand: "$_id",
                    _id: 0,
                    count: 1,
                    totalStock: 1,
                    totalValue: { $round: ["$totalValue", 2] },
                    totalRevenue: { $round: ["$totalRevenue", 2] },
                    totalSold: 1,
                    avgPrice: { $round: ["$avgPrice", 2] },
                    avgProfitMargin: { $round: ["$avgProfitMargin", 2] },
                    avgRevenuePerProduct: {
                        $cond: [
                            { $gt: ["$count", 0] },
                            { $round: [{ $divide: ["$totalRevenue", "$count"] }, 2] },
                            0
                        ]
                    }
                }
            },
            { $sort: { totalRevenue: -1 } }
        ]);

        const result = {
            brands: brandPerformance,
            summary: {
                totalBrands: brandPerformance.length,
                totalProducts: brandPerformance.reduce((sum, brand) => sum + brand.count, 0),
                totalRevenue: brandPerformance.reduce((sum, brand) => sum + brand.totalRevenue, 0)
            }
        };

        if (storeId) {
            const store = await Store.findById(storeId).select('name code').lean();
            result.store = store;
        }

        return result;
    }
}

module.exports = new ProductAnalysisService();