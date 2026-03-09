const Sale = require("./sales.model");
const Product = require("../products/products.model");
const Store = require("../stores/store.model");
const StoreInventory = require("../store-inventory/store-inventory.model");
const mongoose = require("mongoose");

// Record a new sale for a specific store (UPDATED for 3-model architecture)
const recordSale = async (saleData) => {

    if (!saleData.productId) {
        throw new Error("Product ID is required");
    }

    if (!saleData.customerName?.trim()) {
        throw new Error("Customer name is required");
    }

    if (!saleData.paymentMethod) {
        throw new Error("Payment method is required");
    }

    if (!saleData.quantity || saleData.quantity < 1) {
        throw new Error("Quantity must be at least 1");
    }

    const storeId = saleData.storeId;
    if (!storeId) {
        throw new Error("Store ID is required");
    }

    // Validate store exists
    const store = await Store.findById(storeId);
    if (!store) {
        throw new Error("Store not found");
    }

    // Find the product
    const product = await Product.findById(saleData.productId);
    if (!product) {
        throw new Error("Product not found");
    }

    // Check if product exists in store inventory
    const storeInventory = await StoreInventory.findOne({
        store: storeId,
        product: saleData.productId
    });

    if (!storeInventory) {
        throw new Error("Product not available in this store");
    }

    // Check stock in store inventory
    if (storeInventory.stock < saleData.quantity) {
        throw new Error(`Insufficient stock. Available: ${storeInventory.stock} units`);
    }

    // Calculate totals
    const unitPrice = saleData.unitPrice || storeInventory.sellingPrice || product.price;
    const discount = saleData.discount || 0;
    const subtotal = unitPrice * saleData.quantity;
    const total = subtotal - discount;
    const profit = saleData.profit || ((unitPrice - (storeInventory.costPrice || product.costPrice)) * saleData.quantity);

    // Create sale record
    const sale = new Sale({
        saleReference: `SALE-${Date.now().toString().slice(-8)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        productId: product._id,
        storeId: storeId,
        storeName: store.name,
        productName: product.name,
        sku: product.sku,
        quantity: saleData.quantity,
        unitPrice: unitPrice,
        discount: discount,
        subtotal: subtotal,
        total: total,
        profit: profit,
        paymentMethod: saleData.paymentMethod,
        customerName: saleData.customerName.trim(),
        customerPhone: saleData.customerPhone?.trim() || '',
        notes: saleData.notes || '',
        status: "completed",
        createdAt: new Date()
    });

    // Save the sale
    const savedSale = await sale.save();

    // Calculate new stock
    const newStock = storeInventory.stock - saleData.quantity;

    // NEW LOGIC: Delete inventory item if stock reaches 0
    let inventoryAction = "updated";

    if (newStock <= 0) {
        // Delete the inventory item since it's out of stock
        await StoreInventory.findByIdAndDelete(storeInventory._id);
        inventoryAction = "deleted";
    } else {
        // Update store inventory with new stock
        let newStatus = "In Stock";

        if (newStock <= storeInventory.minStock) {
            newStatus = "Low Stock";
        }

        await StoreInventory.findByIdAndUpdate(
            storeInventory._id,
            {
                $inc: {
                    stock: -saleData.quantity,
                    storeSold: saleData.quantity,
                    storeRevenue: total
                },
                $set: {
                    status: newStatus,
                    lastSold: new Date()
                }
            }
        );
    }

    // Update global product sales counters
    await Product.findByIdAndUpdate(
        product._id,
        {
            $inc: {
                totalSold: saleData.quantity,
                totalRevenue: total
            }
        }
    );

    return {
        success: true,
        message: `Sale recorded successfully. Inventory item ${inventoryAction}.`,
        data: {
            sale: savedSale,
            inventoryUpdate: {
                newStock: newStock,
                action: inventoryAction,
                storeId: storeId,
                storeName: store.name,
                itemId: storeInventory._id
            }
        }
    };

};


// Get daily sales summary with store filtering - UPDATED
const getDailySalesSummary = async (date = new Date(), storeId = null) => {
    console.log('DEBUG - Input date:', date, 'Type:', typeof date);

    // Handle date string input
    let queryDate;
    if (typeof date === 'string') {
        const [year, month, day] = date.split('-').map(Number);
        queryDate = new Date(year, month - 1, day);
    } else {
        queryDate = new Date(date);
    }

    // Start of day in LOCAL time
    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);

    // End of day in LOCAL time  
    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Build match stage with optional store filter
    const matchStage = {
        saleDate: { $gte: startOfDay, $lte: endOfDay },
        status: "completed"
    };

    // Convert string storeId to ObjectId if provided
    if (storeId && storeId !== 'all') {
        try {
            matchStage.storeId = new mongoose.Types.ObjectId(storeId);
        } catch (error) {
            console.log('DEBUG - Invalid storeId format, skipping filter:', storeId);
        }
    }

    // Run all aggregations in parallel
    const [summary, itemsSold, paymentMethods] = await Promise.all([
        // Summary aggregation
        Sale.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: storeId && storeId !== 'all' ? "$storeId" : null,
                    totalSales: { $sum: "$total" },
                    totalProfit: { $sum: "$profit" },
                    totalItemsSold: { $sum: "$quantity" },
                    totalTransactions: { $count: {} },
                    averageTransaction: { $avg: "$total" },
                    totalDiscount: { $sum: "$discount" }
                }
            }
        ]),

        // Detailed items sold today - FIXED to handle store-specific sales
        Sale.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            {
                $unwind: "$productDetails"
            },
            {
                $lookup: {
                    from: "stores",
                    localField: "storeId",
                    foreignField: "_id",
                    as: "storeDetails"
                }
            },
            {
                $unwind: {
                    path: "$storeDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: {
                        productId: "$productId",
                        storeId: "$storeId"
                    },
                    productName: { $first: "$productName" },
                    sku: { $first: "$sku" },
                    storeId: { $first: "$storeId" },
                    storeName: { $first: "$storeDetails.name" },
                    category: { $first: "$productDetails.category" },
                    totalQuantitySold: { $sum: "$quantity" },
                    totalRevenue: { $sum: "$total" },
                    totalProfit: { $sum: "$profit" },
                    buyingPrice: { $first: "$productDetails.costPrice" },
                    sellingPrice: { $first: "$unitPrice" },
                    transactionCount: { $sum: 1 },
                    averageSellingPrice: { $avg: "$unitPrice" }
                }
            },
            {
                $sort: { totalQuantitySold: -1 }
            }
        ]),

        // Payment methods breakdown
        Sale.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: "$paymentMethod",
                    totalAmount: { $sum: "$total" },
                    totalTransactions: { $sum: 1 },
                    totalItemsSold: { $sum: "$quantity" },
                    averageTransaction: { $avg: "$total" }
                }
            },
            {
                $sort: { totalAmount: -1 }
            }
        ])
    ]);

    // If no sales for the day
    if (!summary || summary.length === 0) {
        return {
            success: true,
            data: {
                storeId: storeId || 'all',
                date: startOfDay,
                totalSales: 0,
                totalProfit: 0,
                totalItemsSold: 0,
                totalTransactions: 0,
                averageTransaction: 0,
                totalDiscount: 0,
                itemsSold: [],
                paymentMethods: [],
                salesBreakdown: {
                    cash: 0,
                    mpesa: 0,
                    card: 0,
                    paybill: 0,
                    installment: 0,
                    other: 0
                },
                metrics: {
                    netSales: 0,
                    profitMargin: 0,
                    itemsPerTransaction: 0
                }
            }
        };
    }

    const summaryData = summary[0];
    const totalSales = summaryData.totalSales || 0;

    // Calculate payment method percentages
    const paymentMethodsWithPercentage = paymentMethods.map(payment => ({
        paymentMethod: payment._id,
        totalAmount: payment.totalAmount,
        totalTransactions: payment.totalTransactions,
        totalItemsSold: payment.totalItemsSold,
        averageTransaction: payment.averageTransaction,
        percentage: totalSales > 0
            ? ((payment.totalAmount / totalSales) * 100).toFixed(1)
            : "0.0"
    }));

    // Calculate sales breakdown by payment method
    const salesBreakdown = {
        cash: 0,
        mpesa: 0,
        card: 0,
        paybill: 0,
        installment: 0,
        other: 0
    };

    paymentMethods.forEach(payment => {
        const method = payment._id?.toLowerCase();
        if (salesBreakdown.hasOwnProperty(method)) {
            salesBreakdown[method] = payment.totalAmount;
        } else {
            salesBreakdown.other = (salesBreakdown.other || 0) + payment.totalAmount;
        }
    });

    return {
        success: true,
        data: {
            storeId: storeId || 'all',
            date: startOfDay,
            ...summaryData,
            itemsSold: itemsSold.map(item => ({
                productId: item._id.productId,
                productName: item.productName,
                sku: item.sku,
                storeId: item.storeId,
                storeName: item.storeName,
                category: item.category,
                totalQuantitySold: item.totalQuantitySold,
                totalRevenue: item.totalRevenue,
                totalProfit: item.totalProfit,
                buyingPrice: item.buyingPrice || 0,
                sellingPrice: item.averageSellingPrice,
                transactionCount: item.transactionCount,
                profitMargin: item.buyingPrice > 0 ?
                    ((item.averageSellingPrice - item.buyingPrice) / item.buyingPrice * 100).toFixed(1) : "0.0",
                profitPerUnit: item.averageSellingPrice - (item.buyingPrice || 0)
            })),
            paymentMethods: paymentMethodsWithPercentage,
            salesBreakdown,
            metrics: {
                netSales: totalSales - (summaryData.totalDiscount || 0),
                profitMargin: totalSales > 0
                    ? ((summaryData.totalProfit / totalSales) * 100).toFixed(1)
                    : "0.0",
                itemsPerTransaction: summaryData.totalTransactions > 0
                    ? (summaryData.totalItemsSold / summaryData.totalTransactions).toFixed(1)
                    : "0.0"
            }
        }
    };
};

// Get top selling products with store filtering - UPDATED
const getTopSellingProducts = async (limit = 10, startDate = null, endDate = null, storeId = null) => {
    const matchStage = {
        status: 'completed'
    };

    // Add store filter if provided
    if (storeId && storeId !== 'all') {
        try {
            matchStage.storeId = new mongoose.Types.ObjectId(storeId);
        } catch (error) {
            // Invalid store ID, don't filter
        }
    }

    // Add date range filter if provided
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
            matchStage.saleDate = {
                $gte: start,
                $lte: end
            };
        }
    }

    const topProducts = await Sale.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: {
                    productId: "$productId",
                    storeId: "$storeId"
                },
                productName: { $first: "$productName" },
                sku: { $first: "$sku" },
                totalQuantity: { $sum: "$quantity" },
                totalRevenue: { $sum: "$total" },
                totalProfit: { $sum: "$profit" },
                transactionCount: { $sum: 1 },
                averageSellingPrice: { $avg: "$unitPrice" }
            }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: parseInt(limit) }
    ]);

    // Get product details for each
    const enrichedProducts = await Promise.all(
        topProducts.map(async (product) => {
            const productDetails = await Product.findById(product._id.productId)
                .select("category status images costPrice");

            const storeDetails = await Store.findById(product._id.storeId)
                .select("name code");

            return {
                ...product,
                productId: product._id.productId,
                storeId: product._id.storeId,
                storeName: storeDetails?.name,
                storeCode: storeDetails?.code,
                category: productDetails?.category,
                status: productDetails?.status,
                buyingPrice: productDetails?.costPrice || 0,
                image: productDetails?.images?.find(img => img.isPrimary)?.displayUrl ||
                    productDetails?.images?.[0]?.displayUrl,
                profitMargin: productDetails?.costPrice > 0 ?
                    ((product.averageSellingPrice - productDetails.costPrice) / productDetails.costPrice * 100).toFixed(1) : "0.0"
            };
        })
    );

    return {
        success: true,
        data: {
            storeId: storeId || 'all',
            dateRange: startDate && endDate ? { startDate, endDate } : 'all time',
            products: enrichedProducts
        }
    };
};

// Get monthly sales summary with store filtering - UPDATED
const getMonthlySalesSummary = async (year, month, storeId = null) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Build match stage with optional store filter
    const matchStage = {
        saleDate: { $gte: startDate, $lte: endDate },
        status: "completed"
    };

    if (storeId && storeId !== 'all') {
        try {
            matchStage.storeId = new mongoose.Types.ObjectId(storeId);
        } catch (error) {
            // Invalid store ID, skip filter
        }
    }

    const [summary, itemsSold, dailyBreakdown] = await Promise.all([
        // Overall monthly summary
        Sale.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: storeId ? "$storeId" : null,
                    totalSales: { $sum: "$total" },
                    totalProfit: { $sum: "$profit" },
                    totalItemsSold: { $sum: "$quantity" },
                    totalTransactions: { $count: {} },
                    averageTransaction: { $avg: "$total" }
                }
            }
        ]),

        // Items sold this month
        Sale.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            {
                $unwind: "$productDetails"
            },
            {
                $lookup: {
                    from: "stores",
                    localField: "storeId",
                    foreignField: "_id",
                    as: "storeDetails"
                }
            },
            {
                $unwind: {
                    path: "$storeDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: {
                        productId: "$productId",
                        storeId: "$storeId"
                    },
                    productName: { $first: "$productName" },
                    sku: { $first: "$sku" },
                    storeName: { $first: "$storeDetails.name" },
                    totalQuantitySold: { $sum: "$quantity" },
                    totalRevenue: { $sum: "$total" },
                    totalProfit: { $sum: "$profit" },
                    buyingPrice: { $first: "$productDetails.costPrice" },
                    sellingPrice: { $avg: "$unitPrice" },
                    transactionCount: { $sum: 1 },
                    profitPerUnit: { $avg: { $subtract: ["$unitPrice", "$productDetails.costPrice"] } }
                }
            },
            {
                $sort: { totalQuantitySold: -1 }
            }
        ]),

        // Daily breakdown for the month
        Sale.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$saleDate" } },
                        storeId: "$storeId"
                    },
                    dailyRevenue: { $sum: "$total" },
                    dailyProfit: { $sum: "$profit" },
                    dailyItemsSold: { $sum: "$quantity" },
                    transactionCount: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.date": 1 }
            }
        ])
    ]);

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    return {
        success: true,
        data: {
            storeId: storeId || 'all',
            month: monthNames[month - 1],
            year,
            startDate,
            endDate,
            ...(summary[0] || {
                totalSales: 0,
                totalProfit: 0,
                totalItemsSold: 0,
                totalTransactions: 0,
                averageTransaction: 0
            }),
            itemsSold: itemsSold.map(item => ({
                productId: item._id.productId,
                productName: item.productName,
                sku: item.sku,
                storeId: item._id.storeId,
                storeName: item.storeName,
                totalQuantitySold: item.totalQuantitySold,
                totalRevenue: item.totalRevenue,
                totalProfit: item.totalProfit,
                buyingPrice: item.buyingPrice,
                sellingPrice: item.sellingPrice,
                profitPerUnit: item.profitPerUnit,
                transactionCount: item.transactionCount,
                profitMargin: item.buyingPrice > 0 ?
                    ((item.sellingPrice - item.buyingPrice) / item.buyingPrice * 100).toFixed(1) : 0
            })),
            dailyBreakdown: dailyBreakdown.map(day => ({
                date: day._id.date,
                storeId: day._id.storeId,
                dailyRevenue: day.dailyRevenue,
                dailyProfit: day.dailyProfit,
                dailyItemsSold: day.dailyItemsSold,
                transactionCount: day.transactionCount
            }))
        }
    };
};

// Get sales analytics - UPDATED
const getSalesAnalytics = async (period = "month", storeId = null) => {
    try {
        const endDate = new Date();
        let startDate = new Date(endDate);

        switch (period) {
            case "day":
                startDate.setHours(0, 0, 0, 0);
                break;
            case "week":
                startDate.setDate(startDate.getDate() - 7);
                break;
            case "month":
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case "year":
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            default:
                throw new Error("Invalid period. Use: day, week, month, or year");
        }

        // Build match stage with optional store filter
        const matchStage = {
            saleDate: { $gte: startDate, $lte: endDate },
            status: "completed"
        };

        if (storeId && storeId !== 'all') {
            try {
                matchStage.storeId = new mongoose.Types.ObjectId(storeId);
            } catch (error) {
                // Invalid store ID, skip filter
            }
        }

        // Run aggregations
        const [dailyBreakdown, paymentMethodBreakdown, overallSummaryResult, storePerformance] = await Promise.all([
            // Daily breakdown
            Sale.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: "%Y-%m-%d", date: "$saleDate" } },
                            storeId: "$storeId"
                        },
                        dailyRevenue: { $sum: "$total" },
                        dailyProfit: { $sum: "$profit" },
                        itemsSold: { $sum: "$quantity" },
                        transactionCount: { $sum: 1 }
                    }
                },
                { $sort: { "_id.date": 1 } },
                {
                    $project: {
                        date: "$_id.date",
                        storeId: "$_id.storeId",
                        dailyRevenue: 1,
                        dailyProfit: 1,
                        transactionCount: 1,
                        itemsSold: 1,
                        _id: 0
                    }
                }
            ]),

            // Payment method breakdown
            Sale.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: "$paymentMethod",
                        total: { $sum: "$total" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        paymentMethod: "$_id",
                        total: 1,
                        count: 1,
                        _id: 0
                    }
                }
            ]),

            // Overall summary
            Sale.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$total" },
                        totalProfit: { $sum: "$profit" },
                        totalTransactions: { $sum: 1 },
                        totalItemsSold: { $sum: "$quantity" },
                        averageTransactionValue: { $avg: "$total" }
                    }
                }
            ]),

            // Store performance (only if not filtering by specific store)
            !storeId || storeId === 'all' ? Sale.aggregate([
                { $match: matchStage },
                {
                    $lookup: {
                        from: "stores",
                        localField: "storeId",
                        foreignField: "_id",
                        as: "storeDetails"
                    }
                },
                {
                    $unwind: "$storeDetails"
                },
                {
                    $group: {
                        _id: "$storeId",
                        storeName: { $first: "$storeDetails.name" },
                        totalRevenue: { $sum: "$total" },
                        totalProfit: { $sum: "$profit" },
                        transactionCount: { $sum: 1 },
                        itemsSold: { $sum: "$quantity" }
                    }
                },
                {
                    $sort: { totalRevenue: -1 }
                }
            ]) : Promise.resolve([])
        ]);

        const overallSummary = overallSummaryResult[0] || {
            totalRevenue: 0,
            totalProfit: 0,
            totalTransactions: 0,
            totalItemsSold: 0,
            averageTransactionValue: 0
        };

        return {
            success: true,
            data: {
                storeId: storeId || 'all',
                period,
                dateRange: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                },
                dailyBreakdown,
                paymentMethodBreakdown,
                storePerformance,
                overallSummary: {
                    totalRevenue: overallSummary.totalRevenue || 0,
                    totalProfit: overallSummary.totalProfit || 0,
                    totalTransactions: overallSummary.totalTransactions || 0,
                    totalItemsSold: overallSummary.totalItemsSold || 0,
                    averageTransactionValue: overallSummary.averageTransactionValue || 0,
                    profitMargin: overallSummary.totalRevenue > 0 ?
                        ((overallSummary.totalProfit / overallSummary.totalRevenue) * 100).toFixed(2) : "0.00"
                }
            }
        };

    } catch (error) {
        console.error("Error in getSalesAnalytics:", error);
        return {
            success: false,
            error: error.message,
            data: {
                storeId: storeId || 'all',
                period,
                dateRange: { startDate: null, endDate: null },
                dailyBreakdown: [],
                paymentMethodBreakdown: [],
                storePerformance: [],
                overallSummary: {
                    totalRevenue: 0,
                    totalProfit: 0,
                    totalTransactions: 0,
                    totalItemsSold: 0,
                    averageTransactionValue: 0,
                    profitMargin: "0.00"
                }
            }
        };
    }
};

// Get sales by product with store filtering - UPDATED
const getSalesByProduct = async (productId, page = 1, limit = 30, storeId = null) => {
    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
        throw new Error("Product not found");
    }

    const skip = (page - 1) * limit;

    // Build query with optional store filter
    const query = {
        productId: productId,
        status: "completed"
    };

    if (storeId && storeId !== 'all') {
        try {
            query.storeId = new mongoose.Types.ObjectId(storeId);
        } catch (error) {
            // Invalid store ID, skip filter
        }
    }

    const [sales, total] = await Promise.all([
        Sale.find(query)
            .populate("storeId", "name code")
            .sort({ saleDate: -1 })
            .skip(skip)
            .limit(limit),

        Sale.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    // Get sales summary for this product
    const salesSummary = await Sale.aggregate([
        { $match: query },
        {
            $group: {
                _id: storeId ? "$storeId" : null,
                totalRevenue: { $sum: "$total" },
                totalProfit: { $sum: "$profit" },
                totalQuantitySold: { $sum: "$quantity" },
                averageSalePrice: { $avg: "$unitPrice" },
                totalTransactions: { $sum: 1 }
            }
        }
    ]);

    // Get store inventory info if specific store
    let storeInventoryInfo = null;
    if (storeId && storeId !== 'all') {
        storeInventoryInfo = await StoreInventory.findOne({
            store: storeId,
            product: productId
        });
    }

    return {
        success: true,
        data: {
            storeId: storeId || 'all',
            product: {
                id: product._id,
                name: product.name,
                sku: product.sku,
                price: product.price,
                costPrice: product.costPrice,
                status: product.status,
                storeStock: storeInventoryInfo?.stock || 0,
                storeStatus: storeInventoryInfo?.status || "Not in store"
            },
            sales,
            summary: salesSummary[0] || {
                totalRevenue: 0,
                totalProfit: 0,
                totalQuantitySold: 0,
                averageSalePrice: 0,
                totalTransactions: 0
            },
            pagination: {
                total,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        }
    };
};

// Get items sold by date range with store filtering - UPDATED
const getItemsSoldByDateRange = async (startDate, endDate, page = 1, limit = 50, storeId = null) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error("Invalid date format");
    }

    if (start > end) {
        throw new Error("Start date cannot be after end date");
    }

    const skip = (page - 1) * limit;

    // Build match stage with optional store filter
    const matchStage = {
        saleDate: { $gte: start, $lte: end },
        status: "completed"
    };

    if (storeId && storeId !== 'all') {
        try {
            matchStage.storeId = new mongoose.Types.ObjectId(storeId);
        } catch (error) {
            // Invalid store ID, skip filter
        }
    }

    // Get aggregated items sold with pagination
    const [itemsSold, total] = await Promise.all([
        Sale.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            {
                $unwind: "$productDetails"
            },
            {
                $lookup: {
                    from: "stores",
                    localField: "storeId",
                    foreignField: "_id",
                    as: "storeDetails"
                }
            },
            {
                $unwind: {
                    path: "$storeDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: {
                        productId: "$productId",
                        storeId: "$storeId"
                    },
                    productName: { $first: "$productName" },
                    sku: { $first: "$sku" },
                    storeName: { $first: "$storeDetails.name" },
                    category: { $first: "$productDetails.category" },
                    totalQuantitySold: { $sum: "$quantity" },
                    totalRevenue: { $sum: "$total" },
                    totalProfit: { $sum: "$profit" },
                    buyingPrice: { $first: "$productDetails.costPrice" },
                    averageSellingPrice: { $avg: "$unitPrice" },
                    transactionCount: { $sum: 1 },
                    firstSaleDate: { $min: "$saleDate" },
                    lastSaleDate: { $max: "$saleDate" }
                }
            },
            {
                $project: {
                    productName: 1,
                    sku: 1,
                    storeId: "$_id.storeId",
                    storeName: 1,
                    category: 1,
                    totalQuantitySold: 1,
                    totalRevenue: 1,
                    totalProfit: 1,
                    buyingPrice: 1,
                    averageSellingPrice: 1,
                    transactionCount: 1,
                    profitPerUnit: { $subtract: ["$averageSellingPrice", "$buyingPrice"] },
                    profitMargin: {
                        $cond: [
                            { $gt: ["$buyingPrice", 0] },
                            {
                                $multiply: [
                                    { $divide: [{ $subtract: ["$averageSellingPrice", "$buyingPrice"] }, "$buyingPrice"] },
                                    100
                                ]
                            },
                            0
                        ]
                    },
                    firstSaleDate: 1,
                    lastSaleDate: 1
                }
            },
            {
                $sort: { totalQuantitySold: -1 }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            }
        ]),

        // Total count for pagination
        Sale.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        productId: "$productId",
                        storeId: "$storeId"
                    }
                }
            },
            {
                $count: "total"
            }
        ])
    ]);

    const totalCount = total[0]?.total || 0;
    const totalPages = Math.ceil(totalCount / limit);

    return {
        success: true,
        data: {
            storeId: storeId || 'all',
            itemsSold: itemsSold.map(item => ({
                productId: item._id.productId,
                ...item,
                profitMargin: item.profitMargin ? item.profitMargin.toFixed(1) : "0.0"
            })),
            summary: {
                totalProducts: totalCount,
                totalRevenue: itemsSold.reduce((sum, item) => sum + item.totalRevenue, 0),
                totalProfit: itemsSold.reduce((sum, item) => sum + item.totalProfit, 0),
                totalQuantitySold: itemsSold.reduce((sum, item) => sum + item.totalQuantitySold, 0),
                averageRevenuePerProduct: itemsSold.length > 0
                    ? (itemsSold.reduce((sum, item) => sum + item.totalRevenue, 0) / itemsSold.length).toFixed(2)
                    : 0
            },
            pagination: {
                total: totalCount,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            },
            dateRange: {
                startDate: start,
                endDate: end
            }
        }
    };
};

// Refund a sale - UPDATED for store inventory
const refundSale = async (saleId, reason, storeId = null) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const sale = await Sale.findById(saleId);
        if (!sale) {
            throw new Error("Sale not found");
        }

        // Optional: Validate sale belongs to specific store
        if (storeId && sale.storeId.toString() !== storeId.toString()) {
            throw new Error("Sale does not belong to the specified store");
        }

        if (sale.status === "refunded") {
            throw new Error("Sale is already refunded");
        }

        if (sale.status === "cancelled") {
            throw new Error("Sale is already cancelled");
        }

        // Mark as refunded
        sale.status = "refunded";
        sale.notes = reason ? `${sale.notes || ''}\nRefunded: ${reason}`.trim() : "Refunded";
        await sale.save({ session });

        // Restore product stock in store inventory
        const storeInventory = await StoreInventory.findOne({
            store: sale.storeId,
            product: sale.productId
        });

        if (storeInventory) {
            await StoreInventory.findByIdAndUpdate(
                storeInventory._id,
                {
                    $inc: { stock: sale.quantity }
                },
                { session }
            );
        }

        // Update global product counters (optional)
        await Product.findByIdAndUpdate(
            sale.productId,
            {
                $inc: {
                    totalSold: -sale.quantity,
                    totalRevenue: -sale.total
                }
            },
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        return {
            success: true,
            message: "Sale refunded successfully",
            data: {
                sale,
                storeId: sale.storeId
            }
        };

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

// Get recent sales with store filtering - UPDATED
const getRecentSales = async (limit = 20, storeId = null) => {
    // Build query with optional store filter
    const query = { status: "completed" };

    if (storeId && storeId !== 'all') {
        try {
            query.storeId = new mongoose.Types.ObjectId(storeId);
        } catch (error) {
            // Invalid store ID, skip filter
        }
    }

    const sales = await Sale.find(query)
        .populate("productId", "name sku category images")
        .populate("storeId", "name code")
        .sort({ createdAt: -1 })
        .limit(limit);

    // Get summary of recent sales
    const recentSummary = await Sale.aggregate([
        { $match: query },
        {
            $sort: { createdAt: -1 }
        },
        { $limit: parseInt(limit) },
        {
            $group: {
                _id: null,
                totalAmount: { $sum: "$total" },
                totalProfit: { $sum: "$profit" },
                totalItems: { $sum: "$quantity" },
                averageSale: { $avg: "$total" }
            }
        }
    ]);

    // Format sales with product image
    const formattedSales = sales.map(sale => {
        const product = sale.productId;
        return {
            ...sale.toObject(),
            productImage: product?.images?.find(img => img.isPrimary)?.displayUrl ||
                product?.images?.[0]?.displayUrl
        };
    });

    return {
        success: true,
        data: {
            storeId: storeId || 'all',
            sales: formattedSales,
            summary: recentSummary[0] || {
                totalAmount: 0,
                totalProfit: 0,
                totalItems: 0,
                averageSale: 0
            },
            limit
        }
    };
};

module.exports = {
    recordSale,
    getDailySalesSummary,
    getItemsSoldByDateRange,
    getTopSellingProducts,
    getSalesAnalytics,
    getSalesByProduct,
    refundSale,
    getRecentSales,
    getMonthlySalesSummary
};