import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import productApi from "../services/product-api";
import { toast } from "react-hot-toast";

// Query keys
export const productKeys = {
    all: ["products"],
    lists: () => [...productKeys.all, "list"],
    list: (filters) => [...productKeys.lists(), filters],
    details: () => [...productKeys.all, "detail"],
    detail: (id) => [...productKeys.details(), id],
    sku: (sku) => [...productKeys.all, "sku", sku],
    lowStock: () => [...productKeys.all, "low-stock"],
    featured: (limit) => [...productKeys.all, "featured", limit],
    category: (category, limit) => [...productKeys.all, "category", category, limit],
    search: (query, page, limit) => [...productKeys.all, "search", query, page, limit],
    stats: () => [...productKeys.all, "stats"],
    filters: () => [...productKeys.all, "filters"],
    // Store-specific keys
    storeLists: (storeId) => [...productKeys.all, "store", storeId, "list"],
    storeList: (storeId, filters) => [...productKeys.storeLists(storeId), filters],
    storeDetail: (storeId, productId) => [...productKeys.all, "store", storeId, "detail", productId],
    storeLowStock: (storeId) => [...productKeys.all, "store", storeId, "low-stock"],
    storeFeatured: (storeId, limit) => [...productKeys.all, "store", storeId, "featured", limit],
    storeCategory: (storeId, category, limit) => [...productKeys.all, "store", storeId, "category", category, limit],
    storeStats: (storeId) => [...productKeys.all, "store", storeId, "stats"],
};

// ============ GLOBAL PRODUCT HOOKS ============

export const useProducts = (filters = {}, page = 1, limit = 10, enabled = true) => {
    return useQuery({
        queryKey: productKeys.list({ ...filters, page, limit }),
        queryFn: () => productApi.getProducts(filters, page, limit),
        enabled,
        retry: 2,
        select: (data) => ({
            products: data.data,
            pagination: data.pagination,
            success: data.success,
        }),
    });
};

export const useInfiniteProducts = (filters = {}, limit = 10) => {
    return useInfiniteQuery({
        queryKey: productKeys.list(filters),
        queryFn: ({ pageParam = 1 }) =>
            productApi.getProducts(filters, pageParam, limit),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            if (!lastPage.pagination?.hasNext) return undefined;
            return allPages.length + 1;
        },
        select: (data) => ({
            products: data.pages.flatMap(page => page.data),
            totalPages: data.pages[0]?.pagination?.totalPages || 0,
            totalProducts: data.pages[0]?.pagination?.total || 0,
        }),
    });
};

export const useProduct = (productId, enabled = true) => {
    return useQuery({
        queryKey: productKeys.detail(productId),
        queryFn: () => productApi.getProductById(productId),
        enabled: !!productId && enabled,
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 60,
        retry: 2,
        select: (data) => data.data,
    });
};

export const useProductBySKU = (sku, enabled = true) => {
    return useQuery({
        queryKey: productKeys.sku(sku),
        queryFn: () => productApi.getProductBySKU(sku),
        enabled: !!sku && enabled,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        retry: 2,
        select: (data) => data.data,
    });
};

export const useLowStockProducts = () => {
    return useQuery({
        queryKey: productKeys.lowStock(),
        queryFn: productApi.getLowStockProducts,
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 10,
        select: (data) => data.data,
    });
};

export const useFeaturedProducts = (limit = 10) => {
    return useQuery({
        queryKey: productKeys.featured(limit),
        queryFn: () => productApi.getFeaturedProducts(limit),
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 60,
        select: (data) => data.data,
    });
};

export const useProductsByCategory = (category, limit = 20, enabled = true) => {
    return useQuery({
        queryKey: productKeys.category(category, limit),
        queryFn: () => productApi.getProductsByCategory(category, limit),
        enabled: !!category && enabled,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        select: (data) => data.data,
    });
};

export const useSearchProducts = (query, page = 1, limit = 10, enabled = true) => {
    return useQuery({
        queryKey: productKeys.search(query, page, limit),
        queryFn: () => productApi.searchProducts(query, page, limit),
        enabled: !!query && enabled,
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 10,
        select: (data) => ({
            products: data.data,
            pagination: data.pagination,
        }),
    });
};

export const useProductStats = () => {
    return useQuery({
        queryKey: productKeys.stats(),
        queryFn: productApi.getProductStats,
        staleTime: 1000 * 60,
        gcTime: 1000 * 60 * 5,
        select: (data) => data.data,
    });
};

