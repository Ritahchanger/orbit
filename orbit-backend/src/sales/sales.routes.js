const express = require("express");
const router = express.Router();

const salesController = require("./sales.controller");
const asyncWrapper = require("../middlewares/asyncMiddleware");
const tokenValidator = require("../middlewares/tokenValidator");
const {
  storeAccess,
  canManageStore,
} = require("../middlewares/store-access.middleware");
const recordAdminLog = require("../custom-logs/middleware/record-admin.middleware");

// ============ PUBLIC/GLOBAL ROUTES ============

// Record a new sale (requires storeId in body) → log
router.post(
  "/transaction",
  recordAdminLog("RECORD_MULTIPLE_ITEMS_SALE"),
  asyncWrapper(salesController.recordMultipleItemsSale),
);

// Record a single sale → log
router.post(
  "/",
  recordAdminLog("RECORD_SALE"),
  asyncWrapper(salesController.recordSale),
);

// Get global daily summary (optional store filter) → log
router.get(
  "/daily",
  recordAdminLog("VIEW_GLOBAL_DAILY_SALES"),
  asyncWrapper(salesController.getDailySummary),
);

// Get sales by date range → log
router.get(
  "/period",
  recordAdminLog("VIEW_SALES_BY_PERIOD"),
  asyncWrapper(salesController.getSalesByDateRange),
);

// Get global top products → optional log
router.get(
  "/top-products",
  asyncWrapper(salesController.getTopSellingProducts),
);

// Get global analytics → optional log
router.get("/analytics", asyncWrapper(salesController.getSalesAnalytics));

// Get global recent sales → optional log
router.get("/recent", asyncWrapper(salesController.getRecentSales));

// Get sales by specific product → log (sensitive)
router.get(
  "/product/:productId",
  recordAdminLog("VIEW_SALES_BY_PRODUCT"),
  asyncWrapper(salesController.getSalesByProduct),
);

// Refund a sale → log
router.post(
  "/:saleId/refund",
  recordAdminLog("REFUND_SALE"),
  asyncWrapper(salesController.refundSale),
);

// ============ STORE-SPECIFIC ROUTES ============

// Record a sale for a specific store → log
router.post(
  "/stores/:storeId",
  tokenValidator,
  storeAccess("params", "storeId"),
  canManageStore("params", "storeId"),
  recordAdminLog("RECORD_STORE_SALE"),
  asyncWrapper(salesController.recordStoreSale),
);

// Get store-specific daily summary → optional log
router.get(
  "/stores/:storeId/daily",
  asyncWrapper(salesController.getStoreDailySummary),
);

// Get store-specific sales by date range → optional log
router.get(
  "/stores/:storeId/period",
  asyncWrapper(salesController.getStoreSalesByDateRange),
);

// Get store-specific top products → optional log
router.get(
  "/stores/:storeId/top-products",
  asyncWrapper(salesController.getStoreTopSellingProducts),
);

// Get store-specific analytics → optional log
router.get(
  "/stores/:storeId/analytics",
  asyncWrapper(salesController.getStoreSalesAnalytics),
);

// Get store-specific recent sales → optional log
router.get(
  "/stores/:storeId/recent",
  asyncWrapper(salesController.getStoreRecentSales),
);

// Get store-specific sales by product → log
router.get(
  "/stores/:storeId/product/:productId",
  recordAdminLog("VIEW_STORE_SALES_BY_PRODUCT"),
  asyncWrapper(salesController.getStoreSalesByProduct),
);

// Refund a sale in a specific store → log
router.post(
  "/stores/:storeId/refund/:saleId",
  tokenValidator,
  storeAccess("params", "storeId"),
  canManageStore("params", "storeId"),
  recordAdminLog("REFUND_STORE_SALE"),
  asyncWrapper(salesController.refundStoreSale),
);

// ============ NEW STORE COMPARISON ROUTES ============

// Get comparison between stores → optional log
router.get(
  "/stores/comparison",
  asyncWrapper(salesController.getStoreComparison),
);

// Get timeline for a specific store → optional log
router.get(
  "/stores/:storeId/timeline",
  asyncWrapper(salesController.getStoreTimeline),
);

// Get monthly report for a specific store → optional log
router.get(
  "/stores/:storeId/monthly",
  asyncWrapper(salesController.getStoreMonthlyReport),
);

module.exports = router;
