// hooks/product-hooks-store.js
import { useStoreId, useStoreContext } from '../../context/store/StoreContext';

import { toast } from 'react-hot-toast';

import {
    useStoreProducts as baseUseStoreProducts,
    useStoreProduct as baseUseStoreProduct,
    useCreateStoreProduct as baseUseCreateStoreProduct,
    useUpdateStoreProduct as baseUseUpdateStoreProduct,
    useDeleteStoreProduct as baseUseDeleteStoreProduct,
    useStoreLowStockProducts as baseUseStoreLowStockProducts,
    useStoreFeaturedProducts as baseUseStoreFeaturedProducts,
    useStoreProductsByCategory as baseUseStoreProductsByCategory,
    useStoreProductStats as baseUseStoreProductStats,
    useSearchStoreProducts as baseUseSearchStoreProducts,
    useUpdateStoreProductStock as baseUseUpdateStoreProductStock,
    useRecordStoreSale as baseUseRecordStoreSale,
    useInfiniteStoreProducts as baseUseInfiniteStoreProducts
} from './product.hooks';

// Helper function for consistent error handling
const getErrorMessage = (error) => {
    if (!error) return null;

    if (error.response?.data?.message) {
        return error.response.data.message;
    }

    if (error.message) {
        return error.message;
    }

    return 'An error occurred';
};

// Helper to check if store is available
const useStoreCheck = () => {
    const storeId = useStoreId();
    const { currentStore, isLoading } = useStoreContext();

    return {
        storeId,
        currentStore,
        isLoading,
        hasStore: !!storeId,
        storeReady: !isLoading && !!storeId
    };
};

/**
 * AUTOMATIC STORE PRODUCT HOOKS
 * These hooks automatically use the current store from context
 */

export const useAutoStoreProducts = (filters = {}, page = 1, limit = 20, enabled = true) => {
    const { storeId, hasStore, storeReady } = useStoreCheck();
    const shouldEnable = enabled && hasStore && storeReady;

    const query = baseUseStoreProducts(storeId, filters, page, limit, shouldEnable);

    return {
        ...query,
        error: getErrorMessage(query.error),
        // Enhanced state for UI
        state: {
            isLoading: query.isLoading,
            isFetching: query.isFetching,
            isError: query.isError,
            isSuccess: query.isSuccess,
            isEmpty: !query.isLoading && (!query.data?.products?.length),
            hasStore: hasStore,
            storeReady: storeReady,
            isDisabled: !shouldEnable
        },
        // Convenience getters
        products: query.data?.products || [],
        pagination: query.data?.pagination || {},
        store: query.data?.store
    };
};

export const useAutoStoreProduct = (productId, enabled = true) => {
    const { storeId, hasStore, storeReady } = useStoreCheck();
    const shouldEnable = enabled && hasStore && storeReady && !!productId;

    const query = baseUseStoreProduct(storeId, productId, shouldEnable);

    return {
        ...query,
        error: getErrorMessage(query.error),
        state: {
            isLoading: query.isLoading,
            isError: query.isError,
            isSuccess: query.isSuccess,
            hasStore: hasStore,
            storeReady: storeReady,
            isDisabled: !shouldEnable
        },
        product: query.data,
        store: query.data?.store
    };
};

export const useAutoCreateStoreProduct = () => {
    const { storeId, hasStore, storeReady } = useStoreCheck();
    const mutation = baseUseCreateStoreProduct(storeId);

    const enhancedMutation = {
        ...mutation,
        mutate: (variables) => {
            if (!hasStore) {
                toast.error("Please select a store first");
                return;
            }
            if (!storeReady) {
                toast.error("Store is not ready yet");
                return;
            }

            // Ensure store is set in product data
            const enhancedVariables = {
                ...variables,
                productData: {
                    ...variables.productData,
                    store: storeId,
                }
            };

            return mutation.mutate(enhancedVariables);
        },
        mutateAsync: async (variables) => {
            if (!hasStore) {
                throw new Error("No store selected. Please select a store first.");
            }
            if (!storeReady) {
                throw new Error("Store is not ready yet");
            }

            const enhancedVariables = {
                ...variables,
                productData: {
                    ...variables.productData,
                    store: storeId,
                }
            };

            return mutation.mutateAsync(enhancedVariables);
        }
    };

    // Add loading state indicator
    enhancedMutation.isCreating = enhancedMutation.isPending;

    return enhancedMutation;
};

