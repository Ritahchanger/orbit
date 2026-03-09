// services/store-api.js
import { api } from "../../api/axios-conf";

const storeApi = {
  /**
   * Get all stores (filtered by user access)
   */
  getAllStores: async (params = {}) => {
    const response = await api.get("/stores", { params });
    return response.data;
  },

  /**
   * Get single store by ID
   */
  getStoreById: async (storeId) => {
    const response = await api.get(`/stores/${storeId}`);
    return response.data;
  },

  /**
   * Create new store (superadmin only)
   */
  createStore: async (storeData) => {
    const response = await api.post("/stores", storeData);
    return response.data;
  },

  /**
   * Update store
   */
  updateStore: async (storeId, updateData) => {
    console.log(storeId);
    const response = await api.put(`/stores/${storeId}`, updateData);
    return response.data;
  },

  /**
   * Delete store (superadmin only)
   */
  deleteStore: async (storeId) => {
    const response = await api.delete(`/stores/${storeId}`);
    return response.data;
  },

  /**
   * Get store by code
   */
  getStoreByCode: async (code) => {
    const response = await api.get(`/stores/code/${code}`);
    return response.data;
  },

  /**
   * Search stores by name or code
   */
  searchStores: async (searchTerm, limit = 10) => {
    const response = await api.get("/stores/search", {
      params: { q: searchTerm, limit },
    });
    return response.data;
  },

  getWorkers: async (id, params = {}) => {
    const response = await api.get(`/stores/${id}/workers`, {
      params: {
        role: params.role,
        search: params.search,
        page: params.page,
        limit: params.limit,
      },
    });
    return response.data;
  },

  /**
   * Get store statistics
   */
  getStoreStats: async (storeId) => {
    const response = await api.get(`/stores/${storeId}/stats`);
    return response.data;
  },

  /**
   * Get all users in a store
   */
  getStoreUsers: async (storeId) => {
    const response = await api.get(`/stores/${storeId}/users`);
    return response.data;
  },

  /**
   * Assign user to store
   */
  assignUserToStore: async (storeId, userId, permissions = {}) => {
    const response = await api.post(`/stores/${storeId}/users/${userId}`, {
      permissions,
    });
    return response.data;
  },

  /**
   * Get store inventory (products in this store)
   */
  getStoreInventory: async (storeId, params = {}) => {
    const response = await api.get(`/stores/${storeId}/inventory`, { params });
    return response.data;
  },

  /**
   * Get store sales
   */
  getStoreSales: async (storeId, params = {}) => {
    const response = await api.get(`/stores/${storeId}/sales`, { params });
    return response.data;
  },

  /**
   * Get store analytics
   */
  getStoreAnalytics: async (storeId, timeRange = "month") => {
    const response = await api.get(`/stores/${storeId}/analytics`, {
      params: { timeRange },
    });
    return response.data;
  },

  /**
   * Update store opening hours
   */
  updateStoreHours: async (storeId, openingHours) => {
    const response = await api.patch(`/stores/${storeId}/hours`, {
      openingHours,
    });
    return response.data;
  },

  /**
   * Update store status (active/inactive/maintenance)
   */
  updateStoreStatus: async (storeId, status) => {
    const response = await api.patch(`/stores/${storeId}/status`, { status });
    return response.data;
  },

  /**
   * Set store manager
   */
  setStoreManager: async (storeId, managerId) => {
    const response = await api.patch(`/stores/${storeId}/manager`, {
      managerId,
    });
    return response.data;
  },

  /**
   * Remove store manager
   */
  removeStoreManager: async (storeId) => {
    const response = await api.delete(`/stores/${storeId}/manager`);
    return response.data;
  },

  /**
   * Get low stock alerts for a store
   */
  getStoreLowStockAlerts: async (storeId) => {
    const response = await api.get(`/stores/${storeId}/alerts/low-stock`);
    return response.data;
  },

  /**
   * Get store performance metrics
   */
  getStorePerformance: async (storeId, period = "month") => {
    const response = await api.get(`/stores/${storeId}/performance`, {
      params: { period },
    });
    return response.data;
  },

  /**
   * Compare multiple stores
   */
  compareStores: async (storeIds, metrics = ["revenue", "sales", "profit"]) => {
    const response = await api.post("/stores/compare", {
      storeIds,
      metrics,
    });
    return response.data;
  },

  /**
   * Get store revenue breakdown
   */
  getStoreRevenueBreakdown: async (storeId, timeRange = "month") => {
    const response = await api.get(`/stores/${storeId}/revenue-breakdown`, {
      params: { timeRange },
    });
    return response.data;
  },

  /**
   * Export store data as CSV
   */
  exportStoreData: async (storeId, type = "full") => {
    const response = await api.get(`/stores/${storeId}/export`, {
      params: { type, format: "csv" },
      responseType: "blob",
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `store-${storeId}-export-${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    link.remove();

    return { success: true, message: "Export downloaded successfully" };
  },
};

export default storeApi;
