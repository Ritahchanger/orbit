// services/store.service.js
const Store = require("./store.model");
const User = require("../user/user.model");
const Product = require("../products/products.model");
const StoreInventory = require("../store-inventory/store-inventory.model");

class StoreService {
  /**
   * Get all stores (with optional filtering)
   */
  async getAllStores(user, filters = {}) {
    let query = { ...filters };

    // Non-superadmins can only see their assigned stores
    if (user.role !== "superadmin" && !user.canAccessAllStores) {
      if (user.assignedStore) {
        query._id = user.assignedStore;
      } else {
        // If user has no assigned store, return empty
        return { success: true, data: [], count: 0 };
      }
    }

    const stores = await Store.find(query)
      .populate("manager", "firstName lastName email phoneNo")
      .sort({ name: 1 });

    return {
      success: true,
      count: stores.length,
      data: stores,
    };
  }

  /**
   * Get single store by ID with access control
   */
  async getStoreById(storeId, user) {
    const store = await Store.findById(storeId).populate(
      "manager",
      "firstName lastName email phoneNo",
    );

    if (!store) {
      throw new Error("Store not found");
    }

    // Check access permissions
    if (!this.canUserAccessStore(user, store._id)) {
      throw new Error("Not authorized to access this store");
    }

    return {
      success: true,
      data: store,
    };
  }

  /**
   * Create new store (superadmin only)
   */
  async createStore(storeData, user) {
    // Only superadmin can create stores
    if (user.role !== "superadmin") {
      throw new Error("Only superadmin can create stores");
    }

    // Check if store code already exists
    const existingStore = await Store.findOne({ code: storeData.code });
    if (existingStore) {
      throw new Error("Store code already exists");
    }

    const store = await Store.create(storeData);

    return {
      success: true,
      message: "Store created successfully",
      data: store,
    };
  }

  /**
   * Update store with access control
   */
  async updateStore(storeId, updateData, user) {
    console.log("🔍 updateStore called with:");
    console.log("storeId:", storeId);
    console.log("updateData:", JSON.stringify(updateData, null, 2));
    console.log("updateData keys:", Object.keys(updateData));
    const store = await Store.findById(storeId);

    if (!store) {
      throw new Error("Store not found");
    }

    // Check permissions
    if (!this.canUserManageStore(user, store)) {
      throw new Error("Not authorized to update this store");
    }

    // If updating code, check for duplicates
    if (updateData.code && updateData.code !== store.code) {
      const existingCode = await Store.findOne({
        code: updateData.code,
        _id: { $ne: storeId },
      });
      if (existingCode) {
        throw new Error("Store code already exists");
      }
    }

    const updatedStore = await Store.findByIdAndUpdate(storeId, updateData, {
      new: true,
      runValidators: true,
    }).populate("manager", "firstName lastName email phoneNo");

    return {
      success: true,
      message: "Store updated successfully",
      data: updatedStore,
    };
  }

  /**
   * Delete store (superadmin only)
   */
  async deleteStore(storeId, user) {
    if (user.role !== "superadmin") {
      throw new Error("Only superadmin can delete stores");
    }

    const store = await Store.findById(storeId);
    if (!store) {
      throw new Error("Store not found");
    }

    // Check if store has associated data
    const userCount = await User.countDocuments({ assignedStore: storeId });
    if (userCount > 0) {
      throw new Error(
        "Cannot delete store with assigned users. Reassign users first.",
      );
    }

    // Check if store has inventory items
    const inventoryCount = await StoreInventory.countDocuments({
      store: storeId,
    });
    if (inventoryCount > 0) {
      throw new Error(
        "Cannot delete store with inventory items. Clear inventory first.",
      );
    }

    await Store.findByIdAndDelete(storeId);

    return {
      success: true,
      message: "Store deleted successfully",
    };
  }

