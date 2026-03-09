// controllers/inventory/index.js
const inventoryCRUD = require('./inventory-crud.controller');
const inventoryQuery = require('./inventory-query.controller');
const inventoryOperations = require('./inventory-operations.controller');
const inventoryStats = require('./inventory-stats.controller');
const inventoryAlerts = require('./inventory-alerts.controller');
const inventoryBulk = require('./inventory-bulk.controller');

module.exports = {
    // CRUD Controllers
    addToInventory: inventoryCRUD.addToInventory.bind(inventoryCRUD),
    updateInventoryItem: inventoryCRUD.updateInventoryItem.bind(inventoryCRUD),
    removeFromInventory: inventoryCRUD.removeFromInventory.bind(inventoryCRUD),
    getInventoryItemById: inventoryCRUD.getInventoryItemById.bind(inventoryCRUD),

    // Query Controllers
    getStoreInventory: inventoryQuery.getStoreInventory.bind(inventoryQuery),
    getAvailableProducts: inventoryQuery.getAvailableProducts.bind(inventoryQuery),
    searchInventory: inventoryQuery.searchInventory.bind(inventoryQuery),
    getInventoryBySku: inventoryQuery.getInventoryBySku.bind(inventoryQuery),

    // Operations Controllers
    restockProduct: inventoryOperations.restockProduct.bind(inventoryOperations),
    recordSale: inventoryOperations.recordSale.bind(inventoryOperations),
    transferStock: inventoryOperations.transferStock.bind(inventoryOperations),
    adjustStock: inventoryOperations.adjustStock.bind(inventoryOperations),

    // Stats Controllers
    getInventoryStats: inventoryStats.getInventoryStats.bind(inventoryStats),
    getInventoryDashboard: inventoryStats.getInventoryDashboard.bind(inventoryStats),
    getInventoryTrends: inventoryStats.getInventoryTrends.bind(inventoryStats),

    // Alerts Controllers
    getLowStockAlerts: inventoryAlerts.getLowStockAlerts.bind(inventoryAlerts),
    getOutOfStockAlerts: inventoryAlerts.getOutOfStockAlerts.bind(inventoryAlerts),
    getAllAlerts: inventoryAlerts.getAllAlerts.bind(inventoryAlerts),
    acknowledgeAlert: inventoryAlerts.acknowledgeAlert.bind(inventoryAlerts),
    getAlertSummary: inventoryAlerts.getAlertSummary.bind(inventoryAlerts),

    // Bulk Controllers
    bulkUpdate: inventoryBulk.bulkUpdate.bind(inventoryBulk),
    quickAdd: inventoryBulk.quickAdd.bind(inventoryBulk),
    bulkAdd: inventoryBulk.bulkAdd.bind(inventoryBulk),
    importInventory: inventoryBulk.importInventory.bind(inventoryBulk),
    exportInventory: inventoryBulk.exportInventory.bind(inventoryBulk)
};