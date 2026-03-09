const express = require("express");
const asyncHandler = require("../middlewares/asyncMiddleware");
const tokenValidator = require("../middlewares/tokenValidator");
const { storeAccess, canManageStore } = require("../middlewares/store-access.middleware");
const StockInventoryController = require("./controllers/index");

const router = express.Router();

// All routes require authentication
router.use(tokenValidator);

// =================== STORE INVENTORY ROUTES ===================

/**
 * @route   GET /api/v1/stores/:storeId/inventory
 * @desc    Get all inventory items for a store
 * @access  Private (store access required)
 */
router.get(
    asyncHandler(StockInventoryController.getStoreInventory)
);

/**
 * @route   GET /api/v1/stores/:storeId/inventory/stats
 * @desc    Get store inventory statistics
 * @access  Private (store access required)
 */
router.get(
    "/:storeId/inventory/stats",
    storeAccess,
    asyncHandler(StockInventoryController.getInventoryStats)
);

/**
 * @route   GET /api/v1/stores/:storeId/inventory/alerts
 * @desc    Get low stock alerts for a store
 * @access  Private (store access required)
 */
router.get(
    "/:storeId/inventory/alerts",
    storeAccess,
    asyncHandler(StockInventoryController.getLowStockAlerts)
);

/**
 * @route   GET /api/v1/stores/:storeId/inventory/available
 * @desc    Get products available to add to store (not in inventory)
 * @access  Private (store access required)
 */
router.get(
    "/:storeId/inventory/available",
    storeAccess,
    asyncHandler(StockInventoryController.getAvailableProducts)
);

/**
 * @route   POST /api/v1/stores/:storeId/inventory
 * @desc    Add product to store inventory
 * @access  Private (store management required)
 */
router.post(
    "/:storeId/inventory",
    canManageStore,
    asyncHandler(StockInventoryController.addToInventory)
);

/**
 * @route   POST /api/v1/stores/:storeId/inventory/bulk
 * @desc    Bulk add/update inventory items
 * @access  Private (store management required)
 */
router.put(
    "/:inventoryId",
    canManageStore,
    asyncHandler(StockInventoryController.updateInventoryItem)
);

/**
 * @route   DELETE /api/v1/inventory/:inventoryId
 * @desc    Remove product from store inventory
 * @access  Private (store management required)
 */
router.delete(
    "/:inventoryId",
    canManageStore,
    asyncHandler(StockInventoryController.removeFromInventory)
);

/**
 * @route   POST /api/v1/inventory/:inventoryId/restock
 * @desc    Restock inventory item
 * @access  Private (store management required)
 */
router.post(
    "/:inventoryId/restock",
    canManageStore,
    asyncHandler(StockInventoryController.restockProduct)
);

/**
 * @route   POST /api/v1/inventory/:inventoryId/sale
 * @desc    Record sale from inventory
 * @access  Private (store management required)
 */
router.post(
    "/:inventoryId/sale",
    canManageStore,
    asyncHandler(StockInventoryController.recordSale)
);

/**
 * @route   POST /api/v1/inventory/:inventoryId/adjust
 * @desc    Adjust inventory stock (increase/decrease)
 * @access  Private (store management required)
 */
router.post(
    "/:inventoryId/adjust",
    canManageStore,
    asyncHandler(StockInventoryController.adjustStock)
);

// =================== STOCK TRANSFER ROUTES ===================

/**
 * @route   POST /api/v1/inventory/:inventoryId/transfer/:toStoreId
 * @desc    Transfer stock between stores
 * @access  Private (store management required for both stores)
 */
router.post(
    "/:inventoryId/transfer/:toStoreId",
    canManageStore,
    asyncHandler(StockInventoryController.transferStock)
);

/**
 * @route   POST /api/v1/stores/:storeId/inventory/quick-add
 * @desc    Quick add product to inventory by SKU
 * @access  Private (store management required)
 */
router.post(
    "/:storeId/inventory/quick-add",
    canManageStore,
    asyncHandler(StockInventoryController.quickAdd)
);


module.exports = router;