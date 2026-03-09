import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import salesApi from "../services/sales-api";
import { toast } from "react-hot-toast";
import { useStoreId } from "../../context/store/StoreContext";

// Query keys - updated to include storeId
export const salesKeys = {
    all: (storeId = 'global') => ["sales", storeId === 'all' ? 'global' : storeId],
    daily: (date, storeId = 'global') => [...salesKeys.all(storeId), "daily", date],
    dateRange: (params, storeId = 'global') => [...salesKeys.all(storeId), "dateRange", params],
    topProducts: (params, storeId = 'global') => [...salesKeys.all(storeId), "topProducts", params],
    analytics: (period, storeId = 'global') => [...salesKeys.all(storeId), "analytics", period],
    productSales: (productId, params, storeId = 'global') => [...salesKeys.all(storeId), "product", productId, params],
    recent: (limit, storeId = 'global') => [...salesKeys.all(storeId), "recent", limit],
    sale: (saleId, storeId = 'global') => [...salesKeys.all(storeId), "sale", saleId],
    today: (storeId = 'global') => [...salesKeys.all(storeId), "today"],
    thisMonth: (page, limit, storeId = 'global') => [...salesKeys.all(storeId), "thisMonth", page, limit],
    storeComparison: (params) => [...salesKeys.all('comparison'), "comparison", params],
    storeTimeline: (storeId, params) => [...salesKeys.all(storeId), "timeline", params],
    storeMonthly: (storeId, params) => [...salesKeys.all(storeId), "monthly", params],
    storePerformance: (storeId, period) => [...salesKeys.all(storeId), "performance", period],
    dashboard: (storeId) => [...salesKeys.all(storeId), "dashboard"],
};

