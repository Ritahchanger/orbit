const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    level: {
      type: String,
      enum: ["info", "error", "warn", "debug", "fatal"],
      required: true,
      index: true,
    },

    message: {
      type: String,
      required: true,
    },

    // HTTP Request Information
    request: {
      method: String,
      url: String,
      path: String,
      params: mongoose.Schema.Types.Mixed,
      query: mongoose.Schema.Types.Mixed,
      body: mongoose.Schema.Types.Mixed,
      headers: mongoose.Schema.Types.Mixed,
      ip: String,
      userAgent: String,
      responseTime: Number,
    },

    // HTTP Response Information
    response: {
      statusCode: Number,
      statusMessage: String,
    },

    // User Information
    user: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true,
      },
      email: String,
      role: String,
    },

    // Error Information
    error: {
      name: String,
      message: String,
      stack: String,
      code: mongoose.Schema.Types.Mixed,
    },

    // Metadata for additional data
    metadata: mongoose.Schema.Types.Mixed,

    // Tags for categorization
    tags: [String],

    // Source of the log
    source: String,
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  },
);

// ============ INDEXES ============
logSchema.index({ level: 1, createdAt: -1 });
logSchema.index({ "user.userId": 1, createdAt: -1 });
logSchema.index({ "request.path": 1, createdAt: -1 });
logSchema.index({ tags: 1 });
logSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

// ============ STATIC METHODS ============
logSchema.statics.info = function (message, data = {}) {
  return this.create({ level: "info", message, ...data });
};

logSchema.statics.error = function (message, error = null, data = {}) {
  const logData = { level: "error", message, ...data };

  if (error) {
    logData.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
    };
  }

  return this.create(logData);
};

logSchema.statics.warn = function (message, data = {}) {
  return this.create({ level: "warn", message, ...data });
};

logSchema.statics.debug = function (message, data = {}) {
  return this.create({ level: "debug", message, ...data });
};

// Log HTTP request/response
logSchema.statics.logHttp = function (req, res, responseTime, data = {}) {
  // Sanitize sensitive data
  const sanitizedBody = { ...req.body };
  const sensitiveFields = [
    "password",
    "token",
    "authorization",
    "apiKey",
    "creditCard",
  ];

  sensitiveFields.forEach((field) => {
    if (sanitizedBody[field]) {
      sanitizedBody[field] = "[REDACTED]";
    }
  });

  return this.create({
    level: res.statusCode >= 400 ? "error" : "info",
    message: `${req.method} ${req.url} - ${res.statusCode}`,
    request: {
      method: req.method,
      url: req.url,
      path: req.path,
      params: req.params,
      query: req.query,
      body: sanitizedBody,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.get("user-agent"),
      responseTime,
    },
    response: {
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
    },
    user: req.user
      ? {
          userId: req.user._id,
          email: req.user.email,
          role: req.user.role,
        }
      : undefined,
    ...data,
  });
};

// ============ AGGREGATION HELPERS ============
logSchema.statics.getErrorStats = async function (hours = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  return this.aggregate([
    {
      $match: {
        level: { $in: ["error", "fatal"] },
        createdAt: { $gte: since },
      },
    },
    { $group: { _id: "$request.path", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
};

logSchema.statics.getApiStats = async function (hours = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  return this.aggregate([
    {
      $match: {
        "request.method": { $exists: true },
        createdAt: { $gte: since },
      },
    },
    {
      $group: {
        _id: { method: "$request.method", path: "$request.path" },
        count: { $sum: 1 },
        avgResponseTime: { $avg: "$request.responseTime" },
      },
    },
  ]);
};

// Clean up old logs manually
logSchema.statics.cleanup = async function (daysToKeep = 30) {
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
  return this.deleteMany({ createdAt: { $lt: cutoffDate } });
};

const Log = mongoose.model("Log", logSchema);

module.exports = Log;
