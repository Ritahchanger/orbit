import { api } from "../../api/axios-conf";

const NewsletterApi = {
    // ============ SUBSCRIBER MANAGEMENT ============

    /**
     * Subscribe to newsletters
     * @param {Object} data - { email: string, preferences?: object }
     */
    subscribe: async (data) => {
        const response = await api.post("/newsletters/subscribe", data);
        return response.data;
    },
    /**
     * Unsubscribe from newsletters
     * @param {Object} data - { email: string }
     */
    unsubscribe: async (data) => {
        const response = await api.post("/newsletters/unsubscribe", data);
        return response.data;
    },

    /**
     * Update newsletters preferences
     * @param {Object} data - { email: string, preferences: object }
     */
    updatePreferences: async (data) => {
        const response = await api.post("/newsletters/preferences", data);
        return response.data;
    },

    // ============ GET SUBSCRIBERS ============

    /**
     * Get all newsletters subscribers
     * @param {Object} params - { subscribed?: 'true' | 'false' }
     */
    getSubscribers: async (params = {}) => {
        const response = await api.get("/newsletters/subscribers", { params });
        return response.data;
    },

    // ============ SEND NEWSLETTER ============

    /**
     * Send a newsletters
     * @param {Object} data - { 
     *   subject: string, 
     *   content: string (HTML),
     *   campaignId?: string
     * }
     */
    sendNewsletter: async (data) => {
        const response = await api.post("/newsletters/send", data);
        return response.data;
    },

    // ============ OPTIONAL: HELPER FUNCTIONS ============

    /**
     * Quick subscribe - minimal version
     */
    quickSubscribe: async (email) => {
        return await NewsletterApi.subscribe({ email });
    },

    /**
     * Check if email is subscribed
     */
    checkSubscription: async (email) => {
        const response = await NewsletterApi.getSubscribers({ subscribed: 'true' });
        const subscribers = response.data || [];
        return subscribers.some(sub => sub.email === email);
    },

    /**
     * Get subscriber count
     */
    getSubscriberCount: async (subscribedOnly = true) => {
        const params = subscribedOnly ? { subscribed: 'true' } : {};
        const response = await NewsletterApi.getSubscribers(params);
        return response.count || 0;
    }
};

export default NewsletterApi;