import { api } from "../../api/axios-conf";

const logsApi = {
  // ============ FETCH LOGS ============
  getLogs: async (params = { page: 1, limit: 20 }) => {
    const response = await api.get("/logs", { params });
    return response.data;
  },

  // ============ DELETE SINGLE LOG ============
  deleteLog: async (id) => {
    const response = await api.delete(`/logs/${id}`);
    return response.data;
  },

  // ============ BATCH DELETE LOGS ============
  deleteLogsBatch: async (ids = []) => {
    const response = await api.delete("/logs", { data: { ids } });
    return response.data;
  },
};

export default logsApi;
