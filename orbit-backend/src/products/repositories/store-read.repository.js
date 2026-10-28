// repositories/store-read.repository.js
// Narrow, read-only wrapper around the small set of Store queries
// products.service.js needs. Goes through the stores module's public API.
const { findStore, findStoreById } = require("../../stores");

const findById = (storeId) => findStoreById(storeId);

// Ownership-scoped lookup, mirrors product.repository.js's findByIdAndBusiness.
const findByIdAndBusiness = (storeId, businessId) =>
  findStore({ _id: storeId, businessId });

module.exports = {
  findById,
  findByIdAndBusiness,
};
