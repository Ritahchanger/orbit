require("dotenv").config();
const swaggerJSDoc = require("swagger-jsdoc");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ORBIT API",
      version: "1.0.0",
      description: "API documentation for ORBIT backend services",
    },
    servers: [
      {
        url: process.env.BACKEND_URL || "http://localhost:5000",
        description: "Development server",
      },
    ],
    components: {
      schemas: {
        // Add common schemas here to avoid repetition
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: { type: "object" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string" },
                  message: { type: "string" },
                },
              },
            },
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  // IMPORTANT: Include all possible route file locations
  apis: [
    // Product-related routes
    path.join(__dirname, "../src/products/*.routes.js"),
    path.join(__dirname, "../src/products/*.route.js"),

    // Sales-related routes
    path.join(__dirname, "../src/sales/*.routes.js"),
    path.join(__dirname, "../src/sales/*.route.js"),

    // Store-related routes
    path.join(__dirname, "../src/stores/*.routes.js"),
    path.join(__dirname, "../src/stores/*.route.js"),

    // Auth-related routes
    path.join(__dirname, "../src/auth/*.routes.js"),
    path.join(__dirname, "../src/auth/*.route.js"),

    // User-related routes
    path.join(__dirname, "../src/user/*.routes.js"),
    path.join(__dirname, "../src/user/*.route.js"),

    // Report-related routes
    path.join(__dirname, "../src/reports/*.routes.js"),
    path.join(__dirname, "../src/reports/*.route.js"),

    // M-Pesa routes specifically
    path.join(__dirname, "../src/sales/mpesa-routes.js"),
    path.join(__dirname, "../src/sales/mpesa.routes.js"),

    // Generic catch-all
    path.join(__dirname, "../src/**/*.routes.js"),
    path.join(__dirname, "../src/**/*.route.js"),
    path.join(__dirname, "../src/**/routes/*.js"),

    // Root level routes
    path.join(__dirname, "../routes/*.js"),
    path.join(__dirname, "../routes/**/*.js"),
  ],
};

module.exports = swaggerJSDoc(options);
