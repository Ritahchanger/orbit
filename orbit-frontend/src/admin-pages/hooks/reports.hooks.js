import reportsApi from "../services/reports-api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useStoreId } from "../../context/store/StoreContext";

// Query keys - structured for reports
export const reportsKeys = {
    all: (storeId = 'global') => ["reports", storeId === 'all' ? 'global' : storeId],
    dashboard: (storeId = 'global') => [...reportsKeys.all(storeId), "dashboard"],

    // Sales Reports
    sales: (params, storeId = 'global') => [...reportsKeys.all(storeId), "sales", params],

    salesTrend: (period, filters, storeId = 'global') => [...reportsKeys.all(storeId), "sales-trend", period, filters],

    dailySummary: (date, storeId = 'global') => [...reportsKeys.all(storeId), "daily-summary", date],

    monthlySummary: (year, month, storeId = 'global') => [...reportsKeys.all(storeId), "monthly-summary", year, month],

    // Inventory Reports
    inventory: (params, storeId = 'global') => [...reportsKeys.all(storeId), "inventory", params],

    // Product Reports
    productPerformance: (params, storeId = 'global') => [...reportsKeys.all(storeId), "product-performance", params],

    topProducts: (metric, filters, storeId = 'global') => [...reportsKeys.all(storeId), "top-products", metric, filters],

    // Store Reports
    storePerformance: (filters, storeId = 'global') => [...reportsKeys.all(storeId), "store-performance", filters],

    // Financial Reports
    financialSummary: (filters, storeId = 'global') => [...reportsKeys.all(storeId), "financial-summary", filters],

    // Alert Reports
    lowStockAlerts: (storeId = 'global', limit) => [...reportsKeys.all(storeId), "low-stock", limit],

    outOfStock: (storeId = 'global', limit) => [...reportsKeys.all(storeId), "out-of-stock", limit],

    // Category Reports
    categoryRevenue: (filters, storeId = 'global') => [...reportsKeys.all(storeId), "category-revenue", filters],

    // Payment Method Analysis
    paymentMethods: (filters, storeId = 'global') => [...reportsKeys.all(storeId), "payment-methods", filters],

    // Customer Reports
    customerHistory: (customerPhone, filters) => ["reports", "customer-history", customerPhone, filters],

    // Export
    export: (type, format, filters, storeId = 'global') => [...reportsKeys.all(storeId), "export", type, format, filters],

    // Quick Reports
    todaySales: (storeId = 'global') => [...reportsKeys.all(storeId), "today-sales"],

    thisMonthSales: (storeId = 'global') => [...reportsKeys.all(storeId), "this-month-sales"],

    topProductsMonth: (limit, storeId = 'global') => [...reportsKeys.all(storeId), "top-products-month", limit],

    inventorySnapshot: (storeId = 'global') => [...reportsKeys.all(storeId), "inventory-snapshot"],

    // Custom Reports
    customReports: () => ["reports", "custom"],

    customReport: (reportId) => ["reports", "custom", reportId],

    // Scheduled Reports
    scheduledReports: () => ["reports", "scheduled"],

    // Filter Presets
    filterPresets: (reportType) => ["reports", "filter-presets", reportType],

    // Report History
    reportHistory: (page, limit) => ["reports", "history", page, limit],
};

// ============ DASHBOARD REPORTS ============
export const useDashboardStats = (storeId) => {
    const contextStoreId = useStoreId();
    const effectiveStoreId = storeId || contextStoreId || 'global';

    return useQuery({
        queryKey: reportsKeys.dashboard(effectiveStoreId),
        queryFn: () => reportsApi.getDashboardStats(
            effectiveStoreId === 'global' ? undefined : effectiveStoreId
        ),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        retry: 2,
        enabled: effectiveStoreId !== null,
    });
};

