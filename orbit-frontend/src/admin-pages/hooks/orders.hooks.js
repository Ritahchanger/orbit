// orders.hooks.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { getOrders, getOrderById, updateOrderStatus, getCustomers, getCustomerDetail } from "../services/orders-api";

// Query keys
export const ordersKeys = {
    all: ["orders"],
    list: (filters = {}) => [...ordersKeys.all, "list", filters],
    detail: (orderId) => [...ordersKeys.all, "detail", orderId],
    customers: (filters = {}) => [...ordersKeys.all, "customers", filters],
    customer: (phone) => [...ordersKeys.all, "customers", phone],
};

/**
 * List orders with optional status/page/limit filters
 * @param {object} filters - { status, page, limit }
 */
export const useOrders = (filters = {}, options = {}) => {
    return useQuery({
        queryKey: ordersKeys.list(filters),
        queryFn: () => getOrders(filters),
        staleTime: 2 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        ...options,
    });
};

/**
 * Get a single order by id
 * @param {string} orderId - Order identifier
 */
export const useOrder = (orderId, options = {}) => {
    return useQuery({
        queryKey: ordersKeys.detail(orderId),
        queryFn: () => getOrderById(orderId),
        enabled: !!orderId,
        staleTime: 2 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        ...options,
    });
};

/**
 * Update an order's status
 */
export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }) => updateOrderStatus(id, status),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ordersKeys.all });
            queryClient.invalidateQueries({ queryKey: ordersKeys.detail(variables.id) });
            toast.success(data?.message || "Order status updated");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || error.message || "Failed to update order status");
        },
    });
};

/**
 * List customers (derived from orders) with optional search/page/limit filters
 * @param {object} filters - { search, page, limit }
 */
export const useCustomers = (filters = {}, options = {}) => {
    return useQuery({
        queryKey: ordersKeys.customers(filters),
        queryFn: () => getCustomers(filters),
        staleTime: 2 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        ...options,
    });
};

/**
 * Get a single customer's summary + order history
 * @param {string} phone - Customer phone number
 */
export const useCustomerDetail = (phone, options = {}) => {
    return useQuery({
        queryKey: ordersKeys.customer(phone),
        queryFn: () => getCustomerDetail(phone),
        enabled: !!phone,
        staleTime: 2 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        ...options,
    });
};
