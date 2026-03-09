// services/authApiService.js (Enhanced version)

import { api } from "../../api/axios-conf";

export const authApiService = {
    // Set authentication token for all requests
    setAuthToken: (token) => {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    },

    // Clear authentication token
    clearAuthToken: () => {
        delete api.defaults.headers.common["Authorization"];
    },

    // User authentication
    login: (credentials) => api.post("/auth/signin", credentials),

    logout: () => api.post("/auth/logout"),

    getCurrentUser: () => api.get("/auth/me"),

    // OAuth related
    storeIntendedPath: (intendedPath) =>
        api.post("/auth/store-intended-path", { intendedPath }),

    // Additional auth methods
    refreshToken: () => api.post("/auth/refresh-token"),

    verifyToken: () => api.get("/auth/verify-token"),

    // User management
    updateProfile: (userData) => api.put("/auth/profile", userData),

    changePassword: (passwordData) =>
        api.put("/auth/change-password", passwordData),

    getIntendedPath: () => {
        return (
            sessionStorage.getItem("preAuthPath") ||
            localStorage.getItem("preAuthPath") ||
            "/admin"
        );
    },

    // Utility method to check if user is authenticated
    checkAuthStatus: async () => {
        try {
            const response = await api.get("/auth/me");
            return { isAuthenticated: true, user: response.data };
        } catch (error) {
            return { isAuthenticated: false, user: null };
        }
    },
};