export const useProductFilters = () => {
    return useQuery({
        queryKey: productKeys.filters(),
        queryFn: productApi.getProductFilters,
        staleTime: 1000 * 60 * 60 * 24,
        gcTime: 1000 * 60 * 60 * 48,
        select: (data) => data.data,
    });
};

// ============ GLOBAL MUTATIONS (backward compatibility) ============

/**
 * Create product globally (requires store in body)
 */
export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ productData, files }) =>
            productApi.createProduct(productData, files),
        onSuccess: (data) => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
            queryClient.invalidateQueries({ queryKey: productKeys.lowStock() });
            queryClient.invalidateQueries({ queryKey: productKeys.stats() });

            // If store is specified in product data, invalidate store-specific queries too
            if (data.data?.store) {
                queryClient.invalidateQueries({ queryKey: productKeys.storeLists(data.data.store) });
                queryClient.invalidateQueries({ queryKey: productKeys.storeStats(data.data.store) });
            }

            toast.success(data.message || "Product created successfully");
            return data;
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to create product");
            throw error;
        },
    });
};

/**
 * Update product globally
 */
export const useUpdateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ productId, productData, files }) =>
            productApi.updateProduct(productId, productData, files),
        onSuccess: (data, variables) => {
            // Invalidate specific product and lists
            queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.productId) });
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
            queryClient.invalidateQueries({ queryKey: productKeys.lowStock() });

            // If store is specified in product data, invalidate store-specific queries too
            if (variables.productData?.store) {
                queryClient.invalidateQueries({ queryKey: productKeys.storeDetail(variables.productData.store, variables.productId) });
                queryClient.invalidateQueries({ queryKey: productKeys.storeLists(variables.productData.store) });
            }

            toast.success(data.message || "Product updated successfully");
            return data;
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to update product");
            throw error;
        },
    });
};

/**
 * Delete product globally
 */
export const useDeleteProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (productId) => productApi.deleteProduct(productId),
        onSuccess: (data, productId) => {
            // Remove from cache and invalidate lists
            queryClient.removeQueries({ queryKey: productKeys.detail(productId) });
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
            queryClient.invalidateQueries({ queryKey: productKeys.lowStock() });
            queryClient.invalidateQueries({ queryKey: productKeys.featured() });
            queryClient.invalidateQueries({ queryKey: productKeys.stats() });

            // Note: We can't invalidate store-specific queries without knowing the store
            toast.success(data.message || "Product deleted successfully");
            return data;
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to delete product");
            throw error;
        },
    });
};

/**
 * Update stock globally
 */
/**
 * Update stock globally
 */
export const useUpdateStock = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ productId, stockData }) =>
            productApi.updateStock(productId, stockData),
        onSuccess: (data, variables) => {
            // ✅ ADD THIS - Invalidate the products list query
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });

            // Also invalidate specific product and low stock queries
            queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.productId) });
            queryClient.invalidateQueries({ queryKey: productKeys.lowStock() });

            // ✅ ADD THIS - Invalidate stats too if you want updated statistics
            queryClient.invalidateQueries({ queryKey: productKeys.stats() });

            toast.success(data.message || "Stock updated successfully");
            return data;
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to update stock");
            throw error;
        },
    });
};

/**
 * Record sale globally
 */
export const useRecordSale = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ productId, quantity, sellingPrice }) =>
            productApi.recordSale(productId, quantity, sellingPrice),
        onSuccess: (data, variables) => {
            // Optimistic updates
            queryClient.setQueryData(
                productKeys.detail(variables.productId),
                (old) => {
                    if (!old?.data) return old;
                    return {
                        ...old,
                        data: {
                            ...old.data,
                            stock: old.data.stock - variables.quantity,
                            totalSold: old.data.totalSold + variables.quantity,
                        }
                    };
                }
            );

            // Invalidate low stock and stats
            queryClient.invalidateQueries({ queryKey: productKeys.lowStock() });
            queryClient.invalidateQueries({ queryKey: productKeys.stats() });

            toast.success(data.message || "Sale recorded successfully");
            return data;
        },
        onError: (error, variables, context) => {
            // Rollback on error
            queryClient.setQueryData(
                productKeys.detail(variables.productId),
                context.previousProduct
            );

            toast.error(error.response?.data?.message || "Failed to record sale");
            throw error;
        },
    });
};

/**
 * Restock product globally
 */
