// src/stores/index.js
// Public API of the stores module. Other modules should require THIS file
// only — never reach into stores/models or stores/repositories directly.
//
// The finders return Mongoose queries, so callers chain .select(), .session(),
// .lean() etc. exactly as they did on the model.
const storeRepository = require("./repositories/store.repository");

const findStoreById = (id) => storeRepository.findById(id);

/** e.g. { _id: storeId, businessId } for an ownership-scoped lookup. */
const findStore = (filter) => storeRepository.findOne(filter);

const findStores = (filter = {}) => storeRepository.find(filter);

const storeExists = (filter) => storeRepository.exists(filter);

const countStores = (filter = {}) => storeRepository.countDocuments(filter);

/** Read-only analytics (reports). */
const aggregateStores = (pipeline) => storeRepository.aggregate(pipeline);

module.exports = {
  findStoreById,
  findStore,
  findStores,
  storeExists,
  countStores,
  aggregateStores,
};