export const useRecordSale = () => {
    const queryClient = useQueryClient();
    const storeId = useStoreId(); // Get current store from context

    return useMutation({
        mutationFn: (saleData) => {
            // Add storeId from context to the saleData
            const payload = {
                ...saleData,
                storeId: saleData.storeId || storeId
            };

            console.log('📤 RecordSale payload:', payload); // Debug log

            return salesApi.recordSale(payload);
        },
        onSuccess: (data, variables) => {
            // Get the affected storeId from the sale
            const affectedStoreId = variables.storeId || storeId;

            console.log('✅ Sale successful, invalidating queries...');

            // 1. CRITICAL: Invalidate INVENTORY queries
            // This will refresh your inventory table
            queryClient.invalidateQueries({
                queryKey: ['inventory', affectedStoreId]
            });
            queryClient.invalidateQueries({
                queryKey: ['inventory', 'global']
            });

            // Also invalidate store inventory list if you have that
            queryClient.invalidateQueries({
                predicate: query =>
                    query.queryKey.includes('inventory') &&
                    (query.queryKey.includes('list') || query.queryKey.includes('items'))
            });

            // 2. Invalidate SALES queries
            queryClient.invalidateQueries({ queryKey: salesKeys.all('global') });
            queryClient.invalidateQueries({ queryKey: salesKeys.today('global') });
            queryClient.invalidateQueries({ queryKey: salesKeys.recent() });

            // If we have a store, also invalidate store-specific queries
            if (affectedStoreId) {
                queryClient.invalidateQueries({ queryKey: salesKeys.all(affectedStoreId) });
                queryClient.invalidateQueries({ queryKey: salesKeys.today(affectedStoreId) });
                queryClient.invalidateQueries({ queryKey: salesKeys.recent(undefined, affectedStoreId) });
            }

            toast.success(data.message || "Sale recorded successfully!");
            return data;
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to record sale");
            throw error;
        },
    });
};
export const useRecordMultipleSale = () => {
    const queryClient = useQueryClient();
    const storeId = useStoreId(); // Get current store from context

    return useMutation({
        mutationFn: async (transactionData) => {
            // Add storeId from context to the transactionData if not provided
            const payload = {
                ...transactionData,
                storeId: transactionData.storeId || storeId
            };

            console.log('📤 RecordMultipleSale payload:', payload); // Debug log

            // Validate required fields before API call
            if (!payload.storeId) {
                throw new Error("Store ID is required");
            }
            if (!payload.items || !Array.isArray(payload.items) || payload.items.length === 0) {
                throw new Error("At least one item is required");
            }

            return salesApi.recordMultipleSale(payload);
        },
        onSuccess: (data, variables) => {
            // Get the affected storeId from the transaction
            const affectedStoreId = variables.storeId || storeId;
            const itemCount = variables.items?.length || 0;

            console.log(`✅ Transaction successful (${itemCount} items), invalidating queries...`);

            // 1. CRITICAL: Invalidate INVENTORY queries
            queryClient.invalidateQueries({
                queryKey: ['inventory', affectedStoreId]
            });
            queryClient.invalidateQueries({
                queryKey: ['inventory', 'global']
            });

            // Also invalidate inventory-related queries
            queryClient.invalidateQueries({
                predicate: query =>
                    query.queryKey.includes('inventory') ||
                    query.queryKey.includes('stock') ||
                    query.queryKey.includes('products')
            });

            // 2. Invalidate PRODUCT queries (since product stats are updated)
            queryClient.invalidateQueries({
                predicate: query => query.queryKey.includes('products')
            });

            // 3. Invalidate SALES queries
            queryClient.invalidateQueries({ queryKey: salesKeys.all('global') });
            queryClient.invalidateQueries({ queryKey: salesKeys.today('global') });
            queryClient.invalidateQueries({ queryKey: salesKeys.recent() });
            queryClient.invalidateQueries({ queryKey: salesKeys.thisMonth(1, 10, 'global') });
            queryClient.invalidateQueries({ queryKey: salesKeys.dashboard('global') });

            // 4. Invalidate TRANSACTION queries
            queryClient.invalidateQueries({
                predicate: query => query.queryKey.includes('transactions')
            });

            // 5. Invalidate ANALYTICS queries
            queryClient.invalidateQueries({
                predicate: query =>
                    query.queryKey.includes('analytics') ||
                    query.queryKey.includes('reports') ||
                    query.queryKey.includes('dashboard')
            });

            // 6. Store-specific queries
            if (affectedStoreId) {
                queryClient.invalidateQueries({ queryKey: salesKeys.all(affectedStoreId) });
                queryClient.invalidateQueries({ queryKey: salesKeys.today(affectedStoreId) });
                queryClient.invalidateQueries({ queryKey: salesKeys.recent(undefined, affectedStoreId) });
                queryClient.invalidateQueries({ queryKey: salesKeys.thisMonth(1, 10, affectedStoreId) });
                queryClient.invalidateQueries({ queryKey: salesKeys.dashboard(affectedStoreId) });
                queryClient.invalidateQueries({ queryKey: salesKeys.storePerformance(affectedStoreId) });
                queryClient.invalidateQueries({ queryKey: salesKeys.storeTimeline(affectedStoreId) });
            }

            toast.success(
                data.message || `Transaction completed successfully with ${itemCount} item${itemCount > 1 ? 's' : ''}`
            );

            // Return the data for chaining
            return data;
        },
        onError: (error) => {
            console.error('❌ Transaction error:', error);

            // More detailed error messages
            const errorMessage = error.response?.data?.message ||
                error.message ||
                "Failed to process transaction";

            toast.error(errorMessage);

            // If specific item errors, show them
            if (error.response?.data?.errors) {
                error.response.data.errors.forEach((itemError, index) => {
                    toast.error(`Item ${index + 1}: ${itemError}`);
                });
            }

            throw error;
        },
        // Optional: Optimistic updates
        onMutate: async (transactionData) => {
            // Optional: Cancel outgoing queries
            await queryClient.cancelQueries({ queryKey: salesKeys.all('global') });

            // Optional: Store previous data for rollback
            const previousSales = queryClient.getQueryData(salesKeys.all('global'));

            return { previousSales };
        },
        onSettled: () => {

            queryClient.invalidateQueries({ queryKey: salesKeys.all('global') });
        },
    });
};
export const useRecordStoreSale = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ storeId, saleData }) => salesApi.recordStoreSale(storeId, saleData),
        onSuccess: (data, variables) => {
            // Invalidate store-specific queries
            queryClient.invalidateQueries({ queryKey: salesKeys.all(variables.storeId) });
            queryClient.invalidateQueries({ queryKey: salesKeys.today(variables.storeId) });
            queryClient.invalidateQueries({ queryKey: salesKeys.recent(undefined, variables.storeId) });

            // Also invalidate global queries
            queryClient.invalidateQueries({ queryKey: salesKeys.all('global') });

            toast.success(data.message || "Sale recorded successfully!");
            return data;
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to record sale");
            throw error;
        },
    });
};
export const useDailySummary = ({ date, storeId: explicitStoreId } = {}) => {
    const contextStoreId = useStoreId();

    // Handle "all" selection from frontend
    const isAllStores = explicitStoreId === 'all' || explicitStoreId === 'global';

    // Determine storeId for API (undefined for all stores)
    const apiStoreId = isAllStores ? undefined : (explicitStoreId || contextStoreId);

    // Determine storeId for query key (keep "all" for cache differentiation)
    const queryKeyStoreId = isAllStores ? 'all' : (explicitStoreId || contextStoreId || 'global');

    return useQuery({
        queryKey: salesKeys.daily(date?.toISOString().split('T')[0], queryKeyStoreId),
        queryFn: () => salesApi.getDailySummary({
            date,
            storeId: apiStoreId  // This will be undefined for "all"
        }),
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 5,
        retry: 2,
        enabled: queryKeyStoreId !== null,
    });
};

