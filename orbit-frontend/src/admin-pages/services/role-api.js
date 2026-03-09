import { api } from "../../api/axios-conf";

const rolesApi = {
    /**
     * Get all roles
     * @returns {Promise<{success: boolean, data: Array}>} List of roles
     */
    getAllRoles: async (params = {}) => {
        const response = await api.get('/roles', { params });
        return response.data;
    },

    /**
     * Get role by ID
     * @param {string} roleId - Role ID
     * @returns {Promise<{success: boolean, data: Object}>} Role data
     */
    getRoleById: async (roleId) => {
        const response = await api.get(`/roles/${roleId}`);
        return response.data;
    },

    /**
     * Get role by name
     * @param {string} roleName - Role name
     * @returns {Promise<{success: boolean, data: Object}>} Role data
     */
    getRoleByName: async (roleName) => {
        const response = await api.get(`/roles/name/${roleName}`);
        return response.data;
    },

    /**
     * Create new role
     * @param {Object} roleData - Role data
     * @param {string} roleData.name - Role name
     * @param {string} roleData.description - Role description
     * @param {Array} roleData.permissions - Array of permission keys
     * @param {number} roleData.level - Role level (1-10)
     * @param {boolean} roleData.canAssign - Whether role can assign other roles
     * @returns {Promise<{success: boolean, data: Object}>} Created role
     */
    createRole: async (roleData) => {
        const response = await api.post('/roles', roleData);
        return response.data;
    },

    /**
     * Update existing role
     * @param {string} roleId - Role ID
     * @param {Object} updates - Role updates
     * @returns {Promise<{success: boolean, data: Object}>} Updated role
     */
    updateRole: async (roleId, updates) => {
        const response = await api.put(`/roles/${roleId}`, updates);
        return response.data;
    },

    /**
     * Delete role
     * @param {string} roleId - Role ID
     * @returns {Promise<{success: boolean, message: string}>} Delete result
     */
    deleteRole: async (roleId) => {
        const response = await api.delete(`/roles/${roleId}`);
        return response.data;
    },

    /**
     * Add permission to role
     * @param {string} roleId - Role ID
     * @param {string} permissionKey - Permission key
     * @returns {Promise<{success: boolean, data: Object}>} Updated role
     */
    addPermissionToRole: async (roleId, permissionKey) => {
        const response = await api.post(`/roles/${roleId}/permissions`, {
            permission: permissionKey
        });
        return response.data;
    },

    /**
     * Remove permission from role
     * @param {string} roleId - Role ID
     * @param {string} permissionKey - Permission key
     * @returns {Promise<{success: boolean, data: Object}>} Updated role
     */
    removePermissionFromRole: async (roleId, permissionKey) => {
        const response = await api.delete(`/roles/${roleId}/permissions`, {
            data: { permission: permissionKey }
        });
        return response.data;
    },

    /**
     * Get users assigned to role
     * @param {string} roleId - Role ID
     * @param {Object} options - Pagination options
     * @param {number} options.page - Page number
     * @param {number} options.limit - Items per page
     * @returns {Promise<{success: boolean, data: Array, pagination: Object}>} Users list
     */
    getRoleUsers: async (roleId, options = {}) => {
        const response = await api.get(`/roles/${roleId}/users`, { params: options });
        return response.data;
    },

    /**
     * Check if user has permission through role
     * @param {string} userId - User ID
     * @param {string} permissionKey - Permission key
     * @returns {Promise<{success: boolean, data: {hasPermission: boolean}}>} Permission check result
     */
    checkUserPermission: async (userId, permissionKey) => {
        const response = await api.get(`/roles/users/${userId}/permissions/check`, {
            params: { permission: permissionKey }
        });
        return response.data;
    },

    /**
     * Get assignable roles (roles that can be assigned by current role)
     * @param {string} roleName - Current role name
     * @returns {Promise<{success: boolean, data: Array}>} Assignable roles
     */
    getAssignableRoles: async (roleName) => {
        const response = await api.get(`/roles/assignable/${roleName}`);
        return response.data;
    },

    /**
     * Sync role permissions with available permissions
     * @param {string} roleId - Role ID
     * @returns {Promise<{success: boolean, data: Object}>} Sync result
     */
    syncRolePermissions: async (roleId) => {
        const response = await api.post(`/roles/${roleId}/permissions/sync`);
        return response.data;
    },

    /**
     * Seed default roles (superadmin, admin, manager, cashier, staff)
     * @returns {Promise<{success: boolean, data: Array}>} Seeding results
     */
    seedDefaultRoles: async () => {
        const response = await api.post('/roles/seed/default');
        return response.data;
    },

    /**
     * Get role statistics
     * @returns {Promise<{success: boolean, data: Object}>} Role statistics
     */
    getRoleStatistics: async () => {
        const response = await api.get('/roles/statistics/overview');
        return response.data;
    },

    /**
     * Validate permissions
     * @param {Array} permissions - Array of permission keys
     * @returns {Promise<{success: boolean, data: {isValid: boolean}}>} Validation result
     */
    validatePermissions: async (permissions) => {
        const response = await api.post('/roles/permissions/validate', { permissions });
        return response.data;
    },

    /**
     * Bulk update role permissions
     * @param {string} roleId - Role ID
     * @param {Array} permissions - Array of permission keys
     * @returns {Promise<{success: boolean, data: Object}>} Updated role
     */
    bulkUpdatePermissions: async (roleId, permissions) => {
        const response = await api.put(`/roles/${roleId}/permissions/bulk`, { permissions });
        return response.data;
    },

    /**
     * Clone role
     * @param {string} roleId - Role ID to clone
     * @param {Object} options - Clone options
     * @param {string} options.name - New role name
     * @param {string} options.description - New role description
     * @returns {Promise<{success: boolean, data: Object}>} Cloned role
     */
    cloneRole: async (roleId, options) => {
        const response = await api.post(`/roles/${roleId}/clone`, options);
        return response.data;
    },

    /**
     * Export roles to JSON
     * @returns {Promise<Blob>} JSON file blob
     */
    exportRoles: async () => {
        const response = await api.get('/roles/export/json', {
            responseType: 'blob'
        });
        return response.data;
    },

    /**
     * Import roles from JSON
     * @param {Array} roles - Array of role objects
     * @returns {Promise<{success: boolean, results: Array}>} Import results
     */
    importRoles: async (roles) => {
        const response = await api.post('/roles/import/json', { roles });
        return response.data;
    }
};

export default rolesApi;