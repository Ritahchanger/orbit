import { api } from "../../api/axios-conf";

export const newsletterService = {
    /**
     * Subscribe to newsletter
     * @param {Object} data - { email: string, preferences?: object }
     * @returns {Promise} - API response
     */
    subscribe: async (data) => {
        try {
            const response = await api.post('/newsletters/subscribe', data);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Successfully subscribed to newsletter',
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to subscribe',
                data: null,
            };
        }
    }
};