// ============ SALES REPORTS ============
export const useSalesReport = (filters = {}) => {
    const { storeId: explicitStoreId, ...restParams } = filters;
    const contextStoreId = useStoreId();
    const effectiveStoreId = explicitStoreId || contextStoreId || 'global';

    return useQuery({
        queryKey: reportsKeys.sales(restParams, effectiveStoreId),
        queryFn: () => reportsApi.getSalesReport({
            ...restParams,
            storeId: effectiveStoreId === 'global' ? undefined : effectiveStoreId
        }),
        staleTime: 1000 * 60 * 3, // 3 minutes
        gcTime: 1000 * 60 * 5,
        enabled: effectiveStoreId !== null,
    });
};

export const useSalesTrendReport = (period = 'daily', filters = {}) => {
    const { storeId: explicitStoreId, ...restParams } = filters;
    const contextStoreId = useStoreId();
    const effectiveStoreId = explicitStoreId || contextStoreId || 'global';

    return useQuery({
        queryKey: reportsKeys.salesTrend(period, restParams, effectiveStoreId),
        queryFn: () => reportsApi.getSalesTrendReport(period, {
            ...restParams,
            storeId: effectiveStoreId === 'global' ? undefined : effectiveStoreId
        }),
        staleTime: 1000 * 60 * 5,
        enabled: effectiveStoreId !== null,
    });
};

export const useDailySalesSummary = (date, storeId) => {
    const contextStoreId = useStoreId();
    const effectiveStoreId = storeId || contextStoreId || 'global';

    return useQuery({
        queryKey: reportsKeys.dailySummary(date, effectiveStoreId),
        queryFn: () => reportsApi.getDailySalesSummary(
            date,
            effectiveStoreId === 'global' ? undefined : effectiveStoreId
        ),
        staleTime: 1000 * 60 * 3,
        enabled: effectiveStoreId !== null,
    });
};

export const useMonthlySalesSummary = (year, month, storeId) => {
    const contextStoreId = useStoreId();
    const effectiveStoreId = storeId || contextStoreId || 'global';

    return useQuery({
        queryKey: reportsKeys.monthlySummary(year, month, effectiveStoreId),
        queryFn: () => reportsApi.getMonthlySalesSummary(
            year,
            month,
            effectiveStoreId === 'global' ? undefined : effectiveStoreId
        ),
        staleTime: 1000 * 60 * 5,
        enabled: effectiveStoreId !== null,
    });
};

// ============ INVENTORY REPORTS ============
export const useInventoryReport = (filters = {}) => {
    const { storeId: explicitStoreId, ...restParams } = filters;
    const contextStoreId = useStoreId();
    const effectiveStoreId = explicitStoreId || contextStoreId || 'global';

    return useQuery({
        queryKey: reportsKeys.inventory(restParams, effectiveStoreId),
        queryFn: () => reportsApi.getInventoryReport({
            ...restParams,
            storeId: effectiveStoreId === 'global' ? undefined : effectiveStoreId
        }),
        staleTime: 1000 * 60 * 3,
        enabled: effectiveStoreId !== null,
    });
};

// ============ PRODUCT REPORTS ============
export const useProductPerformanceReport = (filters = {}) => {
    const { storeId: explicitStoreId, ...restParams } = filters;
    const contextStoreId = useStoreId();
    const effectiveStoreId = explicitStoreId || contextStoreId || 'global';

    return useQuery({
        queryKey: reportsKeys.productPerformance(restParams, effectiveStoreId),
        queryFn: () => reportsApi.getProductPerformanceReport({
            ...restParams,
            storeId: effectiveStoreId === 'global' ? undefined : effectiveStoreId
        }),
        staleTime: 1000 * 60 * 5,
        enabled: effectiveStoreId !== null,
    });
};

export const useTopPerformingProducts = (metric = 'revenue', filters = {}) => {
    const { storeId: explicitStoreId, ...restParams } = filters;
    const contextStoreId = useStoreId();
    const effectiveStoreId = explicitStoreId || contextStoreId || 'global';

    return useQuery({
        queryKey: reportsKeys.topProducts(metric, restParams, effectiveStoreId),
        queryFn: () => reportsApi.getTopPerformingProducts(metric, {
            ...restParams,
            storeId: effectiveStoreId === 'global' ? undefined : effectiveStoreId
        }),
        staleTime: 1000 * 60 * 5,
        enabled: effectiveStoreId !== null,
    });
};

