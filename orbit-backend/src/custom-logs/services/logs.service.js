// logs.service.js
const Log = require("../models/logs.model");

/**
 * Record a log manually
 */
const recordLog = async (data) => {
  return Log.create(data);
};

/**
 * Get logs with filters + pagination
 */
const getLogs = async ({
  level,
  userId,
  path,
  startDate,
  endDate,
  search,
  page = 1,
  limit = 50,
}) => {
  const query = {};

  // Existing filters
  if (level) query.level = level;
  if (userId) query["user.userId"] = userId;
  if (path) query["request.path"] = path;

  // OPTIMIZATION 1: Fix date range to include entire day
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      const start = new Date(startDate);
      start.setUTCHours(0, 0, 0, 0);
      query.createdAt.$gte = start;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  // OPTIMIZATION 2: More efficient search
  if (search && search.trim()) {
    const searchTerm = search.trim();

    // Use a single regex for better performance
    const searchRegex = new RegExp(searchTerm, "i");

    // OPTIMIZATION 3: Limit search fields based on search term length
    const searchConditions = [
      { message: searchRegex },
      { "error.message": searchRegex },
      { "user.email": searchRegex },
      { "request.path": searchRegex },
    ];

    // Only search in additional fields if search term is short
    // (to prevent performance issues with broad searches)
    if (searchTerm.length < 20) {
      searchConditions.push(
        { "request.url": searchRegex },
        { "request.method": searchRegex },
        { source: searchRegex },
        { "response.statusMessage": searchRegex },
        { "error.name": searchRegex },
        { "error.code": searchRegex },
      );
    }

    // Add exact tag match (more efficient than regex for tags)
    if (searchTerm.length > 2) {
      searchConditions.push({ tags: searchTerm });
    }

    // Combine with existing filters
    if (Object.keys(query).length > 0) {
      // OPTIMIZATION 4: Use $and without destroying the original query
      query.$and = [
        {
          level: query.level,
          "user.userId": query.userId,
          "request.path": query.path,
          createdAt: query.createdAt,
        },
        { $or: searchConditions },
      ];

      // Clean up original fields to avoid duplication
      delete query.level;
      delete query["user.userId"];
      delete query["request.path"];
      delete query.createdAt;
    } else {
      query.$or = searchConditions;
    }
  }

  const skip = (page - 1) * limit;

  // OPTIMIZATION 5: Use projection to select only needed fields
  const projection = {
    level: 1,
    message: 1,
    createdAt: 1,
    "request.method": 1,
    "request.path": 1,
    "response.statusCode": 1,
    "user.email": 1,
    source: 1,
    tags: 1,
    "error.message": 1,
  };

  const [logs, total] = await Promise.all([
    Log.find(query, projection)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Log.countDocuments(query),
  ]);

  return {
    data: logs,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  };
};

/**
 * Delete a single log
 */
const deleteLog = async (logId) => {
  return Log.findByIdAndDelete(logId);
};

/**
 * Delete multiple logs (batch)
 */
const deleteLogsBatch = async (ids = []) => {
  return Log.deleteMany({ _id: { $in: ids } });
};

/**
 * Delete logs by filter (dangerous – admin only)
 */
const deleteLogsByFilter = async (filter = {}) => {
  return Log.deleteMany(filter);
};

module.exports = {
  recordLog,
  getLogs,
  deleteLog,
  deleteLogsBatch,
  deleteLogsByFilter,
};
