// src/business/index.js
// Public API of the business module. Other modules should require THIS file
// only — never reach into business/models or business/repositories directly.
//
// The finders return Mongoose queries, so callers chain .populate(), .sort(),
// .lean() etc. exactly as they did on the model.
const businessRepository = require("./repositories/business.repository");
const businessService = require("./services/business.service");

const findBusinesses = (filter = {}) => businessRepository.find(filter);

const findBusinessById = (id) => businessRepository.findById(id);

const countBusinesses = (filter = {}) =>
  businessRepository.countDocuments(filter);

/** Read-only analytics (platform dashboard). */
const aggregateBusinesses = (pipeline) => businessRepository.aggregate(pipeline);

/**
 * Verify / suspend / reactivate / cancel. Enforces the allowed status
 * transitions; throws on an unknown business or an invalid transition.
 */
const updateBusinessStatus = (id, status, reason) =>
  businessService.updateStatus(id, status, reason);

module.exports = {
  findBusinesses,
  findBusinessById,
  countBusinesses,
  aggregateBusinesses,
  updateBusinessStatus,
};
