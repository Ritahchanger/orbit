// transaction.service.js - FIXED VERSION
const Transaction = require("./transaction.model");
const Sale = require("./sales.model");
const Store = require("../stores/store.model");

// Helper function to populate transaction data - FIXED
const populateTransaction = (query) => {
  return query
    .populate("storeId", "name location")
    .populate("soldBy", "name email")
    .populate({
      path: "saleIds",
      select:
        "productName sku quantity unitPrice total discount subtotal profit saleDate customerName paymentMethod",
      // Keep it simple - don't populate productId for now
    });
};

// 1. Get all transactions with pagination and filters - FIXED
const getAllTransactions = async (filters = {}) => {
  const {
    page = 1,
    limit = 20,
    storeId,
    startDate,
    endDate,
    paymentMethod,
    paymentStatus,
    status,
    customerName,
    customerPhone,
    minAmount,
    maxAmount,
    hasChange,
    soldBy,
    sortBy = "createdAt",
    sortOrder = -1,
    showRefundableOnly = false,
    includeDeleted = false, // NEW: Option to include deleted transactions (default false)
  } = filters;

  // Build filter query
  const query = {};

  // ✅ EXCLUDE soft-deleted transactions by default
  if (!includeDeleted) {
    query.isDeleted = { $ne: true }; // Only include non-deleted transactions
  }

  if (storeId) {
    query.storeId = storeId;
  }

  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  } else if (startDate) {
    query.createdAt = { $gte: new Date(startDate) };
  } else if (endDate) {
    query.createdAt = { $lte: new Date(endDate) };
  }

  if (paymentMethod) {
    query.paymentMethod = paymentMethod;
  }

  if (paymentStatus) {
    query.paymentStatus = paymentStatus;
  }

  if (status) {
    query.status = status;
  }

  if (customerName) {
    query.customerName = { $regex: customerName, $options: "i" };
  }

  if (customerPhone) {
    query.customerPhone = { $regex: customerPhone, $options: "i" };
  }

  if (minAmount !== undefined || maxAmount !== undefined) {
    query.total = {};
    if (minAmount !== undefined) {
      query.total.$gte = parseFloat(minAmount);
    }
    if (maxAmount !== undefined) {
      query.total.$lte = parseFloat(maxAmount);
    }
  }

  if (hasChange === true) {
    query.paymentMethod = "cash";
    query.change = { $gt: 0 };
  } else if (hasChange === false) {
    query.paymentMethod = "cash";
    query.change = 0;
  }

  if (soldBy) {
    query.soldBy = soldBy;
  }

  // Filter only transactions eligible for refund
  if (showRefundableOnly) {
    const refundCutoffDate = new Date();
    refundCutoffDate.setDate(refundCutoffDate.getDate() - 3); // 3 days refund window

    query.createdAt = {
      ...query.createdAt,
      $gte: refundCutoffDate,
    };
    query.paymentStatus = "paid";
    query.status = { $ne: "refunded" };
    query.$or = [
      { refundStatus: { $ne: "full" } },
      { refundStatus: { $exists: false } },
    ];
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Execute query with pagination
  const [transactions, total] = await Promise.all([
    Transaction.find(query)
      .populate("storeId", "name location storeCode")
      .populate("soldBy", "name email employeeId")
      .populate({
        path: "saleIds",
        select: "productName sku quantity unitPrice total",
        options: { limit: 5 },
      })
      .lean()
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit),
    Transaction.countDocuments(query),
  ]);

  // Calculate totals
  const safeTransactions = transactions || [];

  // Calculate transaction age and refund eligibility for each transaction
  const now = new Date();
  const refundWindowDays = 3;
  const refundCutoffDate = new Date();
  refundCutoffDate.setDate(refundCutoffDate.getDate() - refundWindowDays);

  const enrichedTransactions = safeTransactions.map((tx) => {
    const createdAt = new Date(tx.createdAt);
    const ageInDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
    const ageInHours = Math.floor((now - createdAt) / (1000 * 60 * 60));
    const isWithinRefundWindow = createdAt >= refundCutoffDate;

    const canRefund =
      isWithinRefundWindow &&
      tx.paymentStatus === "paid" &&
      tx.status !== "refunded" &&
      (tx.refundStatus !== "full" || !tx.refundStatus);

    const refundDeadline = new Date(createdAt);
    refundDeadline.setDate(refundDeadline.getDate() + refundWindowDays);

    const hoursRemaining = Math.max(
      0,
      Math.floor((refundDeadline - now) / (1000 * 60 * 60)),
    );

    let refundStatusMessage = null;
    if (tx.status === "refunded") {
      refundStatusMessage = "Already refunded";
    } else if (tx.paymentStatus !== "paid") {
      refundStatusMessage = `Cannot refund - payment status: ${tx.paymentStatus}`;
    } else if (!isWithinRefundWindow) {
      refundStatusMessage = `Refund window expired (${ageInDays} days old)`;
    } else if (tx.refundStatus === "full") {
      refundStatusMessage = "Fully refunded";
    }

    return {
      ...tx,
      age: {
        days: ageInDays,
        hours: ageInHours,
        formatted:
          ageInDays > 0
            ? `${ageInDays} day${ageInDays > 1 ? "s" : ""} ${ageInHours % 24} hr${ageInHours % 24 > 1 ? "s" : ""}`
            : `${ageInHours} hour${ageInHours > 1 ? "s" : ""}`,
      },
      refundEligible: canRefund,
      refundDeadline,
      refundWindowExpired: !isWithinRefundWindow,
      hoursRemaining,
      refundStatusMessage,
      availableRefundAmount: tx.total - (tx.refundedAmount || 0),
      refundProgress: tx.refundedAmount
        ? Math.round((tx.refundedAmount / tx.total) * 100)
        : 0,
    };
  });

  const totalRevenue = enrichedTransactions.reduce(
    (sum, tx) => sum + (tx.total || 0),
    0,
  );
  const totalProfit = enrichedTransactions.reduce(
    (sum, tx) => sum + (tx.totalProfit || 0),
    0,
  );
  const totalItems = enrichedTransactions.reduce(
    (sum, tx) => sum + (tx.itemsCount || 0),
    0,
  );
  const totalDiscount = enrichedTransactions.reduce(
    (sum, tx) => sum + (tx.discount || 0),
    0,
  );
  const totalTax = enrichedTransactions.reduce(
    (sum, tx) => sum + (tx.tax || 0),
    0,
  );
  const totalCashGiven = enrichedTransactions.reduce(
    (sum, tx) => sum + (tx.amountGiven || 0),
    0,
  );
  const totalChange = enrichedTransactions.reduce(
    (sum, tx) => sum + (tx.change || 0),
    0,
  );

  // Calculate payment method breakdown
  const paymentMethodBreakdown = enrichedTransactions.reduce((acc, tx) => {
    const method = tx.paymentMethod || "other";
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {});

  // Refund eligibility summary
  const refundableCount = enrichedTransactions.filter(
    (tx) => tx.refundEligible,
  ).length;
  const expiredCount = enrichedTransactions.filter(
    (tx) => tx.refundWindowExpired,
  ).length;
  const refundedCount = enrichedTransactions.filter(
    (tx) => tx.status === "refunded",
  ).length;

  return {
    transactions: enrichedTransactions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
    summary: {
      totalTransactions: total,
      totalRevenue,
      totalProfit,
      totalItems,
      totalDiscount,
      totalTax,
      totalCashGiven,
      totalChange,
      averageTransaction: total > 0 ? totalRevenue / total : 0,
      paymentMethodBreakdown,
      cashTransactions: enrichedTransactions.filter(
        (tx) => tx.paymentMethod === "cash",
      ).length,
      nonCashTransactions: enrichedTransactions.filter(
        (tx) => tx.paymentMethod !== "cash",
      ).length,
      dateRange: {
        start: startDate || null,
        end: endDate || null,
      },
      refundPolicy: {
        refundWindowDays: 3,
        refundableCount,
        expiredCount,
        refundedCount,
        expiredTransactions: expiredCount > 0,
      },
    },
  };
};
// Helper function to populate transaction (optional)
// const populateTransaction = (query) => {
//   return query
//     .populate("storeId", "name location storeCode")
//     .populate("soldBy", "name email employeeId")
//     .populate({
//       path: "saleIds",
//       select: "productName sku quantity unitPrice total",
//       options: { limit: 5 },
//     });
// };
// 2. Get transaction by ID with sales details - FIXED
const getTransactionById = async (transactionId) => {
  const transaction = await populateTransaction(
    Transaction.findOne({
      $or: [{ _id: transactionId }, { transactionId: transactionId }],
    }).lean(), // Add lean() here too
  );

  if (!transaction) {
    throw new Error("Transaction not found");
  }

  // Get detailed sales information - FIXED: Use lean() and don't populate productId
  const salesDetails = await Sale.find({ _id: { $in: transaction.saleIds } })
    .lean()
    .select(
      "productName sku quantity unitPrice total discount subtotal profit saleDate customerName paymentMethod",
    );

  return {
    ...transaction,
    salesDetails,
  };
};