export const useRestockProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ productId, quantity, buyingPrice }) =>
            productApi.restockProduct(productId, quantity, buyingPrice),
        onSuccess: (data, variables) => {
            // Update product cache
            queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.productId) });
            queryClient.invalidateQueries({ queryKey: productKeys.lowStock() });

            toast.success(data.message || "Product restocked successfully");
            return data;
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to restock product");
            throw error;
        },
    });
};

/**
 * Add images to product globally
 */
export const useAddProductImages = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ productId, files }) =>
            productApi.addProductImages(productId, files),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.productId) });
            toast.success(data.message || "Images added successfully");
            return data;
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to add images");
            throw error;
        },
    });
};

/**
 * Remove image from product globally
 */
export const useRemoveProductImage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ productId, gcsFileName }) =>
            productApi.removeProductImage(productId, gcsFileName),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.productId) });
            toast.success(data.message || "Image removed successfully");
            return data;
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to remove image");
            throw error;
        },
    });
};

/**
 * Set primary image globally
 */
export const useSetPrimaryImage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ productId, gcsFileName }) =>
            productApi.setPrimaryImage(productId, gcsFileName),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.productId) });
            toast.success(data.message || "Primary image updated");
            return data;
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to set primary image");
            throw error;
        },
    });
};

/**
 * Optimistic updates for stock operations (global)
 */
export const useOptimisticUpdateStock = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ productId, stockData }) =>
            productApi.updateStock(productId, stockData),
        onMutate: async ({ productId, stockData }) => {
            // Cancel outgoing queries
            await queryClient.cancelQueries({ queryKey: productKeys.detail(productId) });
            await queryClient.cancelQueries({ queryKey: productKeys.lowStock() });

            // Snapshot previous value
            const previousProduct = queryClient.getQueryData(productKeys.detail(productId));

            // Optimistically update
            if (previousProduct?.data) {
                queryClient.setQueryData(
                    productKeys.detail(productId),
                    {
                        ...previousProduct,
                        data: {
                            ...previousProduct.data,
                            stock: stockData.operation === 'set'
                                ? stockData.stock
                                : stockData.operation === 'increment'
                                    ? previousProduct.data.stock + stockData.stock
                                    : previousProduct.data.stock - stockData.stock,
                            ...(stockData.operation === 'set' && {
                                status: stockData.stock <= 0 ? "Out of Stock" :
                                    stockData.stock <= previousProduct.data.minStock ? "Low Stock" : "In Stock"
                            })
                        }
                    }
                );
            }

            return { previousProduct };
        },
        onError: (error, variables, context) => {
            // Rollback on error
            if (context?.previousProduct) {
                queryClient.setQueryData(
                    productKeys.detail(variables.productId),
                    context.previousProduct
                );
            }

            toast.error(error.response?.data?.message || "Failed to update stock");
        },
        onSuccess: (data) => {
            toast.success(data.message || "Stock updated successfully");
        },
        onSettled: (data, error, variables) => {
            // Invalidate after mutation
            queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.productId) });
            queryClient.invalidateQueries({ queryKey: productKeys.lowStock() });
        },
    });
};

// ============ STORE-SPECIFIC PRODUCT HOOKS ============

/**
 * Get products for a specific store
 */
export const useStoreProducts = (storeId, filters = {}, page = 1, limit = 20, enabled = true) => {
    return useQuery({
        queryKey: productKeys.storeList(storeId, { ...filters, page, limit }),
        queryFn: () => productApi.getProductsByStore(storeId, filters, page, limit),
        enabled: !!storeId && enabled,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        retry: 2,
        select: (data) => ({
            products: data.data || [],
            pagination: data.pagination || {},
            store: data.store,
            success: data.success,
        }),
    });
};

/**
 * Get infinite scroll products for a store
 */
export const useInfiniteStoreProducts = (storeId, filters = {}, limit = 20) => {
    return useInfiniteQuery({
        queryKey: productKeys.storeList(storeId, filters),
        queryFn: ({ pageParam = 1 }) =>
            productApi.getProductsByStore(storeId, filters, pageParam, limit),
        initialPageParam: 1,
        enabled: !!storeId,
        getNextPageParam: (lastPage, allPages) => {
            if (!lastPage.pagination?.hasNext) return undefined;
            return allPages.length + 1;
        },
        select: (data) => ({
            products: data.pages.flatMap(page => page.data || []),
            store: data.pages[0]?.store,
            totalPages: data.pages[0]?.pagination?.totalPages || 0,
            totalProducts: data.pages[0]?.pagination?.totalProducts || 0,
        }),
    });
};

