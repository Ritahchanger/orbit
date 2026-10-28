// src/subscription/index.js
// Public API of the subscription module. Other modules should require THIS
// file only — never reach into subscription/models or
// subscription/repositories directly.
//
// The finders return Mongoose queries, so callers chain .select(), .sort(),
// .limit(), .lean() etc. exactly as they did on the model.
const subscriptionRepository = require("./repositories/subscription.repository");

const findSubscriptions = (filter = {}) =>
  subscriptionRepository.findSubscriptions(filter);

/** Read-only analytics (platform dashboard). */
const aggregateSubscriptions = (pipeline) =>
  subscriptionRepository.aggregateSubscriptions(pipeline);

const findPayments = (filter = {}) => subscriptionRepository.findPayments(filter);

/** Read-only analytics (platform dashboard). */
const aggregatePayments = (pipeline) =>
  subscriptionRepository.aggregatePayments(pipeline);

module.exports = {
  findSubscriptions,
  aggregateSubscriptions,
  findPayments,
  aggregatePayments,
};
