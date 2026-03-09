// controllers/inventory/inventory-query.controller.js
const BaseInventoryController = require('./base-inventory.controller');
const inventoryService = require('../services/index');

class InventoryQueryController extends BaseInventoryController {
    constructor() {
        super();
    }

    /**
     * Get store inventory with filtering
     * GET /api/stores/:storeId/inventory
     */
    async getStoreInventory(req, res) {
        try {
            await this.authenticateUser(req);
            this.validateParams(req, ['storeId']);

            const { page, limit } = this.getPaginationParams(req);
            const filters = this.getFilters(req);

            const result = await inventoryService.getStoreInventory(
                req.params.storeId,
                filters,
                page,
                limit,
                req.user
            );

            this.sendSuccess(res, result.data);
        } catch (error) {
            this.sendError(res, error);
        }
    }

    /**
     * Get products available to add to store
     * GET /api/stores/:storeId/inventory/available-products
     */
    async getAvailableProducts(req, res) {
        try {
            await this.authenticateUser(req);
            this.validateParams(req, ['storeId']);

            const { page, limit } = this.getPaginationParams(req);
            const filters = this.getFilters(req);

            const result = await inventoryService.getAvailableProducts(
                req.params.storeId,
                filters,
                page,
                limit
            );

            this.sendSuccess(res, result.data);
        } catch (error) {
            this.sendError(res, error);
        }
    }

    /**
     * Search inventory items
     * GET /api/stores/:storeId/inventory/search
     */
    async searchInventory(req, res) {
        try {
            await this.authenticateUser(req);
            this.validateParams(req, ['storeId']);

            if (!req.query.q) {
                throw new Error("Search query is required");
            }

            const { page, limit } = this.getPaginationParams(req);
            const filters = { ...this.getFilters(req), search: req.query.q };

            const result = await inventoryService.getStoreInventory(
                req.params.storeId,
                filters,
                page,
                limit,
                req.user
            );

            this.sendSuccess(res, result.data, "Search results retrieved");
        } catch (error) {
            this.sendError(res, error);
        }
    }

    /**
     * Get inventory by product SKU
     * GET /api/stores/:storeId/inventory/sku/:sku
     */
    async getInventoryBySku(req, res) {
        try {
            await this.authenticateUser(req);
            this.validateParams(req, ['storeId', 'sku']);

            // This would need a custom service method or we can use existing with filters
            const filters = { search: req.params.sku };

            const result = await inventoryService.getStoreInventory(
                req.params.storeId,
                filters,
                1,
                1,
                req.user
            );

            if (result.data.items.length === 0) {
                throw new Error(`Product with SKU ${req.params.sku} not found in inventory`);
            }

            this.sendSuccess(res, result.data.items[0], "Product found");
        } catch (error) {
            this.sendError(res, error);
        }
    }
}

module.exports = new InventoryQueryController();