export const useStoreDailySummary = (storeId, date) => {
    return useQuery({
        queryKey: salesKeys.daily(date?.toISOString().split('T')[0], storeId),
        queryFn: () => salesApi.getStoreDailySummary(storeId, date),

        retry: 2,
        enabled: !!storeId,
    });
};

export const useTodaySales = (storeId) => {
    const contextStoreId = useStoreId();
    const effectiveStoreId = storeId || contextStoreId || 'global';

    return useQuery({
        queryKey: salesKeys.today(effectiveStoreId),
        queryFn: () => salesApi.getTodaySales(effectiveStoreId === 'global' ? undefined : effectiveStoreId),

        enabled: effectiveStoreId !== null,
    });
};

export const useSalesByDateRange = (params = {}) => {
    const { storeId: explicitStoreId, ...restParams } = params;
    const contextStoreId = useStoreId();
    const storeId = explicitStoreId || contextStoreId || 'global';

    return useQuery({
        queryKey: salesKeys.dateRange(restParams, storeId),
        queryFn: () => salesApi.getSalesByDateRange({
            ...restParams,
            storeId: storeId === 'global' ? undefined : storeId
        }),
        enabled: !!restParams.startDate && !!restParams.endDate && storeId !== null,

    });
};

export const useStoreSalesByDateRange = (storeId, params = {}) => {
    return useQuery({
        queryKey: salesKeys.dateRange(params, storeId),
        queryFn: () => salesApi.getStoreSalesByDateRange(storeId, params),
        enabled: !!storeId && !!params.startDate && !!params.endDate,
    });
};

export const useThisMonthSales = (options = {}) => {
    const { page = 1, limit = 50, storeId: explicitStoreId } = options;
    const contextStoreId = useStoreId();
    const storeId = explicitStoreId || contextStoreId || 'global';

    return useQuery({
        queryKey: salesKeys.thisMonth(page, limit, storeId),
        queryFn: () => salesApi.getThisMonthSales({
            page,
            limit,
            storeId: storeId === 'global' ? undefined : storeId
        }),
        enabled: storeId !== null,
    });
};

export const useTopSellingProducts = (params = {}) => {
    const { storeId: explicitStoreId, ...restParams } = params;
    const contextStoreId = useStoreId();
    const storeId = explicitStoreId || contextStoreId || 'global';

    return useQuery({
        queryKey: salesKeys.topProducts(restParams, storeId),
        queryFn: () => salesApi.getTopSellingProducts({
            ...restParams,
            storeId: storeId === 'global' ? undefined : storeId
        }),

        enabled: storeId !== null,
    });
};

