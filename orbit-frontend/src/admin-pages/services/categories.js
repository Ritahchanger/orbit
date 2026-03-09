import { api } from "../../api/axios-conf";

const categoriesApi = {
  // ============ GET ALL CATEGORIES ============
  getAll: async () => {
    const response = await api.get("/product-categories");
    return response.data;
  },

  // ============ GET CATEGORY BY ID ============
  getById: async (id) => {
    const response = await api.get(`/product-categories/${id}`);
    return response.data;
  },

  // ============ CREATE NEW CATEGORY ============
  create: async (categoryData) => {
    const response = await api.post("/product-categories", categoryData);
    return response.data;
  },

  // ============ UPDATE CATEGORY ============
  update: async (id, updatedData) => {
    const response = await api.put(`/product-categories/${id}`, updatedData);
    return response.data;
  },

  // ============ DELETE CATEGORY ============
  delete: async (id) => {
    const response = await api.delete(`/product-categories/${id}`);
    return response.data;
  },
};

export default categoriesApi;
