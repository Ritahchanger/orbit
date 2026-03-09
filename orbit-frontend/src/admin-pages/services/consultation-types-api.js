// services/consultation-api.js
import { api } from "../../api/axios-conf";

export const consultationApi = {
    /**
     * Get all consultation types (public)
     */
    getConsultationTypes: async (activeOnly = true) => {
        const response = await api.get("/bookings/consultation-types");
        return response.data;
    },

    /**
     * Get single consultation type by ID (public)
     */
    getConsultationTypeById: async (id) => {
        const response = await api.get(`/bookings/consultation-types/${id}`);
        return response.data;
    },

    // ========== ADMIN ENDPOINTS (Requires Authentication) ==========

    /**
     * Create new consultation type (admin only)
     */
    createConsultationType: async (typeData) => {
        const response = await api.post("/bookings/consultation-types", typeData);
        return response.data;
    },

    /**
     * Update consultation type (admin only)
     */
    updateConsultationType: async (id, updateData) => {
        const response = await api.put(`/bookings/consultation-types/${id}`, updateData);
        return response.data;
    },

    /**
     * Delete consultation type (admin only)
     */
    deleteConsultationType: async (id) => {
        const response = await api.delete(`/bookings/consultation-types/${id}`);
        return response.data;
    },

    /**
     * Toggle consultation type active status (admin only)
     */
    toggleConsultationTypeStatus: async (id) => {
        const response = await api.patch(`/bookings/consultation-types/${id}/toggle`);
        return response.data;
    },

    /**
     * Reorder consultation types (admin only)
     */
    reorderConsultationTypes: async (orderMap) => {
        const response = await api.post("/bookings/consultation-types/reorder", { orderMap });
        return response.data;
    },

    /**
     * Bulk update consultation types (admin only)
     * Optional: If you need bulk operations
     */
    bulkUpdateConsultationTypes: async (updates) => {
        const response = await api.put("/bookings/consultation-types/bulk", { updates });
        return response.data;
    }
};

export default consultationApi;