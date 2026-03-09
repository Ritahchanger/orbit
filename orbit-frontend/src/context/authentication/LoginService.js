// services/auth/loginService.js

import { api } from "../../api/axios-conf";


export const loginService = {
    login: async (credentials) => {
        try {
            const response = await api.post("/auth/signin", credentials);
            return response.data;
        } catch (error) {
            // Override axios interceptor error for login specifically
            if (error.response?.status === 401) {
                throw new Error("Invalid email or password");
            }
            throw error; // Re-throw other errors
        }
    }
};