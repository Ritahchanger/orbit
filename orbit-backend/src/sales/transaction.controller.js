const transactionService = require("./transaction.service");

// 1. Get all transactions with pagination and filters
const getAllTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      storeId,
      startDate,
      endDate,
      paymentMethod,
      paymentStatus, // NEW
      status,
      customerName,
      customerPhone, // NEW
      minAmount, // NEW
      maxAmount, // NEW
      hasChange, // NEW
      soldBy, // NEW
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Convert hasChange string to boolean if provided
    let hasChangeBool;
    if (hasChange !== undefined) {
      hasChangeBool = hasChange === "true";
    }

    const result = await transactionService.getAllTransactions({
      page: parseInt(page),
      limit: parseInt(limit),
      storeId,
      startDate,
      endDate,
      paymentMethod,
      paymentStatus, // NEW
      status,
      customerName,
      customerPhone, // NEW
      minAmount: minAmount ? parseFloat(minAmount) : undefined, // NEW
      maxAmount: maxAmount ? parseFloat(maxAmount) : undefined, // NEW
      hasChange: hasChangeBool, // NEW
      soldBy, // NEW
      sortBy,
      sortOrder: sortOrder === "desc" ? -1 : 1,
    });

    res.status(200).json({
      success: true,
      message: "Transactions retrieved successfully",
      data: result.transactions,
      pagination: result.pagination,
      summary: result.summary, // NEW: Include the enhanced summary
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve transactions",
      error: error.message,
    });
  }
};

// 2. Get transaction by ID with sales details
const getTransactionById = async (req, res) => {
  const { transactionId } = req.params;

  const transaction =
    await transactionService.getTransactionById(transactionId);

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: "Transaction not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Transaction retrieved successfully",
    data: transaction,
  });
};

// 3. Get store transactions with filters
const getStoreTransactions = async (req, res) => {
  const { storeId } = req.params;
  const {
    page = 1,
    limit = 20,
    startDate,
    endDate,
    paymentMethod,
    customerName,
  } = req.query;

  const result = await transactionService.getStoreTransactions({
    storeId,
    page: parseInt(page),
    limit: parseInt(limit),
    startDate,
    endDate,
    paymentMethod,
    customerName,
  });

  res.status(200).json({
    success: true,
    message: "Store transactions retrieved successfully",
    data: result.transactions,
    pagination: result.pagination,
  });
};

// 4. Get today's transactions summary
const getTodaySummary = async (req, res) => {
  const { storeId } = req.query;

  const summary = await transactionService.getTodaySummary(storeId);

  res.status(200).json({
    success: true,
    message: "Today's summary retrieved successfully",
    data: summary,
  });
};

module.exports = {
  getAllTransactions,
  getTransactionById,
  getStoreTransactions,
  getTodaySummary,
};