  /**
   * Get store statistics using StoreInventory instead of Product
   */
  async getStoreStats(storeId, user) {
    const store = await Store.findById(storeId);
    if (!store) {
      throw new Error("Store not found");
    }

    if (!this.canUserAccessStore(user, store._id)) {
      throw new Error("Not authorized to access this store");
    }

    // Get store inventory stats
    const inventoryStats = await StoreInventory.aggregate([
      { $match: { store: store._id } },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalStock: { $sum: "$stock" },
          totalValue: {
            $sum: {
              $multiply: [
                "$stock",
                { $ifNull: ["$storePrice", { $literal: 0 }] },
              ],
            },
          },
          lowStockCount: {
            $sum: {
              $cond: [{ $lte: ["$stock", "$minStock"] }, 1, 0],
            },
          },
          outOfStockCount: {
            $sum: {
              $cond: [{ $eq: ["$stock", 0] }, 1, 0],
            },
          },
          totalStoreSold: { $sum: "$storeSold" },
          totalStoreRevenue: { $sum: "$storeRevenue" },
        },
      },
    ]);

    // Get category distribution
    const categoryStats = await StoreInventory.aggregate([
      { $match: { store: store._id } },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$productDetails.category",
          count: { $sum: 1 },
          totalStock: { $sum: "$stock" },
          totalValue: {
            $sum: {
              $multiply: [
                "$stock",
                { $ifNull: ["$storePrice", { $literal: 0 }] },
              ],
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const stats = inventoryStats[0] || {
      totalItems: 0,
      totalStock: 0,
      totalValue: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      totalStoreSold: 0,
      totalStoreRevenue: 0,
    };

    return {
      success: true,
      data: {
        storeInfo: store,
        stats: {
          totalProducts: stats.totalItems,
          totalStock: stats.totalStock,
          inventoryValue: stats.totalValue,
          lowStockProducts: stats.lowStockCount,
          outOfStockProducts: stats.outOfStockCount,
          totalSold: stats.totalStoreSold,
          totalRevenue: stats.totalStoreRevenue,
          categoryDistribution: categoryStats,
        },
      },
    };
  }

  /**
   * Assign user to store
   */
  async assignUserToStore(storeId, userId, permissions = {}, user) {
    if (!this.canUserManageStore(user, { _id: storeId })) {
      throw new Error("Not authorized to manage users in this store");
    }

    const [store, userToAssign] = await Promise.all([
      Store.findById(storeId),
      User.findById(userId),
    ]);

    if (!store || !userToAssign) {
      throw new Error("Store or user not found");
    }

    // Update user's assigned store
    userToAssign.assignedStore = storeId;

    // Add store permissions if provided
    if (Object.keys(permissions).length > 0) {
      const existingPermissionIndex = userToAssign.storePermissions.findIndex(
        (perm) => perm.store.toString() === storeId.toString(),
      );

      if (existingPermissionIndex !== -1) {
        userToAssign.storePermissions[existingPermissionIndex] = {
          store: storeId,
          ...permissions,
        };
      } else {
        userToAssign.storePermissions.push({
          store: storeId,
          ...permissions,
        });
      }
    }

    await userToAssign.save();

    return {
      success: true,
      message: "User assigned to store successfully",
      data: userToAssign,
    };
  }

  /**
   * Get all users in a store
   */
  async getStoreUsers(storeId, user) {
    if (!this.canUserAccessStore(user, storeId)) {
      throw new Error("Not authorized to access this store's users");
    }

    const users = await User.find({ assignedStore: storeId })
      .select("-password")
      .sort({ firstName: 1 });

    return {
      success: true,
      count: users.length,
      data: users,
    };
  }

  /**
   * Get store inventory items
   */
  async getStoreInventory(storeId, filters = {}, page = 1, limit = 20, user) {
    if (!this.canUserAccessStore(user, storeId)) {
      throw new Error("Not authorized to access this store");
    }

    const skip = (page - 1) * limit;
    let query = { store: storeId };

    // Apply filters
    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.lowStock === "true") {
      query.$expr = { $lte: ["$stock", "$minStock"] };
    }

    if (filters.outOfStock === "true") {
      query.stock = 0;
    }

    if (filters.search) {
      // Search in product details
      const searchProducts = await Product.find({
        $or: [
          { name: { $regex: filters.search, $options: "i" } },
          { sku: { $regex: filters.search, $options: "i" } },
          { brand: { $regex: filters.search, $options: "i" } },
        ],
      }).select("_id");

      query.product = { $in: searchProducts.map((p) => p._id) };
    }

    const [inventoryItems, total] = await Promise.all([
      StoreInventory.find(query)
        .populate({
          path: "product",
          select: "name sku price costPrice images brand category description",
        })
        .populate("store", "name code")
        .skip(skip)
        .limit(limit)
        .sort({ updatedAt: -1 })
        .lean(),
      StoreInventory.countDocuments(query),
    ]);

    // Format the response
    const formattedItems = inventoryItems.map((item) => {
      const product = item.product;
      return {
        inventoryId: item._id,
        product: {
          id: product?._id,
          name: product?.name,
          sku: product?.sku,
          price: product?.price,
          costPrice: product?.costPrice,
          category: product?.category,
          brand: product?.brand,
          description: product?.description,
          images: product?.images || [],
        },
        store: item.store,
        storeStock: item.stock,
        storeMinStock: item.minStock,
        storeStatus: item.status,
        storeSold: item.storeSold || 0,
        storeRevenue: item.storeRevenue || 0,
        lastRestock: item.lastRestock,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });

    return {
      success: true,
      data: formattedItems,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
        limit: limit,
      },
    };
  }

  /**
   * Update store inventory item
   */
  async updateStoreInventory(storeId, inventoryId, updateData, user) {
    if (!this.canUserManageStore(user, { _id: storeId })) {
      throw new Error("Not authorized to manage this store's inventory");
    }

    const inventoryItem = await StoreInventory.findOne({
      _id: inventoryId,
      store: storeId,
    });

    if (!inventoryItem) {
      throw new Error("Inventory item not found in this store");
    }

    // Update inventory item
    Object.keys(updateData).forEach((key) => {
      if (key !== "_id" && key !== "store" && key !== "product") {
        inventoryItem[key] = updateData[key];
      }
    });

    // Auto-update status based on stock
    if (updateData.stock !== undefined) {
      if (updateData.stock === 0) {
        inventoryItem.status = "Out of Stock";
      } else if (updateData.stock <= inventoryItem.minStock) {
        inventoryItem.status = "Low Stock";
      } else {
        inventoryItem.status = "In Stock";
      }
    }

    await inventoryItem.save();

    // Populate product details
    await inventoryItem.populate({
      path: "product",
      select: "name sku price brand category",
    });

    return {
      success: true,
      message: "Inventory updated successfully",
      data: inventoryItem,
    };
  }

  /**
   * Remove product from store inventory
   */
  async removeFromStoreInventory(storeId, inventoryId, user) {
    if (!this.canUserManageStore(user, { _id: storeId })) {
      throw new Error("Not authorized to manage this store's inventory");
    }

    const deleted = await StoreInventory.findOneAndDelete({
      _id: inventoryId,
      store: storeId,
    });

    if (!deleted) {
      throw new Error("Inventory item not found in this store");
    }

    return {
      success: true,
      message: "Product removed from store inventory",
    };
  }

  /**
   * Restock product in store
   */
  async restockStoreProduct(storeId, inventoryId, quantity, buyingPrice, user) {
    if (!this.canUserManageStore(user, { _id: storeId })) {
      throw new Error("Not authorized to manage this store's inventory");
    }

    const inventoryItem = await StoreInventory.findOne({
      _id: inventoryId,
      store: storeId,
    });

    if (!inventoryItem) {
      throw new Error("Inventory item not found in this store");
    }

    // Update stock
    inventoryItem.stock += quantity;
    inventoryItem.lastRestock = new Date();

    // Update status based on new stock
    if (inventoryItem.stock === 0) {
      inventoryItem.status = "Out of Stock";
    } else if (inventoryItem.stock <= inventoryItem.minStock) {
      inventoryItem.status = "Low Stock";
    } else {
      inventoryItem.status = "In Stock";
    }

    await inventoryItem.save();

    return {
      success: true,
      message: "Product restocked successfully",
      data: {
        newStock: inventoryItem.stock,
        status: inventoryItem.status,
        lastRestock: inventoryItem.lastRestock,
      },
    };
  }

  /**
   * Helper: Check if user can access store
   */
  canUserAccessStore(user, storeId) {
    // Superadmin can access all stores
    if (user.role === "superadmin" || user.canAccessAllStores) {
      return true;
    }

    // Check assigned store
    if (
      user.assignedStore &&
      user.assignedStore.toString() === storeId.toString()
    ) {
      return true;
    }

    // Check store permissions
    return user.storePermissions.some(
      (perm) => perm.store.toString() === storeId.toString() && perm.canView,
    );
  }

  /**
   * Helper: Check if user can manage store
   */
  canUserManageStore(user, store) {
    // Superadmin can manage all stores
    if (user.role === "superadmin") {
      return true;
    }

    // Check if user is the manager of this store
    if (store.manager && store.manager.toString() === user._id.toString()) {
      return true;
    }

    // Check store permissions for management rights
    return user.storePermissions.some(
      (perm) =>
        perm.store.toString() === store._id.toString() && perm.canManage,
    );
  }

  /**
   * Get store by code
   */
  async getStoreByCode(code, user) {
    const store = await Store.findOne({ code: code.toUpperCase() }).populate(
      "manager",
      "firstName lastName email phoneNo",
    );

    if (!store) {
      throw new Error("Store not found");
    }

    if (!this.canUserAccessStore(user, store._id)) {
      throw new Error("Not authorized to access this store");
    }

    return {
      success: true,
      data: store,
    };
  }

  /**
   * Search stores by name or code
   */
  async searchStores(searchTerm, user, limit = 10) {
    let query = {
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { code: { $regex: searchTerm, $options: "i" } },
      ],
    };

    // Apply user restrictions
    if (user.role !== "superadmin" && !user.canAccessAllStores) {
      if (user.assignedStore) {
        query._id = user.assignedStore;
      } else {
        return { success: true, data: [], count: 0 };
      }
    }

    const stores = await Store.find(query)
      .limit(limit)
      .populate("manager", "firstName lastName")
      .sort({ name: 1 });

    return {
      success: true,
      count: stores.length,
      data: stores,
    };
  }
  /**
   * Get all workers (users) of a specific store
   * @param {string} storeId - The store ID
   * @param {Object} user - The requesting user
   * @param {Object} options - Optional filters (role, search, etc.)
   */
  async getStoreWorkers(storeId, user, options = {}) {
    // Check if user has access to this store
    if (!this.canUserAccessStore(user, storeId)) {
      throw new Error("Not authorized to access this store's workers");
    }

    // Verify store exists
    const store = await Store.findById(storeId);
    if (!store) {
      throw new Error("Store not found");
    }

    // Build query for users in this store
    const query = {
      isActive: true,
      $or: [{ assignedStore: storeId }, { "storePermissions.store": storeId }],
    };

    // Apply role filter if provided
    if (options.role) {
      query.role = options.role;
    }

    // Apply search filter if provided (search by name or email)
    if (options.search) {
      const searchRegex = new RegExp(options.search, "i");
      query.$and = [
        {
          $or: [
            { firstName: searchRegex },
            { lastName: searchRegex },
            { email: searchRegex },
            { phoneNo: searchRegex },
          ],
        },
      ];
    }

    // Pagination
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 20;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await User.countDocuments(query);

    // Get users with their store-specific permissions
    const users = await User.find(query)
      .select("-password") // Exclude password
      .populate("assignedStore", "name code")
      .sort({ firstName: 1, lastName: 1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean() for better performance

    // Add store-specific role and permissions to each user
    const usersWithStoreContext = users.map((user) => {
      // Find store-specific permissions
      const storePermission = user.storePermissions?.find(
        (perm) => perm.store?.toString() === storeId,
      );

      // Find store-specific role
      const storeRole = user.storeRoles?.find(
        (role) => role.store?.toString() === storeId,
      );

      return {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phoneNo: user.phoneNo,
        profileImage: user.profileImage,
        role: user.role, // Global role
        storeRole: storeRole?.role || null, // Store-specific role
        isPrimaryStore: user.assignedStore?._id?.toString() === storeId,
        permissions: storePermission || {
          canView: true,
          canEdit: false,
          canSell: false,
          canManage: false,
        },
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      };
    });

    // Get role distribution stats
    const roleStats = await User.aggregate([
      {
        $match: {
          $or: [
            { assignedStore: store._id },
            { "storePermissions.store": store._id },
          ],
          isActive: true,
        },
      },
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get manager info
    const manager = store.manager
      ? await User.findById(store.manager)
          .select("firstName lastName email phoneNo profileImage")
          .lean()
      : null;

    return {
      success: true,
      data: {
        store: {
          id: store._id,
          name: store.name,
          code: store.code,
          manager: manager
            ? {
                _id: manager._id,
                name: `${manager.firstName} ${manager.lastName}`,
                email: manager.email,
                phone: manager.phoneNo,
              }
            : null,
        },
        workers: usersWithStoreContext,
        stats: {
          total: total,
          managers: usersWithStoreContext.filter((u) => u.role === "manager")
            .length,
          cashiers: usersWithStoreContext.filter((u) => u.role === "cashier")
            .length,
          staff: usersWithStoreContext.filter((u) => u.role === "staff").length,
          roleDistribution: roleStats,
        },
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      },
    };
  }
}

module.exports = new StoreService();
