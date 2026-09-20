// repositories/store-read.repository.js
// The ONLY file in the products module allowed to require the Store model.
// Narrow, read-only wrapper around the small set of Store queries
// product.service.js needs.
const Store = require("../../stores/store.model");

const findById = (storeId) => Store.findById(storeId);

// Ownership-scoped lookup, mirrors product.repository.js's findByIdAndBusiness.
const findByIdAndBusiness = (storeId, businessId) =>
  Store.findOne({ _id: storeId, businessId });

module.exports = {
  findById,
  findByIdAndBusiness,
};
