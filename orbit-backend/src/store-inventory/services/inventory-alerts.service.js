// services/inventory/inventory-alerts.service.js
const BaseInventoryService = require('./base-inventory.service');

class InventoryAlertsService extends BaseInventoryService {
    /**
     * Get low stock alerts
     */
    async getLowStockAlerts(storeId, limit = 20) {
        const lowStockItems = await this.StockInventory.find({
            store: storeId,
            $expr: { $lte: ["$stock", "$minStock"] }
        })
            .populate('product', 'name sku price category brand images')
            .populate('store', 'name code')
            .sort({ stock: 1 })
            .limit(limit)
            .lean();

        const alerts = lowStockItems.map(item => ({
            inventoryId: item._id,
            product: {
                id: item.product?._id,
                name: item.product?.name,
                sku: item.product?.sku,
                price: item.product?.price,
                category: item.product?.category,
                brand: item.product?.brand,
                image: item.product?.images?.find(img => img.isPrimary)?.displayUrl ||
                       item.product?.images?.[0]?.displayUrl
            },
            store: {
                id: item.store?._id,
                name: item.store?.name,
                code: item.store?.code
            },
            currentStock: item.stock,
            minStock: item.minStock,
            status: item.status,
            needed: Math.max(0, item.minStock + 5 - item.stock),
            urgency: this.calculateUrgency(item.stock, item.minStock),
            lastRestock: item.lastRestock,
            storePrice: item.storePrice
        }));

        return {
            success: true,
            data: {
                alerts: alerts,
                summary: {
                    totalAlerts: alerts.length,
                    criticalCount: alerts.filter(a => a.currentStock === 0).length,
                    warningCount: alerts.filter(a => a.currentStock > 0 && a.currentStock <= a.minStock).length,
                    suggestedRestockTotal: alerts.reduce((sum, a) => sum + a.needed, 0)
                },
                timestamp: new Date()
            }
        };
    }

    // Helper method
    calculateUrgency(currentStock, minStock) {
        if (currentStock === 0) return 'critical';
        if (currentStock <= minStock) return 'high';
        if (currentStock <= minStock * 2) return 'medium';
        return 'low';
    }
}

module.exports = new InventoryAlertsService();