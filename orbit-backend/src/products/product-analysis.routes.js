// routes/analysis.routes.js
const express = require("express");
const router = express.Router();
const analysisController = require("./controllers/analysis.controller");
const asyncWrapper = require("../middlewares/asyncMiddleware");
const tokenValidator = require("../middlewares/tokenValidator");
const { storeAccess, canManageStore } = require("../middlewares/store-access.middleware");

// ============ GLOBAL PRODUCT ANALYSIS ROUTES (4 APIs) ============

// 1. Global Dashboard Overview (Comprehensive view)
router.get("/global/dashboard",
    tokenValidator,
    asyncWrapper(analysisController.getGlobalDashboard)
);

// 2. Global Inventory Health Summary
router.get("/global/inventory-summary",
    tokenValidator,
    asyncWrapper(analysisController.getGlobalInventorySummary)
);

// 3. Global Top Performing Products
router.get("/global/top-products",
    tokenValidator,
    asyncWrapper(analysisController.getTopProductsGlobal)
);

// 4. Global Category Performance
router.get("/global/category-performance",
    tokenValidator,
    asyncWrapper(analysisController.getCategoryPerformance)
);

// ============ STORE-SPECIFIC ANALYSIS ROUTES (4 APIs) ============

// 1. Store Inventory Dashboard
router.get("/stores/:storeId/dashboard",
    tokenValidator,
    storeAccess("params", "storeId"),
    asyncWrapper(analysisController.getStoreDashboard)
);

// 2. Store Inventory Health Summary
router.get("/stores/:storeId/inventory-summary",
    tokenValidator,
    storeAccess("params", "storeId"),
    asyncWrapper(analysisController.getStoreInventorySummary)
);

// 3. Store Low Stock Analysis
router.get("/stores/:storeId/low-stock",
    tokenValidator,
    storeAccess("params", "storeId"),
    asyncWrapper(analysisController.getStoreLowStock)
);

// 4. Store Top Products
router.get("/stores/:storeId/top-products",
    tokenValidator,
    storeAccess("params", "storeId"),
    asyncWrapper(analysisController.getStoreTopProducts)
);

// ============ OPTIONAL EXTENDED APIs (If needed later) ============
// These can be added later as requirements grow

// Extended Global Analysis
router.get("/global/low-stock-alerts",
    tokenValidator,
    asyncWrapper(analysisController.getGlobalLowStockAlerts)
);

router.get("/global/brand-performance",
    tokenValidator,
    asyncWrapper(analysisController.getGlobalBrandPerformance)
);

// Extended Store Analysis
router.get("/stores/:storeId/category-analysis",
    tokenValidator,
    storeAccess("params", "storeId"),
    asyncWrapper(analysisController.getStoreCategoryAnalysis)
);

router.get("/stores/:storeId/recommendations",
    tokenValidator,
    storeAccess("params", "storeId"),
    asyncWrapper(analysisController.getStoreRecommendations)
);

module.exports = router;