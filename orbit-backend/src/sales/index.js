// src/sales/index.js
// Public API of the sales module. Other modules should require THIS file only
// — never reach into sales/models or sales/repositories directly.
//
// The finders return Mongoose queries, so callers chain .populate(),
// .session(), .lean() etc. exactly as they did on the model.
const saleRepository = require("./repositories/sale.repository");
const transactionRepository = require("./repositories/transaction.repository");

const findSaleById = (id) => saleRepository.findById(id);

const findSales = (filter = {}) => saleRepository.find(filter);

const countSales = (filter = {}) => saleRepository.countDocuments(filter);

/** Read-only analytics (reports, store comparison). */
const aggregateSales = (pipeline) => saleRepository.aggregate(pipeline);

/** e.g. { _id: transactionId, businessId } for an ownership-scoped lookup. */
const findTransaction = (filter) => transactionRepository.findOne(filter);

const findTransactionById = (id) => transactionRepository.findById(id);

module.exports = {
  findSaleById,
  findSales,
  countSales,
  aggregateSales,
  findTransaction,
  findTransactionById,
};
