const asyncHandler = require("../../middlewares/asyncMiddleware");

const relatedProductsController = require("../controllers/related-products.controller");

const router = require("express").Router();

router.get(
    "/:productId",
    asyncHandler(relatedProductsController.getRelatedProducts)
);

module.exports = router;


