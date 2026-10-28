// src/subscription/index.js
// Public API of the subscription module. Other modules should require THIS
// file only — never reach into subscription/models or
// subscription/repositories directly.
//
// The finders return Mongoose queries, so callers chain .select(), .sort(),
// .limit(), .lean() etc. exactly as they did on the model.
const subscriptionRepository = require("./repositories/subscription.repository");
const subscriptionAdmin = require("./services/subscription-admin.service");

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
  // Platform console billing (see subscription-admin.service)
  listSubscriptions: subscriptionAdmin.listSubscriptions,
  listPayments: subscriptionAdmin.listPayments,
  listPlans: subscriptionAdmin.listPlans,
  extendTrial: subscriptionAdmin.extendTrial,
  changePlan: subscriptionAdmin.changePlan,
  recordPayment: subscriptionAdmin.recordPayment,
  RECORDABLE_PAYMENT_METHODS: subscriptionAdmin.RECORDABLE_METHODS,

  findSubscriptions,
  aggregateSubscriptions,
  findPayments,
  aggregatePayments,
};