// ============ STORE REPORTS ============
export const useStorePerformanceReport = (filters = {}) => {
    const { storeId: explicitStoreId, ...restParams } = filters;
    const contextStoreId = useStoreId();
    const effectiveStoreId = explicitStoreId || contextStoreId || 'global';

    return useQuery({
        queryKey: reportsKeys.storePerformance(restParams, effectiveStoreId),
        queryFn: () => reportsApi.getStorePerformanceReport({
            ...restParams,
            storeId: effectiveStoreId === 'global' ? undefined : effectiveStoreId
        }),
        staleTime: 1000 * 60 * 10,
        enabled: effectiveStoreId !== null,
    });
};

// ============ FINANCIAL REPORTS ============
export const useFinancialSummary = (filters = {}) => {
    const { storeId: explicitStoreId, ...restParams } = filters;
    const contextStoreId = useStoreId();
    const effectiveStoreId = explicitStoreId || contextStoreId || 'global';

    return useQuery({
        queryKey: reportsKeys.financialSummary(restParams, effectiveStoreId),
        queryFn: () => reportsApi.getFinancialSummary({
            ...restParams,
            storeId: effectiveStoreId === 'global' ? undefined : effectiveStoreId
        }),
        staleTime: 1000 * 60 * 10,
        enabled: effectiveStoreId !== null,
    });
};

// ============ ALERT REPORTS ============
export const useLowStockAlerts = (storeId, limit = 50) => {
    const contextStoreId = useStoreId();
    const effectiveStoreId = storeId || contextStoreId || 'global';

    return useQuery({
        queryKey: reportsKeys.lowStockAlerts(effectiveStoreId, limit),
        queryFn: () => reportsApi.getLowStockAlerts(
            effectiveStoreId === 'global' ? undefined : effectiveStoreId,
            limit
        ),
        staleTime: 1000 * 60 * 2, // 2 minutes for alerts
        gcTime: 1000 * 60 * 5,
        enabled: effectiveStoreId !== null,
        refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes for live alerts
    });
};

export const useOutOfStockReport = (storeId, limit = 50) => {
    const contextStoreId = useStoreId();
    const effectiveStoreId = storeId || contextStoreId || 'global';

    return useQuery({
        queryKey: reportsKeys.outOfStock(effectiveStoreId, limit),
        queryFn: () => reportsApi.getOutOfStockReport(
            effectiveStoreId === 'global' ? undefined : effectiveStoreId,
            limit
        ),
        staleTime: 1000 * 60 * 2,
        enabled: effectiveStoreId !== null,
    });
};

// ============ CATEGORY REPORTS ============
export const useCategoryRevenueReport = (filters = {}) => {
    const { storeId: explicitStoreId, ...restParams } = filters;
    const contextStoreId = useStoreId();
    const effectiveStoreId = explicitStoreId || contextStoreId || 'global';

    return useQuery({
        queryKey: reportsKeys.categoryRevenue(restParams, effectiveStoreId),
        queryFn: () => reportsApi.getCategoryRevenueReport({
            ...restParams,
            storeId: effectiveStoreId === 'global' ? undefined : effectiveStoreId
        }),
        staleTime: 1000 * 60 * 10,
        enabled: effectiveStoreId !== null,
    });
};

// ============ PAYMENT METHOD ANALYSIS ============
export const usePaymentMethodAnalysis = (filters = {}) => {
    const { storeId: explicitStoreId, ...restParams } = filters;
    const contextStoreId = useStoreId();
    const effectiveStoreId = explicitStoreId || contextStoreId || 'global';

    return useQuery({
        queryKey: reportsKeys.paymentMethods(restParams, effectiveStoreId),
        queryFn: () => reportsApi.getPaymentMethodAnalysis({
            ...restParams,
            storeId: effectiveStoreId === 'global' ? undefined : effectiveStoreId
        }),
        staleTime: 1000 * 60 * 10,
        enabled: effectiveStoreId !== null,
    });
};

