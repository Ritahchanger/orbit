// services/storeInventoryAnalysis.service.js
const StoreInventory = require("../../store-inventory/store-inventory.model");
const Store = require("../../stores/store.model");

class StoreInventoryAnalysisService {
    /**
     * 1. Store inventory dashboard (Store-specific overview)
     */
    async getStoreDashboard(storeId) {
        const store = await this.validateAndGetStore(storeId);

        const [
            storeSummary,
            lowStockItems,
            topProducts,
            categoryAnalysis
        ] = await Promise.all([
            this.getStoreInventorySummary(storeId),
            this.getStoreLowStockAnalysis(storeId),
            this.getStoreTopProducts(storeId),
            this.getStoreCategoryAnalysis(storeId)
        ]);

        return {
            success: true,
            data: {
                store,
                summary: storeSummary,
                lowStockItems,
                topProducts,
                categoryAnalysis,
                recommendations: await this.getStoreRecommendations(storeId)
            }
        };
    }

    /**
     * 2. Store inventory summary
     */
    async getStoreInventorySummary(storeId) {
        const results = await StoreInventory.aggregate([
            { $match: { store: storeId } },
            {
                $lookup: {
                    from: "products",
                    localField: "product",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            {
                $group: {
                    _id: "$store",
                    totalItems: { $sum: 1 },
                    totalStock: { $sum: "$stock" },
                    totalValue: {
                        $sum: {
                            $multiply: ["$stock", "$productDetails.costPrice"]
                        }
                    },
                    totalStoreRevenue: { $sum: "$storeRevenue" },
                    totalStoreSold: { $sum: "$storeSold" },
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
                $project: {
                    _id: 0,
                    storeId: "$_id",
                    totalItems: 1,
                    totalStock: 1,
                    totalValue: { $round: ["$totalValue", 2] },
                    totalStoreRevenue: { $round: ["$totalStoreRevenue", 2] },
                    totalStoreSold: 1,
                    lowStockCount: 1,
                    outOfStockCount: 1,
                    inventoryHealth: {
                        $cond: [
                            { $gt: ["$totalItems", 0] },
                            {
                                $round: [{
                                    $multiply: [{
                                        $divide: [
                                            { $subtract: ["$totalItems", { $add: ["$lowStockCount", "$outOfStockCount"] }] },
                                            "$totalItems"
                                        ]
                                    }, 100]
                                }, 2]
                            },
                            0
                        ]
                    },
                    avgStockPerProduct: {
                        $cond: [
                            { $gt: ["$totalItems", 0] },
                            { $round: [{ $divide: ["$totalStock", "$totalItems"] }, 2] },
                            0
                        ]
                    }
                }
            }
        ]);

        return results[0] || this.getDefaultStoreSummary();
    }

    /**
     * 3. Store-specific low stock analysis
     */
    async getStoreLowStockAnalysis(storeId) {
        const lowStockItems = await StoreInventory.find({
            store: storeId,
            $expr: { $lte: ["$stock", "$minStock"] }
        })
            .populate({
                path: 'product',
                select: 'name sku price costPrice category'
            })
            .sort({ stock: 1 })
            .lean();

        const summary = lowStockItems.reduce((acc, item) => {
            const deficit = item.minStock - item.stock;
            const restockCost = deficit * (item.product?.costPrice || 0);

            return {
                totalItems: acc.totalItems + 1,
                totalDeficit: acc.totalDeficit + deficit,
                totalRestockCost: acc.totalRestockCost + restockCost,
                criticalCount: acc.criticalCount + (item.stock === 0 ? 1 : 0)
            };
        }, {
            totalItems: 0,
            totalDeficit: 0,
            totalRestockCost: 0,
            criticalCount: 0
        });

        return {
            summary,
            items: lowStockItems.map(item => ({
                productName: item.product?.name || 'Unknown',
                sku: item.product?.sku || 'N/A',
                currentStock: item.stock,
                minStock: item.minStock,
                deficit: item.minStock - item.stock,
                estimatedCost: (item.minStock - item.stock) * (item.product?.costPrice || 0),
                severity: this.getStockSeverity(item.stock, item.minStock),
                category: item.product?.category
            }))
        };
    }

    /**
     * 4. Store top performing products
     */
    async getStoreTopProducts(storeId, limit = 10) {
        const topProducts = await StoreInventory.find({ store: storeId })
            .populate({
                path: 'product',
                select: 'name sku price costPrice category'
            })
            .sort({ storeRevenue: -1 })
            .limit(limit)
            .lean();

        return topProducts.map(item => ({
            productName: item.product?.name,
            sku: item.product?.sku,
            category: item.product?.category,
            storeStock: item.stock,
            storeSold: item.storeSold,
            storeRevenue: item.storeRevenue,
            profitMargin: item.product?.costPrice > 0 ?
                ((item.product.price - item.product.costPrice) / item.product.costPrice * 100).toFixed(2) : 0,
            stockStatus: item.status
        }));
    }

    /**
     * Bonus: Store category analysis
     */
    async getStoreCategoryAnalysis(storeId) {
        const categoryData = await StoreInventory.aggregate([
            { $match: { store: storeId } },
            {
                $lookup: {
                    from: "products",
                    localField: "product",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            {
                $group: {
                    _id: "$productDetails.category",
                    itemCount: { $sum: 1 },
                    totalStock: { $sum: "$stock" },
                    totalSold: { $sum: "$storeSold" },
                    totalRevenue: { $sum: "$storeRevenue" },
                    avgStock: { $avg: "$stock" }
                }
            },
            {
                $project: {
                    category: "$_id",
                    _id: 0,
                    itemCount: 1,
                    totalStock: 1,
                    totalSold: 1,
                    totalRevenue: { $round: ["$totalRevenue", 2] },
                    avgStock: { $round: ["$avgStock", 2] },
                    stockShare: {
                        $cond: [
                            { $ne: ["$totalStock", 0] },
                            {
                                $multiply: [
                                    {
                                        $divide: [
                                            "$totalStock",
                                            { $sum: "$totalStock" }
                                        ]
                                    },
                                    100
                                ]
                            },
                            0
                        ]
                    }
                }
            },
            { $sort: { totalRevenue: -1 } }
        ]);

        return categoryData;
    }

    /**
     * Helper: Store recommendations
     */
    async getStoreRecommendations(storeId) {
        const recommendations = [];

        // Check for critical items
        const criticalItems = await StoreInventory.countDocuments({
            store: storeId,
            stock: 0
        });

        if (criticalItems > 0) {
            recommendations.push({
                type: 'critical',
                message: `${criticalItems} items are completely out of stock`,
                priority: 'high',
                action: 'immediate_restock'
            });
        }

        // Check for slow-moving items
        const slowMovers = await StoreInventory.find({
            store: storeId,
            storeSold: 0,
            stock: { $gt: 5 },
            lastRestock: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
        })
            .populate('product', 'name category')
            .limit(3)
            .lean();

        if (slowMovers.length > 0) {
            recommendations.push({
                type: 'warning',
                message: `${slowMovers.length} items have no sales in 90+ days`,
                priority: 'medium',
                action: 'review_for_discount',
                items: slowMovers.map(item => item.product?.name)
            });
        }

        return recommendations;
    }

    /**
     * Helper: Validate and get store
     */
    async validateAndGetStore(storeId) {
        const store = await Store.findById(storeId).select('name code address status').lean();
        if (!store) {
            throw new Error(`Store with ID ${storeId} not found`);
        }
        return store;
    }

    getStockSeverity(stock, minStock) {
        if (stock === 0) return 'critical';
        if (stock <= minStock * 0.3) return 'high';
        if (stock <= minStock) return 'warning';
        return 'healthy';
    }

    getDefaultStoreSummary() {
        return {
            totalItems: 0,
            totalStock: 0,
            totalValue: 0,
            totalStoreRevenue: 0,
            totalStoreSold: 0,
            lowStockCount: 0,
            outOfStockCount: 0,
            inventoryHealth: 0,
            avgStockPerProduct: 0
        };
    }
}

module.exports = new StoreInventoryAnalysisService();