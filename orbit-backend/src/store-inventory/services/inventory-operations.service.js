// services/inventory/inventory-operations.service.js
const mongoose = require('mongoose');
const BaseInventoryService = require('./base-inventory.service');

class InventoryOperationsService extends BaseInventoryService {
    async restockProduct(inventoryId, quantity, user) {
        const inventoryItem = await this.getInventoryItem(inventoryId, false);

        const oldStock = inventoryItem.stock;
        inventoryItem.stock += quantity;
        inventoryItem.lastRestock = new Date();
        inventoryItem.status = this.calculateStatus(
            inventoryItem.stock,
            inventoryItem.minStock
        );

        await inventoryItem.save();

        return {
            success: true,
            message: `Restocked ${quantity} units. New stock: ${inventoryItem.stock}`,
            data: {
                oldStock: oldStock,
                newStock: inventoryItem.stock,
                added: quantity,
                status: inventoryItem.status,
                lastRestock: inventoryItem.lastRestock
            }
        };
    }

    async recordSale(inventoryId, quantity, sellingPrice = null, user) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const inventoryItem = await this.StockInventory.findById(inventoryId).session(session);

            if (!inventoryItem) throw new Error("Inventory item not found");
            if (inventoryItem.stock < quantity) {
                throw new Error(`Insufficient stock. Available: ${inventoryItem.stock}`);
            }

            // Get product for default price
            const product = await this.Product.findById(inventoryItem.product).session(session);
            const finalPrice = sellingPrice || inventoryItem.storePrice || product.price;

            // Update inventory
            inventoryItem.stock -= quantity;
            inventoryItem.storeSold += quantity;
            inventoryItem.storeRevenue += quantity * finalPrice;
            inventoryItem.status = this.calculateStatus(
                inventoryItem.stock,
                inventoryItem.minStock
            );

            await inventoryItem.save({ session });
            await session.commitTransaction();
            session.endSession();

            return {
                success: true,
                message: "Sale recorded successfully",
                data: {
                    inventoryId: inventoryItem._id,
                    productId: inventoryItem.product,
                    quantitySold: quantity,
                    sellingPrice: finalPrice,
                    totalAmount: quantity * finalPrice,
                    newStock: inventoryItem.stock,
                    status: inventoryItem.status,
                    storeSold: inventoryItem.storeSold,
                    storeRevenue: inventoryItem.storeRevenue
                }
            };

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    async transferStock(fromStoreId, toStoreId, inventoryId, quantity, user) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Check source inventory
            const sourceItem = await this.StockInventory.findOne({
                _id: inventoryId,
                store: fromStoreId
            }).session(session);

            if (!sourceItem) throw new Error("Source inventory item not found");
            if (sourceItem.stock < quantity) {
                throw new Error(`Insufficient stock in source. Available: ${sourceItem.stock}`);
            }

            // Get product info
            const product = await this.Product.findById(sourceItem.product).session(session);

            // Update source inventory
            sourceItem.stock -= quantity;
            sourceItem.status = this.calculateStatus(sourceItem.stock, sourceItem.minStock);
            await sourceItem.save({ session });

            // Check destination inventory
            let destItem = await this.StockInventory.findOne({
                store: toStoreId,
                product: sourceItem.product
            }).session(session);

            if (destItem) {
                destItem.stock += quantity;
                destItem.lastRestock = new Date();
                if (destItem.stock > 0) destItem.status = "In Stock";
            } else {
                destItem = new this.StockInventory({
                    store: toStoreId,
                    product: sourceItem.product,
                    stock: quantity,
                    minStock: sourceItem.minStock,
                    storePrice: sourceItem.storePrice || product.price,
                    status: "In Stock",
                    lastRestock: new Date()
                });
            }

            await destItem.save({ session });
            await session.commitTransaction();
            session.endSession();

            return {
                success: true,
                message: `Transferred ${quantity} units from ${fromStoreId} to ${toStoreId}`,
                data: {
                    from: {
                        inventoryId: sourceItem._id,
                        newStock: sourceItem.stock,
                        status: sourceItem.status
                    },
                    to: {
                        inventoryId: destItem._id,
                        newStock: destItem.stock,
                        status: destItem.status
                    },
                    product: {
                        id: product._id,
                        name: product.name,
                        sku: product.sku
                    }
                }
            };

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
}

module.exports = new InventoryOperationsService();