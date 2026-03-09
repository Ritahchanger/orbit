const express = require("express");
const router = express.Router();

const asyncHandler = require("../../middlewares/asyncMiddleware");
const tokenValidator = require("../../middlewares/tokenValidator");

const CategoriesController = require("../controllers/categories.controller");

// ============ CATEGORY ROUTES ============

// Get all categories
router.get("/", asyncHandler(CategoriesController.getAll));


// Get a single category by ID
router.get("/:id", asyncHandler(CategoriesController.getById));

// Create a new category (protected)
router.post(
  "/",
  tokenValidator, // Require authentication for admin
  asyncHandler(CategoriesController.create),
);

// Update a category by ID (protected)
router.put("/:id", tokenValidator, asyncHandler(CategoriesController.update));

// Delete a category by ID (protected)
router.delete(
  "/:id",
  tokenValidator,
  asyncHandler(CategoriesController.delete),
);

module.exports = router;
