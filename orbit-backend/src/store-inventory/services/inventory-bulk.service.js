// services/inventory/inventory-bulk.service.js
class InventoryBulkService {

    async quickAdd(storeId, items = [], user) {
        console.log('🚀 [SERVICE] quickAdd called!', {
            storeId,
            itemsCount: items.length,
            userId: user?.id,
            timestamp: new Date().toISOString()
        });

        try {
            // Validate items
            if (!items || !Array.isArray(items)) {
                throw new Error("Items must be an array");
            }

            if (items.length === 0) {
                throw new Error("No items provided");
            }

            console.log('🔍 [SERVICE] Starting transaction for quick add');
            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                const results = [];
                const productIds = items.map(item => item.sku);

                console.log('🔍 [SERVICE] Processing SKUs:', productIds);

                // STEP 1: Get all products at once
                const products = await this.Product.find({
                    _id: { $in: productIds }
                }).session(session);

                console.log('🔍 [SERVICE] Found products:', products.length);

                // Create product map
                const productMap = {};
                products.forEach(product => {
                    productMap[product._id.toString()] = product;
                });

                // STEP 2: Get existing inventory
                const existingInventory = await this.StockInventory.find({
                    store: storeId,
                    product: { $in: productIds }
                }).session(session);

                console.log('🔍 [SERVICE] Existing inventory items:', existingInventory.length);

                // Create inventory map
                const inventoryMap = {};
                existingInventory.forEach(item => {
                    inventoryMap[item.product.toString()] = item;
                });

                // STEP 3: Process each item
                for (const item of items) {
                    try {
                        console.log('🔍 [SERVICE] Processing item:', item);

                        const product = productMap[item.sku];
                        if (!product) {
                            throw new Error(`Product ${item.sku} not found`);
                        }

                        const quantity = parseInt(item.quantity) || 1;
                        const productId = item.sku;

                        let inventoryItem = inventoryMap[productId];

                        if (inventoryItem) {
                            // ✅ UPDATE EXISTING INVENTORY ITEM
                            console.log('🔄 [SERVICE] Updating existing inventory item');

                            inventoryItem.stock += quantity;
                            inventoryItem.lastRestock = new Date();
                            inventoryItem.status = this.calculateStatus(
                                inventoryItem.stock,
                                inventoryItem.minStock || 5
                            );

                            await inventoryItem.save({ session });

                            results.push({
                                sku: item.sku,
                                productName: product.name,
                                action: 'updated',
                                newStock: inventoryItem.stock,
                                inventoryId: inventoryItem._id,
                                message: `Updated stock to ${inventoryItem.stock}`
                            });
                        } else {
                            // ✅ CREATE NEW INVENTORY ITEM
                            console.log('🆕 [SERVICE] Creating new inventory item');

                            inventoryItem = new this.StockInventory({
                                store: storeId,
                                product: productId,
                                stock: quantity,
                                minStock: 5,
                                storePrice: product.price,
                                status: quantity > 0 ? "In Stock" : "Out of Stock",
                                lastRestock: new Date()
                            });

                            await inventoryItem.save({ session });

                            results.push({
                                sku: item.sku,
                                productName: product.name,
                                action: 'added',
                                stock: inventoryItem.stock,
                                inventoryId: inventoryItem._id,
                                message: `Added to inventory with ${inventoryItem.stock} units`
                            });
                        }

                        console.log('✅ [SERVICE] Item processed successfully');

                    } catch (itemError) {
                        console.error('❌ [SERVICE] Error processing item:', itemError.message);

                        results.push({
                            sku: item.sku,
                            action: 'failed',
                            error: itemError.message,
                            message: `Failed: ${itemError.message}`
                        });
                    }
                }

                console.log('🔍 [SERVICE] Committing transaction');
                await session.commitTransaction();
                session.endSession();

                // Calculate summary
                const successCount = results.filter(r => r.action !== 'failed').length;
                const failCount = results.filter(r => r.action === 'failed').length;
                const addedCount = results.filter(r => r.action === 'added').length;
                const updatedCount = results.filter(r => r.action === 'updated').length;

                console.log('✅ [SERVICE] Quick add completed:', {
                    successCount,
                    failCount,
                    addedCount,
                    updatedCount
                });

                return {
                    success: true,
                    message: `Quick add completed: ${successCount} successful (${addedCount} added, ${updatedCount} updated), ${failCount} failed`,
                    data: {
                        results,
                        summary: {
                            totalItems: items.length,
                            added: addedCount,
                            updated: updatedCount,
                            failed: failCount,
                            storeId: storeId
                        }
                    }
                };

            } catch (transactionError) {
                console.error('❌ [SERVICE] Transaction error:', transactionError);
                await session.abortTransaction();
                session.endSession();
                throw transactionError;
            }

        } catch (error) {
            console.error('💥 [SERVICE] Error in quickAdd:', {
                error: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            throw error;
        }
    }

    /**
     * Bulk update inventory items
     */
    async bulkUpdate(storeId, updates = [], user) {
        console.log('📦 [SERVICE] bulkUpdate called:', {
            storeId,
            updatesCount: updates.length,
            timestamp: new Date().toISOString()
        });

        const results = [];
        const errors = [];

        for (const update of updates) {
            try {
                let result;

                if (update.action === 'add' && update.productId) {
                    const inventoryCRUD = require('./inventory-crud.service');
                    result = await inventoryCRUD.addToInventory(
                        storeId,
                        update.productId,
                        { stock: update.stock || 0, minStock: update.minStock || 5, price: update.price },
                        user
                    );
                } else if (update.action === 'update' && update.inventoryId) {
                    const inventoryCRUD = require('./inventory-crud.service');
                    result = await inventoryCRUD.updateInventoryItem(
                        update.inventoryId,
                        { stock: update.stock, minStock: update.minStock, storePrice: update.price },
                        user
                    );
                } else if (update.action === 'remove' && update.inventoryId) {
                    const inventoryCRUD = require('./inventory-crud.service');
                    result = await inventoryCRUD.removeFromInventory(update.inventoryId, user);
                } else {
                    throw new Error(`Invalid action or missing required fields: ${JSON.stringify(update)}`);
                }

                results.push({
                    ...update,
                    success: true,
                    message: result.message || 'Operation successful'
                });

            } catch (error) {
                errors.push({
                    ...update,
                    success: false,
                    error: error.message
                });
            }
        }

        return {
            success: true,
            message: `Bulk update completed: ${results.length} successful, ${errors.length} failed`,
            data: {
                successful: results,
                failed: errors,
                summary: {
                    totalProcessed: updates.length,
                    successCount: results.length,
                    failCount: errors.length,
                    successRate: updates.length > 0 ? ((results.length / updates.length) * 100).toFixed(2) + '%' : '0%'
                }
            }
        };
    }
}

module.exports = new InventoryBulkService();