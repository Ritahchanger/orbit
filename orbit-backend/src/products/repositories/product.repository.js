// repositories/product.repository.js
// Only file (besides the model itself) allowed to query the Product collection directly.
const Product = require("../products.model");

const findById = (id, { lean = true, session, select } = {}) => {
  let q = Product.findById(id);
  if (select) q = q.select(select);
  if (session) q = q.session(session);
  if (lean) q = q.lean();
  return q;
};

// Ownership-scoped lookup — the single fix point for the businessId-drop bug:
// returns null both when the id doesn't exist AND when it belongs to a
// different business, so callers can't tell the two apart (matches the
// existing "Product not found" error semantics).
const findByIdAndBusiness = (id, businessId, { lean = false, session } = {}) => {
  let q = Product.findOne({ _id: id, businessId });
  if (session) q = q.session(session);
  if (lean) q = q.lean();
  return q;
};

const findBySku = (sku, { lean = false, session } = {}) => {
  let q = Product.findOne({ sku });
  if (session) q = q.session(session);
  if (lean) q = q.lean();
  return q;
};

const findBySkuAndBusiness = (sku, businessId, { lean = true, session } = {}) => {
  let q = Product.findOne({ sku, businessId });
  if (session) q = q.session(session);
  if (lean) q = q.lean();
  return q;
};

const findBySkuExcludingId = (sku, excludeId) => {
  return Product.findOne({ sku, _id: { $ne: excludeId } });
};

const find = (filter = {}, { select, sort, skip, limit, lean = true, session } = {}) => {
  let q = Product.find(filter);
  if (select) q = q.select(select);
  if (sort) q = q.sort(sort);
  if (typeof skip === "number") q = q.skip(skip);
  if (typeof limit === "number") q = q.limit(limit);
  if (session) q = q.session(session);
  if (lean) q = q.lean();
  return q;
};

const countDocuments = (filter = {}) => Product.countDocuments(filter);

const aggregate = (pipeline) => Product.aggregate(pipeline);

const create = (data) => new Product(data).save();

const save = (doc) => doc.save();

const deleteOne = (doc) => doc.deleteOne();

const deleteMany = (filter = {}) => Product.deleteMany(filter);

const findByIdAndUpdate = (id, update, { session } = {}) => {
  const opts = { new: true, runValidators: true, context: "query" };
  if (session) opts.session = session;
  return Product.findByIdAndUpdate(id, update, opts);
};

const findOneAndUpdate = (filter, update, options = {}) =>
  Product.findOneAndUpdate(filter, update, options);

// Thin `new Product(leanObj)` wrapper — centralizes the existing
// lean-object-rewrapped-as-live-document pattern used to call
// `.toFrontendFormat()` on results of a `.lean()` query.
const hydrate = (leanObj) => new Product(leanObj);

module.exports = {
  findById,
  findByIdAndBusiness,
  findBySku,
  findBySkuAndBusiness,
  findBySkuExcludingId,
  find,
  countDocuments,
  aggregate,
  create,
  save,
  deleteOne,
  deleteMany,
  findByIdAndUpdate,
  findOneAndUpdate,
  hydrate,
};
