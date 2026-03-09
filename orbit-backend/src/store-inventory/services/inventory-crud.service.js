// services/inventory/inventory-crud.service.js
const BaseInventoryService = require('./base-inventory.service');

class InventoryCRUDService extends BaseInventoryService {
    async addToInventory(storeId, productId, inventoryData = {}, user) {
        console.log('📦 addToInventory called:', { storeId, productId, inventoryData });

        await this.validateStore(storeId);
        await this.validateProduct(productId);

        // Check if already in inventory
        const existingItem = await this.findExistingInventory(storeId, productId);

        if (existingItem) {
            console.log('🔄 Updating existing inventory item');
            return await this.updateInventoryItem(existingItem._id, inventoryData, user);
        }

        console.log('🆕 Creating new inventory item');
        const product = await this.Product.findById(productId);
        
        const inventoryItem = new this.StockInventory({
            store: storeId,
            product: productId,
            stock: inventoryData.stock || 0,
            minStock: inventoryData.minStock || 5,
            storePrice: inventoryData.price || product.price,
            status: this.calculateStatus(inventoryData.stock || 0, inventoryData.minStock || 5),
            lastRestock: new Date()
        });

        await inventoryItem.save();
        await inventoryItem.populate('product', 'name sku price category brand');
        await inventoryItem.populate('store', 'name code');

        console.log('✅ Inventory item saved successfully');

        return {
            success: true,
            message: "Product added to store inventory",
            data: inventoryItem
        };
    }

    async updateInventoryItem(inventoryId, updateData, user) {
        const inventoryItem = await this.getInventoryItem(inventoryId, false);

        // Update fields
        const allowedFields = ['stock', 'minStock', 'storePrice'];
        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                inventoryItem[field] = updateData[field];
            }
        });

        // Auto-update status based on stock
        if (updateData.stock !== undefined) {
            inventoryItem.status = this.calculateStatus(
                updateData.stock, 
                inventoryItem.minStock
            );
        }

        // Update last restock if stock increased
        if (updateData.stock !== undefined && updateData.stock > inventoryItem.stock) {
            inventoryItem.lastRestock = new Date();
        }

        await inventoryItem.save();
        await inventoryItem.populate('product', 'name sku price');
        await inventoryItem.populate('store', 'name code');

        return {
            success: true,
            message: "Inventory updated successfully",
            data: inventoryItem
        };
    }

    async removeFromInventory(inventoryId, user) {
        const deleted = await this.StockInventory.findByIdAndDelete(inventoryId);

        if (!deleted) {
            throw new Error("Inventory item not found");
        }

        return {
            success: true,
            message: "Product removed from store inventory"
        };
    }

    async getInventoryItemById(inventoryId, user) {
        const inventoryItem = await this.getInventoryItem(inventoryId);
        
        return {
            success: true,
            data: this.formatInventoryItem(inventoryItem)
        };
    }
}

module.exports = new InventoryCRUDService();