export const useStoreTopSellingProducts = (storeId, params = {}) => {
    return useQuery({
        queryKey: salesKeys.topProducts(params, storeId),
        queryFn: () => salesApi.getStoreTopSellingProducts(storeId, params),

        enabled: !!storeId,
    });
};

export const useSalesAnalytics = (options = {}) => {
    const { period = "month", storeId: explicitStoreId } = options;
    const contextStoreId = useStoreId();
    const storeId = explicitStoreId || contextStoreId || 'global';

    return useQuery({
        queryKey: salesKeys.analytics(period, storeId),
        queryFn: () => salesApi.getSalesAnalytics({
            period,
            storeId: storeId === 'global' ? undefined : storeId
        }),

        enabled: storeId !== null,
    });
};

export const useStoreSalesAnalytics = (storeId, options = {}) => {
    const { period = "month" } = options;

    return useQuery({
        queryKey: salesKeys.analytics(period, storeId),
        queryFn: () => salesApi.getStoreSalesAnalytics(storeId, { period }),

        enabled: !!storeId,
    });
};

export const useSalesByProduct = (productId, params = {}) => {
    const { storeId: explicitStoreId, ...restParams } = params;
    const contextStoreId = useStoreId();
    const storeId = explicitStoreId || contextStoreId || 'global';

    return useQuery({
        queryKey: salesKeys.productSales(productId, restParams, storeId),
        queryFn: () => salesApi.getSalesByProduct({
            productId,
            ...restParams,
            storeId: storeId === 'global' ? undefined : storeId
        }),
        enabled: !!productId && storeId !== null,

    });
};

export const useStoreSalesByProduct = (storeId, productId, params = {}) => {
    return useQuery({
        queryKey: salesKeys.productSales(productId, params, storeId),
        queryFn: () => salesApi.getStoreSalesByProduct(storeId, productId, params),
        enabled: !!storeId && !!productId,

    });
};

export const useRecentSales = (options = {}) => {
    const { limit = 20, storeId: explicitStoreId } = options;
    const contextStoreId = useStoreId();
    const storeId = explicitStoreId || contextStoreId || 'global';

    return useQuery({
        queryKey: salesKeys.recent(limit, storeId),
        queryFn: () => salesApi.getRecentSales({
            limit,
            storeId: storeId === 'global' ? undefined : storeId
        }),

        enabled: storeId !== null,
    });
};

export const useStoreRecentSales = (storeId, options = {}) => {
    const { limit = 20 } = options;

    return useQuery({
        queryKey: salesKeys.recent(limit, storeId),
        queryFn: () => salesApi.getStoreRecentSales(storeId, { limit }),

        enabled: !!storeId,
    });
};

export const useRefundSale = () => {
    const queryClient = useQueryClient();
    const storeId = useStoreId();

    return useMutation({
        mutationFn: ({ saleId, reason, storeId: explicitStoreId }) =>
            salesApi.refundSale({
                saleId,
                reason,
                storeId: explicitStoreId || storeId
            }),
        onSuccess: (data, variables) => {
            const refundStoreId = variables.storeId || storeId;

            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: salesKeys.all(refundStoreId || 'global') });
            queryClient.invalidateQueries({ queryKey: salesKeys.recent(undefined, refundStoreId || 'global') });
            queryClient.invalidateQueries({ queryKey: salesKeys.today(refundStoreId || 'global') });

            toast.success(data.message || "Sale refunded successfully");
            return data;
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to refund sale");
            throw error;
        },
    });
};

export const useRefundStoreSale = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ storeId, saleId, reason }) =>
            salesApi.refundStoreSale(storeId, saleId, reason),
        onSuccess: (data, variables) => {
            // Invalidate store-specific queries
            queryClient.invalidateQueries({ queryKey: salesKeys.all(variables.storeId) });
            queryClient.invalidateQueries({ queryKey: salesKeys.recent(undefined, variables.storeId) });
            queryClient.invalidateQueries({ queryKey: salesKeys.today(variables.storeId) });

            // Also invalidate global queries
            queryClient.invalidateQueries({ queryKey: salesKeys.all('global') });

            toast.success(data.message || "Sale refunded successfully");
            return data;
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to refund sale");
            throw error;
        },
    });
};

