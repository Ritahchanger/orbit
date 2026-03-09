// services/booking-api.js
import { api } from "../../api/axios-conf";

export const bookingApi = {
    /**
     * Get availability for date range
     */
    getAvailability: async (startDate = null, endDate = null) => {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const response = await api.get("/bookings/availability", { params });
        return response.data;
    },


    /**
     * Check if a specific date is valid for booking
     */
    checkDateValidity: async (date) => {
        const response = await api.get(`/bookings/check-date/${date}`);
        return response.data;
    },

    /**
     * Get available time slots for a specific date
     */
    getTimeSlots: async (date) => {
        const response = await api.get(`/bookings/time-slots/${date}`);
        return response.data;
    },

    /**
     * Get all consultation types
     */
    getConsultationTypes: async () => {
        const response = await api.get("/bookings/consultation-types");
        return response.data;
    },

    /**
     * Create a new booking
     */
    createBooking: async (bookingData) => {
        const response = await api.post("/bookings", bookingData, {
            withCredentials: false
        });
        return response.data;
    },

    /**
     * Get booking by reference number
     */
    getBooking: async (referenceNumber) => {
        const response = await api.get(`/bookings/${referenceNumber}`);
        return response.data;
    },

    /**
     * Cancel a booking
     */
    cancelBooking: async (referenceNumber, reason = "") => {
        const response = await api.post(`/bookings/${referenceNumber}/cancel`, { reason });
        return response.data;
    },

    /**
     * ADMIN: Update availability (requires token)
     */
    updateAvailability: async (availabilityData) => {
        const response = await api.put("/bookings/admin/availability", availabilityData);
        return response.data;
    },

    /**
     * ADMIN: Get all bookings (requires token)
     */
    getAllBookings: async (params = {}) => {
        const response = await api.get("/bookings/admin/bookings", { params });
        return response.data;
    }
};

export default bookingApi;