// controllers/storeInventoryController.js
const StoreInventory = require("./store-inventory.model");
const Store = require("../stores/store.model");
const Product = require("../products/products.model");
const mongoose = require("mongoose");

// Get store inventory with filtering
exports.getStoreInventory = async (req, res) => {
  const { storeId } = req.params;
  const {
    search,
    category,
    lowStock,
    outOfStock,
    page = 1,
    limit = 20,
    sortBy = "product.name",
    sortOrder = "asc",
  } = req.query;

  // Validate store exists
  const store = await Store.findById(storeId);
  if (!store) {
    return res.status(404).json({ error: "Store not found" });
  }

  // Build query
  let query = { store: storeId };

  // Search in product fields
  if (search) {
    const productIds = await Product.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ],
    }).select("_id");

    query.product = { $in: productIds.map((p) => p._id) };
  }

  // Category filter
  if (category) {
    const productIds = await Product.find({ category }).select("_id");
    query.product = query.product || {};
    query.product.$in = productIds.map((p) => p._id);
  }

  // Stock status filters
  if (lowStock === "true") {
    query.stock = { $lte: "$minStock" };
  }
  if (outOfStock === "true") {
    query.stock = 0;
  }

  // Execute query with pagination
  const skip = (page - 1) * limit;
  const inventoryItems = await StoreInventory.find(query)
    .populate("product", "name sku price brand category images")
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
    .lean();

  // Add virtual fields
  const enrichedItems = inventoryItems.map((item) => {
    const productValue = item.product ? item.product.price * item.stock : 0;
    return {
      ...item,
      totalValue: productValue,
      needsRestock: item.stock <= item.minStock,
      outOfStock: item.stock === 0,
      profitPerUnit: item.product
        ? item.product.price - (item.product.costPrice || 0)
        : 0,
    };
  });

  // Get total count for pagination
  const total = await StoreInventory.countDocuments(query);

  res.json({
    success: true,
    data: enrichedItems,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
};

// Get inventory statistics
exports.getInventoryStats = async (req, res) => {
  const { storeId } = req.params;

  const stats = await StoreInventory.aggregate([
    { $match: { store: new mongoose.Types.ObjectId(storeId) } },
    {
      $lookup: {
        from: "products",
        localField: "product",
        foreignField: "_id",
        as: "productData",
      },
    },
    { $unwind: "$productData" },
    {
      $group: {
        _id: null,
        totalItems: { $sum: 1 },
        totalStock: { $sum: "$stock" },
        totalValue: { $sum: { $multiply: ["$stock", "$productData.price"] } },
        lowStockItems: {
          $sum: { $cond: [{ $lte: ["$stock", "$minStock"] }, 1, 0] },
        },
        outOfStockItems: { $sum: { $cond: [{ $eq: ["$stock", 0] }, 1, 0] } },
        totalSold: { $sum: "$storeSold" },
        totalRevenue: { $sum: "$storeRevenue" },
      },
    },
    {
      $project: {
        _id: 0,
        totalItems: 1,
        totalStock: 1,
        totalValue: { $round: ["$totalValue", 2] },
        lowStockItems: 1,
        outOfStockItems: 1,
        totalSold: 1,
        totalRevenue: { $round: ["$totalRevenue", 2] },
      },
    },
  ]);

  res.json({
    success: true,
    data: stats[0] || {
      totalItems: 0,
      totalStock: 0,
      totalValue: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
      totalSold: 0,
      totalRevenue: 0,
    },
  });
};

// Get low stock alerts
exports.getLowStockAlerts = async (req, res) => {
  const { storeId } = req.params;
  const { limit = 20 } = req.query;

  const alerts = await StoreInventory.find({
    store: storeId,
    stock: { $lte: "$minStock" },
    stock: { $gt: 0 }, // Not out of stock
  })
    .populate("product", "name sku category brand price images")
    .limit(parseInt(limit))
    .sort({ stock: 1 })
    .lean();

  res.json({
    success: true,
    data: alerts,
  });
};

// Delete inventory item(s)
exports.deleteInventory = async (req, res) => {
  const { storeId } = req.params;
  const { inventoryIds, force = false } = req.body;

  try {
    // Validate store exists
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        error: "Store not found",
      });
    }

    // Handle single delete from params
    if (req.params.inventoryId) {
      const inventoryId = req.params.inventoryId;

      const inventoryItem = await StoreInventory.findOne({
        _id: inventoryId,
        store: storeId,
      });

      if (!inventoryItem) {
        return res.status(404).json({
          success: false,
          error: "Inventory item not found",
        });
      }

      // Check if item has stock before deleting
      if (inventoryItem.stock > 0 && !force) {
        return res.status(400).json({
          success: false,
          error:
            "Cannot delete item with existing stock. Use force=true to override, or adjust stock to 0 first.",
          currentStock: inventoryItem.stock,
          productName: inventoryItem.product?.name || "Unknown",
        });
      }

      await inventoryItem.deleteOne();

      return res.json({
        success: true,
        message: "Inventory item deleted successfully",
        data: {
          deletedId: inventoryId,
          productName: inventoryItem.product?.name,
        },
      });
    }

    // Handle bulk delete
    if (
      !inventoryIds ||
      !Array.isArray(inventoryIds) ||
      inventoryIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        error: "inventoryIds array is required",
      });
    }

    const results = [];
    const errors = [];
    let deletedCount = 0;

    for (const inventoryId of inventoryIds) {
      try {
        const inventoryItem = await StoreInventory.findOne({
          _id: inventoryId,
          store: storeId,
        }).populate("product", "name sku");

        if (!inventoryItem) {
          errors.push({
            inventoryId,
            error: "Inventory item not found",
          });
          continue;
        }

        // Check stock if not force delete
        if (inventoryItem.stock > 0 && !force) {
          errors.push({
            inventoryId,
            error: "Item has existing stock",
            currentStock: inventoryItem.stock,
            productName: inventoryItem.product?.name,
          });
          continue;
        }

        await inventoryItem.deleteOne();
        deletedCount++;

        results.push({
          inventoryId,
          success: true,
          productName: inventoryItem.product?.name,
          sku: inventoryItem.product?.sku,
        });
      } catch (itemError) {
        errors.push({
          inventoryId,
          error: itemError.message,
        });
      }
    }

    res.json({
      success: true,
      message: `Deleted ${deletedCount} inventory items, ${errors.length} failed`,
      summary: {
        total: inventoryIds.length,
        deleted: deletedCount,
        failed: errors.length,
      },
      data: {
        results,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    console.error("Delete inventory error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete inventory items",
      details: error.message,
    });
  }
};

