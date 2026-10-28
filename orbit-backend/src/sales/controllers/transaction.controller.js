const transactionService = require("../services/transaction.service");
const reportService = require("../../reports/services/reports.service");
const { renderReportPdf, renderReceiptPdf } = require("../../reports/pdf/reports.pdf");

// Max rows rendered into a transactions PDF report.
const PDF_ROW_LIMIT = 5000;
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

    const businessId = req.businessId;

    const result = await transactionService.getAllTransactions(
      {
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
      },
      businessId,
    );

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

  const transaction = await transactionService.getTransactionById(
    transactionId,
    req.businessId,
  );

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
    businessId: req.businessId,
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

  const businessId = req.businessId;

  const summary = await transactionService.getTodaySummary(storeId, businessId);

  res.status(200).json({
    success: true,
    message: "Today's summary retrieved successfully",
    data: summary,
  });
};

// 5. Transactions report PDF (same filters as the list endpoint)
const exportTransactionsPdf = async (req, res) => {
  const {
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
  } = req.query;
  const businessId = req.businessId;

  const [result, meta] = await Promise.all([
    transactionService.getAllTransactions(
      {
        page: 1,
        limit: PDF_ROW_LIMIT,
        storeId,
        startDate,
        endDate,
        paymentMethod,
        paymentStatus,
        status,
        customerName,
        customerPhone,
        minAmount: minAmount ? parseFloat(minAmount) : undefined,
        maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
        hasChange: hasChange === undefined ? undefined : hasChange === "true",
        soldBy,
        sortBy: "createdAt",
        sortOrder: -1,
      },
      businessId,
    ),
    reportService.getPdfMeta(businessId, storeId),
  ]);

  const extraScope = [
    paymentMethod && `Payment: ${paymentMethod}`,
    status && `Status: ${status}`,
    paymentStatus && `Payment status: ${paymentStatus}`,
    customerName && `Customer: ${customerName}`,
  ].filter(Boolean);

  const buffer = await renderReportPdf(
    "transactions",
    {
      transactions: result.transactions,
      summary: result.summary,
      truncatedFrom:
        result.pagination.total > result.transactions.length
          ? result.pagination.total
          : null,
    },
    { ...meta, startDate, endDate, extraScope },
  );

  const date = new Date().toISOString().split("T")[0];
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${meta.slug}_transactions_${date}.pdf"`,
  );
  res.send(buffer);
};

// 6. Single transaction receipt PDF
const getTransactionReceiptPdf = async (req, res) => {
  const businessId = req.businessId;
  let transaction;
  try {
    transaction = await transactionService.getTransactionById(
      req.params.transactionId,
      businessId,
    );
  } catch {
    transaction = null;
  }
  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: "Transaction not found",
    });
  }

  const meta = await reportService.getPdfMeta(
    businessId,
    transaction.storeId?._id || transaction.storeId,
  );
  const buffer = await renderReceiptPdf(transaction, meta);

  const ref =
    transaction.transactionId || String(transaction._id).slice(-8).toUpperCase();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `${req.query.inline === "true" ? "inline" : "attachment"}; filename="receipt-${ref}.pdf"`,
  );
  res.send(buffer);
};

module.exports = {
  exportTransactionsPdf,
  getTransactionReceiptPdf,
  getAllTransactions,
  getTransactionById,
  getStoreTransactions,
  getTodaySummary,
};