/**
 * Get specific product in a store
 */
export const useStoreProduct = (storeId, productId, enabled = true) => {
    return useQuery({
        queryKey: productKeys.storeDetail(storeId, productId),
        queryFn: () => productApi.getStoreProductById(storeId, productId),
        enabled: !!storeId && !!productId && enabled,
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 60,
        retry: 2,
        select: (data) => ({
            ...data.data,
            store: data.store,
        }),
    });
};

/**
 * Get low stock products for a specific store
 */
export const useStoreLowStockProducts = (storeId, limit = 20, enabled = true) => {
    return useQuery({
        queryKey: productKeys.storeLowStock(storeId),
        queryFn: () => productApi.getStoreLowStockProducts(storeId, limit),
        enabled: !!storeId && enabled,
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 10,
        select: (data) => ({
            products: data.data || [],
            store: data.store,
            count: data.store?.lowStockCount || 0,
        }),
    });
};

/**
 * Get featured products for a specific store
 */
export const useStoreFeaturedProducts = (storeId, limit = 10, enabled = true) => {
    return useQuery({
        queryKey: productKeys.storeFeatured(storeId, limit),
        queryFn: () => productApi.getStoreFeaturedProducts(storeId, limit),
        enabled: !!storeId && enabled,
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 60,
        select: (data) => ({
            products: data.data || [],
            store: data.store,
            featuredCount: data.store?.featuredCount || 0,
        }),
    });
};

/**
 * Get products by category in a specific store
 */
export const useStoreProductsByCategory = (storeId, category, limit = 20, enabled = true) => {
    return useQuery({
        queryKey: productKeys.storeCategory(storeId, category, limit),
        queryFn: () => productApi.getStoreProductsByCategory(storeId, category, limit),
        enabled: !!storeId && !!category && enabled,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        select: (data) => ({
            products: data.data || [],
            store: data.store,
            category: data.category,
            count: data.count || 0,
        }),
    });
};

/**
 * Get product statistics for a specific store
 */
export const useStoreProductStats = (storeId, enabled = true) => {
    return useQuery({
        queryKey: productKeys.storeStats(storeId),
        queryFn: () => productApi.getStoreProductStats(storeId),
        enabled: !!storeId && enabled,
        staleTime: 1000 * 60,
        gcTime: 1000 * 60 * 5,
        select: (data) => ({
            ...data.data,
            store: data.store,
        }),
    });
};

/**
 * Search products within a specific store
 */
export const useSearchStoreProducts = (storeId, query, page = 1, limit = 10, enabled = true) => {
    return useQuery({
        queryKey: productKeys.storeList(storeId, { search: query, page, limit }),
        queryFn: () => productApi.getProductsByStore(storeId, { search: query }, page, limit),
        enabled: !!storeId && !!query && enabled,
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 10,
        select: (data) => ({
            products: data.data || [],
            pagination: data.pagination || {},
            store: data.store,
        }),
    });
};

// ============ STORE-SPECIFIC MUTATIONS ============

/**
 * Create product in a specific store
 */
export const useCreateStoreProduct = (storeId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ productData, files }) =>
            productApi.createStoreProduct(storeId, productData, files),
        onSuccess: (data) => {
            // Invalidate store-specific queries
            queryClient.invalidateQueries({ queryKey: productKeys.storeLists(storeId) });
            queryClient.invalidateQueries({ queryKey: productKeys.storeLowStock(storeId) });
            queryClient.invalidateQueries({ queryKey: productKeys.storeStats(storeId) });

            // Also invalidate global queries if needed
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
            queryClient.invalidateQueries({ queryKey: productKeys.lowStock() });
            queryClient.invalidateQueries({ queryKey: productKeys.stats() });

            toast.success(data.message || "Product created successfully in store");
            return data;
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to create product in store");
            throw error;
        },
    });
};

/**
 * Update product in a specific store
 */
export const useUpdateStoreProduct = (storeId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ productId, productData, files }) =>
            productApi.updateStoreProduct(storeId, productId, productData, files),
        onSuccess: (data, variables) => {
            // Invalidate specific product and store lists
            queryClient.invalidateQueries({ queryKey: productKeys.storeDetail(storeId, variables.productId) });
            queryClient.invalidateQueries({ queryKey: productKeys.storeLists(storeId) });
            queryClient.invalidateQueries({ queryKey: productKeys.storeLowStock(storeId) });

            // Also invalidate global product
            queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.productId) });

            toast.success(data.message || "Product updated successfully in store");
            return data;
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to update product in store");
            throw error;
        },
    });
};

