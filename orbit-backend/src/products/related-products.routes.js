const asyncHandler = require("../middlewares/asyncMiddleware");

const relatedProductsController = require("./related-products.controller");

const router = require("express").Router();

router.get(
    "/:productId",
    asyncHandler(relatedProductsController.getRelatedProducts)
);

module.exports = router;


