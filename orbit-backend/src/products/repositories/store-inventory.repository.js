// repositories/store-inventory.repository.js
// The ONLY file in the products module allowed to require the StoreInventory
// model. Narrow wrapper around the small set of queries product.service.js
// makes on its own behalf (linking products into a store's inventory). This
// is NOT a conversion of the separate store-inventory backend module — that
// module's own internals are a future, separate pass.
const StoreInventory = require("../../store-inventory/store-inventory.model");

const findOne = (query) => StoreInventory.findOne(query);

const create = (data) => new StoreInventory(data).save();

const find = (query, { select, sort, skip, limit, lean = true, populate } = {}) => {
  let q = StoreInventory.find(query);
  if (Array.isArray(populate)) {
    populate.forEach((p) => {
      q = q.populate(p);
    });
  }
  if (select) q = q.select(select);
  if (sort) q = q.sort(sort);
  if (typeof skip === "number") q = q.skip(skip);
  if (typeof limit === "number") q = q.limit(limit);
  if (lean) q = q.lean();
  return q;
};

const countDocuments = (query) => StoreInventory.countDocuments(query);

const findOneAndDelete = (query) => StoreInventory.findOneAndDelete(query);

module.exports = {
  findOne,
  create,
  find,
  countDocuments,
  findOneAndDelete,
};
