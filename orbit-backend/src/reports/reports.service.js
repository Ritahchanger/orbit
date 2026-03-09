const Store = require("../stores/store.model");
const StoreInventory = require("../store-inventory/store-inventory.model");
const Product = require("../products/products.model");
const Sale = require("../sales/sales.model");

const ExcelJS = require('exceljs');

const mongoose = require("mongoose");

const { writeToBuffer } = require('fast-csv');

class ReportService {
    /**
     * Get overall system dashboard statistics
     */
    async getDashboardStats(storeId = null) {
        try {
            const date = new Date();
            const startOfDay = new Date(date.setHours(0, 0, 0, 0));
            const endOfDay = new Date(date.setHours(23, 59, 59, 999));
            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const startOfYear = new Date(date.getFullYear(), 0, 1);

            // Create separate filters for different collections
            const saleFilter = storeId ? { storeId } : {};
            const inventoryFilter = storeId ? { store: storeId } : {};

            // Execute all queries in parallel
            const [
                totalStores,
                totalProducts,
                totalSalesToday,
                totalRevenueToday,
                totalSalesMonth,
                totalRevenueMonth,
                totalSalesYear,
                totalRevenueYear,
                lowStockProducts,
                topSellingProducts,
                recentSales,
                storeInventories,
                storeStatus
            ] = await Promise.all([
                this.getStoreCount(),
                this.getProductCount(),

                Sale.aggregate([
                    {
                        $match: {
                            ...saleFilter,
                            saleDate: { $gte: startOfDay, $lte: endOfDay },
                            status: 'completed'
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            count: { $sum: 1 },
                            revenue: { $sum: "$total" },
                            profit: { $sum: "$profit" }
                        }
                    }
                ]),

                Sale.aggregate([
                    {
                        $match: {
                            ...saleFilter,
                            saleDate: { $gte: startOfMonth },
                            status: 'completed'
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            count: { $sum: 1 },
                            revenue: { $sum: "$total" },
                            profit: { $sum: "$profit" }
                        }
                    }
                ]),

                Sale.aggregate([
                    {
                        $match: {
                            ...saleFilter,
                            saleDate: { $gte: startOfYear },
                            status: 'completed'
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            count: { $sum: 1 },
                            revenue: { $sum: "$total" },
                            profit: { $sum: "$profit" }
                        }
                    }
                ]),

                StoreInventory.find({
                    ...inventoryFilter,
                    status: 'Low Stock'
                })
                    .populate('product', 'name sku price category')
                    .populate('store', 'name code')
                    .sort({ stock: 1 })
                    .limit(10)
                    .lean(),

                Sale.aggregate([
                    {
                        $match: {
                            ...saleFilter,
                            saleDate: { $gte: startOfMonth },
                            status: 'completed'
                        }
                    },
                    {
                        $group: {
                            _id: "$productId",
                            productName: { $first: "$productName" },
                            sku: { $first: "$sku" },
                            totalQuantity: { $sum: "$quantity" },
                            totalRevenue: { $sum: "$total" },
                            totalProfit: { $sum: "$profit" }
                        }
                    },
                    { $sort: { totalQuantity: -1 } },
                    { $limit: 10 }
                ]),

                Sale.find({
                    ...saleFilter,
                    status: 'completed'
                })
                    .sort({ saleDate: -1 })
                    .limit(10)
                    .populate('storeId', 'name code')
                    .select('productName quantity total paymentMethod customerName saleDate'),

                StoreInventory.aggregate([
                    {
                        $match: inventoryFilter
                    },
                    {
                        $lookup: {
                            from: 'products',
                            localField: 'product',
                            foreignField: '_id',
                            as: 'productDetails'
                        }
                    },
                    { $unwind: { path: '$productDetails', preserveNullAndEmptyArrays: true } },
                    {
                        $group: {
                            _id: null,
                            totalItems: { $sum: "$stock" },
                            totalValue: {
                                $sum: {
                                    $multiply: ["$stock", { $ifNull: ["$productDetails.price", 0] }]
                                }
                            },
                            lowStockCount: {
                                $sum: { $cond: [{ $eq: ["$status", "Low Stock"] }, 1, 0] }
                            },
                            outOfStockCount: {
                                $sum: { $cond: [{ $eq: ["$status", "Out of Stock"] }, 1, 0] }
                            }
                        }
                    }
                ]),

                storeId ?
                    Store.findById(storeId).select('name code status') :
                    Store.aggregate([
                        {
                            $group: {
                                _id: "$status",
                                count: { $sum: 1 }
                            }
                        }
                    ])
            ]);

            // Helper function for safe array access
            const safeGet = (array) => Array.isArray(array) && array.length > 0 ? array[0] : null;

            return {
                overview: {
                    totalStores,
                    totalProducts,
                    totalItemsInInventory: safeGet(storeInventories)?.totalItems || 0,
                    inventoryValue: safeGet(storeInventories)?.totalValue || 0
                },
                salesSummary: {
                    today: {
                        count: safeGet(totalSalesToday)?.count || 0,
                        revenue: safeGet(totalSalesToday)?.revenue || 0,
                        profit: safeGet(totalSalesToday)?.profit || 0
                    },
                    thisMonth: {
                        count: safeGet(totalSalesMonth)?.count || 0,
                        revenue: safeGet(totalSalesMonth)?.revenue || 0,
                        profit: safeGet(totalSalesMonth)?.profit || 0
                    },
                    thisYear: {
                        count: safeGet(totalSalesYear)?.count || 0,
                        revenue: safeGet(totalSalesYear)?.revenue || 0,
                        profit: safeGet(totalSalesYear)?.profit || 0
                    }
                },
                inventoryAlerts: {
                    lowStockCount: safeGet(storeInventories)?.lowStockCount || 0,
                    outOfStockCount: safeGet(storeInventories)?.outOfStockCount || 0,
                    lowStockProducts: Array.isArray(lowStockProducts) ?
                        lowStockProducts.map(item => ({
                            product: item.product,
                            store: item.store,
                            currentStock: item.stock,
                            minStock: item.minStock
                        })) : []
                },
                topProducts: Array.isArray(topSellingProducts) ? topSellingProducts : [],
                recentSales: Array.isArray(recentSales) ? recentSales : [],
                storeStatus: storeId ? storeStatus : this.formatStoreStatus(storeStatus || [])
            };
        } catch (error) {
            console.error('Error in getDashboardStats:', error);
            throw new Error(`Failed to get dashboard stats: ${error.message}`);
        }
    }
    /**
     * Get detailed sales report
     */
    async getSalesReport(filters = {}) {
        try {
            const {
                startDate,
                endDate,
                storeId,
                productId,
                paymentMethod,
                status = 'completed',
                page = 1,
                limit = 50
            } = filters;

            const matchStage = { status };

            // Apply filters
            if (startDate && endDate) {
                matchStage.saleDate = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }

            if (storeId) matchStage.storeId = storeId;
            if (productId) matchStage.productId = productId;
            if (paymentMethod) matchStage.paymentMethod = paymentMethod;

            const skip = (page - 1) * limit;

            const [sales, summary] = await Promise.all([
                // Get paginated sales
                Sale.find(matchStage)
                    .populate('storeId', 'name code')
                    .populate('productId', 'name sku category')
                    .populate('createdBy', 'name email')
                    .sort({ saleDate: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),

                // Get summary statistics
                Sale.aggregate([
                    { $match: matchStage },
                    {
                        $group: {
                            _id: null,
                            totalSales: { $sum: "$total" },
                            totalProfit: { $sum: "$profit" },
                            totalItemsSold: { $sum: "$quantity" },
                            totalTransactions: { $count: {} },
                            averageSaleValue: { $avg: "$total" },
                            maxSale: { $max: "$total" },
                            minSale: { $min: "$total" }
                        }
                    }
                ])
            ]);

            const totalCount = await Sale.countDocuments(matchStage);

            return {
                sales,
                summary: summary[0] || {
                    totalSales: 0,
                    totalProfit: 0,
                    totalItemsSold: 0,
                    totalTransactions: 0,
                    averageSaleValue: 0,
                    maxSale: 0,
                    minSale: 0
                },
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalCount,
                    totalPages: Math.ceil(totalCount / limit),
                    hasNextPage: page * limit < totalCount,
                    hasPrevPage: page > 1
                }
            };
        } catch (error) {
            throw new Error(`Failed to get sales report: ${error.message}`);
        }
    }

