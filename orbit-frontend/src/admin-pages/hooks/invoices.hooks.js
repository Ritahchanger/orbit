import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
    getInvoices,
    getInvoiceById,
    createStandaloneInvoice,
    createInvoiceFromSale,
    updateInvoiceStatus,
    deleteInvoice,
} from "../services/invoices-api";

// Query keys
export const invoicesKeys = {
    all: ["invoices"],
    list: (filters = {}) => [...invoicesKeys.all, "list", filters],
    detail: (invoiceId) => [...invoicesKeys.all, "detail", invoiceId],
};

// ============ QUERIES ============

/**
 * List invoices with optional status/type filters + pagination
 * @param {Object} filters - { status, type, page, limit }
 */
export const useInvoices = (filters = {}) => {
    return useQuery({
        queryKey: invoicesKeys.list(filters),
        queryFn: () => getInvoices(filters),
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 5,
    });
};

/**
 * Fetch a single invoice by id
 * @param {string} invoiceId
 */
export const useInvoice = (invoiceId) => {
    return useQuery({
        queryKey: invoicesKeys.detail(invoiceId),
        queryFn: () => getInvoiceById(invoiceId),
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 5,
        enabled: !!invoiceId,
    });
};

// ============ MUTATIONS ============

export const useCreateStandaloneInvoice = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => createStandaloneInvoice(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: invoicesKeys.all });
            toast.success(data?.message || "Invoice created successfully");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to create invoice");
        },
    });
};

export const useCreateInvoiceFromSale = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (transactionId) => createInvoiceFromSale(transactionId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: invoicesKeys.all });
            toast.success(data?.message || "Invoice generated from sale");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to generate invoice from sale");
        },
    });
};

export const useUpdateInvoiceStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }) => updateInvoiceStatus(id, status),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: invoicesKeys.all });
            queryClient.invalidateQueries({ queryKey: invoicesKeys.detail(variables.id) });
            toast.success(data?.message || "Invoice status updated");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to update invoice status");
        },
    });
};

export const useDeleteInvoice = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => deleteInvoice(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: invoicesKeys.all });
            toast.success(data?.message || "Invoice deleted");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to delete invoice");
        },
    });
};
