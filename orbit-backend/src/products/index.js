// src/products/index.js
// Public API of the products module. Other modules should require THIS file
// only — never reach into products.model.js or products/repositories directly.
const productRepository = require("./repositories/product.repository");

/**
 * Plain existence/field lookup by id. Always lean — every external caller
 * only reads plain fields, none call an instance method on the result.
 */
const findProductById = (id, { session, select } = {}) => {
  return productRepository.findById(id, { lean: true, session, select });
};

/**
 * SKU lookup. Pass businessId to scope it (matches the handful of call
 * sites — pos-service.js, stock-inventory's quickAddBySku — that already
 * scoped this before the refactor); omit it to preserve the unscoped
 * behavior every other current call site relies on.
 */
const findProductBySku = (sku, { businessId, session } = {}) => {
  if (businessId) {
    return productRepository.findBySkuAndBusiness(sku, businessId, {
      lean: true,
      session,
    });
  }
  return productRepository.findBySku(sku, { lean: true, session });
};

/**
 * General-purpose lean finder. Covers: id-only "search to filter another
 * collection" (pass { select: '_id' }), paginated "available products"
 * listings, and seeder stats/list/--low-stock queries.
 */
const findProducts = (filter = {}, { select, sort, skip, limit } = {}) => {
  return productRepository.find(filter, { select, sort, skip, limit, lean: true });
};

const countProducts = (filter = {}) => {
  return productRepository.countDocuments(filter);
};

/** For seeders: create a product document directly. */
const createProduct = (data) => {
  return productRepository.create(data);
};

/** For seeders: upsert a product by SKU. */
const upsertProductBySku = (sku, data) => {
  return productRepository.findOneAndUpdate({ sku }, data, {
    upsert: true,
    new: true,
    runValidators: true,
  });
};

/**
 * The dominant counter-mutation pattern across pos-service.js,
 * sales.services.js, refund.service.js, and stock-inventory.controller.js's
 * recordSale: an atomic $inc on stock/totalSold/totalRevenue. Pass negative
 * values to decrement (used by the sale-void/refund-reversal path).
 */
const incrementProductFields = (productId, incFields, { session } = {}) => {
  return productRepository.findByIdAndUpdate(
    productId,
    { $inc: incFields },
    { session },
  );
};

/**
 * Atomically decrements stock only if enough is currently available,
 * bumping totalSold/totalRevenue in the same update. Used by order checkout
 * (orders/order.service.js) so two concurrent checkouts racing for the last
 * unit can't both succeed — the loser gets null back instead of driving
 * stock negative — and so the check and the decrement can't drift apart the
 * way a separate read-then-$inc would under concurrency. Pass a session to
 * run it as part of a transaction.
 */
const decrementStockIfAvailable = (productId, quantity, revenueDelta, { session } = {}) => {
  return productRepository.findOneAndUpdate(
    { _id: productId, stock: { $gte: quantity } },
    { $inc: { stock: -quantity, totalSold: quantity, totalRevenue: revenueDelta } },
    { new: true, session },
  );
};

/**
 * Preserves stock-inventory.controller.js's existing restockProduct
 * sequence verbatim: decrements the product's global stock (this "restocks"
 * a specific STORE by moving units out of the shared global pool into that
 * store's own inventory — the store-side increment happens separately, in
 * stock-inventory.controller.js itself, not here), then recomputes status
 * with the exact same conditional the original inline code used (note:
 * unlike the Product model's own `restock()` instance method, this does
 * NOT reset status to "In Stock" when stock rises above minStock — that
 * asymmetry is pre-existing, not something introduced by this extraction).
 * Returns null if the product doesn't exist.
 */
const restockProductDirect = async (productId, quantity) => {
  const product = await productRepository.findById(productId, { lean: false });
  if (!product) return null;

  product.stock -= parseInt(quantity, 10);
  product.lastRestock = new Date();

  if (product.stock === 0) {
    product.status = "Out of Stock";
  } else if (product.stock <= product.minStock) {
    product.status = "Low Stock";
  }

  await productRepository.save(product);
  return product;
};

/** For seeders: orbit-test.seed.js's businessId-scoped wipe, products.seed.js's --force (unscoped) wipe. */
const deleteProductsByFilter = (filter = {}) => {
  return productRepository.deleteMany(filter);
};

/**
 * Preserves stock-inventory.controller.js's quickAddBySku sequence: decrements
 * the product's global stock by quantity and recomputes status, but — unlike
 * restockProductDirect — resets status back to "In Stock" when stock rises
 * back above minStock. Kept as a separate function rather than unifying the
 * two status-recompute behaviors, since that asymmetry predates this
 * extraction and unifying it would be a behavior change out of scope here.
 * Pass businessId to scope the lookup (matches quickAddBySku's businessId-scoped
 * find). Returns null if the product doesn't exist.
 */
const decrementProductStockBySku = async (sku, quantity, { businessId } = {}) => {
  const product = businessId
    ? await productRepository.findBySkuAndBusiness(sku, businessId, { lean: false })
    : await productRepository.findBySku(sku, { lean: false });
  if (!product) return null;

  product.stock -= parseInt(quantity, 10);

  if (product.stock === 0) {
    product.status = "Out of Stock";
  } else if (product.stock <= product.minStock) {
    product.status = "Low Stock";
  } else {
    product.status = "In Stock";
  }

  await productRepository.save(product);
  return product;
};

module.exports = {
  findProductById,
  findProductBySku,
  findProducts,
  countProducts,
  createProduct,
  upsertProductBySku,
  incrementProductFields,
  decrementStockIfAvailable,
  restockProductDirect,
  decrementProductStockBySku,
  deleteProductsByFilter,
};
