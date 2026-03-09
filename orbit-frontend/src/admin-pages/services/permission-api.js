import { api } from "../../api/axios-conf";

const permissionApi = {
    /**
     * Get all available permissions
     * @returns {Promise<{success: boolean, data: Array}>} List of all permissions
     */
    getAllPermissions: async () => {
        const response = await api.get('/permissions');
        return response.data;
    },

    /**
     * Get all permissions of a specific user
     * @param {string} userId - User ID
     * @returns {Promise<{success: boolean, data: Array}>} User's permissions
     */
    getUserPermissions: async (userId) => {
        const response = await api.get(`/permissions/users/${userId}`);
        return response.data;
    },

    /**
     * Assign a permission to a user
     * @param {string} userId - User ID
     * @param {Object} permissionData - Permission data
     * @param {string} permissionData.permission - Permission key (e.g., "products.view")
     * @param {string} permissionData.scope - "global" or "store"
     * @param {string} [permissionData.storeId] - Store ID (required for store scope)
     * @returns {Promise<{success: boolean, data: Object}>} Assigned permission
     */
    assignPermission: async (userId, permissionData) => {
        const response = await api.post(`/permissions/users/${userId}`, permissionData);
        return response.data;
    },

    /**
     * Revoke a permission from a user
     * @param {string} userId - User ID
     * @param {Object} permissionData - Permission data
     * @param {string} permissionData.permission - Permission key (e.g., "products.view")
     * @param {string} permissionData.scope - "global" or "store"
     * @param {string} [permissionData.storeId] - Store ID (required for store scope)
     * @returns {Promise<{success: boolean, data: Object}>} Revoked permission
     */
    revokePermission: async (userId, permissionData) => {
        const response = await api.delete(`/permissions/users/${userId}`, {
            data: permissionData
        });
        return response.data;
    }
};

export default permissionApi;