// services/platform-activity.service.js
// Records and lists the console's activity log.
const mongoose = require("mongoose");
const activityRepository = require("../repositories/platform-activity.repository");
const { ACTIONS } = require("../models/platform-activity.model");
const log = require("../../utils/log");

const MAX_LIMIT = 100;

const actorFrom = (admin) =>
  admin
    ? {
        id: admin._id || admin.id,
        email: admin.email,
        name: `${admin.firstName || ""} ${admin.lastName || ""}`.trim(),
      }
    : {};

const requestContext = (req) => ({
  ip: req.ip || "",
  userAgent: String(req.get?.("user-agent") || "").slice(0, 300),
});

/**
 * Saves an entry. Never throws: a failure to write the log is reported but
 * must not undo or fail the action being logged.
 */
const record = async (req, { action, admin, actor, target, details }) => {
  try {
    await activityRepository.create({
      action,
      actor: actor || actorFrom(admin),
      target: target || {},
      details: details || {},
      ...requestContext(req),
    });
  } catch (error) {
    log.error(`Failed to record platform activity ${action}: ${error.message}`);
  }
};

const list = async (filters = {}) => {
  const page = Math.max(parseInt(filters.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(filters.limit, 10) || 25, 1), MAX_LIMIT);

  const query = {};
  if (ACTIONS.includes(filters.action)) query.action = filters.action;
  if (filters.businessId && mongoose.isValidObjectId(filters.businessId)) {
    query["target.type"] = "business";
    query["target.id"] = new mongoose.Types.ObjectId(String(filters.businessId));
  }

  const [entries, total] = await Promise.all([
    activityRepository
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    activityRepository.countDocuments(query),
  ]);

  return { entries, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

module.exports = { record, list, ACTIONS };