// ============ CUSTOMER REPORTS ============
export const useCustomerPurchaseHistory = (customerPhone, filters = {}) => {
    return useQuery({
        queryKey: reportsKeys.customerHistory(customerPhone, filters),
        queryFn: () => reportsApi.getCustomerPurchaseHistory(customerPhone, filters),
        staleTime: 1000 * 60 * 5,
        enabled: !!customerPhone,
    });
};

// ============ EXPORT MUTATIONS ============
export const useExportReport = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ type, filters = {}, format = 'csv' }) =>
            reportsApi.exportReport(type, filters, format),
        onSuccess: (data, variables) => {
            // Download the file
            reportsApi.downloadFile(data.data, data.filename);

            // Add to report history
            queryClient.invalidateQueries({ queryKey: reportsKeys.reportHistory(1, 20) });

            toast.success(`Report exported successfully as ${variables.format.toUpperCase()}`);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to export report");
        },
    });
};

// Convenience hooks for specific export formats
export const useExportCSV = () => {
    const exportMutation = useExportReport();

    return {
        ...exportMutation,
        mutate: (type, filters) => exportMutation.mutate({ type, filters, format: 'csv' }),
    };
};

export const useExportExcel = () => {
    const exportMutation = useExportReport();

    return {
        ...exportMutation,
        mutate: (type, filters) => exportMutation.mutate({ type, filters, format: 'excel' }),
    };
};

export const useExportJSON = () => {
    const exportMutation = useExportReport();

    return {
        ...exportMutation,
        mutate: (type, filters) => exportMutation.mutate({ type, filters, format: 'json' }),
    };
};

// ============ BATCH REPORTS ============
export const useBatchReports = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (reportRequests) => reportsApi.getBatchReports(reportRequests),
        onSuccess: (data) => {
            // Invalidate individual report queries that were part of the batch
            data.results?.forEach((result, index) => {
                const request = data.requests[index];
                if (request.type && request.filters) {
                    // Invalidate the specific query to ensure fresh data next time
                    queryClient.invalidateQueries({
                        queryKey: reportsKeys[request.type]?.(request.filters, request.storeId),
                    });
                }
            });

            toast.success("Batch report generated successfully");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to generate batch reports");
        },
    });
};

// ============ SCHEDULED REPORTS ============
export const useScheduledReports = () => {
    return useQuery({
        queryKey: reportsKeys.scheduledReports(),
        queryFn: () => reportsApi.getScheduledReports(),
        staleTime: 1000 * 60 * 5,
    });
};

export const useScheduleReport = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (scheduleData) => reportsApi.scheduleReport(scheduleData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: reportsKeys.scheduledReports() });
            toast.success("Report scheduled successfully");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to schedule report");
        },
    });
};

export const useCancelScheduledReport = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (scheduleId) => reportsApi.cancelScheduledReport(scheduleId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: reportsKeys.scheduledReports() });
            toast.success("Scheduled report cancelled");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to cancel scheduled report");
        },
    });
};

// ============ FILTER PRESETS ============
export const useFilterPresets = (reportType) => {
    return useQuery({
        queryKey: reportsKeys.filterPresets(reportType),
        queryFn: () => reportsApi.getFilterPresets(reportType),
        staleTime: 1000 * 60 * 10,
        enabled: !!reportType,
    });
};

export const useSaveFilterPreset = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ reportType, presetData }) =>
            reportsApi.saveFilterPreset(reportType, presetData),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: reportsKeys.filterPresets(variables.reportType)
            });
            toast.success("Filter preset saved");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to save filter preset");
        },
    });
};

export const useDeleteFilterPreset = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ reportType, presetId }) =>
            reportsApi.deleteFilterPreset(reportType, presetId),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: reportsKeys.filterPresets(variables.reportType)
            });
            toast.success("Filter preset deleted");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to delete filter preset");
        },
    });
};

// ============ REPORT HISTORY ============
export const useReportHistory = (page = 1, limit = 20) => {
    return useQuery({
        queryKey: reportsKeys.reportHistory(page, limit),
        queryFn: () => reportsApi.getReportHistory(limit, page),
        staleTime: 1000 * 60 * 5,
    });
};

