const express = require("express");
const router = express.Router();

const asyncHandler = require("../../middlewares/asyncMiddleware");
const tokenValidator = require("../../middlewares/refreshTokenValidator");

const CategoriesController = require("../controllers/categories.controller");
const permissionValidator = require("../../middlewares/permissionValidator");

// Managing categories needs the same permission as editing products
// (admins and managers; cashiers and staff can only read).
const canManageCategories = permissionValidator(["products.update"]);

// ============ CATEGORY ROUTES ============

// Get all categories
router.get("/", tokenValidator, asyncHandler(CategoriesController.getAll));

// Get a single category by ID
router.get("/:id", tokenValidator, asyncHandler(CategoriesController.getById));

// Create a new category (protected)
router.post(
  "/",
  tokenValidator,
  canManageCategories,
  asyncHandler(CategoriesController.create),
);

// Update a category by ID (protected)
router.put(
  "/:id",
  tokenValidator,
  canManageCategories,
  asyncHandler(CategoriesController.update),
);

// Delete a category by ID (protected)
router.delete(
  "/:id",
  tokenValidator,
  canManageCategories,
  asyncHandler(CategoriesController.delete),
);

module.exports = router;