// New store comparison hooks
export const useStoreComparison = (params = {}) => {
    return useQuery({
        queryKey: salesKeys.storeComparison(params),
        queryFn: () => salesApi.getStoreComparison(params),
        enabled: !!params.startDate && !!params.endDate,

    });
};

export const useStoreTimeline = (storeId, params = {}) => {
    return useQuery({
        queryKey: salesKeys.storeTimeline(storeId, params),
        queryFn: () => salesApi.getStoreTimeline(storeId, params),
        enabled: !!storeId && !!params.startDate && !!params.endDate,

    });
};

export const useStoreMonthlyReport = (storeId, params = {}) => {
    return useQuery({
        queryKey: salesKeys.storeMonthly(storeId, params),
        queryFn: () => salesApi.getStoreMonthlyReport(storeId, params),
        enabled: !!storeId && !!params.year && !!params.month,

    });
};

export const useStorePerformance = (storeId, period = "month") => {
    return useQuery({
        queryKey: salesKeys.storePerformance(storeId, period),
        queryFn: () => salesApi.getStorePerformance(storeId, period),
        enabled: !!storeId,

    });
};

export const useDashboardData = (storeId) => {
    const contextStoreId = useStoreId();
    const effectiveStoreId = storeId || contextStoreId || 'global';

    return useQuery({
        queryKey: salesKeys.dashboard(effectiveStoreId),
        queryFn: () => salesApi.getDashboardData(
            effectiveStoreId === 'global' ? undefined : effectiveStoreId
        ),

        enabled: effectiveStoreId !== null,
    });
};

