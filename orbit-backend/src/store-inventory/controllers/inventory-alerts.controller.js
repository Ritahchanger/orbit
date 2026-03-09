// controllers/inventory/inventory-alerts.controller.js
const inventoryService = require('../services/index');

const BaseInventoryController = require("./base-inventory.controller")

class InventoryAlertsController extends BaseInventoryController {
    constructor() {
        super();
    }

    /**
     * Get low stock alerts
     * GET /api/stores/:storeId/inventory/alerts/low-stock
     */
    async getLowStockAlerts(req, res) {
        try {
            await this.authenticateUser(req);
            this.validateParams(req, ['storeId']);

            const limit = parseInt(req.query.limit) || 20;

            const result = await inventoryService.getLowStockAlerts(
                req.params.storeId,
                limit
            );

            this.sendSuccess(res, result.data, "Low stock alerts retrieved");
        } catch (error) {
            this.sendError(res, error);
        }
    }

    /**
     * Get out of stock alerts
     * GET /api/stores/:storeId/inventory/alerts/out-of-stock
     */
    async getOutOfStockAlerts(req, res) {
        try {
            await this.authenticateUser(req);
            this.validateParams(req, ['storeId']);

            const limit = parseInt(req.query.limit) || 50;

            const result = await inventoryService.getOutOfStockAlerts(
                req.params.storeId,
                limit
            );

            this.sendSuccess(res, result.data, "Out of stock alerts retrieved");
        } catch (error) {
            this.sendError(res, error);
        }
    }

    /**
     * Get all alerts combined
     * GET /api/stores/:storeId/inventory/alerts/all
     */
    async getAllAlerts(req, res) {
        try {
            await this.authenticateUser(req);
            this.validateParams(req, ['storeId']);

            const options = {
                lowStockLimit: parseInt(req.query.lowStockLimit) || 20,
                outOfStockLimit: parseInt(req.query.outOfStockLimit) || 50,
                expiryDays: parseInt(req.query.expiryDays) || 30
            };

            const result = await inventoryService.getAllAlerts(
                req.params.storeId,
                options
            );

            this.sendSuccess(res, result.data, "All alerts retrieved");
        } catch (error) {
            this.sendError(res, error);
        }
    }

    /**
     * Acknowledge/clear alert
     * POST /api/inventory/alerts/:alertId/acknowledge
     */
    async acknowledgeAlert(req, res) {
        try {
            await this.authenticateUser(req);
            this.validateParams(req, ['alertId']);

            // Implement alert acknowledgment logic
            const alertId = req.params.alertId;
            const notes = req.body.notes || '';

            // This would typically update an alerts collection
            const result = {
                success: true,
                message: `Alert ${alertId} acknowledged`,
                data: {
                    alertId,
                    acknowledgedBy: req.user.id,
                    acknowledgedAt: new Date(),
                    notes,
                    status: 'acknowledged'
                }
            };

            this.sendSuccess(res, result.data, result.message);
        } catch (error) {
            this.sendError(res, error);
        }
    }

    /**
     * Get alert summary
     * GET /api/stores/:storeId/inventory/alerts/summary
     */
    async getAlertSummary(req, res) {
        try {
            await this.authenticateUser(req);
            this.validateParams(req, ['storeId']);

            const [lowStock, outOfStock] = await Promise.all([
                inventoryService.getLowStockAlerts(req.params.storeId, 1),
                inventoryService.getOutOfStockAlerts(req.params.storeId, 1)
            ]);

            const summary = {
                lowStock: {
                    count: lowStock.data.alerts.length,
                    critical: lowStock.data.summary?.criticalCount || 0,
                    warnings: lowStock.data.summary?.warningCount || 0
                },
                outOfStock: {
                    count: outOfStock.data.alerts.length
                },
                totalAlerts: lowStock.data.alerts.length + outOfStock.data.alerts.length,
                lastUpdated: new Date()
            };

            this.sendSuccess(res, summary, "Alert summary retrieved");
        } catch (error) {
            this.sendError(res, error);
        }
    }
}

module.exports = new InventoryAlertsController();