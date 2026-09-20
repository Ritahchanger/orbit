const express = require("express");
const router = express.Router();
const asyncWrapper = require("../middlewares/asyncMiddleware");
const storefrontController = require("./storefront.controller");

// Fully public — no auth. Anyone can browse a published storefront and check out.
router.get("/:slug", asyncWrapper(storefrontController.getStorefront));

router.get("/:slug/products", asyncWrapper(storefrontController.listProducts));

router.get(
  "/:slug/products/:productId",
  asyncWrapper(storefrontController.getProduct),
);

router.post("/:slug/checkout", asyncWrapper(storefrontController.checkout));

module.exports = router;