export const useDeleteReportHistory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (historyId) => reportsApi.deleteReportHistory(historyId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                predicate: query => query.queryKey.includes('history')
            });
            toast.success("Report history deleted");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to delete report history");
        },
    });
};

// ============ CUSTOM REPORTS ============
export const useCustomReports = () => {
    return useQuery({
        queryKey: reportsKeys.customReports(),
        queryFn: () => reportsApi.getCustomReports(),
        staleTime: 1000 * 60 * 5,
    });
};

export const useCustomReport = (reportId) => {
    return useQuery({
        queryKey: reportsKeys.customReport(reportId),
        queryFn: () => reportsApi.getCustomReports().then(reports =>
            reports.find(r => r._id === reportId)
        ),
        staleTime: 1000 * 60 * 5,
        enabled: !!reportId,
    });
};

export const useCreateCustomReport = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (reportConfig) => reportsApi.createCustomReport(reportConfig),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: reportsKeys.customReports() });
            toast.success("Custom report created");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to create custom report");
        },
    });
};

export const useUpdateCustomReport = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ reportId, reportConfig }) =>
            reportsApi.updateCustomReport(reportId, reportConfig),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: reportsKeys.customReports() });
            toast.success("Custom report updated");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to update custom report");
        },
    });
};

export const useDeleteCustomReport = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (reportId) => reportsApi.deleteCustomReport(reportId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: reportsKeys.customReports() });
            toast.success("Custom report deleted");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to delete custom report");
        },
    });
};

// ============ QUICK REPORTS (Optimized for common use cases) ============
export const useTodaySalesQuick = (storeId) => {
    const contextStoreId = useStoreId();
    const effectiveStoreId = storeId || contextStoreId || 'global';

    return useQuery({
        queryKey: reportsKeys.todaySales(effectiveStoreId),
        queryFn: () => reportsApi.getTodaySales(
            effectiveStoreId === 'global' ? undefined : effectiveStoreId
        ),
        staleTime: 1000 * 60 * 2, // 2 minutes for today's data
        gcTime: 1000 * 60 * 5,
        enabled: effectiveStoreId !== null,
        refetchInterval: 1000 * 60 * 5, // Refresh every 5 minutes
    });
};

export const useThisMonthSalesQuick = (storeId) => {
    const contextStoreId = useStoreId();
    const effectiveStoreId = storeId || contextStoreId || 'global';

    return useQuery({
        queryKey: reportsKeys.thisMonthSales(effectiveStoreId),
        queryFn: () => reportsApi.getThisMonthSales(
            effectiveStoreId === 'global' ? undefined : effectiveStoreId
        ),
        staleTime: 1000 * 60 * 5,
        enabled: effectiveStoreId !== null,
    });
};

export const useTopProductsThisMonth = (limit = 10, storeId) => {
    const contextStoreId = useStoreId();
    const effectiveStoreId = storeId || contextStoreId || 'global';

    return useQuery({
        queryKey: reportsKeys.topProductsMonth(limit, effectiveStoreId),
        queryFn: () => reportsApi.getTopProductsThisMonth(
            limit,
            effectiveStoreId === 'global' ? undefined : effectiveStoreId
        ),
        staleTime: 1000 * 60 * 5,
        enabled: effectiveStoreId !== null,
    });
};

export const useInventorySnapshot = (storeId) => {
    const contextStoreId = useStoreId();
    const effectiveStoreId = storeId || contextStoreId || 'global';

    return useQuery({
        queryKey: reportsKeys.inventorySnapshot(effectiveStoreId),
        queryFn: () => reportsApi.getInventorySnapshot(
            effectiveStoreId === 'global' ? undefined : effectiveStoreId
        ),
        staleTime: 1000 * 60 * 3,
        enabled: effectiveStoreId !== null,
    });
};

