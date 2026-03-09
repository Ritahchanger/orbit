// services/transaction-delete-api.js
import { api } from "../../api/axios-conf";

const transactionDeleteApi = {
    /**
     * Soft delete transactions - marks as deleted without removing from database
     * @param {Array|String} transactionIds - Single ID or array of transaction IDs
     * @returns {Promise} - Result of soft delete operation
     */
    softDeleteTransactions: async (transactionIds) => {
        const response = await api.post("/transactions/soft-delete", {
            transactionIds: Array.isArray(transactionIds) ? transactionIds : [transactionIds]
        });
        return response.data;
    },

    /**
     * Permanently delete transactions - removes from database
     * @param {Array|String} transactionIds - Single ID or array of transaction IDs
     * @param {boolean} confirm - Confirmation flag (must be true)
     * @returns {Promise} - Result of permanent delete operation
     */
    permanentDeleteTransactions: async (transactionIds, confirm = false) => {
        if (!confirm) {
            throw new Error("Permanent deletion requires confirmation");
        }

        const response = await api.delete("/transactions/permanent-delete", {
            data: {
                transactionIds: Array.isArray(transactionIds) ? transactionIds : [transactionIds],
                confirm: "PERMANENT_DELETE"
            }
        });
        return response.data;
    },

    /**
     * Restore soft-deleted transactions
     * @param {Array|String} transactionIds - Single ID or array of transaction IDs
     * @returns {Promise} - Result of restore operation
     */
    restoreTransactions: async (transactionIds) => {
        const response = await api.post("/transactions/restore", {
            transactionIds: Array.isArray(transactionIds) ? transactionIds : [transactionIds]
        });
        return response.data;
    },

    /**
     * Get deleted transactions with pagination and filters
     * @param {Object} params - Query parameters
     * @returns {Promise} - Deleted transactions and pagination info
     */
    getDeletedTransactions: async (params = {}) => {
        const response = await api.get("/transactions/deleted", { params });
        return response.data;
    },

    /**
     * Get single deleted transaction by ID
     * @param {string} id - Transaction ID
     * @returns {Promise} - Deleted transaction details
     */
    getDeletedTransactionById: async (id) => {
        const response = await api.get(`/transactions/deleted/${id}`);
        return response.data;
    },

    /**
     * Bulk delete with type parameter
     * @param {Array|String} transactionIds - Single ID or array of transaction IDs
     * @param {string} type - Delete type ('soft' or 'permanent')
     * @param {boolean} confirm - Confirmation for permanent delete
     * @returns {Promise} - Result of bulk delete operation
     */
    bulkDeleteTransactions: async (transactionIds, type = 'soft', confirm = false) => {
        if (type === 'permanent' && !confirm) {
            throw new Error("Permanent deletion requires confirmation");
        }

        const response = await api.delete("/transactions/bulk", {
            params: { type },
            data: {
                transactionIds: Array.isArray(transactionIds) ? transactionIds : [transactionIds],
                ...(type === 'permanent' && { confirm: "PERMANENT_DELETE" })
            }
        });
        return response.data;
    },

    /**
     * Clean up old deleted transactions (admin only)
     * @param {number} daysOld - Delete transactions older than this many days (default: 30)
     * @returns {Promise} - Cleanup result
     */
    cleanupOldDeleted: async (daysOld = 30) => {
        const response = await api.post("/transactions/cleanup", { daysOld });
        return response.data;
    },

    /**
     * Get delete statistics
     * @returns {Promise} - Delete statistics
     */
    getDeleteStats: async () => {
        const response = await api.get("/transactions/delete-stats");
        return response.data;
    },

    /**
     * Search deleted transactions
     * @param {string} searchTerm - Search term
     * @param {Object} filters - Additional filters
     * @returns {Promise} - Search results
     */
    searchDeletedTransactions: async (searchTerm, filters = {}) => {
        const params = {
            search: searchTerm,
            ...filters
        };
        const response = await api.get("/transactions/deleted", { params });
        return response.data;
    },

    /**
     * Export deleted transactions data
     * @param {Object} filters - Filter options
     * @param {string} format - Export format (csv, excel)
     * @returns {Promise} - Download link or blob
     */
    exportDeletedTransactions: async (filters = {}, format = 'csv') => {
        const response = await api.get("/transactions/deleted/export", {
            params: { ...filters, format },
            responseType: "blob"
        });

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `deleted-transactions-${new Date().toISOString().split('T')[0]}.${format}`);
        document.body.appendChild(link);
        link.click();
        link.remove();

        return { success: true, message: "Export downloaded successfully" };
    }
};

export default transactionDeleteApi;