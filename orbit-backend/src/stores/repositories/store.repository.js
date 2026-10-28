// repositories/store.repository.js
// Only file (besides the model itself) that other modules' Store queries go
// through. Returns Mongoose queries, so callers can keep chaining .select(),
// .session() and .lean().
const Store = require("../models/store.model");

const find = (...args) => Store.find(...args);

const findOne = (...args) => Store.findOne(...args);

const findById = (...args) => Store.findById(...args);

const exists = (...args) => Store.exists(...args);

const countDocuments = (...args) => Store.countDocuments(...args);

const aggregate = (pipeline) => Store.aggregate(pipeline);

module.exports = {
  find,
  findOne,
  findById,
  exists,
  countDocuments,
  aggregate,
};
