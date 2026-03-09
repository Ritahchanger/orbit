// api/stockTransfer.api.js
import { api } from "../../api/axios-conf";

const stockTransferApi = {
  // ============ SINGLE TRANSFER ============
  /**
   * Transfer stock from one store to another
   * @param {Object} transferData - Transfer details
   * @param {string} transferData.sourceStoreId - Source store ID
   * @param {string} transferData.destinationStoreId - Destination store ID
   * @param {string} transferData.productId - Product ID to transfer
   * @param {number} transferData.quantity - Quantity to transfer
   * @param {string} transferData.reason - Reason for transfer
   * @param {string} transferData.notes - Additional notes
   */
  transferStock: async (transferData) => {
    console.log(transferData);
    const response = await api.post("/stock-transfers/transfer", transferData);
    console.log(response.data)
    return response.data;
  },

  // ============ BULK TRANSFER ============
  /**
   * Transfer multiple products between stores
   * @param {Object} bulkData - Bulk transfer details
   * @param {string} bulkData.sourceStoreId - Source store ID
   * @param {string} bulkData.destinationStoreId - Destination store ID
   * @param {Array} bulkData.items - Array of products to transfer
   * @param {string} bulkData.items[].productId - Product ID
   * @param {number} bulkData.items[].quantity - Quantity to transfer
   * @param {string} bulkData.reason - Reason for transfer
   * @param {string} bulkData.notes - Additional notes
   */
  bulkTransfer: async (bulkData) => {
    console.log(bulkData);
    const response = await api.post("/stock-transfers/bulk-transfer", bulkData);
    console.log(response.data)
    return response.data;
  },

  // ============ TRANSFER HISTORY ============
  /**
   * Get transfer history with filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.sourceStore - Filter by source store
   * @param {string} params.destinationStore - Filter by destination store
   * @param {string} params.product - Filter by product
   * @param {string} params.status - Filter by status (pending/completed/cancelled)
   * @param {string} params.fromDate - Start date (YYYY-MM-DD)
   * @param {string} params.toDate - End date (YYYY-MM-DD)
   */
  getTransferHistory: async (params = {}) => {
    const response = await api.get("/stock-transfers/history", { params });
    return response.data;
  },

  /**
   * Get transfer by ID
   * @param {string} transferId - Transfer ID
   */
  getTransferById: async (transferId) => {
    const response = await api.get(`/stock-transfers/${transferId}`);
    return response.data;
  },

  // ============ CANCEL TRANSFER ============
  /**
   * Cancel a pending transfer
   * @param {string} transferId - Transfer ID to cancel
   * @param {Object} cancelData - Cancellation details
   * @param {string} cancelData.reason - Reason for cancellation
   */
  cancelTransfer: async (transferId, cancelData) => {
    const response = await api.put(
      `/stock-transfers/${transferId}/cancel`,
      cancelData,
    );
    return response.data;
  },
};

export default stockTransferApi;