// Optimistic update for recording sales
export const useOptimisticRecordSale = () => {
    const queryClient = useQueryClient();
    const storeId = useStoreId();

    // Helper function to determine new status based on stock
    const getUpdatedStatus = (stock, minStock) => {
        if (stock <= 0) return "Out of Stock";
        if (stock <= minStock) return "Low Stock";
        return "In Stock";
    };

    return useMutation({
        mutationFn: (saleData) => {
            // Add storeId from context to the saleData
            const payload = {
                ...saleData,
                storeId: saleData.storeId || storeId
            };

            console.log('📤 OptimisticRecordSale payload:', payload);

            return salesApi.recordSale(payload);
        },
        onMutate: async (newSale) => {
            // Determine which store to update (from saleData or context)
            const targetStoreId = newSale.storeId || storeId || 'global';
            const productId = newSale.productId;

            console.log('🎯 Optimistic update for store:', targetStoreId, 'product:', productId);

            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: salesKeys.today(targetStoreId) });
            await queryClient.cancelQueries({ queryKey: salesKeys.recent(undefined, targetStoreId) });
            await queryClient.cancelQueries({ queryKey: ['inventory', targetStoreId] }); // CRITICAL: Cancel inventory queries

            // Snapshot previous values
            const previousToday = queryClient.getQueryData(salesKeys.today(targetStoreId));
            const previousRecent = queryClient.getQueryData(salesKeys.recent(undefined, targetStoreId));
            const previousInventory = queryClient.getQueryData(['inventory', targetStoreId]);

            // OPTIMISTIC UPDATE 1: Update inventory stock
            if (previousInventory?.data) {
                queryClient.setQueryData(['inventory', targetStoreId], (old) => ({
                    ...old,
                    data: old.data.map(item => {
                        // Check if this is the sold product
                        if (item.product?._id === productId || item.productId === productId) {
                            const newStock = item.stock - (newSale.quantity || 1);
                            return {
                                ...item,
                                stock: newStock,
                                status: getUpdatedStatus(newStock, item.minStock || 5)
                            };
                        }
                        return item;
                    })
                }));
            }

            // OPTIMISTIC UPDATE 2: Update today's sales
            if (previousToday?.data) {
                queryClient.setQueryData(salesKeys.today(targetStoreId), (old) => ({
                    ...old,
                    data: {
                        ...old.data,
                        totalSales: old.data.totalSales + (newSale.total || 0),
                        totalProfit: old.data.totalProfit + (newSale.profit || 0),
                        totalItemsSold: old.data.totalItemsSold + (newSale.quantity || 0),
                        totalTransactions: old.data.totalTransactions + 1,
                    }
                }));
            }

            // OPTIMISTIC UPDATE 3: Update recent sales
            if (previousRecent?.data) {
                const optimisticSale = {
                    _id: `temp-${Date.now()}`,
                    ...newSale,
                    status: "optimistic",
                    createdAt: new Date(),
                };

                queryClient.setQueryData(salesKeys.recent(undefined, targetStoreId), (old) => ({
                    ...old,
                    data: [optimisticSale, ...old.data.slice(0, 19)] // Keep only 20 items
                }));
            }

            return {
                previousToday,
                previousRecent,
                previousInventory,
                targetStoreId,
                productId
            };
        },
        onError: (error, variables, context) => {
            console.error('❌ Optimistic update failed:', error);

            // ROLLBACK 1: Inventory
            if (context?.previousInventory && context?.targetStoreId) {
                queryClient.setQueryData(['inventory', context.targetStoreId], context.previousInventory);
            }

            // ROLLBACK 2: Today's sales
            if (context?.previousToday && context?.targetStoreId) {
                queryClient.setQueryData(salesKeys.today(context.targetStoreId), context.previousToday);
            }

            // ROLLBACK 3: Recent sales
            if (context?.previousRecent && context?.targetStoreId) {
                queryClient.setQueryData(salesKeys.recent(undefined, context.targetStoreId), context.previousRecent);
            }

            toast.error(error.response?.data?.message || "Failed to record sale");
        },
        onSuccess: (data, variables, context) => {
            console.log('✅ Optimistic update succeeded:', data);

            // Get the affected store and product
            const targetStoreId = variables.storeId || storeId || 'global';
            const productId = variables.productId;

            // Invalidate queries to get fresh data from server
            queryClient.invalidateQueries({ queryKey: salesKeys.all('global') });
            queryClient.invalidateQueries({ queryKey: salesKeys.thisMonth(1, 50, targetStoreId) });

            // CRITICAL: Invalidate inventory queries to sync with server
            queryClient.invalidateQueries({ queryKey: ['inventory', targetStoreId] });
            queryClient.invalidateQueries({ queryKey: ['inventory', 'global'] });

            // Also invalidate specific product inventory if you have that query
            if (productId) {
                queryClient.invalidateQueries({
                    predicate: query =>
                        query.queryKey.includes('inventory') &&
                        (query.queryKey.includes(productId) ||
                            (query.queryKey.includes('product') && query.queryKey.includes(productId)))
                });
            }

            if (targetStoreId && targetStoreId !== 'global') {
                queryClient.invalidateQueries({ queryKey: salesKeys.all(targetStoreId) });
            }

            toast.success(data.message || "Sale recorded successfully!");
        },
        onSettled: (data, error, variables, context) => {
            // Refetch after mutation settles to ensure data consistency
            const targetStoreId = variables?.storeId || storeId || 'global';

            // Invalidate sales queries
            queryClient.invalidateQueries({ queryKey: salesKeys.today(targetStoreId) });
            queryClient.invalidateQueries({ queryKey: salesKeys.recent(undefined, targetStoreId) });
            queryClient.invalidateQueries({ queryKey: salesKeys.topProducts({}, targetStoreId) });

            // CRITICAL: Invalidate inventory queries
            queryClient.invalidateQueries({ queryKey: ['inventory', targetStoreId] });
            queryClient.invalidateQueries({
                predicate: query => query.queryKey[0] === 'inventory'
            });

            // Also invalidate global queries
            queryClient.invalidateQueries({ queryKey: salesKeys.today('global') });
            queryClient.invalidateQueries({ queryKey: salesKeys.recent(undefined, 'global') });
        },
    });
};