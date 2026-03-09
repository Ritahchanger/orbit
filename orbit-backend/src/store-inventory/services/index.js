// services/inventory/index.js
const inventoryCRUD = require('./inventory-crud.service');
const inventoryQuery = require('./inventory-query.service');
const inventoryOperations = require('./inventory-operations.service');
const inventoryStats = require('./inventory-stats.service');
const inventoryAlerts = require('./inventory-alerts.service');
const inventoryBulk = require('./inventory-bulk.service');

module.exports = {
    // CRUD Operations
    addToInventory: inventoryCRUD.addToInventory.bind(inventoryCRUD),
    updateInventoryItem: inventoryCRUD.updateInventoryItem.bind(inventoryCRUD),
    removeFromInventory: inventoryCRUD.removeFromInventory.bind(inventoryCRUD),
    getInventoryItemById: inventoryCRUD.getInventoryItemById.bind(inventoryCRUD),

    // Query Operations
    getStoreInventory: inventoryQuery.getStoreInventory.bind(inventoryQuery),
    getAvailableProducts: inventoryQuery.getAvailableProducts.bind(inventoryQuery),

    // Operations
    restockProduct: inventoryOperations.restockProduct.bind(inventoryOperations),
    recordSale: inventoryOperations.recordSale.bind(inventoryOperations),
    transferStock: inventoryOperations.transferStock.bind(inventoryOperations),

    // Stats
    getInventoryStats: inventoryStats.getInventoryStats.bind(inventoryStats),

    // Alerts
    getLowStockAlerts: inventoryAlerts.getLowStockAlerts.bind(inventoryAlerts),

    // Bulk Operations
    bulkUpdate: inventoryBulk.bulkUpdate.bind(inventoryBulk),

    quickAdd:inventoryBulk.quickAdd.bind(inventoryBulk)


};