export const useAutoUpdateStoreProduct = () => {
    const { storeId, hasStore, storeReady } = useStoreCheck();
    const mutation = baseUseUpdateStoreProduct(storeId);

    return {
        ...mutation,
        mutate: (variables) => {
            if (!hasStore) {
                toast.error("Please select a store first");
                return;
            }
            if (!storeReady) {
                toast.error("Store is not ready yet");
                return;
            }
            return mutation.mutate(variables);
        },
        mutateAsync: async (variables) => {
            if (!hasStore) {
                throw new Error("No store selected. Please select a store first.");
            }
            if (!storeReady) {
                throw new Error("Store is not ready yet");
            }
            return mutation.mutateAsync(variables);
        },
        isUpdating: mutation.isPending
    };
};

export const useAutoDeleteStoreProduct = () => {
    const { storeId, hasStore, storeReady } = useStoreCheck();
    const mutation = baseUseDeleteStoreProduct(storeId);

    return {
        ...mutation,
        mutate: (productId) => {
            if (!hasStore) {
                toast.error("Please select a store first");
                return;
            }
            if (!storeReady) {
                toast.error("Store is not ready yet");
                return;
            }
            return mutation.mutate(productId);
        },
        mutateAsync: async (productId) => {
            if (!hasStore) {
                throw new Error("No store selected. Please select a store first.");
            }
            if (!storeReady) {
                throw new Error("Store is not ready yet");
            }
            return mutation.mutateAsync(productId);
        },
        isDeleting: mutation.isPending
    };
};

export const useAutoStoreLowStockProducts = (limit = 20, enabled = true) => {
    const { storeId, hasStore, storeReady } = useStoreCheck();
    const shouldEnable = enabled && hasStore && storeReady;

    const query = baseUseStoreLowStockProducts(storeId, limit, shouldEnable);

    return {
        ...query,
        error: getErrorMessage(query.error),
        state: {
            isLoading: query.isLoading,
            isError: query.isError,
            isSuccess: query.isSuccess,
            hasStore: hasStore,
            storeReady: storeReady
        },
        products: query.data?.products || [],
        lowStockCount: query.data?.count || 0,
        store: query.data?.store
    };
};

export const useAutoStoreFeaturedProducts = (limit = 10, enabled = true) => {
    const { storeId, hasStore, storeReady } = useStoreCheck();
    const shouldEnable = enabled && hasStore && storeReady;

    const query = baseUseStoreFeaturedProducts(storeId, limit, shouldEnable);

    return {
        ...query,
        error: getErrorMessage(query.error),
        state: {
            isLoading: query.isLoading,
            isError: query.isError,
            isSuccess: query.isSuccess,
            hasStore: hasStore,
            storeReady: storeReady
        },
        products: query.data?.products || [],
        featuredCount: query.data?.featuredCount || 0,
        store: query.data?.store
    };
};

export const useAutoStoreProductsByCategory = (category, limit = 20, enabled = true) => {
    const { storeId, hasStore, storeReady } = useStoreCheck();
    const shouldEnable = enabled && hasStore && storeReady && !!category;

    const query = baseUseStoreProductsByCategory(storeId, category, limit, shouldEnable);

    return {
        ...query,
        error: getErrorMessage(query.error),
        state: {
            isLoading: query.isLoading,
            isError: query.isError,
            isSuccess: query.isSuccess,
            hasStore: hasStore,
            storeReady: storeReady,
            hasCategory: !!category
        },
        products: query.data?.products || [],
        category: query.data?.category,
        count: query.data?.count || 0,
        store: query.data?.store
    };
};

