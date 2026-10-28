// repositories/store-inventory.repository.js
// Only file (besides the model itself) that other modules' StoreInventory
// queries go through. Returns Mongoose queries, so callers can keep chaining
// .select(), .populate(), .session() and .lean().
const StoreInventory = require("../models/store-inventory.model");

const find = (...args) => StoreInventory.find(...args);

const findOne = (...args) => StoreInventory.findOne(...args);

const findById = (...args) => StoreInventory.findById(...args);

const countDocuments = (...args) => StoreInventory.countDocuments(...args);

const aggregate = (pipeline) => StoreInventory.aggregate(pipeline);

const create = (...args) => StoreInventory.create(...args);

// Unsaved document, for callers that set fields and save() it themselves.
const build = (data) => new StoreInventory(data);

const findByIdAndUpdate = (...args) => StoreInventory.findByIdAndUpdate(...args);

const findOneAndUpdate = (...args) => StoreInventory.findOneAndUpdate(...args);

const findByIdAndDelete = (...args) => StoreInventory.findByIdAndDelete(...args);

const findOneAndDelete = (...args) => StoreInventory.findOneAndDelete(...args);

module.exports = {
  find,
  findOne,
  findById,
  countDocuments,
  aggregate,
  create,
  build,
  findByIdAndUpdate,
  findOneAndUpdate,
  findByIdAndDelete,
  findOneAndDelete,
};
