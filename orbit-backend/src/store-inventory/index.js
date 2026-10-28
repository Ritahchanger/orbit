// src/store-inventory/index.js
// Public API of the store-inventory module. Other modules should require THIS
// file only — never reach into store-inventory/models or
// store-inventory/repositories directly.
//
// The finders return Mongoose queries, so callers chain .populate(), .sort(),
// .session(), .lean() etc. exactly as they did on the model.
const storeInventoryRepository = require("./repositories/store-inventory.repository");

const findInventoryItem = (filter) => storeInventoryRepository.findOne(filter);

const findInventoryItemById = (id) => storeInventoryRepository.findById(id);

const findInventoryItems = (filter = {}) => storeInventoryRepository.find(filter);

const countInventoryItems = (filter = {}) =>
  storeInventoryRepository.countDocuments(filter);

/** Read-only analytics (reports, store comparison, product analysis). */
const aggregateInventory = (pipeline) =>
  storeInventoryRepository.aggregate(pipeline);

/** Unsaved inventory row; the caller sets stock and calls save(). */
const newInventoryItem = (data) => storeInventoryRepository.build(data);

/** Same arguments as Model.create, e.g. ([doc], { session }). */
const createInventoryItems = (...args) => storeInventoryRepository.create(...args);

const updateInventoryItem = (id, update, options) =>
  storeInventoryRepository.findByIdAndUpdate(id, update, options);

const deleteInventoryItem = (filter) =>
  storeInventoryRepository.findOneAndDelete(filter);

const stockStatus = (stock, minStock) =>
  stock <= minStock ? "Low Stock" : "In Stock";

/**
 * POS checkout for one line item: atomically takes `quantity` units out of
 * the row only if that many are still in stock (so two concurrent checkouts
 * can't drive stock negative), bumps storeSold/storeRevenue, then deletes the
 * row if it hit zero or refreshes its status. Returns null if stock changed
 * since the caller read it.
 */
const sellFromInventory = async (inventoryId, quantity, revenue) => {
  const updated = await storeInventoryRepository.findOneAndUpdate(
    { _id: inventoryId, stock: { $gte: quantity } },
    {
      $inc: { stock: -quantity, storeSold: quantity, storeRevenue: revenue },
      $set: { lastSold: new Date() },
    },
    { new: true },
  );
  if (!updated) return null;

  if (updated.stock <= 0) {
    await storeInventoryRepository.findByIdAndDelete(updated._id);
  } else {
    await storeInventoryRepository.findByIdAndUpdate(updated._id, {
      $set: { status: stockStatus(updated.stock, updated.minStock) },
    });
  }
  return updated;
};

/**
 * Single-item sale (sales.service recordSale) against a row the caller has
 * already read and checked: deletes the row when the sale empties it,
 * otherwise decrements it and sets the status from the new stock. Returns
 * "deleted" or "updated".
 */
const recordInventorySale = async (inventoryItem, quantity, revenue) => {
  const newStock = inventoryItem.stock - quantity;

  if (newStock <= 0) {
    await storeInventoryRepository.findByIdAndDelete(inventoryItem._id);
    return "deleted";
  }

  await storeInventoryRepository.findByIdAndUpdate(inventoryItem._id, {
    $inc: { stock: -quantity, storeSold: quantity, storeRevenue: revenue },
    $set: {
      status: stockStatus(newStock, inventoryItem.minStock),
      lastSold: new Date(),
    },
  });
  return "updated";
};

module.exports = {
  findInventoryItem,
  findInventoryItemById,
  findInventoryItems,
  countInventoryItems,
  aggregateInventory,
  newInventoryItem,
  createInventoryItems,
  updateInventoryItem,
  deleteInventoryItem,
  sellFromInventory,
  recordInventorySale,
};
