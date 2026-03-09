// services/inventory/inventory-query.service.js
const BaseInventoryService = require('./base-inventory.service');

class InventoryQueryService extends BaseInventoryService {
    async getStoreInventory(storeId, filters = {}, page = 1, limit = 20, user) {
        const skip = (page - 1) * limit;
        let query = { store: storeId };

        // Apply filters
        this.applyFilters(query, filters);

        const [inventoryItems, total] = await Promise.all([
            this.StockInventory.find(query)
                .populate({
                    path: 'product',
                    select: 'name sku price costPrice images brand category description'
                })
                .populate('store', 'name code')
                .skip(skip)
                .limit(limit)
                .sort({ updatedAt: -1 })
                .lean(),
            this.StockInventory.countDocuments(query)
        ]);

        // Format response
        const formattedItems = inventoryItems.map(item =>
            this.formatInventoryItem(item)
        );

        // Get summary stats
        const statsService = require('./inventory-stats.service');
        const stats = await statsService.getInventoryStats(storeId, query);

        return {
            success: true,
            data: {
                items: formattedItems,
                summary: stats,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1,
                    limit: limit
                }
            }
        };
    }

    applyFilters(query, filters) {
        if (filters.status) {
            query.status = filters.status;
        }

        if (filters.lowStock === "true") {
            query.$expr = { $lte: ["$stock", "$minStock"] };
        }

        if (filters.outOfStock === "true") {
            query.stock = 0;
        }

        if (filters.inStock === "true") {
            query.stock = { $gt: 0 };
        }

        if (filters.search) {
            // Search implementation
        }

        if (filters.category) {
            // Category filter implementation
        }
    }

    async getAvailableProducts(storeId, filters = {}, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        // Get product IDs already in inventory
        const existingItems = await this.StockInventory.find({ store: storeId })
            .select('product')
            .lean();

        const existingProductIds = existingItems.map(item => item.product);

        // Build query for products NOT in inventory
        let query = {
            _id: { $nin: existingProductIds },
            status: { $ne: "discontinued" }
        };

        // Apply filters
        if (filters.category) query.category = filters.category;
        if (filters.productType) query.productType = filters.productType;

        if (filters.search) {
            query.$or = [
                { name: { $regex: filters.search, $options: "i" } },
                { sku: { $regex: filters.search, $options: "i" } },
                { brand: { $regex: filters.search, $options: "i" } }
            ];
        }

        const [products, total] = await Promise.all([
            this.Product.find(query)
                .select('name sku price costPrice category brand images productType')
                .skip(skip)
                .limit(limit)
                .sort({ name: 1 })
                .lean(),
            this.Product.countDocuments(query)
        ]);

        // Format response
        const formattedProducts = products.map(product => ({
            id: product._id,
            name: product.name,
            sku: product.sku,
            price: product.price,
            costPrice: product.costPrice,
            category: product.category,
            brand: product.brand,
            productType: product.productType,
            image: product.images?.find(img => img.isPrimary)?.displayUrl ||
                product.images?.[0]?.displayUrl,
            profitPerUnit: product.price - product.costPrice
        }));

        return {
            success: true,
            data: {
                products: formattedProducts,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalProducts: total,
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1,
                    limit: limit
                }
            }
        };
    }
}

module.exports = new InventoryQueryService();