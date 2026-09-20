// ecommerce-settings-api.js
import { api } from "../../api/axios-conf";

const ecommerceSettingsApi = {
    /**
     * Get the caller's business ecommerce storefront settings
     * GET /business/ecommerce-settings
     */
    getEcommerceSettings: async () => {
        const response = await api.get("/business/ecommerce-settings");
        return response.data;
    },

    /**
     * Update the caller's business ecommerce storefront settings
     * PATCH /business/ecommerce-settings
     * @param {object} data - Any subset of EcommerceSettings fields
     */
    updateEcommerceSettings: async (data) => {
        const response = await api.patch("/business/ecommerce-settings", data);
        return response.data;
    },
};

export default ecommerceSettingsApi;