// Delete all inventory from store (danger zone)
exports.clearStoreInventory = async (req, res) => {
  const { storeId } = req.params;
  const { confirmation, force = false } = req.body;

  try {
    // Validate store
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        error: "Store not found",
      });
    }

    // Require confirmation for safety
    if (confirmation !== `CLEAR-STORE-${storeId}` && !force) {
      return res.status(400).json({
        success: false,
        error:
          "Confirmation required. Send confirmation: `CLEAR-STORE-${storeId}`",
        hint: "This will delete ALL inventory items from this store",
      });
    }

    // Count items to delete
    const itemCount = await StoreInventory.countDocuments({ store: storeId });

    if (itemCount === 0) {
      return res.json({
        success: true,
        message: "Store inventory is already empty",
        data: { deletedCount: 0 },
      });
    }

    // Check for items with stock
    const itemsWithStock = await StoreInventory.find({
      store: storeId,
      stock: { $gt: 0 },
    }).populate("product", "name");

    if (itemsWithStock.length > 0 && !force) {
      return res.status(400).json({
        success: false,
        error: "Cannot clear inventory: Some items still have stock",
        itemsWithStock: itemsWithStock.map((item) => ({
          productName: item.product?.name,
          currentStock: item.stock,
        })),
        hint: "Use force=true to override or adjust stock to 0 first",
      });
    }

    // Perform deletion
    const result = await StoreInventory.deleteMany({ store: storeId });

    res.json({
      success: true,
      message: `Successfully cleared ${result.deletedCount} inventory items from store`,
      data: {
        deletedCount: result.deletedCount,
        storeId,
        storeName: store.name,
      },
    });
  } catch (error) {
    console.error("Clear inventory error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to clear store inventory",
      details: error.message,
    });
  }
};

