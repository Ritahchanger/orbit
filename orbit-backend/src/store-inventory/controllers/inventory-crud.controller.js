// controllers/inventory/inventory-crud.controller.js
const BaseInventoryController = require('./base-inventory.controller');
const inventoryService = require('../services/index');

class InventoryCRUDController extends BaseInventoryController {
    constructor() {
        super();
    }

    /**
     * Add product to store inventory
     * POST /api/stores/:storeId/inventory
     */
    async addToInventory(req, res) {
        try {
            await this.authenticateUser(req);
            this.validateParams(req, ['storeId']);
            this.validateBody(req, ['productId']);

            const result = await inventoryService.addToInventory(
                req.params.storeId,
                req.body.productId,
                req.body,
                req.user
            );

            this.sendSuccess(res, result.data, result.message, 201);
        } catch (error) {
            this.sendError(res, error);
        }
    }

    /**
     * Update inventory item
     * PUT /api/inventory/:inventoryId
     */
    async updateInventoryItem(req, res) {
        try {
            await this.authenticateUser(req);
            this.validateParams(req, ['inventoryId']);

            const result = await inventoryService.updateInventoryItem(
                req.params.inventoryId,
                req.body,
                req.user
            );

            this.sendSuccess(res, result.data, result.message);
        } catch (error) {
            this.sendError(res, error);
        }
    }

    /**
     * Remove product from inventory
     * DELETE /api/inventory/:inventoryId
     */
    async removeFromInventory(req, res) {
        try {
            await this.authenticateUser(req);
            this.validateParams(req, ['inventoryId']);

            const result = await inventoryService.removeFromInventory(
                req.params.inventoryId,
                req.user
            );

            this.sendSuccess(res, null, result.message);
        } catch (error) {
            this.sendError(res, error);
        }
    }

    /**
     * Get inventory item by ID
     * GET /api/inventory/:inventoryId
     */
    async getInventoryItemById(req, res) {
        try {
            await this.authenticateUser(req);
            this.validateParams(req, ['inventoryId']);

            const result = await inventoryService.getInventoryItemById(
                req.params.inventoryId,
                req.user
            );

            this.sendSuccess(res, result.data);
        } catch (error) {
            this.sendError(res, error);
        }
    }
}

module.exports = new InventoryCRUDController();