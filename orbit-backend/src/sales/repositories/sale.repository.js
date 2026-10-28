// repositories/sale.repository.js
// Only file (besides the model itself) that other modules' Sale queries go
// through. Returns Mongoose queries, so callers can keep chaining.
const Sale = require("../models/sales.model");

const find = (...args) => Sale.find(...args);

const findById = (...args) => Sale.findById(...args);

const countDocuments = (...args) => Sale.countDocuments(...args);

const aggregate = (pipeline) => Sale.aggregate(pipeline);

module.exports = {
  find,
  findById,
  countDocuments,
  aggregate,
};
