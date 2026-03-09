// controllers/inventory/inventory-bulk.controller.js
const BaseInventoryController = require('./base-inventory.controller');
const inventoryService = require('../services/index');

class InventoryBulkController extends BaseInventoryController {
    constructor() {
        super();
    }

    /**
     * Bulk update inventory items
     * POST /api/stores/:storeId/inventory/bulk
     */
    async bulkUpdate(req, res) {
       
            await this.authenticateUser(req);
            this.validateParams(req, ['storeId']);
            this.validateBody(req, ['updates']);

            if (!Array.isArray(req.body.updates)) {
                throw new Error("Updates must be an array");
            }

            if (req.body.updates.length > 100) {
                throw new Error("Maximum 100 updates per request");
            }

            const result = await inventoryService.bulkUpdate(
                req.params.storeId,
                req.body.updates,
                req.user
            );

            this.sendSuccess(res, result.data, result.message);
       
    }

    /**
     * Quick add multiple products to inventory
     * POST /api/stores/:storeId/inventory/quick-add
     */
    async quickAdd(req, res) {

        console.log('🚀 Quick add request received:', {
            storeId: req.params.storeId,
            itemsCount: req.body.items?.length || 0
        });

        await this.authenticateUser(req);
        this.validateParams(req, ['storeId']);
        this.validateBody(req, ['items']);

        if (!Array.isArray(req.body.items)) {
            throw new Error("Items must be an array");
        }

        if (req.body.items.length > 50) {
            throw new Error("Maximum 50 items per quick add request");
        }

        // Validate each item
        req.body.items.forEach((item, index) => {
            if (!item.sku) {
                throw new Error(`Item at index ${index} is missing SKU`);
            }
            if (item.quantity && isNaN(parseInt(item.quantity))) {
                throw new Error(`Item at index ${index} has invalid quantity`);
            }
        });

        const result = await inventoryService.quickAdd(
            req.params.storeId,
            req.body.items,
            req.user
        );

        console.log('✅ Quick add completed:', result.message);

        this.sendSuccess(res, result.data, result.message);

    }

    /**
     * Bulk add products to inventory
     * POST /api/stores/:storeId/inventory/bulk-add
     */
    async bulkAdd(req, res) {

        await this.authenticateUser(req);
        this.validateParams(req, ['storeId']);
        this.validateBody(req, ['products']);

        if (!Array.isArray(req.body.products)) {
            throw new Error("Products must be an array");
        }

        const result = await inventoryService.bulkAdd(
            req.params.storeId,
            req.body.products,
            req.user
        );

        this.sendSuccess(res, result.data, result.message);

    }

    /**
     * Import inventory from CSV
     * POST /api/stores/:storeId/inventory/import
     */
    async importInventory(req, res) {

        await this.authenticateUser(req);
        this.validateParams(req, ['storeId']);

        // Assuming CSV data is sent as JSON array in request body
        const csvData = req.body.csvData || [];

        if (!Array.isArray(csvData)) {
            throw new Error("CSV data must be an array");
        }

        if (csvData.length === 0) {
            throw new Error("No data to import");
        }

        const result = await inventoryService.importFromCSV(
            req.params.storeId,
            csvData,
            req.user
        );

        this.sendSuccess(res, result.data, result.message);

    }

    /**
     * Export inventory to CSV
     * GET /api/stores/:storeId/inventory/export
     */
    async exportInventory(req, res) {

        await this.authenticateUser(req);
        this.validateParams(req, ['storeId']);

        const filters = this.getFilters(req);

        const result = await inventoryService.exportToCSV(
            req.params.storeId,
            filters
        );

        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=inventory-${req.params.storeId}-${Date.now()}.csv`);

        // Convert JSON to CSV string
        const csvString = this.convertToCSV(result.data.csvData);

        res.send(csvString);

    }

    /**
     * Convert JSON to CSV string
     */
    convertToCSV(data) {
        if (data.length === 0) return '';

        const headers = Object.keys(data[0]);
        const csvRows = [];

        // Add headers
        csvRows.push(headers.join(','));

        // Add data rows
        data.forEach(row => {
            const values = headers.map(header => {
                const value = row[header];
                // Handle values that might contain commas
                if (typeof value === 'string' && value.includes(',')) {
                    return `"${value}"`;
                }
                return value;
            });
            csvRows.push(values.join(','));
        });

        return csvRows.join('\n');
    }
}

module.exports = new InventoryBulkController();