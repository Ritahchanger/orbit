// controllers/inventory/inventory-operations.controller.js
const BaseInventoryController = require('./base-inventory.controller');
const inventoryService = require('../services/index');

class InventoryOperationsController extends BaseInventoryController {
    constructor() {
        super();
    }

    /**
     * Restock product
     * POST /api/inventory/:inventoryId/restock
     */
    async restockProduct(req, res) {
        try {
            await this.authenticateUser(req);
            this.validateParams(req, ['inventoryId']);
            this.validateBody(req, ['quantity']);

            const result = await inventoryService.restockProduct(
                req.params.inventoryId,
                req.body.quantity,
                req.user
            );

            this.sendSuccess(res, result.data, result.message);
        } catch (error) {
            this.sendError(res, error);
        }
    }

    /**
     * Record sale from inventory
     * POST /api/inventory/:inventoryId/sale
     */
    async recordSale(req, res) {
        try {
            await this.authenticateUser(req);
            this.validateParams(req, ['inventoryId']);
            this.validateBody(req, ['quantity']);

            const result = await inventoryService.recordSale(
                req.params.inventoryId,
                req.body.quantity,
                req.body.sellingPrice,
                req.user
            );

            this.sendSuccess(res, result.data, result.message);
        } catch (error) {
            this.sendError(res, error);
        }
    }

    /**
     * Transfer stock between stores
     * POST /api/inventory/transfer
     */
    async transferStock(req, res) {
        try {
            await this.authenticateUser(req);
            this.validateBody(req, ['fromStoreId', 'toStoreId', 'inventoryId', 'quantity']);

            const result = await inventoryService.transferStock(
                req.body.fromStoreId,
                req.body.toStoreId,
                req.body.inventoryId,
                req.body.quantity,
                req.user
            );

            this.sendSuccess(res, result.data, result.message);
        } catch (error) {
            this.sendError(res, error);
        }
    }

    /**
     * Adjust inventory (add/subtract stock)
     * POST /api/inventory/:inventoryId/adjust
     */
    async adjustStock(req, res) {
        try {
            await this.authenticateUser(req);
            this.validateParams(req, ['inventoryId']);
            this.validateBody(req, ['adjustment', 'reason']);

            const inventoryId = req.params.inventoryId;
            const adjustment = parseInt(req.body.adjustment);
            const reason = req.body.reason;

            if (isNaN(adjustment)) {
                throw new Error("Adjustment must be a number");
            }

            let result;
            if (adjustment > 0) {
                // Positive adjustment = restock
                result = await inventoryService.restockProduct(
                    inventoryId,
                    adjustment,
                    req.user
                );
                result.message = `Stock increased by ${adjustment}. ${result.message}`;
            } else {
                // Negative adjustment = manual deduction
                const quantity = Math.abs(adjustment);
                // We need to check stock first
                const inventoryItem = await inventoryService.getInventoryItemById(inventoryId, req.user);
                
                if (inventoryItem.data.storeStock < quantity) {
                    throw new Error(`Insufficient stock. Available: ${inventoryItem.data.storeStock}`);
                }

                // Use recordSale with 0 price or create a new method for manual adjustment
                result = await inventoryService.recordSale(
                    inventoryId,
                    quantity,
                    0, // 0 price for adjustments
                    req.user
                );
                result.message = `Stock decreased by ${quantity} (${reason}). ${result.message}`;
                result.data.reason = reason;
            }

            this.sendSuccess(res, result.data, result.message);
        } catch (error) {
            this.sendError(res, error);
        }
    }
}

module.exports = new InventoryOperationsController();