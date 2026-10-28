// repositories/store-inventory.repository.js
// The products module's narrow wrapper around the store-inventory queries
// products.service.js makes on its own behalf (linking products into a
// store's inventory). Goes through the store-inventory module's public API.
const {
  countInventoryItems,
  deleteInventoryItem,
  findInventoryItem,
  findInventoryItems,
  newInventoryItem,
} = require("../../store-inventory");

const findOne = (query) => findInventoryItem(query);

const create = (data) => newInventoryItem(data).save();

const find = (query, { select, sort, skip, limit, lean = true, populate } = {}) => {
  let q = findInventoryItems(query);
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

const countDocuments = (query) => countInventoryItems(query);

const findOneAndDelete = (query) => deleteInventoryItem(query);

module.exports = {
  findOne,
  create,
  find,
  countDocuments,
  findOneAndDelete,
};
