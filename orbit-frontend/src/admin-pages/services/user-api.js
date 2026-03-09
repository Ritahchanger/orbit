import { api } from "../../api/axios-conf";

const UserApi = {
  // ============ AUTHENTICATION ============
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  updateProfile: async (updateData) => {
    const response = await api.put("/users/me", updateData);
    return response.data;
  },

  changeMyPassword: async (passwordData) => {
    const response = await api.put("/users/me/change-password", passwordData);
    return response.data;
  },

  // ============ USER STORES (Self-management) ============
  getMyStores: async () => {
    const response = await api.get("/users/me/stores");
    return response.data;
  },

  setMyPrimaryStore: async (storeId) => {
    const response = await api.put("/users/me/primary-store", { storeId });
    return response.data;
  },

  // ============ ADMIN USER MANAGEMENT ============
  getUserStats: async () => {
    const response = await api.get("/users/stats");
    return response.data;
  },

  getAllUsers: async (params = {}) => {
    const response = await api.get("/users", { params });
    return response.data;
  },

  getAllAdmins: async (params = {}) => {
    const response = await api.get("/users/admins", { params });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  updateUserRole: async (id, role) => {
    const response = await api.put(`/users/${id}/role`, { role });
    return response.data;
  },

  // ============ ADMIN USER SUSPENSION ============
  suspendUser: async (userId, reason = "") => {
    const response = await api.put(`/users/${userId}/suspend`, { reason });
    return response.data;
  },
  unsuspendUser: async (userId) => {
    const response = await api.put(`/users/${userId}/unsuspend`);
    return response.data;
  },

  changeUserPassword: async (id, passwordData) => {
    const response = await api.put(
      `/users/${id}/change-password`,
      passwordData,
    );
    return response.data;
  },

  // ============ ADMIN STORE ASSIGNMENTS ============
  assignStoreToUser: async (userId, storeData) => {
    const response = await api.post(`/users/${userId}/stores`, storeData);
    return response.data;
  },

  removeStoreFromUser: async (userId, storeId) => {
    const response = await api.delete(`/users/${userId}/stores/${storeId}`);
    return response.data;
  },

  getUserStorePermissions: async (userId, storeId) => {
    const response = await api.get(
      `/users/${userId}/stores/${storeId}/permissions`,
    );
    return response.data;
  },

  getUserStores: async (userId) => {
    const response = await api.get(`/users/${userId}/stores`);
    return response.data;
  },

  setUserPrimaryStore: async (userId, storeId) => {
    const response = await api.put(`/users/${userId}/primary-store`, {
      storeId,
    });
    return response.data;
  },
};

export default UserApi;
