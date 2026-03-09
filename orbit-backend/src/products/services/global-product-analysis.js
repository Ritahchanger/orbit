const Product = require("../../products/products.model");

class GlobalProductAnalysisService {
    /**
     * Get comprehensive dashboard overview
     */
    async getDashboardOverview() {
        const [
            inventorySummary,
            topProducts,
            categoryDistribution,
            lowStockAlerts
        ] = await Promise.all([
            this.getInventorySummary(),
            this.getTopProductsByRevenue(5),
            this.getCategoryPerformance(),
            this.getGlobalLowStockAlerts()
        ]);

        return {
            success: true,
            data: {
                inventorySummary,
                topProducts,
                categoryPerformance: categoryDistribution,
                lowStockAlerts,
                alerts: await this.generateGlobalAlerts()
            }
        };
    }

    /**
     * Get inventory health summary (Global)
     */
    async getInventorySummary() {
        const results = await Product.aggregate([
            {
                $group: {
                    _id: null,
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
                $project: {
                    _id: 0,
                    totalProducts: 1,
                    totalStock: 1,
                    totalValue: { $round: ["$totalValue", 2] },
                    totalRevenue: { $round: ["$totalRevenue", 2] },
                    totalSold: 1,
                    lowStockCount: 1,
                    outOfStockCount: 1,
                    inStockCount: {
                        $subtract: [
                            "$totalProducts",
                            { $add: ["$lowStockCount", "$outOfStockCount"] }
                        ]
                    },
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
            }
        ]);

        return results[0] || this.getDefaultSummary();
    }

    /**
     * Get top performing products by revenue
     */
    async getTopProductsByRevenue(limit = 10) {
        const products = await Product.find({})
            .sort({ totalRevenue: -1 })
            .limit(limit)
            .select('name sku price costPrice stock totalSold totalRevenue status category')
            .lean();

        return products.map(p => ({
            ...p,
            profit: (p.price - p.costPrice) * p.totalSold,
            profitMargin: p.costPrice > 0 ?
                ((p.price - p.costPrice) / p.costPrice * 100).toFixed(2) : 0,
            inventoryValue: p.costPrice * p.stock
        }));
    }

    /**
     * Get category performance analysis
     */
    async getCategoryPerformance() {
        return await Product.aggregate([
            {
                $group: {
                    _id: "$category",
                    productCount: { $sum: 1 },
                    totalStock: { $sum: "$stock" },
                    totalRevenue: { $sum: "$totalRevenue" },
                    totalSold: { $sum: "$totalSold" },
                    avgProfitMargin: {
                        $avg: {
                            $cond: [
                                { $and: [{ $gt: ["$costPrice", 0] }, { $gt: ["$price", 0] }] },
                                { $multiply: [{ $divide: [{ $subtract: ["$price", "$costPrice"] }, "$costPrice"] }, 100] },
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
                    productCount: 1,
                    totalStock: 1,
                    totalRevenue: { $round: ["$totalRevenue", 2] },
                    totalSold: 1,
                    avgProfitMargin: { $round: ["$avgProfitMargin", 2] }
                }
            },
            { $sort: { totalRevenue: -1 } }
        ]);
    }

    /**
     * Get global low stock alerts - WORKING VERSION
     */
    async getGlobalLowStockAlerts() {
        try {
            // Get low stock products
            const lowStockProducts = await Product.find({
                $expr: { $lte: ["$stock", "$minStock"] },
                status: { $in: ["active", "Low Stock", "In Stock"] }
            })
                .sort({ stock: 1 })
                .limit(50)
                .select('name sku stock minStock price costPrice category brand totalSold status productType lastRestock')
                .lean();

            // Calculate summary statistics
            const summary = {
                totalAlerts: lowStockProducts.length,
                critical: lowStockProducts.filter(p => p.stock === 0).length,
                warning: lowStockProducts.filter(p => p.stock > 0 && p.stock <= p.minStock).length,
                estimatedRestockValue: lowStockProducts.reduce((sum, p) => {
                    return sum + (Math.max(0, p.minStock - p.stock) * p.costPrice);
                }, 0),
                totalPotentialLoss: lowStockProducts.reduce((sum, p) => {
                    return sum + (Math.max(0, p.minStock - p.stock) * (p.price - p.costPrice));
                }, 0),
                byCategory: this._groupByCategory(lowStockProducts)
            };

            // Enrich products with additional data
            const enrichedProducts = lowStockProducts.map(p => ({
                ...p,
                deficit: Math.max(0, p.minStock - p.stock),
                severity: this._getStockSeverity(p.stock, p.minStock),
                priority: this._getStockPriority(p),
                inventoryValue: p.costPrice * p.stock,
                lostSalesValue: Math.max(0, p.minStock - p.stock) * p.price,
                recommendation: this._getRecommendation(p),
                urgency: this._calculateUrgency(p)
            }));

            return {
                success: true,
                summary,
                products: enrichedProducts,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error("Error in getGlobalLowStockAlerts:", error);
            throw error;
        }
    }

    /**
     * Helper: Generate global alerts
     */
    async generateGlobalAlerts() {
        const alerts = [];

        // Critical out of stock
        const outOfStock = await Product.countDocuments({
            stock: 0,
            status: { $in: ["active", "In Stock", "Low Stock"] }
        });
        if (outOfStock > 0) {
            alerts.push({
                type: 'critical',
                message: `${outOfStock} products are out of stock`,
                action: 'restock',
                priority: 'high'
            });
        }

        // Low stock products
        const lowStockCount = await Product.countDocuments({
            $expr: {
                $and: [
                    { $lte: ["$stock", "$minStock"] },
                    { $gt: ["$stock", 0] }
                ]
            },
            status: { $in: ["active", "In Stock", "Low Stock"] }
        });

        if (lowStockCount > 0) {
            alerts.push({
                type: 'warning',
                message: `${lowStockCount} products are running low on stock`,
                action: 'review',
                priority: 'medium'
            });
        }

        // High-value slow movers
        const slowMovers = await Product.countDocuments({
            totalSold: 0,
            stock: { $gt: 10 },
            costPrice: { $gt: 1000 }
        });

        if (slowMovers > 0) {
            alerts.push({
                type: 'info',
                message: `${slowMovers} high-value products have no sales`,
                action: 'review_promotion',
                priority: 'low'
            });
        }

        return alerts;
    }

    // ============ PRIVATE HELPER METHODS ============

    /**
     * Group products by category
     */
    _groupByCategory(products) {
        const grouped = {};
        products.forEach(product => {
            if (!grouped[product.category]) {
                grouped[product.category] = {
                    count: 0,
                    totalDeficit: 0,
                    totalValue: 0,
                    products: []
                };
            }
            grouped[product.category].count++;
            grouped[product.category].totalDeficit += Math.max(0, product.minStock - product.stock);
            grouped[product.category].totalValue += product.costPrice * product.stock;
            grouped[product.category].products.push(product._id);
        });
        return grouped;
    }

    /**
     * Get stock severity level
     */
    _getStockSeverity(stock, minStock) {
        if (stock === 0) return 'critical';
        if (stock <= minStock * 0.3) return 'high';
        if (stock <= minStock * 0.6) return 'medium';
        if (stock <= minStock) return 'low';
        return 'healthy';
    }

    /**
     * Calculate stock priority
     */
    _getStockPriority(product) {
        const deficitRatio = product.stock === 0 ? 1 : (product.minStock - product.stock) / product.minStock;
        const valueImpact = product.costPrice * Math.max(0, product.minStock - product.stock);

        if (product.stock === 0) return 'critical';
        if (deficitRatio > 0.7 || valueImpact > 5000) return 'high';
        if (deficitRatio > 0.4 || valueImpact > 1000) return 'medium';
        return 'low';
    }

    /**
     * Get recommendation based on product status
     */
    _getRecommendation(product) {
        if (product.stock === 0) {
            return {
                action: 'urgent_restock',
                message: 'Product is out of stock. Restock immediately.',
                quantity: product.minStock * 2,
                timeframe: 'ASAP'
            };
        }

        const deficit = product.minStock - product.stock;
        if (deficit > 0) {
            return {
                action: 'restock',
                message: `Stock is below minimum. Restock ${deficit} units.`,
                quantity: deficit,
                timeframe: 'Within 3 days'
            };
        }

        return {
            action: 'monitor',
            message: 'Stock is adequate. Continue monitoring.',
            quantity: 0,
            timeframe: 'Next week'
        };
    }

    /**
     * Calculate urgency score
     */
    _calculateUrgency(product) {
        let score = 0;

        // Stock level factor
        if (product.stock === 0) score += 100;
        else if (product.stock <= product.minStock * 0.3) score += 80;
        else if (product.stock <= product.minStock * 0.6) score += 50;
        else if (product.stock <= product.minStock) score += 20;

        // Sales velocity factor
        const dailySales = product.totalSold / 30; // Assuming 30 days
        if (dailySales > 10) score += 30;
        else if (dailySales > 5) score += 20;
        else if (dailySales > 1) score += 10;

        // Value factor
        if (product.costPrice * product.minStock > 10000) score += 25;
        else if (product.costPrice * product.minStock > 5000) score += 15;
        else if (product.costPrice * product.minStock > 1000) score += 5;

        return Math.min(100, score);
    }

    /**
     * Get default summary for empty results
     */
    getDefaultSummary() {
        return {
            totalProducts: 0,
            totalStock: 0,
            totalValue: 0,
            totalRevenue: 0,
            totalSold: 0,
            lowStockCount: 0,
            outOfStockCount: 0,
            inStockCount: 0,
            inventoryHealth: 0
        };
    }
}

module.exports = new GlobalProductAnalysisService();