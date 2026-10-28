// repositories/subscription.repository.js
// Only file (besides the model itself) that other modules' Subscription and
// Payment queries go through. Returns Mongoose queries, so callers can keep
// chaining.
const { Subscription, Payment } = require("../models/subscription.model");

const findSubscriptions = (...args) => Subscription.find(...args);

const aggregateSubscriptions = (pipeline) => Subscription.aggregate(pipeline);

const findPayments = (...args) => Payment.find(...args);

const aggregatePayments = (pipeline) => Payment.aggregate(pipeline);

module.exports = {
  findSubscriptions,
  aggregateSubscriptions,
  findPayments,
  aggregatePayments,
};
