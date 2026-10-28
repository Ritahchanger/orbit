// repositories/transaction.repository.js
// Only file (besides the model itself) that other modules' Transaction
// queries go through. Returns Mongoose queries, so callers can keep chaining.
const Transaction = require("../models/transaction.model");

const findOne = (...args) => Transaction.findOne(...args);

const findById = (...args) => Transaction.findById(...args);

module.exports = {
  findOne,
  findById,
};
