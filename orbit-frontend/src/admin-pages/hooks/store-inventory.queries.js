// store-inventory.queries.js
import { useQuery,useInfiniteQuery } from "@tanstack/react-query";
import { inventoryApi } from "../services/inventory-api";
export const inventoryKeys = {
    all: ["inventory"],
    lists: () => [...inventoryKeys.all, "list"],
    list: (storeId, filters = {}) => [...inventoryKeys.lists(), { storeId, ...filters }],
    details: () => [...inventoryKeys.all, "detail"],
    detail: (inventoryId) => [...inventoryKeys.details(), inventoryId],
    stats: (storeId) => [...inventoryKeys.all, "stats", storeId],
    alerts: (storeId, limit) => [...inventoryKeys.all, "alerts", storeId, { limit }],
    available: (storeId, filters = {}) => [...inventoryKeys.all, "available", storeId, filters],
    history: (storeId, filters = {}) => [...inventoryKeys.all, "history", storeId, filters],
    transfers: (storeId, filters = {}) => [...inventoryKeys.all, "transfers", storeId, filters],
};

/**
 * Get store inventory with filtering
 */
export const useStoreInventory = (storeId, filters = {}, options = {}) => {
    return useQuery({
        queryKey: inventoryKeys.list(storeId, filters),
        queryFn: () => inventoryApi.getStoreInventory(storeId, filters),
        enabled: !!storeId,
        ...options,
    });
};

/**
 * Get inventory statistics
 */
export const useInventoryStats = (storeId, options = {}) => {
    return useQuery({
        queryKey: inventoryKeys.stats(storeId),
        queryFn: () => inventoryApi.getInventoryStats(storeId),
        enabled: !!storeId,
        ...options,
    });
};

/**
 * Get low stock alerts
 */
export const useLowStockAlerts = (storeId, limit = 20, options = {}) => {
    return useQuery({
        queryKey: inventoryKeys.alerts(storeId, limit),
        queryFn: () => inventoryApi.getLowStockAlerts(storeId, limit),
        enabled: !!storeId,
        ...options,
    });
};

/**
 * Get products available to add to store
 */
export const useAvailableProducts = (storeId, filters = {}, options = {}) => {
    return useQuery({
        queryKey: inventoryKeys.available(storeId, filters),
        queryFn: () => inventoryApi.getAvailableProducts(storeId, filters),
        enabled: !!storeId,
        ...options,
    });
};

/**
 * Get specific inventory item
 */
export const useInventoryItem = (inventoryId, options = {}) => {
    return useQuery({
        queryKey: inventoryKeys.detail(inventoryId),
        queryFn: () => inventoryApi.getInventoryItem(inventoryId),
        enabled: !!inventoryId,
        ...options,
    });
};

/**
 * Get inventory history
 */
export const useInventoryHistory = (storeId, filters = {}, options = {}) => {
    return useQuery({
        queryKey: inventoryKeys.history(storeId, filters),
        queryFn: () => inventoryApi.getInventoryHistory(storeId, filters),
        enabled: !!storeId,
        ...options,
    });
};

/**
 * Get stock transfer history
 */
export const useTransferHistory = (storeId, filters = {}, options = {}) => {
    return useQuery({
        queryKey: inventoryKeys.transfers(storeId, filters),
        queryFn: () => inventoryApi.getTransferHistory(storeId, filters),
        enabled: !!storeId,
        ...options,
    });
};

/**
 * Infinite scroll for inventory
 */
export const useInfiniteInventory = (storeId, filters = {}, pageSize = 20) => {
    return useInfiniteQuery({
        queryKey: [...inventoryKeys.list(storeId, filters), 'infinite'],
        queryFn: ({ pageParam = 1 }) =>
            inventoryApi.getStoreInventory(storeId, {
                ...filters,
                page: pageParam,
                limit: pageSize
            }),
        getNextPageParam: (lastPage, pages) => {
            const { pagination } = lastPage || {};
            if (!pagination) return undefined;

            if (pagination.page < pagination.pages) {
                return pagination.page + 1;
            }
            return undefined;
        },
        enabled: !!storeId,
        initialPageParam: 1,
    });
};

// Convenience query hooks
export const useSearchInventory = (storeId, searchTerm, filters = {}, options = {}) => {
    return useStoreInventory(storeId, { search: searchTerm, ...filters }, options);
};

export const useLowStockItems = (storeId, filters = {}, options = {}) => {
    return useStoreInventory(storeId, { lowStock: true, ...filters }, options);
};

export const useOutOfStockItems = (storeId, filters = {}, options = {}) => {
    return useStoreInventory(storeId, { outOfStock: true, ...filters }, options);
};

export const useInventoryByCategory = (storeId, category, filters = {}, options = {}) => {
    return useStoreInventory(storeId, { category, ...filters }, options);
};