    /**
     * Get inventory report
     */
    async getInventoryReport(filters = {}) {
        try {
            const { storeId, category, status, minStock, maxStock, sortBy = 'stock', sortOrder = 'asc', page = 1, limit = 50 } = filters;

            const skip = (page - 1) * limit;
            const sortOrderValue = sortOrder === 'asc' ? 1 : -1;

            // Build the main aggregation pipeline
            const pipeline = [];

            // Match stage
            const matchStage = {};
            if (storeId) matchStage.store = new mongoose.Types.ObjectId(storeId);
            if (status) matchStage.status = status;
            if (minStock !== undefined) matchStage.stock = { ...matchStage.stock, $gte: minStock };
            if (maxStock !== undefined) matchStage.stock = { ...matchStage.stock, $lte: maxStock };

            if (Object.keys(matchStage).length > 0) {
                pipeline.push({ $match: matchStage });
            }

            // Lookup product
            pipeline.push({
                $lookup: {
                    from: 'products',
                    localField: 'product',
                    foreignField: '_id',
                    as: 'product'
                }
            });

            pipeline.push({ $unwind: '$product' });

            // Apply category filter after lookup
            if (category) {
                pipeline.push({
                    $match: { 'product.category': category }
                });
            }

            // Lookup store
            pipeline.push({
                $lookup: {
                    from: 'stores',
                    localField: 'store',
                    foreignField: '_id',
                    as: 'store'
                }
            });

            pipeline.push({ $unwind: '$store' });

            // Project only needed fields
            pipeline.push({
                $project: {
                    stock: 1,
                    minStock: 1,
                    status: 1,
                    storeSold: 1,
                    storeRevenue: 1,
                    lastRestock: 1,
                    product: {
                        _id: '$product._id',
                        name: '$product.name',
                        sku: '$product.sku',
                        price: '$product.price',
                        category: '$product.category',
                        costPrice: '$product.costPrice',
                        brand: '$product.brand'
                    },
                    store: {
                        _id: '$store._id',
                        name: '$store.name',
                        code: '$store.code',
                        'address.city': '$store.address.city'
                    }
                }
            });

            // Sort
            let sortField = sortBy;
            // Handle nested sorting
            if (sortBy === 'name') sortField = 'product.name';
            else if (sortBy === 'price') sortField = 'product.price';
            else if (sortBy === 'category') sortField = 'product.category';

            pipeline.push({ $sort: { [sortField]: sortOrderValue } });

            // Pagination
            const countPipeline = [...pipeline];
            countPipeline.push({ $count: 'total' });

            pipeline.push({ $skip: skip });
            pipeline.push({ $limit: limit });

            // Execute queries
            const [inventory, totalCountResult] = await Promise.all([
                StoreInventory.aggregate(pipeline),
                StoreInventory.aggregate(countPipeline)
            ]);

            const totalCount = totalCountResult[0]?.total || 0;

            // Summary aggregation (separate for better performance)
            const summaryPipeline = [];

            if (Object.keys(matchStage).length > 0) {
                summaryPipeline.push({ $match: matchStage });
            }

            summaryPipeline.push({
                $lookup: {
                    from: 'products',
                    localField: 'product',
                    foreignField: '_id',
                    as: 'product'
                }
            });

            summaryPipeline.push({ $unwind: '$product' });

            if (category) {
                summaryPipeline.push({
                    $match: { 'product.category': category }
                });
            }

            summaryPipeline.push({
                $group: {
                    _id: null,
                    totalItems: { $sum: "$stock" },
                    totalValue: { $sum: { $multiply: ["$stock", "$product.price"] } },
                    totalCostValue: { $sum: { $multiply: ["$stock", "$product.costPrice"] } },
                    lowStockCount: { $sum: { $cond: [{ $eq: ["$status", "Low Stock"] }, 1, 0] } },
                    outOfStockCount: { $sum: { $cond: [{ $eq: ["$status", "Out of Stock"] }, 1, 0] } },
                    uniqueProducts: { $addToSet: "$product" }
                }
            });

            const summaryResult = await StoreInventory.aggregate(summaryPipeline);
            const summaryData = summaryResult[0] || {
                totalItems: 0,
                totalValue: 0,
                totalCostValue: 0,
                lowStockCount: 0,
                outOfStockCount: 0,
                uniqueProducts: []
            };

            return {
                inventory,
                summary: {
                    ...summaryData,
                    potentialProfit: summaryData.totalValue - summaryData.totalCostValue,
                    profitMargin: summaryData.totalCostValue > 0
                        ? ((summaryData.totalValue - summaryData.totalCostValue) / summaryData.totalCostValue * 100)
                        : 0,
                    uniqueProductCount: summaryData.uniqueProducts?.length || 0
                },
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalCount,
                    totalPages: Math.ceil(totalCount / limit),
                    hasNextPage: page * limit < totalCount,
                    hasPrevPage: page > 1
                }
            };

        } catch (error) {
            throw new Error(`Failed to get inventory report: ${error.message}`);
        }
    }

    /**
     * Get product performance report
     */
    async getProductPerformanceReport(filters = {}) {

        const {
            startDate,
            endDate,
            storeId,
            category,
            limit = 20
        } = filters;

        const matchStage = { status: 'completed' };

        if (startDate && endDate) {
            matchStage.saleDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (storeId) {
            matchStage.storeId = new mongoose.Types.ObjectId(storeId);
        }

        // First, get all product IDs that match the criteria
        let productMatch = {};
        if (category) {
            const products = await Product.find({ category }).select('_id');
            const productIds = products.map(p => new mongoose.Types.ObjectId(p._id));
            productMatch = { productId: { $in: productIds } };
        }

        const salesData = await Sale.aggregate([
            { $match: { ...matchStage, ...productMatch } },
            {
                $group: {
                    _id: "$productId",
                    productName: { $first: "$productName" },
                    sku: { $first: "$sku" },
                    totalSold: { $sum: "$quantity" },
                    totalRevenue: { $sum: "$total" },
                    totalProfit: { $sum: "$profit" },
                    averagePrice: { $avg: "$unitPrice" },
                    transactionCount: { $count: {} }
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: { path: '$productDetails', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    productId: '$_id',
                    productName: 1,
                    sku: 1,
                    category: '$productDetails.category',
                    brand: '$productDetails.brand',
                    totalSold: 1,
                    totalRevenue: 1,
                    totalProfit: 1,
                    averagePrice: 1,
                    transactionCount: 1,
                    profitMargin: {
                        $cond: [
                            { $gt: ['$totalRevenue', 0] },
                            { $multiply: [{ $divide: ['$totalProfit', '$totalRevenue'] }, 100] },
                            0
                        ]
                    },
                    avgSaleQuantity: { $divide: ['$totalSold', '$transactionCount'] }
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: limit }
        ]);

        // Get current inventory for these products
        const productIds = salesData.map(item => new mongoose.Types.ObjectId(item.productId));

        if (productIds.length === 0) {
            return [];
        }

        // Build inventory match stage based on storeId
        const inventoryMatchStage = { product: { $in: productIds } };
        if (storeId) {
            inventoryMatchStage.store = new mongoose.Types.ObjectId(storeId);
        }

        const inventoryData = await StoreInventory.aggregate([
            { $match: inventoryMatchStage },
            {
                $group: {
                    _id: "$product",
                    totalStock: { $sum: "$stock" },
                    storesWithStock: {
                        $sum: {
                            $cond: [
                                { $gt: ["$stock", 0] },
                                1,
                                0
                            ]
                        }
                    },
                    storesOutOfStock: {
                        $sum: {
                            $cond: [
                                { $eq: ["$stock", 0] },
                                1,
                                0
                            ]
                        }
                    },
                    // If specific store, get store-specific stock
                    ...(storeId ? {
                        storeStock: { $first: "$stock" },
                        storeStatus: { $first: "$status" }
                    } : {})
                }
            }
        ]);

        // Merge sales and inventory data
        const mergedData = salesData.map(sale => {
            const inventory = inventoryData.find(inv =>
                inv._id && sale.productId &&
                inv._id.toString() === sale.productId.toString()
            );

            // If specific store is selected, use store-specific data
            const currentStock = storeId ?
                (inventory?.storeStock || 0) :
                (inventory?.totalStock || 0);

            return {
                ...sale,
                currentStock: currentStock,
                storesWithStock: inventory?.storesWithStock || 0,
                storesOutOfStock: inventory?.storesOutOfStock || 0,
                stockTurnover: sale.totalSold > 0 && currentStock > 0 ?
                    sale.totalSold / currentStock : 0,
                ...(storeId && {
                    storeStatus: inventory?.storeStatus || 'Out of Stock'
                })
            };
        });

        return mergedData;

    }
    /**
     * Get store performance report
     */
    async getStorePerformanceReport(filters = {}) {
        try {
            const {
                startDate,
                endDate,
                sortBy = 'totalRevenue',
                sortOrder = 'desc'
            } = filters;

            const matchStage = { status: 'completed' };

            if (startDate && endDate) {
                matchStage.saleDate = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }

            const storePerformance = await Sale.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: "$storeId",
                        storeName: { $first: "$storeId" }, // We'll populate this later
                        totalSales: { $sum: "$total" },
                        totalProfit: { $sum: "$profit" },
                        totalItemsSold: { $sum: "$quantity" },
                        transactionCount: { $count: {} },
                        averageTransaction: { $avg: "$total" },
                        uniqueCustomers: { $addToSet: "$customerPhone" }
                    }
                },
                {
                    $lookup: {
                        from: 'stores',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'storeDetails'
                    }
                },
                { $unwind: '$storeDetails' },
                {
                    $lookup: {
                        from: 'storeinventories',
                        localField: '_id',
                        foreignField: 'store',
                        as: 'inventoryDetails'
                    }
                },
                {
                    $project: {
                        storeId: '$_id',
                        storeName: '$storeDetails.name',
                        storeCode: '$storeDetails.code',
                        storeStatus: '$storeDetails.status',
                        address: '$storeDetails.address',
                        totalSales: 1,
                        totalProfit: 1,
                        totalItemsSold: 1,
                        transactionCount: 1,
                        averageTransaction: 1,
                        uniqueCustomersCount: { $size: '$uniqueCustomers' },
                        inventoryValue: {
                            $sum: '$inventoryDetails.stock'
                        },
                        inventoryItems: {
                            $sum: { $size: '$inventoryDetails' }
                        },
                        profitMargin: {
                            $cond: [
                                { $gt: ['$totalSales', 0] },
                                { $multiply: [{ $divide: ['$totalProfit', '$totalSales'] }, 100] },
                                0
                            ]
                        }
                    }
                },
                { $sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 } }
            ]);

            return storePerformance;
        } catch (error) {
            throw new Error(`Failed to get store performance report: ${error.message}`);
        }
    }

    /**
     * Get sales trend report (daily, monthly, yearly)
     */
    async getSalesTrendReport(period = 'daily', filters = {}) {
        try {
            const { startDate, endDate, storeId } = filters;

            let dateFormat, groupBy;

            switch (period) {
                case 'daily':
                    dateFormat = '%Y-%m-%d';
                    groupBy = { $dateToString: { format: dateFormat, date: "$saleDate" } };
                    break;
                case 'monthly':
                    dateFormat = '%Y-%m';
                    groupBy = { $dateToString: { format: dateFormat, date: "$saleDate" } };
                    break;
                case 'yearly':
                    dateFormat = '%Y';
                    groupBy = { $dateToString: { format: dateFormat, date: "$saleDate" } };
                    break;
                default:
                    throw new Error('Invalid period. Use "daily", "monthly", or "yearly"');
            }

            const matchStage = { status: 'completed' };

            if (startDate && endDate) {
                matchStage.saleDate = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }

            // FIX: Convert string storeId to ObjectId
            if (storeId) {
                matchStage.storeId = new mongoose.Types.ObjectId(storeId); // Convert to ObjectId
            }

            const salesTrend = await Sale.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: groupBy,
                        date: { $first: "$saleDate" },
                        totalSales: { $sum: "$total" },
                        totalProfit: { $sum: "$profit" },
                        totalItemsSold: { $sum: "$quantity" },
                        transactionCount: { $count: {} },
                        averageTransaction: { $avg: "$total" }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            return salesTrend;
        } catch (error) {
            throw new Error(`Failed to get sales trend report: ${error.message}`);
        }
    }

    /**
     * Get financial summary report
     */
    async getFinancialSummary(filters = {}) {
        try {
            const { startDate, endDate, storeId } = filters;

            const matchStage = { status: 'completed' };

            if (startDate && endDate) {
                matchStage.saleDate = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }

            if (storeId) matchStage.storeId = storeId;

            const [salesSummary, paymentMethods, topProducts, dailyBreakdown] = await Promise.all([
                // Overall sales summary
                Sale.aggregate([
                    { $match: matchStage },
                    {
                        $group: {
                            _id: null,
                            totalRevenue: { $sum: "$total" },
                            totalCost: { $sum: { $subtract: ["$total", "$profit"] } },
                            totalProfit: { $sum: "$profit" },
                            totalTransactions: { $count: {} },
                            totalItemsSold: { $sum: "$quantity" }
                        }
                    }
                ]),

                // Payment method breakdown
                Sale.aggregate([
                    { $match: matchStage },
                    {
                        $group: {
                            _id: "$paymentMethod",
                            amount: { $sum: "$total" },
                            count: { $count: {} },
                            averageAmount: { $avg: "$total" }
                        }
                    },
                    { $sort: { amount: -1 } }
                ]),

                // Top 10 products by revenue
                Sale.aggregate([
                    { $match: matchStage },
                    {
                        $group: {
                            _id: "$productId",
                            productName: { $first: "$productName" },
                            revenue: { $sum: "$total" },
                            profit: { $sum: "$profit" },
                            quantitySold: { $sum: "$quantity" }
                        }
                    },
                    { $sort: { revenue: -1 } },
                    { $limit: 10 }
                ]),

                // Daily breakdown (last 30 days)
                Sale.aggregate([
                    {
                        $match: {
                            ...matchStage,
                            saleDate: {
                                $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                            }
                        }
                    },
                    {
                        $group: {
                            _id: { $dateToString: { format: "%Y-%m-%d", date: "$saleDate" } },
                            revenue: { $sum: "$total" },
                            profit: { $sum: "$profit" },
                            transactions: { $count: {} }
                        }
                    },
                    { $sort: { _id: 1 } }
                ])
            ]);

            const summary = salesSummary[0] || {
                totalRevenue: 0,
                totalCost: 0,
                totalProfit: 0,
                totalTransactions: 0,
                totalItemsSold: 0
            };

            return {
                summary: {
                    ...summary,
                    profitMargin: summary.totalRevenue > 0 ?
                        (summary.totalProfit / summary.totalRevenue * 100) : 0,
                    avgTransactionValue: summary.totalTransactions > 0 ?
                        summary.totalRevenue / summary.totalTransactions : 0,
                    avgProfitPerTransaction: summary.totalTransactions > 0 ?
                        summary.totalProfit / summary.totalTransactions : 0
                },
                paymentMethods,
                topProducts,
                dailyBreakdown
            };
        } catch (error) {
            throw new Error(`Failed to get financial summary: ${error.message}`);
        }
    }

    // Helper methods
    async getStoreCount() {
        return Store.countDocuments({ status: 'active' });
    }

    async getProductCount() {
        return Product.countDocuments({ status: { $in: ['active', 'In Stock', 'Low Stock'] } });
    }

    formatStoreStatus(storeStatus) {
        const formatted = {};
        storeStatus.forEach(item => {
            formatted[item._id] = item.count;
        });
        return formatted;
    }

    /**
     * Export report data to CSV/Excel format
     */
    async exportReport(type, filters = {}, format = 'csv') {
        try {
            let data;

            switch (type) {
                case 'sales':
                    data = await this.getSalesReport(filters);
                    break;
                case 'inventory':
                    data = await this.getInventoryReport(filters);
                    break;
                case 'products':
                    data = await this.getProductPerformanceReport(filters);
                    break;
                case 'stores':
                    data = await this.getStorePerformanceReport(filters);
                    break;
                case 'dashboard':
                    data = await this.getDashboardStats(filters.storeId);
                    break;
                case 'financial':
                    data = await this.getFinancialSummary(filters);
                    break;
                default:
                    throw new Error(`Invalid export type. Valid types: sales, inventory, products, stores, dashboard, financial`);
            }

            if (format === 'csv') {
                return await this.generateCSV(data, type);
            } else if (format === 'excel') {
                return await this.generateExcel(data, type);
            } else if (format === 'json') {
                return await this.generateJSON(data, type);
            } else if (format === 'pdf') {
                return await this.generatePDF(data, type);
            } else {
                throw new Error(`Invalid format. Valid formats: csv, excel, json, pdf`);
            }
        } catch (error) {
            throw new Error(`Failed to export report: ${error.message}`);
        }
    }

    /**
     * Generate CSV file using fast-csv
     */
    async generateCSV(data, type) {
        try {
            let csvData;
            let filename = `${type}_report_${new Date().toISOString().split('T')[0]}.csv`;

            switch (type) {
                case 'sales':
                    csvData = this.formatSalesForCSV(data);
                    break;
                case 'inventory':
                    csvData = this.formatInventoryForCSV(data);
                    break;
                case 'products':
                    csvData = this.formatProductsForCSV(data);
                    break;
                case 'stores':
                    csvData = this.formatStoresForCSV(data);
                    break;
                case 'dashboard':
                    csvData = this.formatDashboardForCSV(data);
                    break;
                case 'financial':
                    csvData = this.formatFinancialForCSV(data);
                    break;
                default:
                    throw new Error('Unsupported report type for CSV export');
            }

            // Generate CSV buffer using fast-csv
            const buffer = await writeToBuffer(csvData.rows, {
                headers: csvData.headers,
                includeEndRowDelimiter: true,
                writeBOM: true // For Excel compatibility
            });

            return {
                contentType: 'text/csv; charset=utf-8',
                filename,
                buffer,
                rowCount: csvData.rows.length
            };
        } catch (error) {
            throw new Error(`Failed to generate CSV: ${error.message}`);
        }
    }

    /**
     * Generate Excel file using exceljs
     */
    async generateExcel(data, type) {
        try {
            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'Inventory Management System';
            workbook.lastModifiedBy = 'System';
            workbook.created = new Date();
            workbook.modified = new Date();

            let filename = `${type}_report_${new Date().toISOString().split('T')[0]}.xlsx`;

            switch (type) {
                case 'sales':
                    await this.createSalesExcel(workbook, data);
                    break;
                case 'inventory':
                    await this.createInventoryExcel(workbook, data);
                    break;
                case 'products':
                    await this.createProductsExcel(workbook, data);
                    break;
                case 'stores':
                    await this.createStoresExcel(workbook, data);
                    break;
                case 'dashboard':
                    await this.createDashboardExcel(workbook, data);
                    break;
                case 'financial':
                    await this.createFinancialExcel(workbook, data);
                    break;
                default:
                    throw new Error('Unsupported report type for Excel export');
            }

            const buffer = await workbook.xlsx.writeBuffer();

            return {
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                filename,
                buffer,
                sheetCount: workbook.worksheets.length
            };
        } catch (error) {
            throw new Error(`Failed to generate Excel: ${error.message}`);
        }
    }

    /**
     * Generate JSON file
     */
    async generateJSON(data, type) {
        try {
            const filename = `${type}_report_${new Date().toISOString().split('T')[0]}.json`;
            const jsonData = JSON.stringify(data, null, 2);

            return {
                contentType: 'application/json',
                filename,
                buffer: Buffer.from(jsonData, 'utf8')
            };
        } catch (error) {
            throw new Error(`Failed to generate JSON: ${error.message}`);
        }
    }

    /**
     * Generate PDF file (simplified version - you might want to use pdfkit or puppeteer)
     */
    async generatePDF(data, type) {
        try {
            const filename = `${type}_report_${new Date().toISOString().split('T')[0]}.pdf`;

            // For a real implementation, you'd use pdfkit, puppeteer, or a PDF library
            // This is a placeholder that returns HTML that can be converted to PDF
            const html = this.generateHTMLReport(data, type);

            return {
                contentType: 'application/pdf',
                filename,
                buffer: Buffer.from(html, 'utf8'), // In reality, this would be PDF buffer
                note: 'PDF generation requires additional setup with puppeteer or pdfkit'
            };
        } catch (error) {
            throw new Error(`Failed to generate PDF: ${error.message}`);
        }
    }

    // ========== CSV FORMATTING METHODS ==========

    formatSalesForCSV(data) {
        const headers = [
            'Sale Date', 'Invoice No', 'Product', 'SKU', 'Quantity',
            'Unit Price', 'Discount', 'Subtotal', 'Total', 'Profit',
            'Payment Method', 'Customer Name', 'Customer Phone',
            'Store', 'Status', 'Created At'
        ];

        const rows = data.sales.map(sale => [
            sale.saleDate ? new Date(sale.saleDate).toLocaleDateString() : '',
            sale.transactionId || '',
            sale.productName || '',
            sale.sku || '',
            sale.quantity || 0,
            sale.unitPrice ? `$${sale.unitPrice.toFixed(2)}` : '$0.00',
            sale.discount ? `$${sale.discount.toFixed(2)}` : '$0.00',
            sale.subtotal ? `$${sale.subtotal.toFixed(2)}` : '$0.00',
            sale.total ? `$${sale.total.toFixed(2)}` : '$0.00',
            sale.profit ? `$${sale.profit.toFixed(2)}` : '$0.00',
            sale.paymentMethod || '',
            sale.customerName || '',
            sale.customerPhone || '',
            sale.storeId?.name || 'N/A',
            sale.status || '',
            sale.createdAt ? new Date(sale.createdAt).toLocaleDateString() : ''
        ]);

        return { headers, rows };
    }

    formatInventoryForCSV(data) {
        const headers = [
            'Product', 'SKU', 'Category', 'Brand', 'Store',
            'Store Code', 'Current Stock', 'Min Stock', 'Status',
            'Price', 'Cost Price', 'Inventory Value', 'Last Restock',
            'Total Sold (Store)', 'Revenue (Store)'
        ];

        const rows = data.inventory.map(item => [
            item.product?.name || 'N/A',
            item.product?.sku || 'N/A',
            item.product?.category || 'N/A',
            item.product?.brand || 'N/A',
            item.store?.name || 'N/A',
            item.store?.code || 'N/A',
            item.stock || 0,
            item.minStock || 0,
            item.status || '',
            item.product?.price ? `$${item.product.price.toFixed(2)}` : '$0.00',
            item.product?.costPrice ? `$${item.product.costPrice.toFixed(2)}` : '$0.00',
            `$${(item.stock * (item.product?.price || 0)).toFixed(2)}`,
            item.lastRestock ? new Date(item.lastRestock).toLocaleDateString() : 'Never',
            item.storeSold || 0,
            item.storeRevenue ? `$${item.storeRevenue.toFixed(2)}` : '$0.00'
        ]);

        return { headers, rows };
    }

    formatProductsForCSV(data) {
        const headers = [
            'Product', 'SKU', 'Category', 'Brand', 'Total Sold',
            'Total Revenue', 'Total Profit', 'Profit Margin',
            'Average Price', 'Transaction Count', 'Avg Sale Quantity',
            'Current Stock', 'Stores With Stock', 'Stores Out of Stock',
            'Stock Turnover'
        ];

        const rows = data.map(product => [
            product.productName || '',
            product.sku || '',
            product.category || '',
            product.brand || '',
            product.totalSold || 0,
            product.totalRevenue ? `$${product.totalRevenue.toFixed(2)}` : '$0.00',
            product.totalProfit ? `$${product.totalProfit.toFixed(2)}` : '$0.00',
            product.profitMargin ? `${product.profitMargin.toFixed(2)}%` : '0.00%',
            product.averagePrice ? `$${product.averagePrice.toFixed(2)}` : '$0.00',
            product.transactionCount || 0,
            product.avgSaleQuantity ? product.avgSaleQuantity.toFixed(2) : '0.00',
            product.currentStock || 0,
            product.storesWithStock || 0,
            product.storesOutOfStock || 0,
            product.stockTurnover ? product.stockTurnover.toFixed(2) : '0.00'
        ]);

        return { headers, rows };
    }

    formatStoresForCSV(data) {
        const headers = [
            'Store Name', 'Store Code', 'Status', 'Total Sales',
            'Total Profit', 'Profit Margin', 'Total Items Sold',
            'Transaction Count', 'Average Transaction', 'Unique Customers',
            'Inventory Value', 'Inventory Items', 'Address'
        ];

        const rows = data.map(store => [
            store.storeName || '',
            store.storeCode || '',
            store.storeStatus || '',
            store.totalSales ? `$${store.totalSales.toFixed(2)}` : '$0.00',
            store.totalProfit ? `$${store.totalProfit.toFixed(2)}` : '$0.00',
            store.profitMargin ? `${store.profitMargin.toFixed(2)}%` : '0.00%',
            store.totalItemsSold || 0,
            store.transactionCount || 0,
            store.averageTransaction ? `$${store.averageTransaction.toFixed(2)}` : '$0.00',
            store.uniqueCustomersCount || 0,
            store.inventoryValue ? store.inventoryValue.toFixed(2) : '0',
            store.inventoryItems || 0,
            `${store.address?.street || ''} ${store.address?.building || ''}, ${store.address?.city || ''}`.trim()
        ]);

        return { headers, rows };
    }

    formatDashboardForCSV(data) {
        const headers = ['Metric', 'Value', 'Details'];

        const rows = [
            ['Total Stores', data.overview.totalStores, ''],
            ['Total Products', data.overview.totalProducts, ''],
            ['Total Items in Inventory', data.overview.totalItemsInInventory, ''],
            ['Inventory Value', `$${data.overview.inventoryValue?.toFixed(2) || '0.00'}`, ''],
            ['Today Sales Count', data.salesSummary.today.count, ''],
            ['Today Revenue', `$${data.salesSummary.today.revenue?.toFixed(2) || '0.00'}`, ''],
            ['Today Profit', `$${data.salesSummary.today.profit?.toFixed(2) || '0.00'}`, ''],
            ['Monthly Sales Count', data.salesSummary.thisMonth.count, ''],
            ['Monthly Revenue', `$${data.salesSummary.thisMonth.revenue?.toFixed(2) || '0.00'}`, ''],
            ['Monthly Profit', `$${data.salesSummary.thisMonth.profit?.toFixed(2) || '0.00'}`, ''],
            ['Low Stock Items', data.inventoryAlerts.lowStockCount, ''],
            ['Out of Stock Items', data.inventoryAlerts.outOfStockCount, '']
        ];

        return { headers, rows };
    }

    formatFinancialForCSV(data) {
        const headers = ['Category', 'Amount', 'Percentage', 'Count'];

        const rows = [
            ['Total Revenue', `$${data.summary.totalRevenue?.toFixed(2) || '0.00'}`, '100%', data.summary.totalTransactions || 0],
            ['Total Cost', `$${data.summary.totalCost?.toFixed(2) || '0.00'}`, '', ''],
            ['Total Profit', `$${data.summary.totalProfit?.toFixed(2) || '0.00'}`, `${data.summary.profitMargin?.toFixed(2) || '0.00'}%`, ''],
            ['Total Items Sold', data.summary.totalItemsSold || 0, '', ''],
            ['Average Transaction', `$${data.summary.avgTransactionValue?.toFixed(2) || '0.00'}`, '', ''],
            ['Avg Profit/Transaction', `$${data.summary.avgProfitPerTransaction?.toFixed(2) || '0.00'}`, '', '']
        ];

        // Add payment methods
        data.paymentMethods.forEach(pm => {
            const percentage = (pm.amount / data.summary.totalRevenue * 100).toFixed(2);
            rows.push([
                `Payment: ${pm._id}`,
                `$${pm.amount?.toFixed(2) || '0.00'}`,
                `${percentage}%`,
                pm.count || 0
            ]);
        });

        return { headers, rows };
    }

    // ========== EXCEL FORMATTING METHODS ==========

    async createSalesExcel(workbook, data) {
        const worksheet = workbook.addWorksheet('Sales Report');

        // Title
        worksheet.mergeCells('A1:P1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = 'SALES REPORT';
        titleCell.font = { size: 16, bold: true };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

        // Summary section
        if (data.summary) {
            worksheet.mergeCells('A3:B3');
            worksheet.getCell('A3').value = 'SUMMARY';
            worksheet.getCell('A3').font = { bold: true };

            const summaryData = [
                ['Total Sales:', `$${data.summary.totalSales?.toFixed(2) || '0.00'}`],
                ['Total Profit:', `$${data.summary.totalProfit?.toFixed(2) || '0.00'}`],
                ['Total Items Sold:', data.summary.totalItemsSold || 0],
                ['Total Transactions:', data.summary.totalTransactions || 0],
                ['Average Sale:', `$${data.summary.averageSaleValue?.toFixed(2) || '0.00'}`],
                ['Max Sale:', `$${data.summary.maxSale?.toFixed(2) || '0.00'}`],
                ['Min Sale:', `$${data.summary.minSale?.toFixed(2) || '0.00'}`]
            ];

            summaryData.forEach((row, index) => {
                worksheet.getCell(`A${index + 5}`).value = row[0];
                worksheet.getCell(`B${index + 5}`).value = row[1];
            });
        }

        // Add empty row
        const summaryEndRow = data.summary ? 12 : 4;
        worksheet.addRow([]);

        // Table headers
        const headers = [
            'Sale Date', 'Invoice No', 'Product', 'SKU', 'Quantity',
            'Unit Price', 'Discount', 'Subtotal', 'Total', 'Profit',
            'Payment Method', 'Customer Name', 'Customer Phone',
            'Store', 'Status', 'Created At'
        ];

        const headerRow = worksheet.addRow(headers);
        headerRow.font = { bold: true };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4F81BD' }
        };
        headerRow.alignment = { horizontal: 'center' };

        // Style header cells
        headerRow.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Add data rows
        data.sales.forEach(sale => {
            const row = worksheet.addRow([
                sale.saleDate ? new Date(sale.saleDate) : '',
                sale.transactionId || '',
                sale.productName || '',
                sale.sku || '',
                sale.quantity || 0,
                sale.unitPrice || 0,
                sale.discount || 0,
                sale.subtotal || 0,
                sale.total || 0,
                sale.profit || 0,
                sale.paymentMethod || '',
                sale.customerName || '',
                sale.customerPhone || '',
                sale.storeId?.name || 'N/A',
                sale.status || '',
                sale.createdAt ? new Date(sale.createdAt) : ''
            ]);

            // Add borders to data cells
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });

        // Format currency columns
        ['F', 'G', 'H', 'I', 'J'].forEach(col => {
            worksheet.getColumn(col).numFmt = '"$"#,##0.00';
        });

        // Format date columns
        ['A', 'P'].forEach(col => {
            worksheet.getColumn(col).numFmt = 'dd-mm-yyyy hh:mm';
        });

        // Auto-fit columns
        worksheet.columns.forEach(column => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, (cell) => {
                const cellLength = cell.value ? cell.value.toString().length : 0;
                if (cellLength > maxLength) {
                    maxLength = cellLength;
                }
            });
            column.width = Math.min(Math.max(maxLength + 2, 10), 50);
        });

        // Add filter
        worksheet.autoFilter = {
            from: `${headerRow.number}`,
            to: { row: worksheet.rowCount, column: headers.length }
        };
    }

    async createInventoryExcel(workbook, data) {
        const worksheet = workbook.addWorksheet('Inventory Report');

        // Title
        worksheet.mergeCells('A1:O1');
        worksheet.getCell('A1').value = 'INVENTORY REPORT';
        worksheet.getCell('A1').font = { size: 16, bold: true };
        worksheet.getCell('A1').alignment = { horizontal: 'center' };

        // Summary
        if (data.summary) {
            worksheet.mergeCells('A3:B3');
            worksheet.getCell('A3').value = 'INVENTORY SUMMARY';
            worksheet.getCell('A3').font = { bold: true };

            const summaryData = [
                ['Total Items:', data.summary.totalItems || 0],
                ['Total Value:', `$${data.summary.totalValue?.toFixed(2) || '0.00'}`],
                ['Total Cost:', `$${data.summary.totalCostValue?.toFixed(2) || '0.00'}`],
                ['Potential Profit:', `$${data.summary.potentialProfit?.toFixed(2) || '0.00'}`],
                ['Profit Margin:', `${data.summary.profitMargin?.toFixed(2) || '0.00'}%`],
                ['Unique Products:', data.summary.uniqueProductCount || 0],
                ['Low Stock Items:', data.summary.lowStockCount || 0],
                ['Out of Stock:', data.summary.outOfStockCount || 0]
            ];

            summaryData.forEach((row, index) => {
                worksheet.getCell(`A${index + 5}`).value = row[0];
                worksheet.getCell(`B${index + 5}`).value = row[1];
            });
        }

        worksheet.addRow([]);

        // Table headers
        const headers = [
            'Product', 'SKU', 'Category', 'Brand', 'Store',
            'Store Code', 'Current Stock', 'Min Stock', 'Status',
            'Price', 'Cost Price', 'Inventory Value', 'Last Restock',
            'Total Sold', 'Revenue'
        ];

        const headerRow = worksheet.addRow(headers);
        headerRow.font = { bold: true };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFC0504D' }
        };

        // Add data
        data.inventory.forEach(item => {
            worksheet.addRow([
                item.product?.name || 'N/A',
                item.product?.sku || 'N/A',
                item.product?.category || 'N/A',
                item.product?.brand || 'N/A',
                item.store?.name || 'N/A',
                item.store?.code || 'N/A',
                item.stock || 0,
                item.minStock || 0,
                item.status || '',
                item.product?.price || 0,
                item.product?.costPrice || 0,
                (item.stock * (item.product?.price || 0)),
                item.lastRestock ? new Date(item.lastRestock) : '',
                item.storeSold || 0,
                item.storeRevenue || 0
            ]);
        });

        // Format columns
        ['J', 'K', 'L', 'O'].forEach(col => {
            worksheet.getColumn(col).numFmt = '"$"#,##0.00';
        });

        worksheet.getColumn('M').numFmt = 'dd-mm-yyyy';

        // Auto-fit
        worksheet.columns.forEach(column => {
            column.width = 15;
        });
    }

    // Similar methods for other report types...
    // You can follow the same pattern for createProductsExcel, createStoresExcel, etc.

    generateHTMLReport(data, type) {
        // Simplified HTML generation for PDF conversion
        return `
            <html>
                <head>
                    <title>${type.toUpperCase()} Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 40px; }
                        h1 { color: #333; border-bottom: 2px solid #4F81BD; padding-bottom: 10px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th { background-color: #4F81BD; color: white; padding: 10px; text-align: left; }
                        td { padding: 8px; border: 1px solid #ddd; }
                        .summary { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
                        .total { font-weight: bold; color: #4F81BD; }
                    </style>
                </head>
                <body>
                    <h1>${type.toUpperCase()} REPORT</h1>
                    <div class="summary">
                        <p>Generated on: ${new Date().toLocaleDateString()}</p>
                        <p>Report Type: ${type}</p>
                    </div>
                    <p>Note: For full PDF generation, implement with puppeteer or pdfkit.</p>
                </body>
            </html>
        `;
    }
}

module.exports = new ReportService();