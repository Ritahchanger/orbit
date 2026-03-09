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
router.get("/search", asyncHandler(productController.searchProducts));

// Get featured products
router.get("/featured", asyncHandler(productController.getFeaturedProducts));

// Get products by category
router.get(
  "/category/:category",
  asyncHandler(productController.getProductsByCategory),
);

// Get product statistics
router.get("/stats", asyncHandler(productController.getProductStats));

// ✅ ADD THIS: GLOBAL low stock route
router.get(
  "/low-stock",
  asyncHandler(productController.getGlobalLowStockProducts),
);

router.get(
  "/stores/:storeId/low-stock",

  storeAccess("params", "storeId"),

  asyncHandler(productController.getStoreLowStockProducts),
);

// Get single product by ID (must come LAST to avoid conflict with store routes)
router.get("/:id", asyncHandler(productController.getProductById));

// Get product by SKU
router.get("/sku/:sku", asyncHandler(productController.getProductBySKU));

router.patch(
  "/:productId/stock",
  tokenValidator, // Require authentication
  asyncHandler(productController.updateProductStock),
);

// Restock product globally (add stock with buying price)
router.post(
  "/:productId/restock",
  tokenValidator, // Require authentication
  asyncHandler(productController.restockProduct),
);

// Get all products with filtering
router.get("/", asyncHandler(productController.getProducts));

// ============ PUBLIC STORE-SPECIFIC ROUTES ============

// Get all products for a specific store
router.get(
  "/stores/:storeId/products",
  asyncHandler(productController.getProductsByStore),
);

// Get store-specific product statistics
router.get(
  "/stores/:storeId/stats",
  asyncHandler(productController.getStoreProductStats),
);

// Get store-specific featured products
router.get(
  "/stores/:storeId/featured",
  asyncHandler(productController.getStoreFeaturedProducts),
);

// Get store-specific products by category
router.get(
  "/stores/:storeId/category/:category",
  asyncHandler(productController.getStoreProductsByCategory),
);

// Get specific product in a store (public view)
router.get(
  "/stores/:storeId/products/:productId",
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

router.put(
  "/stores/:storeId/products/:productId",
  storeAccess("params", "storeId"),
  canManageStore("params", "storeId"),
  upload.array("images", 5),
  asyncHandler(productController.updateStoreProduct),
);

router.patch(
  "/stores/:storeId/products/:productId/stock",
  asyncHandler(productController.updateStoreProduct),
);

// Remove product from store inventory (doesn't delete the product)
router.delete(
  "/stores/:storeId/products/:productId",
  storeAccess("params", "storeId"),
  canManageStore("params", "storeId"),
  asyncHandler(productController.deleteStoreProduct),
);

// Record sale for product in store - REMOVED (use sales endpoints)
// router.post("/stores/:storeId/products/:productId/sale", ...); // Use sales endpoints

// Get low stock products for store (protected)

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
  upload.array("images", 5),
  asyncHandler(productController.createProduct),
);

// In your product routes file (e.g., product.routes.js)
router.put(
  "/:id",
  upload.array("images", 5), // Optional: for updating images
  asyncHandler(productController.updateProduct),
);

// ✅ ADD THIS: DELETE global product route
router.delete(
  "/:id",
  tokenValidator, // Require authentication
  asyncHandler(productController.deleteProduct),
);

module.exports = router;