// ============ OPTIMISTIC UPDATES (for real-time feel) ============
export const useOptimisticDashboardUpdate = () => {
    const queryClient = useQueryClient();
    const storeId = useStoreId();

    return useMutation({
        mutationFn: async (updateData) => {
            // Simulate API call or use a real one
            return Promise.resolve(updateData);
        },
        onMutate: async (newData) => {
            const effectiveStoreId = newData.storeId || storeId || 'global';

            // Cancel outgoing refetches
            await queryClient.cancelQueries({
                queryKey: reportsKeys.dashboard(effectiveStoreId)
            });

            // Snapshot previous value
            const previousDashboard = queryClient.getQueryData(
                reportsKeys.dashboard(effectiveStoreId)
            );

            // Optimistically update the dashboard
            if (previousDashboard?.data) {
                queryClient.setQueryData(
                    reportsKeys.dashboard(effectiveStoreId),
                    (old) => ({
                        ...old,
                        data: {
                            ...old.data,
                            salesSummary: {
                                ...old.data.salesSummary,
                                today: {
                                    ...old.data.salesSummary?.today,
                                    revenue: (old.data.salesSummary?.today?.revenue || 0) +
                                        (newData.saleAmount || 0),
                                    count: (old.data.salesSummary?.today?.count || 0) + 1,
                                    profit: (old.data.salesSummary?.today?.profit || 0) +
                                        (newData.profit || 0),
                                }
                            },
                            recentSales: [
                                {
                                    _id: `temp-${Date.now()}`,
                                    ...newData,
                                    createdAt: new Date(),
                                    status: "optimistic",
                                },
                                ...(old.data.recentSales || []).slice(0, 9)
                            ]
                        }
                    })
                );
            }

            return { previousDashboard, effectiveStoreId };
        },
        onError: (error, variables, context) => {
            // Rollback on error
            if (context?.previousDashboard && context?.effectiveStoreId) {
                queryClient.setQueryData(
                    reportsKeys.dashboard(context.effectiveStoreId),
                    context.previousDashboard
                );
            }
        },
        onSettled: (data, error, variables, context) => {
            // Refetch to ensure data is fresh
            if (context?.effectiveStoreId) {
                queryClient.invalidateQueries({
                    queryKey: reportsKeys.dashboard(context.effectiveStoreId)
                });
                queryClient.invalidateQueries({
                    queryKey: reportsKeys.todaySales(context.effectiveStoreId)
                });
            }
        },
    });
};

// ============ INVALIDATION HELPERS ============
export const useInvalidateReports = () => {
    const queryClient = useQueryClient();
    const storeId = useStoreId();

    return {
        invalidateAll: (targetStoreId = null) => {
            const effectiveStoreId = targetStoreId || storeId || 'global';

            queryClient.invalidateQueries({
                predicate: query =>
                    query.queryKey.includes('reports') &&
                    (query.queryKey.includes(effectiveStoreId) ||
                        query.queryKey.includes('global'))
            });
        },

        invalidateSalesReports: (targetStoreId = null) => {
            const effectiveStoreId = targetStoreId || storeId || 'global';

            queryClient.invalidateQueries({
                queryKey: reportsKeys.sales({}, effectiveStoreId)
            });
            queryClient.invalidateQueries({
                queryKey: reportsKeys.todaySales(effectiveStoreId)
            });
            queryClient.invalidateQueries({
                queryKey: reportsKeys.thisMonthSales(effectiveStoreId)
            });
        },

        invalidateInventoryReports: (targetStoreId = null) => {
            const effectiveStoreId = targetStoreId || storeId || 'global';

            queryClient.invalidateQueries({
                queryKey: reportsKeys.inventory({}, effectiveStoreId)
            });
            queryClient.invalidateQueries({
                queryKey: reportsKeys.inventorySnapshot(effectiveStoreId)
            });
            queryClient.invalidateQueries({
                queryKey: reportsKeys.lowStockAlerts(effectiveStoreId)
            });
        },

        invalidateFinancialReports: (targetStoreId = null) => {
            const effectiveStoreId = targetStoreId || storeId || 'global';

            queryClient.invalidateQueries({
                queryKey: reportsKeys.financialSummary({}, effectiveStoreId)
            });
        }
    };
};

