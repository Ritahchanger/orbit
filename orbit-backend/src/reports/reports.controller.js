const reportService = require('./reports.service');

class ReportController {
    /**
     * @desc    Get dashboard statistics
     * @route   GET /api/reports/dashboard
     * @access  Private/Admin
     */
    async getDashboardStats(req, res) {
        const { storeId } = req.query;

        const dashboardStats = await reportService.getDashboardStats(storeId || null);

        res.status(200).json({
            success: true,
            message: 'Dashboard statistics retrieved successfully',
            data: dashboardStats,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * @desc    Get detailed sales report
     * @route   GET /api/reports/sales
     * @access  Private/Admin
     */
    async getSalesReport(req, res) {
        const {
            startDate,
            endDate,
            storeId,
            productId,
            paymentMethod,
            status,
            page = 1,
            limit = 50
        } = req.query;

        const filters = {
            startDate,
            endDate,
            storeId,
            productId,
            paymentMethod,
            status,
            page: parseInt(page),
            limit: parseInt(limit)
        };

        const salesReport = await reportService.getSalesReport(filters);

        res.status(200).json({
            success: true,
            message: 'Sales report retrieved successfully',
            data: salesReport,
            filters,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * @desc    Get inventory report
     * @route   GET /api/reports/inventory
     * @access  Private/Admin
     */
    async getInventoryReport(req, res) {
        const {
            storeId,
            category,
            status,
            minStock,
            maxStock,
            sortBy = 'stock',
            sortOrder = 'asc',
            page = 1,
            limit = 50
        } = req.query;

        const filters = {
            storeId,
            category,
            status,
            minStock: minStock ? parseInt(minStock) : undefined,
            maxStock: maxStock ? parseInt(maxStock) : undefined,
            sortBy,
            sortOrder,
            page: parseInt(page),
            limit: parseInt(limit)
        };

        const inventoryReport = await reportService.getInventoryReport(filters);

        res.status(200).json({
            success: true,
            message: 'Inventory report retrieved successfully',
            data: inventoryReport,
            filters,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * @desc    Get product performance report
     * @route   GET /api/reports/products/performance
     * @access  Private/Admin
     */
    async getProductPerformanceReport(req, res) {
        const {
            startDate,
            endDate,
            storeId,
            category,
            limit = 20
        } = req.query;

        const filters = {
            startDate,
            endDate,
            storeId,
            category,
            limit: parseInt(limit)
        };

        const productReport = await reportService.getProductPerformanceReport(filters);

        res.status(200).json({
            success: true,
            message: 'Product performance report retrieved successfully',
            data: productReport,
            count: productReport.length,
            filters,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * @desc    Get store performance report
     * @route   GET /api/reports/stores/performance
     * @access  Private/Admin
     */
    async getStorePerformanceReport(req, res) {
        const {
            startDate,
            endDate,
            sortBy = 'totalRevenue',
            sortOrder = 'desc'
        } = req.query;

        const filters = {
            startDate,
            endDate,
            sortBy,
            sortOrder
        };

        const storeReport = await reportService.getStorePerformanceReport(filters);

        res.status(200).json({
            success: true,
            message: 'Store performance report retrieved successfully',
            data: storeReport,
            count: storeReport.length,
            filters,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * @desc    Get sales trend report
     * @route   GET /api/reports/sales/trend
     * @access  Private/Admin
     */
    async getSalesTrendReport(req, res) {
        const {
            period = 'daily',
            startDate,
            endDate,
            storeId
        } = req.query;

        const filters = {
            startDate,
            endDate,
            storeId
        };

        const salesTrend = await reportService.getSalesTrendReport(period, filters);

        res.status(200).json({
            success: true,
            message: `Sales trend report (${period}) retrieved successfully`,
            data: salesTrend,
            period,
            filters,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * @desc    Get financial summary report
     * @route   GET /api/reports/financial/summary
     * @access  Private/Admin
     */
    async getFinancialSummary(req, res) {
        const {
            startDate,
            endDate,
            storeId
        } = req.query;

        const filters = {
            startDate,
            endDate,
            storeId
        };

        const financialSummary = await reportService.getFinancialSummary(filters);

        res.status(200).json({
            success: true,
            message: 'Financial summary retrieved successfully',
            data: financialSummary,
            filters,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * @desc    Export report to various formats
     * @route   GET /api/reports/export/:type
     * @access  Private/Admin
     */
    async exportReport(req, res) {
        const { type } = req.params;
        const {
            format = 'csv',
            startDate,
            endDate,
            storeId,
            productId,
            paymentMethod,
            status,
            category,
            minStock,
            maxStock,
            sortBy,
            sortOrder
        } = req.query;

        // Validate export type
        const validTypes = ['sales', 'inventory', 'products', 'stores', 'dashboard', 'financial'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: `Invalid export type. Valid types: ${validTypes.join(', ')}`
            });
        }

        // Validate format
        const validFormats = ['csv', 'excel', 'json', 'pdf'];
        if (!validFormats.includes(format)) {
            return res.status(400).json({
                success: false,
                message: `Invalid format. Valid formats: ${validFormats.join(', ')}`
            });
        }

        // Build filters based on report type
        let filters = {};

        if (startDate && endDate) {
            filters.startDate = startDate;
            filters.endDate = endDate;
        }

        if (storeId) filters.storeId = storeId;
        if (productId) filters.productId = productId;
        if (paymentMethod) filters.paymentMethod = paymentMethod;
        if (status) filters.status = status;
        if (category) filters.category = category;
        if (minStock !== undefined) filters.minStock = parseInt(minStock);
        if (maxStock !== undefined) filters.maxStock = parseInt(maxStock);
        if (sortBy) filters.sortBy = sortBy;
        if (sortOrder) filters.sortOrder = sortOrder;

        // Generate export
        const exportData = await reportService.exportReport(type, filters, format);

        // Set headers for file download
        res.setHeader('Content-Type', exportData.contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${exportData.filename}"`);

        // Additional headers for CSV/Excel
        if (format === 'csv') {
            res.setHeader('Content-Encoding', 'utf-8');
        }

        // Send file
        res.send(exportData.buffer);
    }

    /**
     * @desc    Get low stock alert report
     * @route   GET /api/reports/alerts/low-stock
     * @access  Private/Admin
     */
    async getLowStockAlerts(req, res) {
        const { storeId, limit = 50 } = req.query;

        const filters = {
            storeId,
            status: 'Low Stock',
            limit: parseInt(limit),
            sortBy: 'stock',
            sortOrder: 'asc'
        };

        const lowStockReport = await reportService.getInventoryReport(filters);

        res.status(200).json({
            success: true,
            message: 'Low stock alerts retrieved successfully',
            data: lowStockReport,
            filters,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * @desc    Get out of stock report
     * @route   GET /api/reports/alerts/out-of-stock
     * @access  Private/Admin
     */
    async getOutOfStockReport(req, res) {
        const { storeId, limit = 50 } = req.query;

        const filters = {
            storeId,
            status: 'Out of Stock',
            limit: parseInt(limit),
            sortBy: 'lastRestock',
            sortOrder: 'desc'
        };

        const outOfStockReport = await reportService.getInventoryReport(filters);

        res.status(200).json({
            success: true,
            message: 'Out of stock report retrieved successfully',
            data: outOfStockReport,
            filters,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * @desc    Get top performing products
     * @route   GET /api/reports/products/top-performing
     * @access  Private/Admin
     */
    async getTopPerformingProducts(req, res) {
        const {
            metric = 'revenue',
            startDate,
            endDate,
            storeId,
            limit = 10
        } = req.query;

        const filters = {
            startDate,
            endDate,
            storeId,
            limit: parseInt(limit)
        };

        const productReport = await reportService.getProductPerformanceReport(filters);

        // Sort by specified metric
        let sortedProducts = [...productReport];
        if (metric === 'revenue') {
            sortedProducts.sort((a, b) => b.totalRevenue - a.totalRevenue);
        } else if (metric === 'profit') {
            sortedProducts.sort((a, b) => b.totalProfit - a.totalProfit);
        } else if (metric === 'quantity') {
            sortedProducts.sort((a, b) => b.totalSold - a.totalSold);
        }

        res.status(200).json({
            success: true,
            message: `Top performing products by ${metric} retrieved successfully`,
            data: sortedProducts,
            metric,
            filters,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * @desc    Get revenue by category report
     * @route   GET /api/reports/category/revenue
     * @access  Private/Admin
     */
    async getCategoryRevenueReport(req, res) {
        const { startDate, endDate, storeId } = req.query;

        const matchStage = { status: 'completed' };

        if (startDate && endDate) {
            matchStage.saleDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (storeId) matchStage.storeId = storeId;

        const Sale = require('../sales/sales.model');
        const categoryReport = await Sale.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: '$productDetails' },
            {
                $group: {
                    _id: '$productDetails.category',
                    category: { $first: '$productDetails.category' },
                    totalRevenue: { $sum: '$total' },
                    totalProfit: { $sum: '$profit' },
                    totalQuantity: { $sum: '$quantity' },
                    productCount: { $addToSet: '$productId' }
                }
            },
            {
                $project: {
                    _id: 0,
                    category: 1,
                    totalRevenue: 1,
                    totalProfit: 1,
                    totalQuantity: 1,
                    productCount: { $size: '$productCount' },
                    averageRevenuePerProduct: { $divide: ['$totalRevenue', { $size: '$productCount' }] },
                    profitMargin: {
                        $cond: [
                            { $gt: ['$totalRevenue', 0] },
                            { $multiply: [{ $divide: ['$totalProfit', '$totalRevenue'] }, 100] },
                            0
                        ]
                    }
                }
            },
            { $sort: { totalRevenue: -1 } }
        ]);

        res.status(200).json({
            success: true,
            message: 'Category revenue report retrieved successfully',
            data: categoryReport,
            filters: { startDate, endDate, storeId },
            timestamp: new Date().toISOString()
        });
    }

    /**
     * @desc    Get payment method analysis
     * @route   GET /api/reports/payment-methods
     * @access  Private/Admin
     */
    async getPaymentMethodAnalysis(req, res) {
        const { startDate, endDate, storeId } = req.query;

        const matchStage = { status: 'completed' };

        if (startDate && endDate) {
            matchStage.saleDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (storeId) matchStage.storeId = storeId;

        const Sale = require('../sales/sales.model');
        const paymentAnalysis = await Sale.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$paymentMethod',
                    paymentMethod: { $first: '$paymentMethod' },
                    totalAmount: { $sum: '$total' },
                    transactionCount: { $count: {} },
                    averageAmount: { $avg: '$total' },
                    customerCount: { $addToSet: '$customerPhone' }
                }
            },
            {
                $project: {
                    _id: 0,
                    paymentMethod: 1,
                    totalAmount: 1,
                    transactionCount: 1,
                    averageAmount: { $round: ['$averageAmount', 2] },
                    customerCount: { $size: '$customerCount' }
                }
            },
            { $sort: { totalAmount: -1 } }
        ]);

        // Calculate totals for percentages
        const totalAmount = paymentAnalysis.reduce((sum, item) => sum + item.totalAmount, 0);
        const totalTransactions = paymentAnalysis.reduce((sum, item) => sum + item.transactionCount, 0);

        // Add percentages
        const analysisWithPercentages = paymentAnalysis.map(item => ({
            ...item,
            percentageOfTotal: totalAmount > 0 ? (item.totalAmount / totalAmount * 100).toFixed(2) : 0,
            percentageOfTransactions: totalTransactions > 0 ? (item.transactionCount / totalTransactions * 100).toFixed(2) : 0
        }));

        res.status(200).json({
            success: true,
            message: 'Payment method analysis retrieved successfully',
            data: analysisWithPercentages,
            summary: {
                totalAmount,
                totalTransactions,
                averageTransactionAmount: totalTransactions > 0 ? (totalAmount / totalTransactions).toFixed(2) : 0
            },
            filters: { startDate, endDate, storeId },
            timestamp: new Date().toISOString()
        });
    }

    /**
     * @desc    Get customer purchase history
     * @route   GET /api/reports/customers/:customerPhone/history
     * @access  Private/Admin
     */
    async getCustomerPurchaseHistory(req, res) {
        const { customerPhone } = req.params;
        const {
            startDate,
            endDate,
            storeId,
            page = 1,
            limit = 20
        } = req.query;

        const matchStage = {
            customerPhone: customerPhone,
            status: 'completed'
        };

        if (startDate && endDate) {
            matchStage.saleDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (storeId) matchStage.storeId = storeId;

        const skip = (page - 1) * limit;

        const Sale = require('../sales/sales.model');
        const [purchases, summary] = await Promise.all([
            Sale.find(matchStage)
                .populate('storeId', 'name code')
                .populate('productId', 'name sku category')
                .sort({ saleDate: -1 })
                .skip(skip)
                .limit(parseInt(limit)),

            Sale.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: null,
                        totalSpent: { $sum: '$total' },
                        totalTransactions: { $count: {} },
                        totalItems: { $sum: '$quantity' },
                        averageTransaction: { $avg: '$total' },
                        firstPurchase: { $min: '$saleDate' },
                        lastPurchase: { $max: '$saleDate' }
                    }
                }
            ])
        ]);

        const totalCount = await Sale.countDocuments(matchStage);
        const customerName = purchases[0]?.customerName || 'Unknown';

        res.status(200).json({
            success: true,
            message: 'Customer purchase history retrieved successfully',
            data: {
                customer: {
                    phone: customerPhone,
                    name: customerName
                },
                purchases,
                summary: summary[0] || {
                    totalSpent: 0,
                    totalTransactions: 0,
                    totalItems: 0,
                    averageTransaction: 0
                }
            },
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalCount,
                totalPages: Math.ceil(totalCount / limit)
            },
            filters: { startDate, endDate, storeId },
            timestamp: new Date().toISOString()
        });
    }

    /**
     * @desc    Get daily sales summary
     * @route   GET /api/reports/daily-summary
     * @access  Private/Admin
     */
    async getDailySalesSummary(req, res) {
        const { date, storeId } = req.query;

        const selectedDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const matchStage = {
            saleDate: { $gte: startOfDay, $lte: endOfDay },
            status: 'completed'
        };

        if (storeId) matchStage.storeId = storeId;

        const Sale = require('../sales/sales.model');
        const dailySummary = await Sale.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: "$total" },
                    totalProfit: { $sum: "$profit" },
                    totalItemsSold: { $sum: "$quantity" },
                    totalTransactions: { $count: {} },
                    averageTransaction: { $avg: "$total" },
                    maxTransaction: { $max: "$total" },
                    minTransaction: { $min: "$total" }
                }
            }
        ]);

        const summary = dailySummary[0] || {
            totalSales: 0,
            totalProfit: 0,
            totalItemsSold: 0,
            totalTransactions: 0,
            averageTransaction: 0,
            maxTransaction: 0,
            minTransaction: 0
        };

        res.status(200).json({
            success: true,
            message: 'Daily sales summary retrieved successfully',
            data: {
                date: selectedDate.toISOString().split('T')[0],
                summary,
                formattedDate: selectedDate.toLocaleDateString()
            },
            filters: { date, storeId },
            timestamp: new Date().toISOString()
        });
    }

    /**
     * @desc    Get monthly sales summary
     * @route   GET /api/reports/monthly-summary
     * @access  Private/Admin
     */
    async getMonthlySalesSummary(req, res) {
        const { year, month, storeId } = req.query;

        const currentYear = year ? parseInt(year) : new Date().getFullYear();
        const currentMonth = month ? parseInt(month) - 1 : new Date().getMonth();

        const startOfMonth = new Date(currentYear, currentMonth, 1);
        const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

        const matchStage = {
            saleDate: { $gte: startOfMonth, $lte: endOfMonth },
            status: 'completed'
        };

        if (storeId) matchStage.storeId = storeId;

        const Sale = require('../sales/sales.model');
        const monthlySummary = await Sale.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: "$total" },
                    totalProfit: { $sum: "$profit" },
                    totalItemsSold: { $sum: "$quantity" },
                    totalTransactions: { $count: {} },
                    averageTransaction: { $avg: "$total" },
                    maxTransaction: { $max: "$total" },
                    minTransaction: { $min: "$total" }
                }
            }
        ]);

        const summary = monthlySummary[0] || {
            totalSales: 0,
            totalProfit: 0,
            totalItemsSold: 0,
            totalTransactions: 0,
            averageTransaction: 0,
            maxTransaction: 0,
            minTransaction: 0
        };

        res.status(200).json({
            success: true,
            message: 'Monthly sales summary retrieved successfully',
            data: {
                year: currentYear,
                month: currentMonth + 1,
                summary,
                monthName: startOfMonth.toLocaleDateString('en-US', { month: 'long' }),
                dateRange: {
                    start: startOfMonth.toISOString().split('T')[0],
                    end: endOfMonth.toISOString().split('T')[0]
                }
            },
            filters: { year, month, storeId },
            timestamp: new Date().toISOString()
        });
    }
}

module.exports = new ReportController();