// orders-api.js
import { api } from "../../api/axios-conf";

/**
 * List orders (businessId-scoped server-side)
 * GET /orders?status=&page=&limit=
 * @param {object} params - { status, page, limit }
 */
export const getOrders = async (params = {}) => {
    const response = await api.get("/orders", { params });
    return response.data;
};

/**
 * Get a single order by id
 * GET /orders/:id
 * @param {string} id - Order identifier
 */
export const getOrderById = async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
};

/**
 * Update an order's status
 * PATCH /orders/:id/status
 * @param {string} id - Order identifier
 * @param {string} status - New order status
 */
export const updateOrderStatus = async (id, status) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
};

/**
 * List customers, derived/aggregated from orders (businessId-scoped server-side)
 * GET /orders/customers?search=&page=&limit=
 * @param {object} params - { search, page, limit }
 */
export const getCustomers = async (params = {}) => {
    const response = await api.get("/orders/customers", { params });
    return response.data;
};

/**
 * Get a single customer's summary + full order history
 * GET /orders/customers/:phone
 * @param {string} phone - Customer phone number (their identifier)
 */
export const getCustomerDetail = async (phone) => {
    const response = await api.get(`/orders/customers/${encodeURIComponent(phone)}`);
    return response.data;
};
