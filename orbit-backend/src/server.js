const express = require("express");

const swaggerUi = require("swagger-ui-express");

const swaggerSpec = require("../config/swagger");

const PORT = process.env.PORT || 5000;

const app = express();

const webSocketService = require("./sales/services/ws.service");

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
const log = require("./utils/log");

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

// API routes (see routes.js)
for (const [routePath, router] of require("./routes")) {
  app.use(routePath, router);
}

app.use(errorHandler);

server.listen(PORT, async () => {
  try {
    await connectDb();
    log.info(`The application is listening on http://localhost:${PORT}`);
  } catch (error) {
    log.info(`There was a problem connecting to the server`);
  }
});