// Get products available to add (not in inventory)
exports.getAvailableProducts = async (req, res) => {
  const { storeId } = req.params;
  const { search, category, page = 1, limit = 20 } = req.query;

  // Get products already in inventory
  const existingItems = await StoreInventory.find({ store: storeId }).select(
    "product",
  );
  const existingProductIds = existingItems.map((item) => item.product);

  // Build query for available products
  let query = {
    _id: { $nin: existingProductIds },
    status: { $ne: "inactive" },
  };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { sku: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
    ];
  }

  if (category) {
    query.category = category;
  }

  const skip = (page - 1) * limit;
  const products = await Product.find(query)
    .select("name sku price brand category stock costPrice images status")
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ name: 1 });

  const total = await Product.countDocuments(query);

  res.json({
    success: true,
    data: products,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
};

// Add product to store inventory
exports.addToInventory = async (req, res) => {
  const { storeId } = req.params;
  const { productId, stock = 0, minStock = 5 } = req.body;

  // Validate store
  const store = await Store.findById(storeId);
  if (!store) {
    return res.status(404).json({ error: "Store not found" });
  }

  // Validate product
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  // Check if already in inventory
  const existing = await StoreInventory.findOne({
    store: storeId,
    product: productId,
  });
  if (existing) {
    return res
      .status(400)
      .json({ error: "Product already exists in inventory" });
  }

  // Create inventory item
  const inventoryItem = new StoreInventory({
    store: storeId,
    product: productId,
    stock,
    minStock,
    status:
      stock > 0
        ? stock <= minStock
          ? "Low Stock"
          : "In Stock"
        : "Out of Stock",
  });

  await inventoryItem.save();
  await inventoryItem.populate(
    "product",
    "name sku price brand category images",
  );

  res.status(201).json({
    success: true,
    message: "Product added to inventory successfully",
    data: inventoryItem,
  });
};

// Quick add by SKU
exports.quickAddToInventory = async (req, res) => {
  const { storeId } = req.params;
  const { sku, quantity = 1 } = req.body;

  if (!sku) {
    return res.status(400).json({ error: "SKU is required" });
  }

  // Find product by SKU
  const product = await Product.findOne({ sku: sku.trim().toUpperCase() });
  if (!product) {
    return res.status(404).json({ error: `Product with SKU ${sku} not found` });
  }

  // Check if already in inventory
  let inventoryItem = await StoreInventory.findOne({
    store: storeId,
    product: product._id,
  });

  if (inventoryItem) {
    // Update existing
    inventoryItem.stock += parseInt(quantity);
    inventoryItem.lastRestock = new Date();
    await inventoryItem.save();
  } else {
    // Create new
    inventoryItem = new StoreInventory({
      store: storeId,
      product: product._id,
      stock: parseInt(quantity),
      status: quantity > 0 ? "In Stock" : "Out of Stock",
    });
    await inventoryItem.save();
  }

  await inventoryItem.populate(
    "product",
    "name sku price brand category images",
  );

  res.json({
    success: true,
    message:
      inventoryItem.stock > 0
        ? "Product added to inventory"
        : "Product added (out of stock)",
    data: inventoryItem,
  });
};

// Bulk update inventory
exports.bulkUpdateInventory = async (req, res) => {
  const { storeId } = req.params;
  const { updates } = req.body;

  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({ error: "Updates array is required" });
  }

  const results = [];
  const errors = [];

  for (const update of updates) {
    try {
      const { productId, stock, minStock } = update;

      let inventoryItem = await StoreInventory.findOne({
        store: storeId,
        product: productId,
      });

      if (inventoryItem) {
        // Update existing
        if (stock !== undefined) inventoryItem.stock = stock;
        if (minStock !== undefined) inventoryItem.minStock = minStock;
        await inventoryItem.save();
        results.push({
          productId,
          action: "updated",
          inventoryId: inventoryItem._id,
        });
      } else {
        // Create new
        inventoryItem = new StoreInventory({
          store: storeId,
          product: productId,
          stock: stock || 0,
          minStock: minStock || 5,
        });
        await inventoryItem.save();
        results.push({
          productId,
          action: "created",
          inventoryId: inventoryItem._id,
        });
      }
    } catch (err) {
      errors.push({
        productId: update.productId,
        error: err.message,
      });
    }
  }

  res.json({
    success: true,
    message: `Processed ${results.length} items, ${errors.length} errors`,
    data: { results, errors },
  });
};

