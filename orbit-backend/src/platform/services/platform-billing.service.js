// services/platform-billing.service.js
// The console's billing page: subscriptions and payments across businesses,
// and the billing actions taken on one business. Goes through the
// subscription and business modules' public APIs.
const mongoose = require("mongoose");
const CustomError = require("../../errors/CustomError");
const { findBusinesses, findBusinessById } = require("../../business");
const subscriptions = require("../../subscription");
const { containsRegex } = require("./search-helpers");

// Business ids whose name or email matches, for searching billing lists
const businessIdsMatching = async (search) => {
  const text = String(search || "").trim().slice(0, 80);
  if (!text) return undefined;
  const regex = containsRegex(text);
  const businesses = await findBusinesses({ $or: [{ businessName: regex }, { businessEmail: regex }] })
    .select("_id")
    .limit(500)
    .lean();
  return businesses.map((b) => b._id);
};

const listSubscriptions = async (filters = {}) =>
  subscriptions.listSubscriptions({ ...filters, businessIds: await businessIdsMatching(filters.search) });

const listPayments = async (filters = {}) =>
  subscriptions.listPayments({ ...filters, businessIds: await businessIdsMatching(filters.search) });

const listPlans = () => subscriptions.listPlans();

// The business a billing action targets; 404 if it's missing or deleted
const targetBusiness = async (id) => {
  if (!mongoose.isValidObjectId(id)) throw CustomError.badRequest("Invalid business ID");
  const business = await findBusinessById(id).select("businessName isDeleted").lean();
  if (!business || business.isDeleted) throw CustomError.notFound("Business not found");
  return business;
};

const extendTrial = async (id, days) => {
  const business = await targetBusiness(id);
  return { business, result: await subscriptions.extendTrial(business._id, days) };
};

const changePlan = async (id, body) => {
  const business = await targetBusiness(id);
  return { business, result: await subscriptions.changePlan(business._id, body) };
};

const recordPayment = async (id, body, admin) => {
  const business = await targetBusiness(id);
  return { business, result: await subscriptions.recordPayment(business._id, body, admin.email) };
};

module.exports = { listSubscriptions, listPayments, listPlans, extendTrial, changePlan, recordPayment };
