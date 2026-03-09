import { api } from "../../api/axios-conf";

import { mpesaApi } from "./mpesa-api";

const salesApi = {
  // ============ GLOBAL ROUTES (storeId optional in params) ============
  // Record a new sale

  ...mpesaApi,

  processMpesaSale: async ({ saleData, paymentData, clientId = null }) => {
    try {
      // Step 1: Initiate M-Pesa payment
      const paymentResponse = await mpesaApi.initiatePayment({
        ...paymentData,
        clientId,
      });

      console.log("📥 M-Pesa initiation response:", paymentResponse);

      // ✅ FIX: Check if response is wrapped in .data
      const responseData = paymentResponse.data || paymentResponse;

      if (!responseData.success) {
        throw new Error(responseData.message || "Failed to initiate payment");
      }

      // ✅ CORRECT: Use the actual field names from backend
      return {
        success: true,
        message: "M-Pesa payment initiated",
        data: {
          transactionId: responseData.data.transactionId, // MongoDB _id
          mpesaCheckoutId: responseData.data.mpesaCheckoutId, // ✅ CORRECT FIELD NAME
          merchantRequestId: responseData.data.merchantRequestId,
          customerMessage: responseData.data.customerMessage,
          clientId,
        },
      };
    } catch (error) {
      console.error("M-Pesa payment initiation failed:", error);
      throw error;
    }
  },

  // Method to complete sale after M-Pesa payment confirmation
  finalizeMpesaSale: async ({ transactionId, saleIds, summary, clientId }) => {
    try {
      // Step 1: Complete the M-Pesa transaction
      const completionResponse = await mpesaApi.completeTransaction({
        transactionId, // ✅ MongoDB _id
        saleIds,
        transactionSummary: summary,
        clientId,
      });

      console.log("📥 M-Pesa completion response:", completionResponse);

      const responseData = completionResponse.data || completionResponse;

      return {
        success: true,
        message: "M-Pesa transaction completed successfully",
        data: {
          ...responseData.data,
          transactionNumber: responseData.data?.transactionId, // Generated TXN-xxx/MPT-xxx
        },
      };
    } catch (error) {
      console.error("M-Pesa transaction completion failed:", error);
      throw error;
    }
  },

  // WebSocket event handler for M-Pesa updates
  setupMpesaWebSocketHandlers: (socket, handlers = {}) => {
    // Listen for M-Pesa status updates
    socket.on("mpesa_status", (data) => {
      const {
        status,
        message,
        transactionId,
        mpesaCheckoutId, // ✅ Use correct field name
        mpesaReceipt,
      } = data;

      if (handlers.onStatusUpdate) {
        handlers.onStatusUpdate({
          status,
          message,
          transactionId,
          mpesaCheckoutId, // ✅ Use correct field name
          mpesaReceipt,
          timestamp: new Date().toISOString(),
        });
      }

      // Handle specific statuses
      switch (status) {
        case "stk_sent":
          if (handlers.onStkSent) {
            handlers.onStkSent({
              ...data,
              mpesaCheckoutId: data.mpesaCheckoutId, // ✅ Correct
            });
          }
          break;

        case "success":
          if (handlers.onPaymentSuccess) {
            handlers.onPaymentSuccess({
              ...data,
              mpesaReceipt: data.mpesaReceipt,
              mpesaCheckoutId: data.mpesaCheckoutId,
            });
          }
          break;

        case "failed":
          if (handlers.onPaymentFailed) {
            handlers.onPaymentFailed(data);
          }
          break;

        case "completed":
          if (handlers.onTransactionCompleted) {
            handlers.onTransactionCompleted({
              ...data,
              transactionNumber: data.transactionNumber, // Generated TXN-xxx
            });
          }
          break;

        default:
          console.log("M-Pesa status update:", data);
      }
    });

    // Listen for polling responses
    socket.on("mpesa_poll", (data) => {
      if (handlers.onPollUpdate) {
        handlers.onPollUpdate(data);
      }
    });
  },

  recordSale: async (saleData) => {
    const response = await api.post("/sales", saleData);
    return response.data;
  },

  recordMultipleSale: async (saleData) => {
    const response = await api.post("/sales/transaction", saleData);
    return response.data;
  },

  // Record a sale for specific store
  recordStoreSale: async (storeId, saleData) => {
    const response = await api.post(`/sales/stores/${storeId}`, saleData);
    return response.data;
  },

  // Get daily sales summary (global or filtered by store)
  getDailySummary: async ({ date, storeId } = {}) => {
    const params = {};
    if (date) params.date = date.toISOString().split("T")[0];
    if (storeId) params.storeId = storeId;

    const response = await api.get("/sales/daily", { params });
    return response.data;
  },

  // Get store-specific daily summary
  getStoreDailySummary: async (storeId, date) => {
    const params = date ? { date: date.toISOString().split("T")[0] } : {};
    const response = await api.get(`/sales/stores/${storeId}/daily`, {
      params,
    });
    return response.data;
  },

  // Get sales by date range (global or filtered by store)
  getSalesByDateRange: async ({
    startDate,
    endDate,
    page = 1,
    limit = 50,
    storeId,
  } = {}) => {
    const params = { startDate, endDate, page, limit };
    if (storeId) params.storeId = storeId;

    const response = await api.get("/sales/period", { params });
    return response.data;
  },

  // Get store-specific sales by date range
  getStoreSalesByDateRange: async (
    storeId,
    { startDate, endDate, page = 1, limit = 50 } = {},
  ) => {
    const params = { startDate, endDate, page, limit };
    const response = await api.get(`/sales/stores/${storeId}/period`, {
      params,
    });
    return response.data;
  },

  // Get top selling products (global or filtered by store)
  getTopSellingProducts: async ({
    limit = 10,
    startDate,
    endDate,
    storeId,
  } = {}) => {
    const params = { limit, startDate, endDate };
    if (storeId) params.storeId = storeId;

    const response = await api.get("/sales/top-products", { params });
    return response.data;
  },

  // Get store-specific top products
  getStoreTopSellingProducts: async (
    storeId,
    { limit = 10, startDate, endDate } = {},
  ) => {
    const params = { limit, startDate, endDate };
    const response = await api.get(`/sales/stores/${storeId}/top-products`, {
      params,
    });
    return response.data;
  },

  // Get sales analytics (global or filtered by store)
  getSalesAnalytics: async ({ period = "month", storeId } = {}) => {
    const params = { period };
    if (storeId) params.storeId = storeId;

    const response = await api.get("/sales/analytics", { params });
    return response.data;
  },

  // Get store-specific analytics
  getStoreSalesAnalytics: async (storeId, { period = "month" } = {}) => {
    const response = await api.get(`/sales/stores/${storeId}/analytics`, {
      params: { period },
    });
    return response.data;
  },

  // Get sales by product (global or filtered by store)
  getSalesByProduct: async ({
    productId,
    page = 1,
    limit = 30,
    storeId,
  } = {}) => {
    const params = { page, limit };
    if (storeId) params.storeId = storeId;

    const response = await api.get(`/sales/product/${productId}`, { params });
    return response.data;
  },

  // Get store-specific sales by product
  getStoreSalesByProduct: async (
    storeId,
    productId,
    { page = 1, limit = 30 } = {},
  ) => {
    const response = await api.get(
      `/sales/stores/${storeId}/product/${productId}`,
      {
        params: { page, limit },
      },
    );
    return response.data;
  },

  // Refund a sale (global - optional store validation)
  refundSale: async ({ saleId, reason, storeId } = {}) => {
    const response = await api.post(`/sales/${saleId}/refund`, {
      reason,
      storeId,
    });
    return response.data;
  },

  // Refund a sale in specific store
  refundStoreSale: async (storeId, saleId, reason) => {
    const response = await api.post(
      `/sales/stores/${storeId}/refund/${saleId}`,
      { reason },
    );
    return response.data;
  },

  // Get recent sales (global or filtered by store)
  getRecentSales: async ({ limit = 20, storeId } = {}) => {
    const params = { limit };
    if (storeId) params.storeId = storeId;

    const response = await api.get("/sales/recent", { params });
    return response.data;
  },

  // Get store-specific recent sales
  getStoreRecentSales: async (storeId, { limit = 20 } = {}) => {
    const response = await api.get(`/sales/stores/${storeId}/recent`, {
      params: { limit },
    });
    return response.data;
  },

  // ============ NEW STORE COMPARISON ROUTES ============

  // Get comparison between stores
  getStoreComparison: async ({ startDate, endDate } = {}) => {
    const params = { startDate, endDate };
    const response = await api.get("/sales/stores/comparison", { params });
    return response.data;
  },

  // Get timeline for specific store
  getStoreTimeline: async (
    storeId,
    { startDate, endDate, interval = "day" } = {},
  ) => {
    const params = { startDate, endDate, interval };
    const response = await api.get(`/sales/stores/${storeId}/timeline`, {
      params,
    });
    return response.data;
  },

  // Get monthly report for specific store
  getStoreMonthlyReport: async (storeId, { year, month } = {}) => {
    const params = { year, month };
    const response = await api.get(`/sales/stores/${storeId}/monthly`, {
      params,
    });
    return response.data;
  },

  // ============ BACKWARD COMPATIBILITY ============

  // Keep original methods for backward compatibility
  getSaleById: async (saleId) => {
    const response = await api.get(`/sales/${saleId}`);
    return response.data;
  },

  // Get today's sales (shortcut)
  getTodaySales: async (storeId) => {
    return salesApi.getDailySummary({
      date: new Date(),
      storeId,
    });
  },

  // Get this month's sales
  getThisMonthSales: async ({ page = 1, limit = 50, storeId } = {}) => {
    const startDate = new Date(new Date().getFullYear(), new Date().getMonth());
    const endDate = new Date();
    return salesApi.getSalesByDateRange({
      startDate,
      endDate,
      page,
      limit,
      storeId,
    });
  },

  // ============ CONVENIENCE METHODS ============

  // Get store performance overview
  getStorePerformance: async (storeId, period = "month") => {
    const [analytics, recent, topProducts] = await Promise.all([
      salesApi.getStoreSalesAnalytics(storeId, { period }),
      salesApi.getStoreRecentSales(storeId, { limit: 10 }),
      salesApi.getStoreTopSellingProducts(storeId, { limit: 5 }),
    ]);

    return {
      analytics: analytics.data,
      recentSales: recent.data,
      topProducts: topProducts.data,
    };
  },

  // Get dashboard data (all stores or specific store)
  getDashboardData: async (storeId) => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [daily, monthly, recent, topProducts] = await Promise.all([
      salesApi.getDailySummary({ date: today, storeId }),
      salesApi.getSalesByDateRange({
        startDate: firstDayOfMonth,
        endDate: today,
        storeId,
      }),
      salesApi.getRecentSales({ limit: 10, storeId }),
      salesApi.getTopSellingProducts({ limit: 5, storeId }),
    ]);

    return {
      daily: daily.data,
      monthly: monthly.data,
      recent: recent.data,
      topProducts: topProducts.data,
    };
  },

  // Export sales data
  exportSalesData: async ({
    startDate,
    endDate,
    storeId,
    format = "json",
  } = {}) => {
    const params = { startDate, endDate, format };
    if (storeId) params.storeId = storeId;

    const response = await api.get("/sales/export", { params });
    return response.data;
  },
};

export default salesApi;
