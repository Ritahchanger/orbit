// src/hooks/useTransactions.js
import { useQuery, useQueryClient } from "@tanstack/react-query";

import transactionsApi from "../services/transaction-api";

import { useStoreId } from "../../context/store/StoreContext";

// Minimal query keys for RAM optimization
export const transactionKeys = {
    all: (storeId = 'global') => ["transactions", storeId],
    list: (params) => ["transactions", "list", params],
    detail: (id) => ["transactions", "detail", id],
    store: (storeId, params) => ["transactions", "store", storeId, params],
    today: (storeId) => ["transactions", "today", storeId],
};

/**
 * 1. Hook: Get all transactions with pagination and filtering
 * - Minimal caching: 1 minute stale, 2 minute cache
 * - Small payload: Only request necessary fields via API
 */
export const useTransactions = (params = {}) => {
    const { storeId: explicitStoreId, ...restParams } = params;
    const contextStoreId = useStoreId();
    const isAllStores = explicitStoreId === 'all';
    const apiStoreId = isAllStores ? undefined : (explicitStoreId || contextStoreId);
    
    return useQuery({
        queryKey: transactionKeys.list({ ...restParams, apiStoreId }),
        queryFn: () => transactionsApi.getAllTransactions({
            ...restParams,
            storeId: apiStoreId,
            page: restParams.page || 1,
            limit: Math.min(restParams.limit || 20, 50), // Cap at 50 for RAM
        }),
        staleTime: 1000 * 60, // 1 minute
        gcTime: 1000 * 60 * 2, // 2 minutes (optimized for RAM)
        refetchOnWindowFocus: false, // Save RAM
        refetchOnReconnect: false,
        retry: 1, // Single retry
    });
};

/**
 * 2. Hook: Get transaction by ID with detailed sales information
 * - Medium caching: 5 minutes stale, 10 minutes cache
 * - Only fetch when needed
 */
export const useTransactionById = (transactionId) => {
    return useQuery({
        queryKey: transactionKeys.detail(transactionId),
        queryFn: () => transactionsApi.getTransactionById(transactionId),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        enabled: !!transactionId,
        refetchOnWindowFocus: false,
    });
};

/**
 * 3. Hook: Get all transactions for a specific store
 * - Similar to getAllTransactions but store-specific
 */
export const useStoreTransactions = (storeId, params = {}) => {
    return useQuery({
        queryKey: transactionKeys.store(storeId, params),
        queryFn: () => transactionsApi.getStoreTransactions(storeId, {
            ...params,
            page: params.page || 1,
            limit: Math.min(params.limit || 20, 50), // Cap at 50
        }),
        staleTime: 1000 * 60, // 1 minute
        gcTime: 1000 * 60 * 2, // 2 minutes
        enabled: !!storeId,
        refetchOnWindowFocus: false,
        retry: 1,
    });
};

/**
 * 4. Hook: Get today's transactions summary and analytics
 * - Short caching: 30 seconds stale, 1 minute cache
 * - Frequently updated data
 */
export const useTodaySummary = (storeId) => {
    const contextStoreId = useStoreId();
    const effectiveStoreId = storeId || contextStoreId;
    const apiStoreId = effectiveStoreId === 'global' ? undefined : effectiveStoreId;

    return useQuery({
        queryKey: transactionKeys.today(effectiveStoreId || 'global'),
        queryFn: () => transactionsApi.getTodaySummary(apiStoreId),
        staleTime: 1000 * 30, // 30 seconds
        gcTime: 1000 * 60, // 1 minute
        refetchInterval: 1000 * 60 * 5, // Auto-refresh every 5 minutes
        refetchOnWindowFocus: false,
        retry: 1,
    });
};

/**
 * Optimized hook for transaction dashboard (combines today + recent)
 */
