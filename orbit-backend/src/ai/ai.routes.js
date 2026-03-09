const express = require("express");
const router = express.Router();
const aiController = require("./ai.controller");
const asyncHandler = require("../middlewares/asyncMiddleware");
const tokenValidator = require("../middlewares/tokenValidator");
const validateAnalysisRequest = (req, res, next) => {
  if (!req.body.data) {
    return res.status(400).json({
      success: false,
      error: "Data field is required",
    });
  }
  next();
};
router.post(
  "/analyze",
  tokenValidator,
  validateAnalysisRequest,
  asyncHandler(aiController.analyze),
);
router.post(
  "/dashboard",
  tokenValidator,
  validateAnalysisRequest,
  asyncHandler(aiController.analyzeDashboard),
);
router.post(
  "/products",
  tokenValidator,
  validateAnalysisRequest,
  asyncHandler(aiController.analyzeProducts),
);
router.post(
  "/transactions",
  tokenValidator,
  validateAnalysisRequest,
  asyncHandler(aiController.analyzeTransactions),
);
router.post(
  "/inventory",
  tokenValidator,
  validateAnalysisRequest,
  asyncHandler(aiController.analyzeInventory),
);
router.post(
  "/report",
  tokenValidator,
  validateAnalysisRequest,
  asyncHandler(aiController.generateReport),
);
router.post("/chat", tokenValidator, asyncHandler(aiController.chat));
router.get("/health", asyncHandler(aiController.health));
router.get("/status", asyncHandler(aiController.health));
module.exports = router;
