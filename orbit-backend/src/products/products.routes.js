const express = require("express");

const productController = require("./products.controller");

const asyncHandler = require("../middlewares/asyncMiddleware");

const upload = require("../utils/multer");


const tokenValidator = require("../middlewares/tokenValidator");

const {
  storeAccess,
  canManageStore,
} = require("../middlewares/store-access.middleware");

const router = express.Router();

// ============ PUBLIC GLOBAL PRODUCT ROUTES ============

// Global search
router.get(
  "/search",
  tokenValidator,
  asyncHandler(productController.searchProducts),
);

// Get featured products
router.get(
  "/featured",
  tokenValidator,
  asyncHandler(productController.getFeaturedProducts),
);

// Get products by category
router.get(
  "/category/:category",
  tokenValidator,
  asyncHandler(productController.getProductsByCategory),
);

// Get product statistics
router.get(
  "/stats",
  tokenValidator,
  asyncHandler(productController.getProductStats),
);

// ✅ GLOBAL low stock route
router.get(
  "/low-stock",
  tokenValidator,
  asyncHandler(productController.getGlobalLowStockProducts),
);

router.get(
  "/stores/:storeId/low-stock",
  tokenValidator,
  storeAccess("params", "storeId"),
  asyncHandler(productController.getStoreLowStockProducts),
);

// Get product by SKU
router.get(
  "/sku/:sku",
  tokenValidator,
  asyncHandler(productController.getProductBySKU),
);

// Get single product by ID (must come LAST to avoid conflict with store routes)
router.get(
  "/:id",
  tokenValidator,
  asyncHandler(productController.getProductById),
);

// Update stock
router.patch(
  "/:productId/stock",
  tokenValidator,
  asyncHandler(productController.updateProductStock),
);

// Restock product globally
router.post(
  "/:productId/restock",
  tokenValidator,
  asyncHandler(productController.restockProduct),
);

// Get all products with filtering
router.get("/", tokenValidator, asyncHandler(productController.getProducts));

// ============ PUBLIC STORE-SPECIFIC ROUTES ============

// Get all products for a specific store
router.get(
  "/stores/:storeId/products",
  tokenValidator,
  asyncHandler(productController.getProductsByStore),
);

// Get store-specific product statistics
router.get(
  "/stores/:storeId/stats",
  tokenValidator,
  asyncHandler(productController.getStoreProductStats),
);

// Get store-specific featured products
router.get(
  "/stores/:storeId/featured",
  tokenValidator,
  asyncHandler(productController.getStoreFeaturedProducts),
);

// Get store-specific products by category
router.get(
  "/stores/:storeId/category/:category",
  tokenValidator,
  asyncHandler(productController.getStoreProductsByCategory),
);

// Get specific product in a store (public view)
router.get(
  "/stores/:storeId/products/:productId",
  tokenValidator,
  asyncHandler(productController.getStoreProductById),
);

// ============ PROTECTED STORE MANAGEMENT ROUTES ============

// All routes below require authentication and store management permissions
router.use(tokenValidator);

// Create new product and add to store inventory
router.post(
  "/stores/:storeId/products",
  storeAccess("params", "storeId"),
  canManageStore("params", "storeId"),
  upload.array("images", 5),
  asyncHandler(productController.createStoreProduct),
);

// Update existing product in store (only product details, not inventory)
router.put(
  "/stores/:storeId/products/:productId",
  storeAccess("params", "storeId"),
  canManageStore("params", "storeId"),
  upload.array("images", 5),
  asyncHandler(productController.updateStoreProduct),
);

// Update stock for store product
router.patch(
  "/stores/:storeId/products/:productId/stock",
  storeAccess("params", "storeId"),
  canManageStore("params", "storeId"),
  asyncHandler(productController.updateStoreProduct),
);

// Remove product from store inventory
router.delete(
  "/stores/:storeId/products/:productId",
  storeAccess("params", "storeId"),
  canManageStore("params", "storeId"),
  asyncHandler(productController.deleteStoreProduct),
);

// Add existing product to store inventory
router.post(
  "/stores/:storeId/products/:productId/add-to-inventory",
  storeAccess("params", "storeId"),
  canManageStore("params", "storeId"),
  asyncHandler(productController.addProductToStore),
);

// Image management routes
router.post(
  "/stores/:storeId/products/:productId/images",
  storeAccess("params", "storeId"),
  canManageStore("params", "storeId"),
  upload.array("images", 5),
  asyncHandler(productController.addProductImages),
);

router.delete(
  "/stores/:storeId/products/:productId/images",
  storeAccess("params", "storeId"),
  canManageStore("params", "storeId"),
  asyncHandler(productController.removeProductImage),
);

router.put(
  "/stores/:storeId/products/:productId/images/primary",
  storeAccess("params", "storeId"),
  canManageStore("params", "storeId"),
  asyncHandler(productController.setPrimaryImage),
);

// ============ PROTECTED GLOBAL PRODUCT MANAGEMENT ROUTES ============

// Create global product (requires admin/super admin)
router.post(
  "/",
  tokenValidator,
  upload.array("images", 5),
  asyncHandler(productController.createProduct),
);

// Update global product
router.put(
  "/:id",
  tokenValidator,
  upload.array("images", 5),
  asyncHandler(productController.updateProduct),
);

// Delete global product
router.delete(
  "/:id",
  tokenValidator,
  asyncHandler(productController.deleteProduct),
);

module.exports = router;
