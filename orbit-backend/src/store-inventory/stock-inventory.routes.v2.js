const express = require("express");
const asyncHandler = require("../middlewares/asyncMiddleware");
const tokenValidator = require("../middlewares/tokenValidator");
const {
  storeAccess,
  canManageStore,
} = require("../middlewares/store-access.middleware");
const StockInventoryController = require("./stock-inventory.controller");

const router = express.Router();

// All routes require authentication
router.use(tokenValidator);

// =================== MVP INVENTORY ROUTES ===================

/**
 * @route   GET /api/v1/stores/:storeId/inventory
 * @desc    Get all inventory items for a store (with search/filters)
 * @access  Private (store access required)
 */
router.get(
  "/:storeId/inventory",
  storeAccess("id"),
  asyncHandler(StockInventoryController.getStoreInventory),
);

/**
 * @route   GET /api/v1/stores/:storeId/inventory/stats
 * @desc    Get store inventory statistics (dashboard numbers)
 * @access  Private (store access required)
 */
router.get(
  "/:storeId/inventory/stats",
  storeAccess("id"),
  asyncHandler(StockInventoryController.getInventoryStats),
);

/**
 * @route   GET /api/v1/stores/:storeId/inventory/alerts
 * @desc    Get low stock alerts (for notification system)
 * @access  Private (store access required)
 */
router.get(
  "/:storeId/inventory/alerts",
  storeAccess("id"),
  asyncHandler(StockInventoryController.getLowStockAlerts),
);

/**
 * @route   GET /api/v1/stores/:storeId/inventory/available
 * @desc    Get products available to add to store (for add product modal)
 * @access  Private (store access required)
 */
router.get(
  "/:storeId/inventory/available",
  storeAccess("id"),
  asyncHandler(StockInventoryController.getAvailableProducts),
);

/**
 * @route   POST /api/v1/stores/:storeId/inventory/manage
 * @desc    SMART ENDPOINT: Add or update inventory (handles single & bulk)
 * @access  Private (store management required)
 */
router.post(
  "/:storeId/inventory/manage",
  canManageStore("id"),
  asyncHandler(StockInventoryController.addOrUpdateInventory),
);

/**
 * @route   POST /api/v1/stores/:storeId/inventory/quick-add
 * @desc    Quick add product to inventory by SKU (scanner friendly)
 * @access  Private (store management required)
 */
router.post(
  "/:storeId/inventory/quick-add",
  canManageStore("id"),
  asyncHandler(StockInventoryController.quickAddBySku),
);

/**
 * @route   PUT /api/v1/inventory/:inventoryId
 * @desc    Update specific inventory item (stock, minStock, etc)
 * @access  Private (store management required)
 */
router.put(
  "/inventory/:inventoryId", // Fixed: Added "inventory/" prefix
  canManageStore("id"),
  asyncHandler(StockInventoryController.updateInventoryItem),
);

/**
 * @route   DELETE /api/v1/inventory/:inventoryId
 * @desc    Remove product from store inventory
 * @access  Private (store management required)
 */
router.delete(
  "/inventory/:inventoryId", // Fixed: Added "inventory/" prefix
  canManageStore("id"),
  asyncHandler(StockInventoryController.removeFromInventory),
);

/**
 * @route   POST /api/v1/inventory/:inventoryId/restock
 * @desc    Restock inventory item (increase stock)
 * @access  Private (store management required)
 */
router.post(
  "/inventory/:inventoryId/restock", // Fixed: Added "inventory/" prefix
  asyncHandler(StockInventoryController.restockProduct),
);

/**
 * @route   POST /api/v1/inventory/:inventoryId/sale
 * @desc    Record sale from inventory (reduce stock)
 * @access  Private (store management required)
 */


// Bulk delete inventory items
router.delete(
  "/:storeId/inventory",
  canManageStore("id"),
  asyncHandler(StockInventoryController.deleteInventory),
);

// Clear entire store inventory (danger zone)
router.post(
  "/:storeId/inventory/clear",
  canManageStore("id"),
  asyncHandler(StockInventoryController.clearStoreInventory),
);

router.post(
  "/inventory/:inventoryId/sale", // Fixed: Added "inventory/" prefix
  canManageStore("id"),
  asyncHandler(StockInventoryController.recordSale),
);

/**
 * @route   POST /api/v1/inventory/:inventoryId/adjust
 * @desc    Adjust stock (increase/decrease for corrections)
 * @access  Private (store management required)
 */
router.post(
  "/inventory/:inventoryId/adjust", // Fixed: Added "inventory/" prefix
  canManageStore("id"),
  asyncHandler(StockInventoryController.adjustStock),
);

/**
 * @route   GET /api/v1/stores/:storeId/inventory/report
 * @desc    Generate inventory report (CSV export)
 * @access  Private (store access required)
 */
router.get(
  "/:storeId/inventory/report",
  storeAccess("id"),
  asyncHandler(StockInventoryController.generateInventoryReport),
);

module.exports = router;