// ============ PRE-FETCHING ============
export const usePrefetchReports = () => {
    const queryClient = useQueryClient();
    const storeId = useStoreId();

    return {
        prefetchDashboard: async (targetStoreId = null) => {
            const effectiveStoreId = targetStoreId || storeId || 'global';

            await queryClient.prefetchQuery({
                queryKey: reportsKeys.dashboard(effectiveStoreId),
                queryFn: () => reportsApi.getDashboardStats(
                    effectiveStoreId === 'global' ? undefined : effectiveStoreId
                ),
                staleTime: 1000 * 60 * 5,
            });
        },

        prefetchTodaySales: async (targetStoreId = null) => {
            const effectiveStoreId = targetStoreId || storeId || 'global';

            await queryClient.prefetchQuery({
                queryKey: reportsKeys.todaySales(effectiveStoreId),
                queryFn: () => reportsApi.getTodaySales(
                    effectiveStoreId === 'global' ? undefined : effectiveStoreId
                ),
                staleTime: 1000 * 60 * 2,
            });
        },

        prefetchLowStockAlerts: async (targetStoreId = null) => {
            const effectiveStoreId = targetStoreId || storeId || 'global';

            await queryClient.prefetchQuery({
                queryKey: reportsKeys.lowStockAlerts(effectiveStoreId),
                queryFn: () => reportsApi.getLowStockAlerts(
                    effectiveStoreId === 'global' ? undefined : effectiveStoreId,
                    20
                ),
                staleTime: 1000 * 60 * 2,
            });
        }
    };
};

// ============ COMPOSED HOOKS (for complex report combinations) ============
export const useSalesDashboard = (storeId) => {
    const dashboard = useDashboardStats(storeId);
    const todaySales = useTodaySalesQuick(storeId);
    const topProducts = useTopProductsThisMonth(10, storeId);

    const isLoading = dashboard.isLoading || todaySales.isLoading || topProducts.isLoading;
    const error = dashboard.error || todaySales.error || topProducts.error;

    return {
        isLoading,
        error,
        data: {
            dashboard: dashboard.data,
            todaySales: todaySales.data,
            topProducts: topProducts.data,
        },
        refetch: () => {
            dashboard.refetch();
            todaySales.refetch();
            topProducts.refetch();
        }
    };
};

export const useInventoryDashboard = (storeId) => {
    const inventory = useInventorySnapshot(storeId);
    const lowStock = useLowStockAlerts(storeId);
    const outOfStock = useOutOfStockReport(storeId);

    const isLoading = inventory.isLoading || lowStock.isLoading || outOfStock.isLoading;
    const error = inventory.error || lowStock.error || outOfStock.error;

    return {
        isLoading,
        error,
        data: {
            inventory: inventory.data,
            lowStock: lowStock.data,
            outOfStock: outOfStock.data,
        },
        refetch: () => {
            inventory.refetch();
            lowStock.refetch();
            outOfStock.refetch();
        }
    };
};

export const useReports = {
    // Query hooks
    useDashboardStats,
    useSalesReport,
    useSalesTrendReport,
    useDailySalesSummary,
    useMonthlySalesSummary,
    useInventoryReport,
    useProductPerformanceReport,
    useTopPerformingProducts,
    useStorePerformanceReport,
    useFinancialSummary,
    useLowStockAlerts,
    useOutOfStockReport,
    useCategoryRevenueReport,
    usePaymentMethodAnalysis,
    useCustomerPurchaseHistory,

    // Mutation hooks
    useExportReport,
    useExportCSV,
    useExportExcel,
    useExportJSON,
    useBatchReports,
    useScheduleReport,
    useCancelScheduledReport,
    useSaveFilterPreset,
    useDeleteFilterPreset,
    useDeleteReportHistory,
    useCreateCustomReport,
    useUpdateCustomReport,
    useDeleteCustomReport,

    // Quick report hooks
    useTodaySalesQuick,
    useThisMonthSalesQuick,
    useTopProductsThisMonth,
    useInventorySnapshot,

    // Utility hooks
    useInvalidateReports,
    usePrefetchReports,
    useOptimisticDashboardUpdate,

    // Composed hooks
    useSalesDashboard,
    useInventoryDashboard,
};

export default useReports;