export const useAutoStoreProductStats = (enabled = true) => {
    const { storeId, hasStore, storeReady } = useStoreCheck();
    const shouldEnable = enabled && hasStore && storeReady;

    const query = baseUseStoreProductStats(storeId, shouldEnable);

    return {
        ...query,
        error: getErrorMessage(query.error),
        state: {
            isLoading: query.isLoading,
            isError: query.isError,
            isSuccess: query.isSuccess,
            hasStore: hasStore,
            storeReady: storeReady
        },
        stats: query.data || {},
        store: query.data?.store
    };
};

export const useAutoSearchStoreProducts = (query, page = 1, limit = 10, enabled = true) => {
    const { storeId, hasStore, storeReady } = useStoreCheck();
    const shouldEnable = enabled && hasStore && storeReady && !!query;

    const searchQuery = baseUseSearchStoreProducts(storeId, query, page, limit, shouldEnable);

    return {
        ...searchQuery,
        error: getErrorMessage(searchQuery.error),
        state: {
            isLoading: searchQuery.isLoading,
            isError: searchQuery.isError,
            isSuccess: searchQuery.isSuccess,
            hasStore: hasStore,
            storeReady: storeReady,
            hasQuery: !!query
        },
        products: searchQuery.data?.products || [],
        pagination: searchQuery.data?.pagination || {},
        store: searchQuery.data?.store
    };
};

export const useAutoUpdateStoreProductStock = () => {
    const { storeId, hasStore, storeReady } = useStoreCheck();
    const mutation = baseUseUpdateStoreProductStock(storeId);

    return {
        ...mutation,
        mutate: (variables) => {
            if (!hasStore) {
                toast.error("Please select a store first");
                return;
            }
            if (!storeReady) {
                toast.error("Store is not ready yet");
                return;
            }
            return mutation.mutate(variables);
        },
        mutateAsync: async (variables) => {
            if (!hasStore) {
                throw new Error("No store selected. Please select a store first.");
            }
            if (!storeReady) {
                throw new Error("Store is not ready yet");
            }
            return mutation.mutateAsync(variables);
        },
        isUpdatingStock: mutation.isPending
    };
};

export const useAutoRecordStoreSale = () => {
    const { storeId, hasStore, storeReady } = useStoreCheck();
    const mutation = baseUseRecordStoreSale(storeId);

    return {
        ...mutation,
        mutate: (variables) => {
            if (!hasStore) {
                toast.error("Please select a store first");
                return;
            }
            if (!storeReady) {
                toast.error("Store is not ready yet");
                return;
            }
            return mutation.mutate(variables);
        },
        mutateAsync: async (variables) => {
            if (!hasStore) {
                throw new Error("No store selected. Please select a store first.");
            }
            if (!storeReady) {
                throw new Error("Store is not ready yet");
            }
            return mutation.mutateAsync(variables);
        },
        isRecordingSale: mutation.isPending
    };
};

export const useAutoInfiniteStoreProducts = (filters = {}, limit = 20) => {
    const { storeId, hasStore, storeReady } = useStoreCheck();
    const enabled = hasStore && storeReady;

    const query = baseUseInfiniteStoreProducts(storeId, filters, limit, { enabled });

    return {
        ...query,
        error: getErrorMessage(query.error),
        state: {
            isLoading: query.isLoading,
            isError: query.isError,
            isSuccess: query.isSuccess,
            hasStore: hasStore,
            storeReady: storeReady,
            isFetchingNextPage: query.isFetchingNextPage,
            hasNextPage: query.hasNextPage
        },
        products: query.data?.products || [],
        totalPages: query.data?.totalPages || 0,
        totalProducts: query.data?.totalProducts || 0,
        store: query.data?.store,
        // Helper methods
        loadMore: query.fetchNextPage,
        canLoadMore: query.hasNextPage
    };
};

/**
 * SMART PRODUCT HOOKS
 * These automatically switch between global and store-specific based on context
 */

