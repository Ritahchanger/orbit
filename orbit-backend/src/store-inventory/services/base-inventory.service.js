// services/inventory/base-inventory.service.js
const StockInventory = require("../store-inventory.model");
const Product = require("../../products/products.model");
const Store = require("../../stores/store.model");

class BaseInventoryService {
    constructor() {
        this.StockInventory = StockInventory;
        this.Product = Product;
        this.Store = Store;
    }

    async validateStore(storeId) {
        const store = await this.Store.findById(storeId);
        if (!store) throw new Error("Store not found");
        return store;
    }

    async validateProduct(productId) {
        const product = await this.Product.findById(productId);
        if (!product) throw new Error("Product not found");
        return product;
    }

    async getInventoryItem(inventoryId, populate = true) {
        const query = this.StockInventory.findById(inventoryId);

        if (populate) {
            query.populate('product', 'name sku price costPrice brand category')
                .populate('store', 'name code');
        }

        const item = await query;
        if (!item) throw new Error("Inventory item not found");
        return item;
    }

    async findExistingInventory(storeId, productId) {
        return await this.StockInventory.findOne({
            store: storeId,
            product: productId
        });
    }

    calculateStatus(stock, minStock) {
        if (stock === 0) return "Out of Stock";
        if (stock <= minStock) return "Low Stock";
        return "In Stock";
    }

    formatInventoryItem(item) {
        const product = item.product;
        const costPrice = product?.costPrice || 0;
        const sellingPrice = item.storePrice || product?.price || 0;
        const profitPerUnit = sellingPrice - costPrice;

        return {
            inventoryId: item._id,
            product: {
                id: product?._id,
                name: product?.name,
                sku: product?.sku,
                globalPrice: product?.price,
                costPrice: costPrice,
                category: product?.category,
                brand: product?.brand,
                description: product?.description,
                images: product?.images || [],
                productType: product?.productType
            },
            store: item.store,
            storeStock: item.stock,
            storeMinStock: item.minStock,
            storePrice: item.storePrice,
            storeStatus: item.status,
            storeSold: item.storeSold || 0,
            storeRevenue: item.storeRevenue || 0,
            profitPerUnit: profitPerUnit,
            totalValue: item.stock * costPrice,
            potentialProfit: item.stock * profitPerUnit,
            lastRestock: item.lastRestock,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
        };
    }

}

module.exports = BaseInventoryService;