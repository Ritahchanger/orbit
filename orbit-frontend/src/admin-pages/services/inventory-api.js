import { api } from "../../api/axios-conf";

export const inventoryApi = {
  // =================== GET REQUESTS ===================

  /**
   * Get store inventory with filtering
   * @param {string} storeId - Store ID
   * @param {Object} filters - Filter options
   * @param {string} filters.search - Search term
   * @param {string} filters.category - Category filter
   * @param {boolean} filters.lowStock - Low stock only
   * @param {boolean} filters.outOfStock - Out of stock only
   * @param {number} filters.page - Page number
   * @param {number} filters.limit - Items per page
   * @param {string} filters.sortBy - Sort field
   * @param {string} filters.sortOrder - Sort order (asc/desc)
   */
  getStoreInventory: async (storeId, filters = {}) => {
    try {
      const response = await api.get(`/stores-inventory/${storeId}/inventory`, {
        params: filters,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get inventory statistics
   * @param {string} storeId - Store ID
   */
  getInventoryStats: async (storeId) => {
    try {
      const response = await api.get(
        `/stores-inventory/${storeId}/inventory/stats`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get low stock alerts
   * @param {string} storeId - Store ID
   * @param {number} limit - Limit results
   */
  getLowStockAlerts: async (storeId, limit = 20) => {
    try {
      const response = await api.get(
        `/stores-inventory/${storeId}/inventory/alerts`,
        {
          params: { limit },
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get products available to add to store
   * @param {string} storeId - Store ID
   * @param {Object} filters - Filter options
   */
  getAvailableProducts: async (storeId, filters = {}) => {
    try {
      const response = await api.get(
        `/stores-inventory/${storeId}/inventory/available`,
        {
          params: filters,
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get specific inventory item
   * @param {string} inventoryId - Inventory item ID
   */
  getInventoryItem: async (inventoryId) => {
    try {
      const response = await api.get(
        `/stores-inventory/inventory/${inventoryId}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Generate inventory report
   * @param {string} storeId - Store ID
   * @param {string} format - Report format (json/csv)
   * @param {Object} dateRange - Date range filter
   */
  generateInventoryReport: async (storeId, format = "json", dateRange = {}) => {
    try {
      const response = await api.get(
        `/stores-inventory/${storeId}/inventory/report`,
        {
          params: { format, ...dateRange },
        },
      );

      // Handle CSV download
      if (format === "csv") {
        const blob = new Blob([response.data], {
          type: "text/csv",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `inventory-report-${storeId}-${new Date().toISOString().split("T")[0]}.csv`,
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        return { success: true, message: "Report downloaded successfully" };
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // =================== SMART OPERATIONS ===================

  /**
   * SMART: Add or update inventory items (handles single & bulk)
   * @param {string} storeId - Store ID
   * @param {Object|Array} items - Single item or array of items
   * @param {string} operation - "add" or "update"
   */
  manageInventory: async (storeId, items, operation = "add") => {
    try {
      const response = await api.post(`/${storeId}/inventory/manage`, {
        items: Array.isArray(items) ? items : [items],
        operation,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Quick add by SKU
   * @param {string} storeId - Store ID
   * @param {string} sku - Product SKU
   * @param {number} quantity - Quantity to add
   */
  quickAddBySku: async (storeId, sku, quantity = 1) => {
    try {
      console.log("📤 Quick add request:", { storeId, sku, quantity });

      const response = await api.post(
        `/stores-inventory/${storeId}/inventory/quick-add`,
        {
          sku: sku.trim().toUpperCase(),
          quantity: Number(quantity),
        },
      );

      console.log("📥 Quick add response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Quick add error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw new Error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          `Failed to add product with SKU: ${sku}`,
      );
    }
  },

  // =================== SINGLE ITEM OPERATIONS ===================

  /**
   * Update inventory item
   * @param {string} inventoryId - Inventory item ID
   * @param {Object} updateData - Data to update
   */
  updateInventoryItem: async (inventoryId, updateData) => {
    try {
      const response = await api.put(
        `/stores-inventory/${inventoryId}`,
        updateData,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Remove product from inventory
   * @param {string} inventoryId - Inventory item ID
   */
  removeFromInventory: async (inventoryId) => {
    try {
      const response = await api.delete(`/stores-inventory/${inventoryId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Restock product
   * @param {string} inventoryId - Inventory item ID
   * @param {number} quantity - Quantity to restock
   */
  restockProduct: async (inventoryId, quantity) => {
    try {
      const response = await api.post(
        `/stores-inventory/inventory/${inventoryId}/restock`,
        {
          quantity,
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Record sale
   * @param {string} inventoryId - Inventory item ID
   * @param {Object} saleData - Sale data
   * @param {number} saleData.quantity - Quantity sold
   * @param {number} saleData.sellingPrice - Selling price (optional)
   * @param {string} saleData.customerName - Customer name (optional)
   * @param {string} saleData.note - Note (optional)
   */
  recordSale: async (inventoryId, saleData) => {
    try {
      const response = await api.post(
        `/stores-inventory/${inventoryId}/sale`,
        saleData,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Adjust stock (increase/decrease)
   * @param {string} inventoryId - Inventory item ID
   * @param {number} quantity - Quantity adjustment (positive or negative)
   * @param {string} reason - Reason for adjustment
   * @param {string} note - Note (optional)
   */
  adjustStock: async (inventoryId, quantity, reason, note = "") => {
    try {
      const response = await api.post(
        `/stores-inventory/${inventoryId}/adjust`,
        {
          quantity,
          reason,
          note,
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // =================== CONVENIENCE METHODS ===================

  /**
   * Single add to inventory (convenience method)
   * @param {string} storeId - Store ID
   * @param {Object} itemData - Item data
   */
  addToInventory: async (storeId, itemData) => {
    return inventoryApi.manageInventory(storeId, itemData, "add");
  },

  /**
   * Bulk add to inventory (convenience method)
   * @param {string} storeId - Store ID
   * @param {Array} items - Array of items
   */
  bulkAddToInventory: async (storeId, items) => {
    return inventoryApi.manageInventory(storeId, items, "add");
  },

  /**
   * Bulk update inventory (convenience method)
   * @param {string} storeId - Store ID
   * @param {Array} items - Array of items
   */
  bulkUpdateInventory: async (storeId, items) => {
    return inventoryApi.manageInventory(storeId, items, "update");
  },

  /**
   * Search inventory (alias for getStoreInventory with search)
   * @param {string} storeId - Store ID
   * @param {string} searchTerm - Search term
   * @param {Object} filters - Additional filters
   */
  searchInventory: async (storeId, searchTerm, filters = {}) => {
    return inventoryApi.getStoreInventory(storeId, {
      search: searchTerm,
      ...filters,
    });
  },

  /**
   * Get inventory by category
   * @param {string} storeId - Store ID
   * @param {string} category - Category name
   * @param {Object} filters - Additional filters
   */
  getInventoryByCategory: async (storeId, category, filters = {}) => {
    return inventoryApi.getStoreInventory(storeId, { category, ...filters });
  },

  /**
   * Get low stock items
   * @param {string} storeId - Store ID
   * @param {Object} filters - Additional filters
   */
  getLowStockItems: async (storeId, filters = {}) => {
    return inventoryApi.getStoreInventory(storeId, {
      lowStock: true,
      ...filters,
    });
  },

  /**
   * Get out of stock items
   * @param {string} storeId - Store ID
   * @param {Object} filters - Additional filters
   */
  getOutOfStockItems: async (storeId, filters = {}) => {
    return inventoryApi.getStoreInventory(storeId, {
      outOfStock: true,
      ...filters,
    });
  },

  /**
   * Get inventory items below minimum stock
   * @param {string} storeId - Store ID
   * @param {Object} filters - Additional filters
   */
  getBelowMinStock: async (storeId, filters = {}) => {
    return inventoryApi.getStoreInventory(storeId, {
      lowStock: true,
      ...filters,
    });
  },
};

// =================== HELPER FUNCTIONS ===================

export const inventoryHelpers = {
  /**
   * Calculate suggested restock quantity
   * @param {number} currentStock - Current stock
   * @param {number} minStock - Minimum stock
   * @param {number} salesVelocity - Daily sales velocity
   * @returns {number} Suggested restock quantity
   */
  calculateRestock: (currentStock, minStock, salesVelocity = 1) => {
    const safetyStock = minStock * 1.5; // 50% safety buffer
    const suggested = Math.max(
      safetyStock - currentStock,
      minStock * salesVelocity,
    );
    return Math.ceil(suggested);
  },

  /**
   * Format inventory item for display
   * @param {Object} item - Inventory item
   * @returns {Object} Formatted item
   */
  formatInventoryItem: (item) => {
    return {
      id: item.inventoryId || item._id,
      product: item.product,
      stock: item.storeStock || item.stock,
      minStock: item.storeMinStock || item.minStock,
      price: item.storePrice || item.product?.price,
      status: item.storeStatus || item.status,
      sold: item.storeSold || 0,
      revenue: item.storeRevenue || 0,
      lastRestock: item.lastRestock,
      needsRestock:
        (item.storeStock || item.stock) <=
        (item.storeMinStock || item.minStock),
      outOfStock: (item.storeStock || item.stock) === 0,
      profitPerUnit: item.profitPerUnit || 0,
      totalValue: item.totalValue || 0,
    };
  },

  /**
   * Validate inventory data before submission
   * @param {Object} data - Inventory data
   * @returns {Object} Validation result
   */
  validateInventoryData: (data) => {
    const errors = [];

    if (data.stock !== undefined && data.stock < 0) {
      errors.push("Stock cannot be negative");
    }

    if (data.minStock !== undefined && data.minStock < 0) {
      errors.push("Minimum stock cannot be negative");
    }

    if (data.storePrice !== undefined && data.storePrice < 0) {
      errors.push("Price cannot be negative");
    }

    if (data.productId && !data.productId.match(/^[0-9a-fA-F]{24}$/)) {
      errors.push("Invalid product ID");
    }

    if (data.sku && typeof data.sku !== "string") {
      errors.push("SKU must be a string");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Generate CSV data from inventory items
   * @param {Array} inventoryItems - Inventory items
   * @returns {Array} CSV data array
   */
  generateCSVData: (inventoryItems) => {
    const headers = [
      "SKU",
      "Product Name",
      "Category",
      "Brand",
      "Current Stock",
      "Min Stock",
      "Price",
      "Status",
      "Total Value",
      "Last Restock",
    ];

    const rows = inventoryItems.map((item) => [
      item.product?.sku || "",
      item.product?.name || "",
      item.product?.category || "",
      item.product?.brand || "",
      item.storeStock || item.stock,
      item.storeMinStock || item.minStock,
      item.storePrice || item.product?.price || 0,
      item.storeStatus || item.status,
      item.totalValue || 0,
      item.lastRestock ? new Date(item.lastRestock).toLocaleDateString() : "",
    ]);

    return [headers, ...rows];
  },

  /**
   * Format error message from API response
   * @param {Error} error - API error
   * @returns {string} User-friendly error message
   */
  formatErrorMessage: (error) => {
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return "An error occurred. Please try again.";
  },

  /**
   * Prepare items for bulk operation
   * @param {Array} selectedProducts - Selected products
   * @param {number} quantity - Quantity for all items
   * @param {Object} additionalData - Additional data for each item
   * @returns {Array} Prepared items array
   */
  prepareBulkItems: (selectedProducts, quantity = 1, additionalData = {}) => {
    return selectedProducts.map((product) => ({
      productId: product.id,
      quantity: Number(quantity),
      minStock: product.minStock || 5,
      price: product.price,
      ...additionalData,
    }));
  },
};

export default inventoryApi;
