// services/inventory/inventory-stats.service.js
const BaseInventoryService = require('./base-inventory.service');

class InventoryStatsService extends BaseInventoryService {
    async getInventoryStats(storeId, additionalQuery = {}) {
        const query = { store: storeId, ...additionalQuery };

        const stats = await this.StockInventory.aggregate([
            { $match: query },
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
                    _id: null,
                    totalItems: { $sum: 1 },
                    totalStock: { $sum: "$stock" },
                    totalValue: {
                        $sum: {
                            $multiply: [
                                "$stock",
                                { $ifNull: ["$storePrice", "$productDetails.price"] }
                            ]
                        }
                    },
                    totalCostValue: {
                        $sum: {
                            $multiply: ["$stock", "$productDetails.costPrice"]
                        }
                    },
                    lowStockCount: {
                        $sum: {
                            $cond: [{ $lte: ["$stock", "$minStock"] }, 1, 0]
                        }
                    },
                    outOfStockCount: {
                        $sum: {
                            $cond: [{ $eq: ["$stock", 0] }, 1, 0]
                        }
                    },
                    inStockCount: {
                        $sum: {
                            $cond: [{ $gt: ["$stock", 0] }, 1, 0]
                        }
                    },
                    totalStoreSold: { $sum: "$storeSold" },
                    totalStoreRevenue: { $sum: "$storeRevenue" },
                    averageStockPerItem: { $avg: "$stock" }
                }
            }
        ]);

        const result = stats[0] || this.getDefaultStats();

        // Calculate profit
        const totalProfit = result.totalStoreRevenue - result.totalCostValue;
        const profitMargin = result.totalStoreRevenue > 0
            ? (totalProfit / result.totalStoreRevenue) * 100
            : 0;

        return {
            ...result,
            totalProfit: totalProfit,
            profitMargin: profitMargin.toFixed(2),
            potentialProfit: (result.totalValue - result.totalCostValue)
        };
    }

    getDefaultStats() {
        return {
            totalItems: 0,
            totalStock: 0,
            totalValue: 0,
            totalCostValue: 0,
            lowStockCount: 0,
            outOfStockCount: 0,
            inStockCount: 0,
            totalStoreSold: 0,
            totalStoreRevenue: 0,
            averageStockPerItem: 0
        };
    }
}

module.exports = new InventoryStatsService();