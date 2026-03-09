// api/refundApi.js
import { api } from "../../api/axios-conf";
/**
 * REFUND API
 * Handles all refund-related operations
 * Routes match exactly with backend: /api/v1/refunds
 */
const refundApi = {
    /**
     * 1. PROCESS A REFUND
     * POST /api/v1/refunds
     * @param {Object} refundData - Refund data
     * @param {string} refundData.transactionId - Original transaction MongoDB ID (REQUIRED)
     * @param {number} refundData.amount - Amount to refund (REQUIRED)
     * @param {string} refundData.method - Refund method: "cash", "mpesa", "bank", "original", "wallet" (REQUIRED)
     * @param {string} refundData.reason - Refund reason from enum (REQUIRED)
     * @param {string} refundData.reasonText - Custom reason text (required if reason is "other")
     * @param {Array} refundData.items - Selected items for partial refund (optional)
     * @param {boolean} refundData.returnToStock - Return items to inventory (default: true)
     * @param {string} refundData.notes - Additional notes (optional)
     * @param {string} refundData.mpesaPhone - M-Pesa phone number (required if method is "mpesa")
     * @param {string} refundData.bankReference - Bank reference (required if method is "bank")
     * @param {string} refundData.bankAccount - Bank account (required if method is "bank")
     * @param {string} refundData.bankName - Bank name (required if method is "bank")
     * @param {string} refundData.cashReceivedBy - Cash receiver name (optional for cash)
     * @returns {Promise} Refund result with receipt and transaction update
     */
    processRefund: async (refundData) => {
        const response = await api.post("/refunds", refundData);
        return response.data;
    },

    /**
     * 2. CHECK REFUND ELIGIBILITY
     * GET /api/v1/refunds/check/:transactionId
     * @param {string} transactionId - Transaction MongoDB ID
     * @param {number} amount - Optional specific amount to check
     * @returns {Promise} Refund eligibility status with available amount
     */
    checkRefundEligibility: async (transactionId, amount = null) => {
        const params = amount ? { amount } : {};
        const response = await api.get(`/refunds/check/${transactionId}`, { params });
        return response.data;
    },

    /**
     * 3. GET REFUND BY ID
     * GET /api/v1/refunds/:refundId
     * @param {string} refundId - Refund MongoDB ID or refundId (e.g., REF-12345678-ABCD)
     * @returns {Promise} Complete refund details with populated references
     */
    getRefundById: async (refundId) => {
        const response = await api.get(`/refunds/${refundId}`);
        return response.data;
    },

    /**
     * 4. GET ALL REFUNDS FOR A TRANSACTION
     * GET /api/v1/refunds/transaction/:transactionId
     * @param {string} transactionId - Transaction MongoDB ID
     * @returns {Promise} Array of refunds for the transaction
     */
    getRefundsByTransaction: async (transactionId) => {
        const response = await api.get(`/refunds/transaction/${transactionId}`);
        return response.data;
    },

    /**
     * 5. GET REFUNDS BY STORE WITH PAGINATION
     * GET /api/v1/refunds/store/:storeId
     * @param {string} storeId - Store ID
     * @param {Object} params - Query parameters
     * @param {number} params.page - Page number (default: 1)
     * @param {number} params.limit - Items per page (default: 20, max: 100)
     * @param {string} params.method - Filter by refund method (cash, mpesa, bank)
     * @param {string} params.reason - Filter by refund reason
     * @param {string} params.refundStatus - Filter by status (pending, processing, completed, failed)
     * @param {string} params.startDate - Filter by start date (YYYY-MM-DD)
     * @param {string} params.endDate - Filter by end date (YYYY-MM-DD)
     * @returns {Promise} Paginated refunds with metadata
     */
    getRefundsByStore: async (storeId, params = {}) => {
        const response = await api.get(`/refunds/store/${storeId}`, { params });
        return response.data;
    },

    /**
     * 6. GET REFUND SUMMARY/DASHBOARD STATS
     * GET /api/v1/refunds/summary
     * @param {string} storeId - Optional store ID to filter
     * @param {number} days - Number of days to analyze (default: 30)
     * @returns {Promise} Refund analytics with totals, by method, by reason, daily trend
     */
    getRefundSummary: async (storeId = null, days = 30) => {
        const params = {};
        if (storeId) params.storeId = storeId;
        if (days) params.days = days;
        
        const response = await api.get("/refunds/summary", { params });
        return response.data;
    },

    /**
     * 7. APPROVE PENDING REFUND
     * PUT /api/v1/refunds/:refundId/approve
     * @param {string} refundId - Refund MongoDB ID
     * @returns {Promise} Updated refund with approval details
     */
    approveRefund: async (refundId) => {
        const response = await api.put(`/refunds/${refundId}/approve`);
        return response.data;
    }
};

export default refundApi;