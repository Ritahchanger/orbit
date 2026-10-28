// repositories/business.repository.js
// Only file (besides the model itself) that other modules' Business queries
// go through. Returns Mongoose queries, so callers can keep chaining
// .select(), .populate(), .sort() and .lean().
const Business = require("../models/business.model");

const find = (...args) => Business.find(...args);

const findById = (...args) => Business.findById(...args);

const countDocuments = (...args) => Business.countDocuments(...args);

const aggregate = (pipeline) => Business.aggregate(pipeline);

module.exports = {
  find,
  findById,
  countDocuments,
  aggregate,
};