/**
 * Delete product from a specific store
 */
export const useDeleteStoreProduct = (storeId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (productId) => productApi.deleteStoreProduct(storeId, productId),
        onSuccess: (data, productId) => {
            // Remove from cache and invalidate store lists
            queryClient.removeQueries({ queryKey: productKeys.storeDetail(storeId, productId) });
            queryClient.invalidateQueries({ queryKey: productKeys.storeLists(storeId) });
            queryClient.invalidateQueries({ queryKey: productKeys.storeLowStock(storeId) });
            queryClient.invalidateQueries({ queryKey: productKeys.storeStats(storeId) });
            queryClient.invalidateQueries({ queryKey: productKeys.storeFeatured(storeId) });

            // Also remove from global cache
            queryClient.removeQueries({ queryKey: productKeys.detail(productId) });

            toast.success(data.message || "Product deleted successfully from store");
            return data;
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to delete product from store");
            throw error;
        },
    });
};

/**
 * Update stock for product in a specific store
 */
export const useUpdateStoreProductStock = (storeId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ productId, stockData }) =>
            productApi.updateStoreProductStock(storeId, productId, stockData),
        onSuccess: (data, variables) => {
            // ✅ ADD THIS LINE - it's the most important!
            queryClient.invalidateQueries({
                queryKey: productKeys.storeLists(storeId)
            });

            // Invalidate store-specific queries
            queryClient.invalidateQueries({
                queryKey: productKeys.storeDetail(storeId, variables.productId)
            });
            queryClient.invalidateQueries({
                queryKey: productKeys.storeLowStock(storeId)
            });

            // Also invalidate global product
            queryClient.invalidateQueries({
                queryKey: productKeys.detail(variables.productId)
            });

            toast.success(data.message || "Stock updated successfully in store");
            return data;
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to update stock in store");
            throw error;
        },
    });
};

/**
 * Record sale for product in a specific store
 */
export const useRecordStoreSale = (storeId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ productId, quantity, sellingPrice }) =>
            productApi.recordStoreSale(storeId, productId, quantity, sellingPrice),
        onSuccess: (data, variables) => {
            // Optimistic updates for store product
            queryClient.setQueryData(
                productKeys.storeDetail(storeId, variables.productId),
                (old) => {
                    if (!old?.data) return old;
                    return {
                        ...old,
                        data: {
                            ...old.data,
                            stock: old.data.stock - variables.quantity,
                            totalSold: old.data.totalSold + variables.quantity,
                        }
                    };
                }
            );

            // Invalidate store low stock and stats
            queryClient.invalidateQueries({ queryKey: productKeys.storeLowStock(storeId) });
            queryClient.invalidateQueries({ queryKey: productKeys.storeStats(storeId) });

            // Also invalidate global queries
            queryClient.invalidateQueries({ queryKey: productKeys.lowStock() });
            queryClient.invalidateQueries({ queryKey: productKeys.stats() });

            toast.success(data.message || "Sale recorded successfully in store");
            return data;
        },
        onError: (error, variables, context) => {
            // Rollback on error
            queryClient.setQueryData(
                productKeys.storeDetail(storeId, variables.productId),
                context.previousProduct
            );

            toast.error(error.response?.data?.message || "Failed to record sale in store");
            throw error;
        },
    });
};

// ============ UTILITY HOOKS ============

/**
 * Hook to get products for current store from context
 */
export const useCurrentStoreProducts = (currentStore, filters = {}, page = 1, limit = 20, enabled = true) => {
    const storeId = currentStore?._id;
    return useStoreProducts(storeId, filters, page, limit, enabled && !!storeId);
};

/**
 * Hook to create product in current store from context
 */
export const useCreateProductInCurrentStore = (currentStore) => {
    const storeId = currentStore?._id;
    const mutation = useCreateStoreProduct(storeId);

    // Override mutationFn to check store
    return {
        ...mutation,
        mutate: (variables) => {
            if (!storeId) {
                toast.error("No store selected");
                return;
            }
            mutation.mutate(variables);
        }
    };
};

/**
 * Hook to update product in current store from context
 */
export const useUpdateProductInCurrentStore = (currentStore) => {
    const storeId = currentStore?._id;
    const mutation = useUpdateStoreProduct(storeId);

    return {
        ...mutation,
        mutate: (variables) => {
            if (!storeId) {
                toast.error("No store selected");
                return;
            }
            mutation.mutate(variables);
        }
    };
};

