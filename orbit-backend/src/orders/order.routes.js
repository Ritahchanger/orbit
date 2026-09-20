const express = require("express");
const router = express.Router();
const asyncWrapper = require("../middlewares/asyncMiddleware");
const tokenValidator = require("../middlewares/tokenValidator");
const orderController = require("./order.controller");

// Admin-facing order management — all business-scoped.
router.use(tokenValidator);

router.get("/", asyncWrapper(orderController.list));

// Must be registered before /:id so "customers" isn't captured as an order id.
router.get("/customers", asyncWrapper(orderController.listCustomers));

router.get("/customers/:phone", asyncWrapper(orderController.getCustomerDetail));

router.get("/:id", asyncWrapper(orderController.getById));

router.patch("/:id/status", asyncWrapper(orderController.updateStatus));

module.exports = router;
