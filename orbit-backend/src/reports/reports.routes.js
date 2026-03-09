const express = require("express");
const router = express.Router();

const reportController = require("./reports.controller");
const asyncHandler = require("../middlewares/asyncMiddleware");
const tokenValidator = require("../middlewares/tokenValidator");

// Apply auth middleware
router.use(tokenValidator);

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Analytics and reporting endpoints
 */

/**
 * @swagger
 * /api/v1/reports/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 */
router.get("/dashboard", asyncHandler(reportController.getDashboardStats));

/**
 * @swagger
 * /api/v1/reports/sales:
 *   get:
 *     summary: Get sales report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sales report retrieved successfully
 */
router.get("/sales", asyncHandler(reportController.getSalesReport));

/**
 * @swagger
 * /api/v1/reports/sales/trend:
 *   get:
 *     summary: Get sales trend report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sales trend data retrieved successfully
 */
router.get("/sales/trend", asyncHandler(reportController.getSalesTrendReport));

/**
 * @swagger
 * /api/v1/reports/daily-summary:
 *   get:
 *     summary: Get daily sales summary
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daily sales summary retrieved successfully
 */
router.get("/daily-summary", asyncHandler(reportController.getDailySalesSummary));

/**
 * @swagger
 * /api/v1/reports/monthly-summary:
 *   get:
 *     summary: Get monthly sales summary
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly sales summary retrieved successfully
 */
router.get("/monthly-summary", asyncHandler(reportController.getMonthlySalesSummary));

/**
 * @swagger
 * /api/v1/reports/inventory:
 *   get:
 *     summary: Get inventory report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory report retrieved successfully
 */
router.get("/inventory", asyncHandler(reportController.getInventoryReport));

/**
 * @swagger
 * /api/v1/reports/products/performance:
 *   get:
 *     summary: Get product performance report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Product performance data retrieved successfully
 */
router.get("/products/performance", asyncHandler(reportController.getProductPerformanceReport));

/**
 * @swagger
 * /api/v1/reports/products/top-performing:
 *   get:
 *     summary: Get top performing products
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top performing products retrieved successfully
 */
router.get("/products/top-performing", asyncHandler(reportController.getTopPerformingProducts));

/**
 * @swagger
 * /api/v1/reports/stores/performance:
 *   get:
 *     summary: Get store performance report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Store performance data retrieved successfully
 */
router.get("/stores/performance", asyncHandler(reportController.getStorePerformanceReport));

/**
 * @swagger
 * /api/v1/reports/financial/summary:
 *   get:
 *     summary: Get financial summary report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Financial summary retrieved successfully
 */
router.get("/financial/summary", asyncHandler(reportController.getFinancialSummary));

/**
 * @swagger
 * /api/v1/reports/alerts/low-stock:
 *   get:
 *     summary: Get low stock alerts
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Low stock alerts retrieved successfully
 */
router.get("/alerts/low-stock", asyncHandler(reportController.getLowStockAlerts));

/**
 * @swagger
 * /api/v1/reports/alerts/out-of-stock:
 *   get:
 *     summary: Get out of stock report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Out of stock report retrieved successfully
 */
router.get("/alerts/out-of-stock", asyncHandler(reportController.getOutOfStockReport));

/**
 * @swagger
 * /api/v1/reports/category/revenue:
 *   get:
 *     summary: Get category revenue report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category revenue data retrieved successfully
 */
router.get("/category/revenue", asyncHandler(reportController.getCategoryRevenueReport));

/**
 * @swagger
 * /api/v1/reports/payment-methods:
 *   get:
 *     summary: Get payment method analysis
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment method analysis retrieved successfully
 */
router.get("/payment-methods", asyncHandler(reportController.getPaymentMethodAnalysis));

/**
 * @swagger
 * /api/v1/reports/customers/{customerPhone}/history:
 *   get:
 *     summary: Get customer purchase history
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerPhone
 *         required: true
 *         schema:
 *           type: string
 *         example: "0712345678"
 *     responses:
 *       200:
 *         description: Customer purchase history retrieved successfully
 */
router.get(
    "/customers/:customerPhone/history",
    asyncHandler(reportController.getCustomerPurchaseHistory)
);

/**
 * @swagger
 * /api/v1/reports/export/{type}:
 *   get:
 *     summary: Export report data
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         example: sales
 *     responses:
 *       200:
 *         description: Report exported successfully
 */
router.get("/export/:type", asyncHandler(reportController.exportReport));

module.exports = router;
