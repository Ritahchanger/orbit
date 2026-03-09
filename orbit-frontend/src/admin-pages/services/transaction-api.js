import { api } from "../../api/axios-conf";

const transactionsApi = {
    /**
     * 1. Get all transactions with pagination and filtering
     * @param {Object} params - Filter parameters
     * @param {number} params.page - Page number (default: 1)
     * @param {number} params.limit - Items per page (default: 20, max: 100)
     * @param {string} params.storeId - Filter by store ID
     * @param {string} params.startDate - Filter by start date (YYYY-MM-DD)
     * @param {string} params.endDate - Filter by end date (YYYY-MM-DD)
     * @param {string} params.paymentMethod - Filter by payment method
     * @param {string} params.status - Filter by transaction status
     * @param {string} params.customerName - Filter by customer name
     * @param {string} params.sortBy - Field to sort by (createdAt, total, customerName, transactionId)
     * @param {string} params.sortOrder - Sort order (asc, desc)
     * @returns {Promise} Transaction data with pagination and summary
     */
    getAllTransactions: async (params = {}) => {
        const response = await api.get("/transactions", { params });
        return response.data;
    },

    /**
     * 2. Get transaction by ID with detailed sales information
     * @param {string} transactionId - Transaction ID or MongoDB ObjectId
     * @returns {Promise} Transaction details with sales information
     */
    getTransactionById: async (transactionId) => {
        const response = await api.get(`/transactions/${transactionId}`);
        return response.data;
    },

    /**
     * 3. Get all transactions for a specific store
     * @param {string} storeId - Store ID
     * @param {Object} params - Filter parameters
     * @param {number} params.page - Page number (default: 1)
     * @param {number} params.limit - Items per page (default: 20, max: 100)
     * @param {string} params.startDate - Filter by start date (YYYY-MM-DD)
     * @param {string} params.endDate - Filter by end date (YYYY-MM-DD)
     * @param {string} params.paymentMethod - Filter by payment method
     * @param {string} params.customerName - Filter by customer name
     * @returns {Promise} Store transactions with pagination
     */
    getStoreTransactions: async (storeId, params = {}) => {
        const response = await api.get(`/transactions/store/${storeId}`, { params });
        return response.data;
    },

    /**
     * 4. Get today's transactions summary and analytics
     * @param {string} storeId - Optional store ID to filter by specific store
     * @returns {Promise} Today's summary with analytics
     */
    getTodaySummary: async (storeId = null) => {
        const params = storeId ? { storeId } : {};
        const response = await api.get("/transactions/today/summary", { params });
        return response.data;
    }
};

export default transactionsApi;