// Get specific inventory item
exports.getInventoryItem = async (req, res) => {
  const { inventoryId } = req.params;

  const inventoryItem = await StoreInventory.findById(inventoryId)
    .populate("product")
    .populate("store", "name code");

  if (!inventoryItem) {
    return res.status(404).json({ error: "Inventory item not found" });
  }

  res.json({
    success: true,
    data: inventoryItem,
  });
};

// Update inventory item
exports.updateInventoryItem = async (req, res) => {
  const { inventoryId } = req.params;
  const updateData = req.body;

  const inventoryItem = await StoreInventory.findById(inventoryId);
  if (!inventoryItem) {
    return res.status(404).json({ error: "Inventory item not found" });
  }

  // Update fields
  Object.keys(updateData).forEach((key) => {
    if (key !== "_id" && key !== "store" && key !== "product") {
      inventoryItem[key] = updateData[key];
    }
  });

  await inventoryItem.save();
  await inventoryItem.populate(
    "product",
    "name sku price brand category images",
  );

  res.json({
    success: true,
    message: "Inventory item updated successfully",
    data: inventoryItem,
  });
};

// Remove product from inventory
exports.removeFromInventory = async (req, res) => {
  const { inventoryId } = req.params;

  const inventoryItem = await StoreInventory.findByIdAndDelete(inventoryId);
  if (!inventoryItem) {
    return res.status(404).json({ error: "Inventory item not found" });
  }

  res.json({
    success: true,
    message: "Product removed from inventory",
  });
};

