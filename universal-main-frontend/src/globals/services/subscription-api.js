import { api } from "../../config/api";

const subscriptionApi = {
  // ── Public: plans (no token needed) ──────────────────────────────────────
  getAllPlans: async (params = {}) => {
    const response = await api.get("/subscription/plans", { params });
    return response.data;
  },

  getPlanById: async (id) => {
    const response = await api.get(`/subscription/plans/${id}`);
    return response.data;
  },

  // ── Protected: plans (token required) ────────────────────────────────────
  createPlan: async (planData) => {
    const response = await api.post("/subscription/plans", planData);
    return response.data;
  },

  updatePlan: async (id, planData) => {
    const response = await api.patch(`/subscription/plans/${id}`, planData);
    return response.data;
  },

  deletePlan: async (id) => {
    const response = await api.delete(`/subscription/plans/${id}`);
    return response.data;
  },

  // ── Protected: payments ──────────────────────────────────────────────────
  getAllPayments: async (params = {}) => {
    const response = await api.get("/subscription/payments", { params });
    return response.data;
  },

  getPaymentById: async (id) => {
    const response = await api.get(`/subscription/payments/${id}`);
    return response.data;
  },

  createPayment: async (paymentData) => {
    const response = await api.post("/subscription/payments", paymentData);
    return response.data;
  },

  updatePayment: async (id, paymentData) => {
    const response = await api.patch(
      `/subscription/payments/${id}`,
      paymentData,
    );
    return response.data;
  },

  deletePayment: async (id) => {
    const response = await api.delete(`/subscription/payments/${id}`);
    return response.data;
  },

  // ── Protected: subscription ─────────────────────────────────────────────
  getAllSubscriptions: async (params = {}) => {
    const response = await api.get("/subscription", { params });
    return response.data;
  },

  getMySubscription: async () => {
    const response = await api.get("/subscription/my");
    return response.data;
  },

  createSubscription: async (subscriptionData) => {
    const response = await api.post("/subscription", subscriptionData);
    return response.data;
  },

  cancelSubscription: async (id, reason = "") => {
    const response = await api.patch(`/subscription/${id}/cancel`, { reason });
    return response.data;
  },

  updateSubscription: async (id, subscriptionData) => {
    const response = await api.patch(`/subscription/${id}`, subscriptionData);
    return response.data;
  },

  getSubscriptionById: async (id) => {
    const response = await api.get(`/subscription/${id}`);
    return response.data;
  },

  deleteSubscription: async (id) => {
    const response = await api.delete(`/subscription/${id}`);
    return response.data;
  },
};

export default subscriptionApi;
