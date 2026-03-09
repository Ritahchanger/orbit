const express = require("express");
const router = express.Router();
const storeController = require("./store-comparison.controller");
const tokenValidator = require("../middlewares/tokenValidator");
const asyncWrapper = require("../middlewares/asyncMiddleware");


router.use(tokenValidator);



// ========== STORE COMPARISON ROUTES ==========
router.get("/compare", asyncWrapper(storeController.compareStores));
router.get("/drill-down/:storeId", asyncWrapper(storeController.getStoreDrillDown));
router.get("/quick", asyncWrapper(storeController.getQuickComparison));
router.get("/benchmarks", asyncWrapper(storeController.getBenchmarks));
router.get("/export", asyncWrapper(storeController.exportComparison));
router.get("/trends/:storeId", asyncWrapper(storeController.getStoreTrends));
router.get("/metric/:metric", asyncWrapper(storeController.compareByMetric));


module.exports = router;