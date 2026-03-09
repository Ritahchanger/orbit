const salesService = require("./sales.services");

const posSalesService = require("./pos-service");

// Record a new sale (global - storeId in body)

// Record a new sale (global - storeId in body)
const recordSale = async (req, res) => {
  const result = await salesService.recordSale(req.body);
  res.status(201).json(result);
};

const recordMultipleItemsSale = async (req, res) => {
  const result = await posSalesService.recordMultipleItemsSale(req.body);
  res.status(201).json(result);
};
// Record a sale for specific store
const recordStoreSale = async (req, res) => {
  const { storeId } = req.params;
  const result = await salesService.recordSale(req.body, storeId);
  res.status(201).json(result);
};

// Get daily summary (global or filtered by storeId in query)
const getDailySummary = async (req, res) => {
  const { date, storeId } = req.query;

  const result = await salesService.getDailySalesSummary(
    date ? new Date(date) : new Date(),
    storeId,
  );
  res.json(result);
};

// Get store-specific daily summary
const getStoreDailySummary = async (req, res) => {
  const { storeId } = req.params;
  const { date } = req.query;

  const result = await salesService.getDailySalesSummary(
    date ? new Date(date) : new Date(),
    storeId,
  );
  res.json(result);
};

// Get sales by date range (global or filtered)
const getSalesByDateRange = async (req, res) => {
  const { startDate, endDate, page = 1, limit = 50, storeId } = req.query;

  const result = await salesService.getItemsSoldByDateRange(
    startDate,
    endDate,
    parseInt(page),
    parseInt(limit),
    storeId,
  );
  res.json(result);
};

// Get store-specific sales by date range
const getStoreSalesByDateRange = async (req, res) => {
  const { storeId } = req.params;
  const { startDate, endDate, page = 1, limit = 50 } = req.query;

  const result = await salesService.getItemsSoldByDateRange(
    startDate,
    endDate,
    parseInt(page),
    parseInt(limit),
    storeId,
  );
  res.json(result);
};

// Get top selling products (global or filtered)
const getTopSellingProducts = async (req, res) => {
  const { limit = 10, startDate, endDate, storeId } = req.query;

  const result = await salesService.getTopSellingProducts(
    parseInt(limit),
    startDate,
    endDate,
    storeId,
  );
  res.json(result);
};

// Get store-specific top products
const getStoreTopSellingProducts = async (req, res) => {
  const { storeId } = req.params;
  const { limit = 10, startDate, endDate } = req.query;

  const result = await salesService.getTopSellingProducts(
    parseInt(limit),
    startDate,
    endDate,
    storeId,
  );
  res.json(result);
};

// Get sales analytics (global or filtered)
const getSalesAnalytics = async (req, res) => {
  const { period = "month", storeId } = req.query;

  const result = await salesService.getSalesAnalytics(period, storeId);
  res.json(result);
};

// Get store-specific analytics
const getStoreSalesAnalytics = async (req, res) => {
  const { storeId } = req.params;
  const { period = "month" } = req.query;

  const result = await salesService.getSalesAnalytics(period, storeId);
  res.json(result);
};

// Get sales by product (global or filtered)
const getSalesByProduct = async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 30, storeId } = req.query;

  const result = await salesService.getSalesByProduct(
    productId,
    parseInt(page),
    parseInt(limit),
    storeId,
  );
  res.json(result);
};

// Get store-specific sales by product
const getStoreSalesByProduct = async (req, res) => {
  const { storeId, productId } = req.params;
  const { page = 1, limit = 30 } = req.query;

  const result = await salesService.getSalesByProduct(
    productId,
    parseInt(page),
    parseInt(limit),
    storeId,
  );
  res.json(result);
};

// Refund a sale (global - optional store validation)
const refundSale = async (req, res) => {
  const { saleId } = req.params;
  const { reason, storeId } = req.body;

  const result = await salesService.refundSale(saleId, reason, storeId);
  res.json(result);
};

// Refund a sale in specific store
const refundStoreSale = async (req, res) => {
  const { storeId, saleId } = req.params;
  const { reason } = req.body;

  const result = await salesService.refundSale(saleId, reason, storeId);
  res.json(result);
};

// Get recent sales (global or filtered)
const getRecentSales = async (req, res) => {
  const { limit = 20, storeId } = req.query;

  const result = await salesService.getRecentSales(parseInt(limit), storeId);
  res.json(result);
};

// Get store-specific recent sales
const getStoreRecentSales = async (req, res) => {
  const { storeId } = req.params;
  const { limit = 20 } = req.query;

  const result = await salesService.getRecentSales(parseInt(limit), storeId);
  res.json(result);
};

// Get store comparison report
const getStoreComparison = async (req, res) => {
  const { startDate, endDate } = req.query;

  const result = await salesService.getStoreComparisonReport(
    startDate,
    endDate,
  );
  res.json(result);
};

// Get store timeline
const getStoreTimeline = async (req, res) => {
  const { storeId } = req.params;
  const { startDate, endDate, interval = "day" } = req.query;

  const result = await salesService.getStoreSalesTimeline(
    storeId,
    startDate,
    endDate,
    interval,
  );
  res.json(result);
};

// Get store monthly report
const getStoreMonthlyReport = async (req, res) => {
  const { storeId } = req.params;
  const { year, month } = req.query;

  const result = await salesService.getMonthlySalesSummary(
    year,
    month,
    storeId,
  );
  res.json(result);
};

module.exports = {
  recordMultipleItemsSale,
  recordSale,
  recordStoreSale,
  getDailySummary,
  getStoreDailySummary,
  getSalesByDateRange,
  getStoreSalesByDateRange,
  getTopSellingProducts,
  getStoreTopSellingProducts,
  getSalesAnalytics,
  getStoreSalesAnalytics,
  getSalesByProduct,
  getStoreSalesByProduct,
  refundSale,
  refundStoreSale,
  getRecentSales,
  getStoreRecentSales,
  getStoreComparison,
  getStoreTimeline,
  getStoreMonthlyReport,
};
