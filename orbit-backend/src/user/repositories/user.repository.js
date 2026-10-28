// repositories/user.repository.js
// Only file (besides the model itself) that other modules' User queries go
// through. Returns Mongoose queries, so callers can keep chaining .select(),
// .populate(), .session() and .lean().
const User = require("../models/user.model");

const find = (...args) => User.find(...args);

const findOne = (...args) => User.findOne(...args);

const findById = (...args) => User.findById(...args);

const countDocuments = (...args) => User.countDocuments(...args);

const aggregate = (pipeline) => User.aggregate(pipeline);

const create = (...args) => User.create(...args);

const deleteOne = (...args) => User.deleteOne(...args);

const updateOne = (...args) => User.updateOne(...args);

module.exports = {
  find,
  findOne,
  findById,
  countDocuments,
  aggregate,
  create,
  deleteOne,
  updateOne,
};