// 3. Get store transactions with filters - FIXED
const getStoreTransactions = async ({ storeId, ...filters }) => {
  if (!storeId) {
    throw new Error("Store ID is required");
  }

  // Verify store exists
  const store = await Store.findById(storeId).lean();
  if (!store) {
    throw new Error("Store not found");
  }

  return getAllTransactions({
    storeId,
    ...filters,
  });
};

// 4. Get today's transactions summary - FIXED
const getTodaySummary = async (storeId = null) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Build query
  const query = {
    createdAt: {
      $gte: today,
      $lt: tomorrow,
    },
    status: "completed",
  };

  if (storeId) {
    query.storeId = storeId;
  }

  // Get all today's transactions - Use lean()
  const transactions = await Transaction.find(query).lean();

  // Calculate summary
  const summary = {
    totalTransactions: transactions.length,
    totalRevenue: transactions.reduce((sum, tx) => sum + (tx.total || 0), 0),
    totalProfit: transactions.reduce(
      (sum, tx) => sum + (tx.totalProfit || 0),
      0,
    ),
    totalItems: transactions.reduce((sum, tx) => sum + (tx.itemsCount || 0), 0),
    cashTransactions: transactions.filter((tx) => tx.paymentMethod === "cash")
      .length,
    mpesaTransactions: transactions.filter((tx) => tx.paymentMethod === "mpesa")
      .length,
    cardTransactions: transactions.filter((tx) => tx.paymentMethod === "card")
      .length,
    paymentMethodBreakdown: transactions.reduce((acc, tx) => {
      const method = tx.paymentMethod || "other";
      acc[method] = (acc[method] || 0) + (tx.total || 0);
      return acc;
    }, {}),
    hourlyBreakdown: transactions.reduce((acc, tx) => {
      if (tx.createdAt) {
        const hour = new Date(tx.createdAt).getHours();
        acc[hour] = (acc[hour] || 0) + (tx.total || 0);
      }
      return acc;
    }, Array(24).fill(0)),
  };

  // Calculate averages
  summary.averageTransaction =
    summary.totalTransactions > 0
      ? summary.totalRevenue / summary.totalTransactions
      : 0;
  summary.averageItemsPerTransaction =
    summary.totalTransactions > 0
      ? summary.totalItems / summary.totalTransactions
      : 0;

  // Get top products sold today - FIXED: Use lean() and don't populate
  const todaySales = await Sale.find({
    saleDate: { $gte: today, $lt: tomorrow },
    status: "completed",
  })
    .lean()
    .select("productName sku quantity total");

  const productSales = {};
  todaySales.forEach((sale) => {
    const productKey = sale.productName || "Unknown Product";
    if (!productSales[productKey]) {
      productSales[productKey] = {
        product: {
          name: sale.productName,
          sku: sale.sku,
        },
        quantity: 0,
        revenue: 0,
      };
    }
    productSales[productKey].quantity += sale.quantity || 0;
    productSales[productKey].revenue += sale.total || 0;
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  summary.topProducts = topProducts;

  return summary;
};

module.exports = {
  getAllTransactions,
  getTransactionById,
  getStoreTransactions,
  getTodaySummary,
};