export const useTransactionDashboard = (storeId) => {
    const contextStoreId = useStoreId();
    const effectiveStoreId = storeId || contextStoreId;
    const apiStoreId = effectiveStoreId === 'global' ? undefined : effectiveStoreId;

    return useQuery({
        queryKey: ['transactions', 'dashboard', effectiveStoreId || 'global'],
        queryFn: async () => {
            const [todaySummary, recent] = await Promise.all([
                transactionsApi.getTodaySummary(apiStoreId),
                transactionsApi.getAllTransactions({
                    limit: 5,
                    sortBy: 'createdAt',
                    sortOrder: 'desc',
                    storeId: apiStoreId,
                }),
            ]);
            
            return {
                today: todaySummary.data,
                recent: recent.data || [],
            };
        },
        staleTime: 1000 * 60, // 1 minute
        gcTime: 1000 * 60 * 2, // 2 minutes
        refetchOnWindowFocus: false,
        retry: 1,
    });
};

/**
 * Memory-optimized hook for transaction search
 * - Only searches when input has at least 2 characters
 * - Debounced by caller (not here to keep simple)
 */
export const useTransactionSearch = (searchTerm, params = {}) => {
    const { storeId: explicitStoreId, ...restParams } = params;
    const contextStoreId = useStoreId();
    const apiStoreId = explicitStoreId === 'all' ? undefined : (explicitStoreId || contextStoreId);

    return useQuery({
        queryKey: ['transactions', 'search', searchTerm, apiStoreId],
        queryFn: () => {
            // Try by customer name first
            return transactionsApi.getAllTransactions({
                customerName: searchTerm,
                limit: 10,
                storeId: apiStoreId,
                ...restParams,
            });
        },
        enabled: searchTerm && searchTerm.trim().length >= 2,
        staleTime: 1000 * 60 * 2, // 2 minutes for search results
        gcTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    });
};

/**
 * Hook to clear transaction cache (memory management)
 */
export const useClearTransactionCache = () => {
    const queryClient = useQueryClient();
    const storeId = useStoreId();

    return () => {
        // Only remove transaction queries to free RAM
        const queries = queryClient.getQueryCache().getAll();
        queries.forEach(query => {
            if (query.queryKey[0] === 'transactions') {
                queryClient.removeQueries({ queryKey: query.queryKey });
            }
        });
    };
};

/**
 * Hook to prefetch transaction for better UX
 */
export const usePrefetchTransaction = () => {
    const queryClient = useQueryClient();

    return (transactionId) => {
        queryClient.prefetchQuery({
            queryKey: transactionKeys.detail(transactionId),
            queryFn: () => transactionsApi.getTransactionById(transactionId),
            staleTime: 1000 * 60 * 5,
        });
    };
};

/**
 * Hook to invalidate transaction queries after mutations
 */
export const useInvalidateTransactions = () => {
    const queryClient = useQueryClient();
    const storeId = useStoreId();

    return () => {
        // Invalidate only specific transaction queries
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        
        // If we have a store, invalidate store-specific too
        if (storeId && storeId !== 'global') {
            queryClient.invalidateQueries({ 
                queryKey: transactionKeys.store(storeId, {}) 
            });
        }
    };
};

/**
 * Utility function to manually garbage collect old queries
 */
export const cleanupTransactionQueries = (queryClient) => {
    const ONE_HOUR = 1000 * 60 * 60;
    const now = Date.now();
    
    queryClient.getQueryCache().getAll().forEach(query => {
        if (query.queryKey[0] === 'transactions') {
            const lastUpdated = query.state.dataUpdatedAt;
            if (lastUpdated && (now - lastUpdated) > ONE_HOUR) {
                queryClient.removeQueries({ queryKey: query.queryKey });
            }
        }
    });
};

// Minimal constants (no objects to save RAM)
export const TRANSACTION_STATUS = ['pending', 'completed', 'cancelled', 'refunded'];
export const PAYMENT_METHODS = ['cash', 'mpesa', 'card', 'paybill', 'installment', 'other'];
export const SORT_OPTIONS = ['createdAt', 'total', 'customerName', 'transactionId'];