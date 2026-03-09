import { api } from "../../api/axios-conf";

const aiApi = {
  // Analysis endpoints
  analyze: async (data, options = {}) => {
    const response = await api.post("/ai/analyze", {
      data,
      context: options.context || "general",
      type: options.type || "analysis",
      format: options.format || "json",
      audience: options.audience || "manager",
      language: options.language || "en",
      detailed: options.detailed || false,
    });
    return response.data;
  },

  analyzeDashboard: async (dashboardData) => {
    const response = await api.post("/ai/dashboard", {
      data: dashboardData,
    });
    console.log(response.data)
    return response.data;
  },

  analyzeProducts: async (productsData) => {
    const response = await api.post("/ai/products", {
      data: productsData,
    });
    return response.data;
  },

  analyzeTransactions: async (transactionsData) => {
    const response = await api.post("/ai/transactions", {
      data: transactionsData,
    });
    return response.data;
  },

  // ✅ ADD THIS - Missing inventory endpoint
  analyzeInventory: async (inventoryData) => {
    const response = await api.post("/ai/inventory", {
      data: inventoryData,
    });
    return response.data;
  },

  generateReport: async (reportData, reportType = "performance") => {
    const response = await api.post("/ai/report", {
      data: reportData,
      reportType,
    });
    return response.data;
  },

  chat: async (message, history = []) => {
    const response = await api.post("/ai/chat", {
      message,
      history,
    });
    return response.data;
  },

  // Health endpoints
  healthCheck: async () => {
    const response = await api.get("/ai/health");
    return response.data;
  },

  getStatus: async () => {
    const response = await api.get("/ai/status");
    return response.data;
  },
};

export default aiApi;
