const express = require("express");
const router = express.Router();
const asyncWrapper = require("../middlewares/asyncMiddleware");
const tokenValidator = require("../middlewares/tokenValidator");
const invoiceController = require("./invoice.controller");

router.use(tokenValidator);

router.get("/", asyncWrapper(invoiceController.list));

router.get("/:id", asyncWrapper(invoiceController.getById));

router.post("/standalone", asyncWrapper(invoiceController.createStandalone));

router.post(
  "/from-sale/:transactionId",
  asyncWrapper(invoiceController.createFromSale),
);

router.patch("/:id/status", asyncWrapper(invoiceController.updateStatus));

router.delete("/:id", asyncWrapper(invoiceController.remove));

module.exports = router;
