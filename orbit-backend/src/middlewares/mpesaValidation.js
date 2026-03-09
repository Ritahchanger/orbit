// middlewares/mpesa-validation.js
const { body } = require("express-validator");

const initiatePaymentValidation = [
  body("phone").notEmpty().withMessage("Phone number is required"),
  body("amount")
    .notEmpty()
    .isFloat({ min: 1 })
    .withMessage("Amount must be at least 1"),
  body("customerName").notEmpty().withMessage("Customer name is required"),
  body("storeId").notEmpty().withMessage("Store ID is required"),
];

const completeTransactionValidation = [
  body("transactionId").notEmpty().withMessage("Transaction ID is required"),

  // ✅ OPTION 1: Either saleIds OR items is required
  body().custom((value, { req }) => {
    const { saleIds, items } = req.body;
    if ((!saleIds || saleIds.length === 0) && (!items || items.length === 0)) {
      throw new Error("Either saleIds or items are required");
    }
    return true;
  }),

  // ✅ Make saleIds optional
  body("saleIds").optional().isArray(),

  // ✅ Add validation for items if present
  body("items").optional().isArray().withMessage("Items must be an array"),

  body("items.*.sku")
    .optional()
    .notEmpty()
    .withMessage("SKU is required for each item"),

  body("items.*.quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),

  // ✅ Optional fields for creating sales
  body("storeId").optional().isString(),
  body("customerName").optional().isString(),
  body("customerPhone").optional().isString(),
  body("mpesaReceipt").optional().isString(),
  body("mpesaCheckoutId").optional().isString(),
  body("soldBy").optional().isString(),

  // ✅ Transaction summary is optional now
  body("transactionSummary").optional().isObject(),
];

const validateRequest = require("./validateRequest");

module.exports = {
  initiatePaymentValidation,
  completeTransactionValidation,
  validateRequest,
};
