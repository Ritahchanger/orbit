import { api } from "../../api/axios-conf";

export const mpesaApi = {
  /**
   * Initiate M-Pesa STK Push payment
   * @param {Object} paymentData - Payment information
   * @param {string} paymentData.phone - Customer phone number
   * @param {number} paymentData.amount - Payment amount
   * @param {string} paymentData.customerName - Customer name
   * @param {string} paymentData.customerEmail - Customer email (optional)
   * @param {string} paymentData.storeId - Store ID
   * @param {string[]} paymentData.saleIds - Sale IDs to link (optional)
   * @param {string} paymentData.notes - Additional notes (optional)
   * @param {string} paymentData.clientId - WebSocket client ID (optional)
   * @returns {Promise} - Response data
   */
  initiatePayment: async (paymentData) => {
    const response = await api.post("/mpesa/initiate", paymentData);
    return response.data;
  },

  /**
   * Complete M-Pesa transaction after successful payment
   * @param {Object} transactionData - Transaction completion data
   * @param {string} transactionData.transactionId - Transaction ID from payment
   * @param {string[]} transactionData.saleIds - Sale IDs to link
   * @param {Object} transactionData.transactionSummary - Transaction summary
   * @param {number} transactionData.transactionSummary.itemsCount - Number of items
   * @param {number} transactionData.transactionSummary.subtotal - Subtotal amount
   * @param {number} transactionData.transactionSummary.discount - Discount amount
   * @param {number} transactionData.transactionSummary.tax - Tax amount
   * @param {number} transactionData.transactionSummary.total - Total amount
   * @param {number} transactionData.transactionSummary.totalProfit - Total profit
   * @param {string} transactionData.clientId - WebSocket client ID (optional)
   * @returns {Promise} - Response data
   */
  completeTransaction: async (transactionData) => {
    const response = await api.post("/mpesa/complete", transactionData);
    return response.data;
  },

  /**
   * Poll M-Pesa transaction status (fallback if WebSocket fails)
   * @param {string} checkoutRequestId - M-Pesa Checkout Request ID
   * @param {string} clientId - WebSocket client ID (optional)
   * @returns {Promise} - Response data
   */
  pollStatus: async (checkoutRequestId, clientId = null) => {
    const params = {};
    if (clientId) {
      params.clientId = clientId;
    }
    const response = await api.get(`/mpesa/status/${checkoutRequestId}`, {
      params,
    });
    return response.data;
  },

  /**
   * Validate phone number for M-Pesa payments
   * @param {Object} phoneData - Phone validation data
   * @param {string} phoneData.phone - Phone number to validate
   * @returns {Promise} - Response data
   */
  validatePhone: async (phoneData) => {
    const response = await api.post("/mpesa/validate-phone", phoneData);
    return response.data;
  },

  /**
   * Generate M-Pesa access token (for testing/development)
   * @returns {Promise} - Response data with token
   */
  generateToken: async () => {
    const response = await api.get("/mpesa/token");
    return response.data;
  },

  /**
   * Helper function to format phone number for M-Pesa
   * @param {string} phone - Raw phone number
   * @returns {string} - Formatted phone number
   */
  formatPhoneNumber: (phone) => {
    // Remove any non-digit characters
    const digits = phone.replace(/\D/g, "");

    if (digits.startsWith("0") && digits.length === 10) {
      return "254" + digits.substring(1);
    } else if (digits.startsWith("254") && digits.length === 12) {
      return digits;
    } else if (digits.startsWith("7") && digits.length === 9) {
      return "254" + digits;
    } else if (digits.length === 9) {
      return "254" + digits;
    } else {
      throw new Error("Invalid phone number format");
    }
  },

  /**
   * Parse callback metadata from M-Pesa response
   * @param {Object} callbackData - M-Pesa callback data
   * @returns {Object} - Parsed metadata
   */
  parseCallbackMetadata: (callbackData) => {
    const metadata = {};
    if (callbackData.Body?.stkCallback?.CallbackMetadata?.Item) {
      callbackData.Body.stkCallback.CallbackMetadata.Item.forEach((item) => {
        metadata[item.Name] = item.Value;
      });
    }
    return metadata;
  },

  /**
   * Check if M-Pesa payment was successful
   * @param {Object} callbackData - M-Pesa callback data
   * @returns {boolean} - True if payment successful
   */
  isPaymentSuccessful: (callbackData) => {
    return callbackData.Body?.stkCallback?.ResultCode === 0;
  },

  /**
   * Get payment status description
   * @param {number} resultCode - M-Pesa result code
   * @returns {string} - Status description
   */
  getStatusDescription: (resultCode) => {
    const statusMap = {
      0: "Payment successful",
      1: "Insufficient funds",
      1032: "Request cancelled by user",
      1037: "Timeout - Payment was not completed in time",
      1031: "Invalid phone number",
      1014: "Invalid amount",
      1001: "Invalid transaction",
      9999: "System error",
    };
    return statusMap[resultCode] || `Unknown error (Code: ${resultCode})`;
  },
};
