const { isFeatureEnabled } = require("./config/features");

// Every API route, mounted in this order by server.js. Order matters where
// paths overlap: /products/related must come before /products. An optional
// third entry names a feature (config/features.js); the route is only
// mounted while that feature is on.
const routes = [
  ["/api/v1/quotes", require("./quotation/routes/quotation.routes")],
  ["/api/v1/newsletters", require("./newsletters/routes/newsletters.routes")],
  ["/api/v1/products/related", require("./products/routes/related-products.routes")],
  ["/api/v1/products", require("./products/routes/products.routes")],
  ["/api/v1/product-categories", require("./products/routes/category.routes")],
  ["/api/v1/products-analysis", require("./products/routes/product-analysis.routes")],
  ["/api/v1/stores", require("./stores/routes/store.routes")],
  ["/api/v1/blogs", require("./blogs/routes/blogs.routes")],
  ["/api/v1/auth", require("./auth/routes/auth.routes")],
  ["/api/v1/users", require("./user/routes/users.routes")],
  ["/api/v1/sales", require("./sales/routes/sales.routes")],
  ["/api/v1/stores-inventory", require("./store-inventory/routes/store-inventory.routes")],
  ["/api/v1/otp", require("./auth/routes/otp.routes")],
  ["/api/v1/bookings", require("./booking/routes/booking.routes"), "consultations"],
  ["/api/v1/permissions", require("./permissions/routes/permission.routes")],
  ["/api/v1/roles", require("./permissions/routes/role.routes")],
  ["/api/v1/reports", require("./reports/routes/reports.routes")],
  ["/api/v1/transactions", require("./sales/routes/transaction-delete.routes")],
  ["/api/v1/transactions", require("./sales/routes/transaction.routes")],
  ["/api/v1/store-comparison", require("./stores/routes/store-comparison.routes")],
  ["/api/v1/mpesa", require("./sales/routes/mpesa.routes")],
  ["/api/v1/ai", require("./ai/routes/ai.routes")],
  ["/api/v1/refunds", require("./refund/routes/refund.routes")],
  ["/api/v1/business", require("./business/routes/business.routes")],
  ["/api/v1/subscription", require("./subscription/routes/subscription.routes")],
  ["/api/v1/platform", require("./platform/routes/platform.routes")],
  ["/api/v1/logs", require("./custom-logs/routes/logs.routes")],
  [
    "/api/v1/consultations",
    require("./booking/routes/sent-consultation-email.routes"),
    "consultations",
  ],
  ["/api/v1/stock-transfers", require("./stock-transfer/routes/stock-transfer.routes")],
  ["/api/v1/orders", require("./orders/routes/order.routes")],
  ["/api/v1/invoices", require("./invoices/routes/invoice.routes")],
  ["/api/v1/storefront", require("./storefront/routes/storefront.routes")],
];

module.exports = routes
  .filter(([, , feature]) => !feature || isFeatureEnabled(feature))
  .map(([routePath, router]) => [routePath, router]);