// Restock product - Fixed to work with middleware
exports.restockProduct = async (req, res) => {
  const { inventoryId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity <= 0) {
    return res.status(400).json({ error: "Valid quantity is required" });
  }

  try {
    // First, find the inventory item to get the store ID
    const inventoryItem = await StoreInventory.findById(inventoryId).populate(
      "product",
      "name sku price stock minStock",
    );

    if (!inventoryItem) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    // Get store ID from the inventory item
    const storeId = inventoryItem.store;

    // ⭐⭐⭐ CRITICAL: Manually check permissions since middleware failed ⭐⭐⭐
    // Check if user has access to this store
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Simple permission check - you might need to adjust this
    // Check if user is superadmin or store manager
    const canManage =
      user.role === "superadmin" ||
      (user.managedStores && user.managedStores.includes(storeId));

    if (!canManage) {
      return res.status(403).json({
        error: "You don't have permission to manage this store's inventory",
      });
    }

    // Rest of your restock logic...
    if (!inventoryItem.product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if enough stock in Product model
    if (inventoryItem.product.stock < quantity) {
      return res.status(400).json({
        error: `Insufficient global stock. Available: ${inventoryItem.product.stock}`,
        available: inventoryItem.product.stock,
      });
    }

    // Update Product model stock (reduce)
    const product = await Product.findById(inventoryItem.product._id);
    product.stock -= parseInt(quantity);
    product.lastRestock = new Date();

    if (product.stock === 0) {
      product.status = "Out of Stock";
    } else if (product.stock <= product.minStock) {
      product.status = "Low Stock";
    }

    await product.save();

    // Update StoreInventory stock (add)
    inventoryItem.stock += parseInt(quantity);
    inventoryItem.lastRestock = new Date();
    await inventoryItem.save();

    await inventoryItem.populate("product", "name sku price");

    res.json({
      success: true,
      message: `Transferred ${quantity} units from global to store inventory`,
      data: {
        newStock: inventoryItem.stock,
        product: inventoryItem.product.name,
        sku: inventoryItem.product.sku,
        globalStockRemaining: product.stock,
        globalStatus: product.status,
      },
    });
  } catch (error) {
    console.error("Restock error:", error);
    res.status(500).json({
      error: "Failed to restock product",
      details: error.message,
    });
  }
};
// Record sale
exports.recordSale = async (req, res) => {
  const { inventoryId } = req.params;
  const { quantity, sellingPrice, customerName, note } = req.body;

  if (!quantity || quantity <= 0) {
    return res.status(400).json({ error: "Valid quantity is required" });
  }

  const inventoryItem =
    await StoreInventory.findById(inventoryId).populate("product");

  if (!inventoryItem) {
    return res.status(404).json({ error: "Inventory item not found" });
  }

  // Check stock availability
  if (inventoryItem.stock < quantity) {
    return res.status(400).json({
      error: `Insufficient stock. Available: ${inventoryItem.stock}`,
    });
  }

  const price = sellingPrice || inventoryItem.product.price;

  // Update inventory
  inventoryItem.stock -= quantity;
  inventoryItem.storeSold += quantity;
  inventoryItem.storeRevenue += quantity * price;
  await inventoryItem.save();

  // Also update main product stats
  await Product.findByIdAndUpdate(inventoryItem.product._id, {
    $inc: {
      totalSold: quantity,
      totalRevenue: quantity * price,
      stock: -quantity,
    },
  });

  res.json({
    success: true,
    message: `Sale recorded for ${quantity} units`,
    data: {
      product: inventoryItem.product.name,
      quantity,
      total: quantity * price,
      newStock: inventoryItem.stock,
    },
  });
};

// Adjust stock
exports.adjustStock = async (req, res) => {
  const { inventoryId } = req.params;
  const { quantity, reason, note } = req.body;

  if (!quantity) {
    return res.status(400).json({ error: "Quantity is required" });
  }

  const inventoryItem =
    await StoreInventory.findById(inventoryId).populate("product");

  if (!inventoryItem) {
    return res.status(404).json({ error: "Inventory item not found" });
  }

  const newStock = inventoryItem.stock + parseInt(quantity);

  if (newStock < 0) {
    return res.status(400).json({
      error: `Cannot adjust below 0. Current stock: ${inventoryItem.stock}`,
    });
  }

  inventoryItem.stock = newStock;
  await inventoryItem.save();

  res.json({
    success: true,
    message: `Stock adjusted by ${quantity > 0 ? "+" : ""}${quantity}`,
    data: {
      product: inventoryItem.product.name,
      adjustment: quantity,
      newStock,
      reason,
    },
  });
};

// Transfer stock between stores
exports.transferStock = async (req, res) => {
  const { inventoryId, toStoreId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity <= 0) {
    return res.status(400).json({ error: "Valid quantity is required" });
  }

  // Validate stores
  const fromStore =
    await StoreInventory.findById(inventoryId).populate("product");
  const toStore = await Store.findById(toStoreId);

  if (!fromStore) {
    return res.status(404).json({ error: "Source inventory not found" });
  }
  if (!toStore) {
    return res.status(404).json({ error: "Destination store not found" });
  }

  // Check availability
  if (fromStore.stock < quantity) {
    return res.status(400).json({
      error: `Insufficient stock. Available: ${fromStore.stock}`,
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  // Deduct from source
  fromStore.stock -= quantity;
  await fromStore.save({ session });

  // Add to destination
  let toInventory = await StoreInventory.findOne({
    store: toStoreId,
    product: fromStore.product._id,
  }).session(session);

  if (toInventory) {
    toInventory.stock += quantity;
    toInventory.lastRestock = new Date();
  } else {
    toInventory = new StoreInventory({
      store: toStoreId,
      product: fromStore.product._id,
      stock: quantity,
      status: "In Stock",
    });
  }

  await toInventory.save({ session });
  await session.commitTransaction();
  session.endSession();

  res.json({
    success: true,
    message: `Transferred ${quantity} units to ${toStore.name}`,
    data: {
      product: fromStore.product.name,
      quantity,
      fromStore: fromStore.store,
      toStore: toStoreId,
      newSourceStock: fromStore.stock,
    },
  });
};

// Get stock transfer history
exports.getTransferHistory = async (req, res) => {
  const { storeId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  res.json({
    success: true,
    data: [],
    message: "Transfer history endpoint - implement Transfer model",
  });
};

// Get inventory history
exports.getInventoryHistory = async (req, res) => {
  const { storeId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  res.json({
    success: true,
    data: [],
    message: "Inventory history endpoint - implement History model",
  });
};

// Generate inventory report
exports.generateInventoryReport = async (req, res) => {
  const { storeId } = req.params;
  const { format = "json", startDate, endDate } = req.query;

  // Get inventory data
  const inventoryItems = await StoreInventory.find({ store: storeId })
    .populate("product", "name sku category brand price costPrice")
    .lean();

  // Format data
  const reportData = inventoryItems.map((item) => ({
    product: item.product?.name || "N/A",
    sku: item.product?.sku || "N/A",
    category: item.product?.category || "N/A",
    brand: item.product?.brand || "N/A",
    stock: item.stock,
    minStock: item.minStock,
    price: item.product?.price || 0,
    costPrice: item.product?.costPrice || 0,
    value: (item.product?.price || 0) * item.stock,
    status: item.status,
    sold: item.storeSold,
    revenue: item.storeRevenue,
    lastRestock: item.lastRestock,
  }));

  if (format === "csv") {
    // Generate CSV
    const headers = Object.keys(reportData[0] || {}).join(",");
    const rows = reportData.map((item) =>
      Object.values(item)
        .map((val) =>
          typeof val === "string" ? `"${val.replace(/"/g, '""')}"` : val,
        )
        .join(","),
    );
    const csv = [headers, ...rows].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="inventory-report-${storeId}-${new Date().toISOString().split("T")[0]}.csv"`,
    );
    return res.send(csv);
  }

  // Default JSON response
  res.json({
    success: true,
    data: reportData,
    generatedAt: new Date(),
    storeId,
  });
};

// Batch update
exports.batchUpdate = async (req, res) => {
  const { storeId } = req.params;
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Items array is required" });
  }

  const results = [];
  const errors = [];

  for (const item of items) {
    try {
      const { inventoryId, stock, minStock } = item;

      const inventoryItem = await StoreInventory.findOne({
        _id: inventoryId,
        store: storeId,
      });

      if (!inventoryItem) {
        throw new Error(
          "Inventory item not found or doesn't belong to this store",
        );
      }

      if (stock !== undefined) inventoryItem.stock = stock;
      if (minStock !== undefined) inventoryItem.minStock = minStock;

      await inventoryItem.save();
      results.push({ inventoryId, success: true });
    } catch (err) {
      errors.push({
        item,
        error: err.message,
      });
    }
  }

  res.json({
    success: true,
    message: `Batch update completed: ${results.length} successful, ${errors.length} failed`,
    data: { results, errors },
  });
};

// Import from CSV/Excel
exports.importToInventory = async (req, res) => {
  const { storeId } = req.params;
  const { importData } = req.body;

  res.json({
    success: true,
    message: "Import endpoint - implement CSV/Excel parsing",
    data: { importData },
  });
};

// Unified add or update inventory
exports.addOrUpdateInventory = async (req, res) => {
  const { storeId } = req.params;
  const { items, operation = "add" } = req.body; // "add" or "update"

  // Validate store
  const store = await Store.findById(storeId);
  if (!store) {
    return res.status(404).json({ error: "Store not found" });
  }

  // Check if it's single item or bulk
  const isBulk = Array.isArray(items) && items.length > 1;

  if (isBulk) {
    // Bulk operation
    return await handleBulkInventory(storeId, items, operation, res);
  } else {
    // Single operation
    return await handleSingleInventory(storeId, items, operation, res);
  }
};

// Handle single inventory item
const handleSingleInventory = async (storeId, itemData, operation, res) => {
  const { productId, sku, quantity = 1, minStock = 5, price } = itemData;

  // Find product by either ID or SKU
  let product;
  if (productId) {
    product = await Product.findById(productId);
  } else if (sku) {
    product = await Product.findOne({ sku: sku.trim().toUpperCase() });
  }

  if (!product) {
    return res.status(404).json({
      error: "Product not found",
      provided: productId ? `ID: ${productId}` : `SKU: ${sku}`,
    });
  }

  // Find existing inventory item
  let inventoryItem = await StoreInventory.findOne({
    store: storeId,
    product: product._id,
  });

  if (inventoryItem) {
    // Update existing
    if (operation === "add") {
      inventoryItem.stock += parseInt(quantity);
    } else if (operation === "update") {
      inventoryItem.stock = parseInt(quantity);
    }

    if (minStock !== undefined) inventoryItem.minStock = minStock;
    if (price !== undefined) inventoryItem.storePrice = price;

    inventoryItem.lastRestock = new Date();
  } else {
    // Create new
    inventoryItem = new StoreInventory({
      store: storeId,
      product: product._id,
      stock: parseInt(quantity),
      minStock,
      storePrice: price || product.price,
      status: quantity > 0 ? "In Stock" : "Out of Stock",
    });
  }

  // Calculate status
  if (inventoryItem.stock === 0) {
    inventoryItem.status = "Out of Stock";
  } else if (inventoryItem.stock <= inventoryItem.minStock) {
    inventoryItem.status = "Low Stock";
  } else {
    inventoryItem.status = "In Stock";
  }

  await inventoryItem.save();
  await inventoryItem.populate(
    "product",
    "name sku price brand category images",
  );

  res.json({
    success: true,
    message: `Product ${inventoryItem.product.name} ${operation === "add" ? "added to" : "updated in"} inventory`,
    data: inventoryItem,
    operation: operation,
    isBulk: false,
  });
};

// Handle bulk inventory operations
const handleBulkInventory = async (storeId, items, operation, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const results = [];
  const errors = [];
  let totalAdded = 0;
  let totalUpdated = 0;

  for (const [index, item] of items.entries()) {
    try {
      const { productId, sku, quantity = 1, minStock = 5, price } = item;

      // Find product
      let product;
      if (productId) {
        product = await Product.findById(productId).session(session);
      } else if (sku) {
        product = await Product.findOne({
          sku: sku.trim().toUpperCase(),
        }).session(session);
      }

      if (!product) {
        errors.push({
          index,
          item,
          error: `Product not found: ${productId ? `ID: ${productId}` : `SKU: ${sku}`}`,
        });
        continue;
      }

      // Find existing inventory item
      let inventoryItem = await StoreInventory.findOne({
        store: storeId,
        product: product._id,
      }).session(session);

      if (inventoryItem) {
        // Update existing
        if (operation === "add") {
          inventoryItem.stock += parseInt(quantity);
        } else if (operation === "update") {
          inventoryItem.stock = parseInt(quantity);
        }

        if (minStock !== undefined) inventoryItem.minStock = minStock;
        if (price !== undefined) inventoryItem.storePrice = price;

        inventoryItem.lastRestock = new Date();
        totalUpdated++;
      } else {
        // Create new
        inventoryItem = new StoreInventory({
          store: storeId,
          product: product._id,
          stock: parseInt(quantity),
          minStock,
          storePrice: price || product.price,
          status: quantity > 0 ? "In Stock" : "Out of Stock",
        });
        totalAdded++;
      }

      // Calculate status
      if (inventoryItem.stock === 0) {
        inventoryItem.status = "Out of Stock";
      } else if (inventoryItem.stock <= inventoryItem.minStock) {
        inventoryItem.status = "Low Stock";
      } else {
        inventoryItem.status = "In Stock";
      }

      await inventoryItem.save({ session });
      await inventoryItem.populate("product", "name sku price brand category");

      results.push({
        index,
        success: true,
        productId: product._id,
        sku: product.sku,
        productName: product.name,
        operation: inventoryItem.isNew ? "created" : "updated",
        stock: inventoryItem.stock,
        status: inventoryItem.status,
      });
    } catch (itemError) {
      errors.push({
        index,
        item,
        error: itemError.message,
      });
    }
  }

  await session.commitTransaction();
  session.endSession();

  res.json({
    success: true,
    message: `Bulk operation completed: ${totalAdded} added, ${totalUpdated} updated, ${errors.length} failed`,
    summary: {
      totalProcessed: items.length,
      successful: results.length,
      failed: errors.length,
      added: totalAdded,
      updated: totalUpdated,
    },
    results,
    errors: errors.length > 0 ? errors : undefined,
    operation,
    isBulk: true,
  });
};

// Quick add by SKU

// Quick add by SKU
exports.quickAddBySku = async (req, res) => {
  const { storeId } = req.params;
  const { sku, quantity = 1 } = req.body;

  if (!sku) {
    return res.status(400).json({ error: "SKU is required" });
  }

  // Find product by SKU
  const product = await Product.findOne({ sku: sku.trim().toUpperCase() });
  if (!product) {
    return res
      .status(404)
      .json({ error: `Product with SKU "${sku}" not found` });
  }

  // Check if there's enough stock in products model
  if (product.stock < quantity) {
    return res.status(400).json({
      error: `Insufficient stock. Only ${product.stock} units available`,
      available: product.stock,
      requested: quantity,
    });
  }

  // Find or create inventory item
  let inventoryItem = await StoreInventory.findOne({
    store: storeId,
    product: product._id,
  });

  if (inventoryItem) {
    inventoryItem.stock += parseInt(quantity);
    inventoryItem.lastRestock = new Date();
  } else {
    inventoryItem = new StoreInventory({
      store: storeId,
      product: product._id,
      stock: parseInt(quantity),
      status: quantity > 0 ? "In Stock" : "Out of Stock",
      minStock: product.minStock || 5, // Copy minStock from product
    });
  }

  // Update status
  if (inventoryItem.stock === 0) {
    inventoryItem.status = "Out of Stock";
  } else if (inventoryItem.stock <= inventoryItem.minStock) {
    inventoryItem.status = "Low Stock";
  } else {
    inventoryItem.status = "In Stock";
  }

  // ⭐⭐⭐ REDUCE STOCK FROM PRODUCTS MODEL ⭐⭐⭐
  // Update the global product stock
  product.stock -= parseInt(quantity);

  // Update global product status
  if (product.stock === 0) {
    product.status = "Out of Stock";
  } else if (product.stock <= product.minStock) {
    product.status = "Low Stock";
  } else {
    product.status = "In Stock";
  }

  // Save both models
  await inventoryItem.save();
  await product.save(); // Save the updated product with reduced stock

  await inventoryItem.populate(
    "product",
    "name sku price brand category images",
  );

  res.json({
    success: true,
    message: `Added ${quantity} units of "${inventoryItem.product.name}" to store inventory`,
    data: {
      inventoryItem,
      globalStockRemaining: product.stock,
      globalStatus: product.status,
    },
  });
};