export const useSmartProducts = (filters = {}, page = 1, limit = 20, enabled = true) => {
    const { storeId, hasStore, storeReady } = useStoreCheck();

    if (hasStore && storeReady) {
        return useAutoStoreProducts(filters, page, limit, enabled);
    } else {
        // Fallback to global products
        const { useProducts } = require('./product.hooks');
        const query = useProducts(filters, page, limit, enabled);

        return {
            ...query,
            error: getErrorMessage(query.error),
            state: {
                isLoading: query.isLoading,
                isError: query.isError,
                isSuccess: query.isSuccess,
                hasStore: hasStore,
                storeReady: storeReady,
                isGlobal: true
            },
            products: query.data?.products || [],
            pagination: query.data?.pagination || {}
        };
    }
};

export const useSmartCreateProduct = () => {
    const { storeId, hasStore, storeReady } = useStoreCheck();

    if (hasStore && storeReady) {
        return useAutoCreateStoreProduct();
    } else {
        const { useCreateProduct } = require('./product.hooks');
        const mutation = useCreateProduct();

        return {
            ...mutation,
            isCreating: mutation.isPending,
            isGlobal: true
        };
    }
};

export const useSmartProduct = (productId, enabled = true) => {
    const { storeId, hasStore, storeReady } = useStoreCheck();

    if (hasStore && storeReady && productId) {
        return useAutoStoreProduct(productId, enabled);
    } else {
        const { useProduct } = require('./product.hooks');
        const query = useProduct(productId, enabled);

        return {
            ...query,
            error: getErrorMessage(query.error),
            state: {
                isLoading: query.isLoading,
                isError: query.isError,
                isSuccess: query.isSuccess,
                hasStore: hasStore,
                storeReady: storeReady,
                isGlobal: true
            },
            product: query.data
        };
    }
};

/**
 * UTILITY HOOKS
 */

// Hook to require store before performing actions
export const useRequireStore = () => {
    const { storeId, hasStore, currentStore, isLoading } = useStoreCheck();

    const ensureStore = (actionName = "perform this action") => {
        if (isLoading) {
            toast.error("Loading store information...");
            return false;
        }

        if (!hasStore) {
            toast.error(`Please select a store to ${actionName}`);
            return false;
        }

        return true;
    };

    return {
        storeId,
        currentStore,
        hasStore,
        isLoading,
        ensureStore,
        // Quick check helpers
        canCreate: hasStore,
        canUpdate: hasStore,
        canDelete: hasStore,
        // Store info
        storeName: currentStore?.name || "No store selected",
        storeCode: currentStore?.code || ""
    };
};

// Hook to get current store info for display
export const useCurrentStoreInfo = () => {
    const { currentStore, storeId, hasStore, isLoading } = useStoreCheck();

    return {
        id: storeId,
        name: currentStore?.name || "No Store",
        code: currentStore?.code || "",
        address: currentStore?.address,
        phone: currentStore?.phone,
        email: currentStore?.email,
        logo: currentStore?.logo,
        hasStore,
        isLoading,
        // Check if store is active
        isActive: currentStore?.status === "active",
        // Format for display
        displayName: currentStore?.name ? `${currentStore.name} (${currentStore.code})` : "Select a Store",
        shortName: currentStore?.name || "Select Store"
    };
};

// Hook to prefetch store products (for performance)
export const usePrefetchStoreProducts = () => {
    const { storeId, hasStore } = useStoreCheck();
    const queryClient = useQueryClient();

    const prefetchProducts = async (filters = {}, page = 1, limit = 20) => {
        if (!hasStore) return;

        const queryKey = productKeys.storeList(storeId, { ...filters, page, limit });

        await queryClient.prefetchQuery({
            queryKey,
            queryFn: () => productApi.getProductsByStore(storeId, filters, page, limit),
            staleTime: 1000 * 60 * 5 // 5 minutes
        });
    };

    const prefetchProduct = async (productId) => {
        if (!hasStore || !productId) return;

        const queryKey = productKeys.storeDetail(storeId, productId);

        await queryClient.prefetchQuery({
            queryKey,
            queryFn: () => productApi.getStoreProductById(storeId, productId),
            staleTime: 1000 * 60 * 10 // 10 minutes
        });
    };

    return {
        prefetchProducts,
        prefetchProduct,
        canPrefetch: hasStore
    };
};