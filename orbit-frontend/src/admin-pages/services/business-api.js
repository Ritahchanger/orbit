// services/business.api.js
import { api } from "../../api/axios-conf";

const businessApi = {
  // ── Public: register ─────────────────────────────────────────────────────
  register: async (businessData) => {
    const response = await api.post("/business/register", businessData);
    return response.data;
  },

  // ── Public: search (used on login page — no token needed) ────────────────
  search: async (query = "") => {
    const response = await api.get("/business/search", {
      params: { search: query },
    });
    return response.data;
  },

  // ── Protected: get all with filters/pagination ───────────────────────────
  getAll: async (params = {}) => {
    const response = await api.get("/business", { params });
    return response.data;
  },

  // ── Protected: get logged-in owner's business ────────────────────────────
  getMyBusiness: async () => {
    const response = await api.get("/business/my-business");
    return response.data;
  },

  // ── Protected: get single business by ID ─────────────────────────────────
  getById: async (id) => {
    const response = await api.get(`/business/${id}`);
    return response.data;
  },

  // ── Protected: update business info ──────────────────────────────────────
  update: async (id, updatedData) => {
    const response = await api.patch(`/business/${id}`, updatedData);
    return response.data;
  },

  // ── Protected: update business status (verify/suspend/activate) ──────────
  updateStatus: async (id, status, reason = "") => {
    const response = await api.patch(`/business/${id}/status`, {
      status,
      reason,
    });
    return response.data;
  },
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },
  // ── Protected: delete business ───────────────────────────────────────────
  delete: async (id) => {
    const response = await api.delete(`/business/${id}`);
    return response.data;
  },
};

export default businessApi;
