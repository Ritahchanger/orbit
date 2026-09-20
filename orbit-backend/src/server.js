const express = require("express");

const swaggerUi = require("swagger-ui-express");

const swaggerSpec = require("../config/swagger");

const PORT = process.env.PORT || 5000;

const app = express();

const webSocketService = require("./sales/wsService");

const http = require("http");

const server = http.createServer(app);

webSocketService.init(server);

const cookieParser = require("cookie-parser");

const connectDb = require("./config/db.connection");

const errorHandler = require("./middlewares/errorHandler");

require("dotenv").config();

const { html } = require("./entry");

const passport = require("./config/passport");

const session = require("express-session");

const logger = require("./middlewares/logger");

const cors = require("cors");

const path = require("path");

app.use(express.json({ limit: "50mb" }));

app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(cookieParser());

app.use(logger);

const staticAllowedOrigins = [
  "https://megagamers254.com",
  "https://www.megagamers254.com",
  "https://api.megagamers254.com",
  "http://megagamers254.com",
  "http://31.97.197.116",
  "https://31.97.197.116",
  "http://www.megagamers254.com",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // No Origin header = non-browser request (curl, server-to-server) — allow.
      if (!origin) return callback(null, true);

      if (staticAllowedOrigins.includes(origin)) return callback(null, true);

      // Any subdomain of localhost, any port — each business's storefront is
      // exercised locally as <storeSlug>.localhost:<port>, and slugs are
      // dynamic (one business per slug, many businesses), so a fixed
      // whitelist entry per business isn't workable.
      if (/^https?:\/\/[a-z0-9-]+\.localhost(:\d+)?$/i.test(origin)) {
        return callback(null, true);
      }

      callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-request-time"],
  }),
);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  }),
);

app.use(passport.initialize());

app.use(passport.session());

app.get("/", (req, res) => {
  res.send(html);
});

app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1/quotes", require("./quotation/quotation.routes"));

app.use("/api/v1/newsletters", require("./newsletters/newsletters.routes"));

app.use(
  "/api/v1/products/related",
  require("./products/related-products.routes"),
);

app.use("/api/v1/products", require("./products/products.routes"));

app.use(
  "/api/v1/product-categories",
  require("./products/routes/category.routes"),
);

app.use(
  "/api/v1/products-analysis",
  require("./products/product-analysis.routes"),
);

app.use("/api/v1/stores", require("./stores/store.routes"));

app.use("/api/v1/blogs", require("./blogs/blogs.routes"));

app.use("/api/v1/auth", require("./auth/auth.routes"));

app.use("/api/v1/users", require("./user/users.routes"));

app.use("/api/v1/sales", require("./sales/sales.routes"));

app.use(
  "/api/v1/stores-inventory",
  require("./store-inventory/stock-inventory.routes.v2"),
);

app.use("/api/v1/otp", require("./auth/otp/otp.routes"));

app.use("/api/v1/bookings", require("./booking/booking.routes"));

app.use(
  "/api/v1/permissions",
  require("./permissions/routes/permission.routes"),
);

app.use("/api/v1/roles", require("./permissions/routes/role.routes"));

app.use("/api/v1/reports", require("./reports/reports.routes"));

app.use("/api/v1/transactions", require("./sales/transaction-delete.routes"));

app.use("/api/v1/transactions", require("./sales/transaction.routes"));

app.use("/api/v1/store-comparison", require("./stores/store-comparison.routes"));

app.use("/api/v1/mpesa", require("./sales/mpesa-routes"));

app.use("/api/v1/ai", require("./ai/ai.routes"));

app.use("/api/v1/refunds", require("./refund/refund.routes"));

app.use("/api/v1/business", require("./business/routes/routes"));

app.use(
  "/api/v1/subscription",
  require("./subscription/routes/subscription.routes"),
);

app.use("/api/v1/logs", require("./custom-logs/routes/logs.routes"));

app.use(
  "/api/v1/consultations",
  require("./booking/sent-consultation-email.routes"),
);

app.use(
  "/api/v1/stock-transfers",
  require("./stock-transfer/stock-transfer.routes"),
);

app.use("/api/v1/orders", require("./orders/order.routes"));

app.use("/api/v1/invoices", require("./invoices/invoice.routes"));

app.use("/api/v1/storefront", require("./storefront/storefront.routes"));

app.use(errorHandler);

server.listen(PORT, async () => {
  try {
    await connectDb();
    console.log(`The application is listening on http://localhost:${PORT}`);
  } catch (error) {
    console.log(`There was a problem connecting to the server`);
  }
});
