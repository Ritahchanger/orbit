// product-analysis-queries.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import productAnalysisApi from '../services/product-analysis-api';


import { productAnalysisKeys } from './product-analysis-queries';
// Query keys
export const productAnalysisKeys = {
    all: ['product-analysis'],
    global: {
        all: [...productAnalysisKeys.all, 'global'],
        dashboard: () => [...productAnalysisKeys.global.all, 'dashboard'],
        inventorySummary: () => [...productAnalysisKeys.global.all, 'inventory-summary'],
        topProducts: (limit) => [...productAnalysisKeys.global.all, 'top-products', { limit }],
        categoryPerformance: () => [...productAnalysisKeys.global.all, 'category-performance'],
        lowStockAlerts: () => [...productAnalysisKeys.global.all, 'low-stock-alerts'],
        brandPerformance: () => [...productAnalysisKeys.global.all, 'brand-performance'],
    },
    store: {
        all: (storeId) => [...productAnalysisKeys.all, 'store', storeId],
        dashboard: (storeId) => [...productAnalysisKeys.store.all(storeId), 'dashboard'],
        inventorySummary: (storeId) => [...productAnalysisKeys.store.all(storeId), 'inventory-summary'],
        lowStock: (storeId) => [...productAnalysisKeys.store.all(storeId), 'low-stock'],
        topProducts: (storeId, limit) => [...productAnalysisKeys.store.all(storeId), 'top-products', { limit }],
        categoryAnalysis: (storeId) => [...productAnalysisKeys.store.all(storeId), 'category-analysis'],
        recommendations: (storeId) => [...productAnalysisKeys.store.all(storeId), 'recommendations'],
    }
};

// ============ GLOBAL ANALYSIS QUERIES ============

/**
 * Global Dashboard Overview
 */
export const useGlobalDashboard = (options = {}) => {
    return useQuery({
        queryKey: productAnalysisKeys.global.dashboard(),
        queryFn: () => productAnalysisApi.getGlobalDashboard(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000,
        ...options,
    });
};

/**
 * Global Inventory Health Summary
 */
export const useGlobalInventorySummary = (options = {}) => {
    return useQuery({
        queryKey: productAnalysisKeys.global.inventorySummary(),
        queryFn: () => productAnalysisApi.getGlobalInventorySummary(),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        ...options,
    });
};

/**
 * Global Top Performing Products
 * @param {number} limit - Number of products to return
 */
export const useGlobalTopProducts = (limit = 10, options = {}) => {
    return useQuery({
        queryKey: productAnalysisKeys.global.topProducts(limit),
        queryFn: () => productAnalysisApi.getGlobalTopProducts(limit),
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000,
        ...options,
    });
};

/**
 * Global Category Performance
 */
export const useGlobalCategoryPerformance = (options = {}) => {
    return useQuery({
        queryKey: productAnalysisKeys.global.categoryPerformance(),
        queryFn: () => productAnalysisApi.getGlobalCategoryPerformance(),
        staleTime: 15 * 60 * 1000, // 15 minutes
        gcTime: 30 * 60 * 1000,
        ...options,
    });
};

/**
 * Global Low Stock Alerts (Optional)
 */
export const useGlobalLowStockAlerts = (options = {}) => {
    return useQuery({
        queryKey: productAnalysisKeys.global.lowStockAlerts(),
        queryFn: () => productAnalysisApi.getGlobalLowStockAlerts(),
        staleTime: 3 * 60 * 1000, // 3 minutes
        gcTime: 5 * 60 * 1000,
        ...options,
    });
};

/**
 * Global Brand Performance (Optional)
 */
export const useGlobalBrandPerformance = (options = {}) => {
    return useQuery({
        queryKey: productAnalysisKeys.global.brandPerformance(),
        queryFn: () => productAnalysisApi.getGlobalBrandPerformance(),
        staleTime: 15 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        ...options,
    });
};

// ============ STORE ANALYSIS QUERIES ============

/**
 * Store Inventory Dashboard
 * @param {string} storeId - Store identifier
 */
export const useStoreDashboard = (storeId, options = {}) => {
    return useQuery({
        queryKey: productAnalysisKeys.store.dashboard(storeId),
        queryFn: () => productAnalysisApi.getStoreDashboard(storeId),
        enabled: !!storeId,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        ...options,
    });
};

/**
 * Store Inventory Health Summary
 * @param {string} storeId - Store identifier
 */
export const useStoreInventorySummary = (storeId, options = {}) => {
    return useQuery({
        queryKey: productAnalysisKeys.store.inventorySummary(storeId),
        queryFn: () => productAnalysisApi.getStoreInventorySummary(storeId),
        enabled: !!storeId,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        ...options,
    });
};

/**
 * Store Low Stock Analysis
 * @param {string} storeId - Store identifier
 */
export const useStoreLowStockAnalysis = (storeId, options = {}) => {
    return useQuery({
        queryKey: productAnalysisKeys.store.lowStock(storeId),
        queryFn: () => productAnalysisApi.getStoreLowStockAnalysis(storeId),
        enabled: !!storeId,
        staleTime: 3 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        ...options,
    });
};

/**
 * Store Top Products
 * @param {string} storeId - Store identifier
 * @param {number} limit - Number of products to return
 */
export const useStoreTopProducts = (storeId, limit = 10, options = {}) => {
    return useQuery({
        queryKey: productAnalysisKeys.store.topProducts(storeId, limit),
        queryFn: () => productAnalysisApi.getStoreTopProducts(storeId, limit),
        enabled: !!storeId,
        staleTime: 2 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        ...options,
    });
};

/**
 * Store Category Analysis (Optional)
 * @param {string} storeId - Store identifier
 */
export const useStoreCategoryAnalysis = (storeId, options = {}) => {
    return useQuery({
        queryKey: productAnalysisKeys.store.categoryAnalysis(storeId),
        queryFn: () => productAnalysisApi.getStoreCategoryAnalysis(storeId),
        enabled: !!storeId,
        staleTime: 10 * 60 * 1000,
        gcTime: 20 * 60 * 1000,
        ...options,
    });
};

/**
 * Store Recommendations (Optional)
 * @param {string} storeId - Store identifier
 */
export const useStoreRecommendations = (storeId, options = {}) => {
    return useQuery({
        queryKey: productAnalysisKeys.store.recommendations(storeId),
        queryFn: () => productAnalysisApi.getStoreRecommendations(storeId),
        enabled: !!storeId,
        staleTime: 10 * 60 * 1000,
        gcTime: 20 * 60 * 1000,
        ...options,
    });
};

// ============ CONVENIENCE QUERIES ============

/**
 * Get all global analytics in one query (parallel fetching)
 */
export const useAllGlobalAnalytics = (options = {}) => {
    const dashboardQuery = useGlobalDashboard(options);
    const inventoryQuery = useGlobalInventorySummary(options);
    const topProductsQuery = useGlobalTopProducts(10, options);
    const categoryQuery = useGlobalCategoryPerformance(options);

    return {
        dashboard: dashboardQuery.data,
        inventorySummary: inventoryQuery.data,
        topProducts: topProductsQuery.data,
        categoryPerformance: categoryQuery.data,
        isLoading: dashboardQuery.isLoading || inventoryQuery.isLoading ||
            topProductsQuery.isLoading || categoryQuery.isLoading,
        isError: dashboardQuery.isError || inventoryQuery.isError ||
            topProductsQuery.isError || categoryQuery.isError,
        errors: [dashboardQuery.error, inventoryQuery.error,
        topProductsQuery.error, categoryQuery.error].filter(Boolean),
        refetchAll: () => {
            dashboardQuery.refetch();
            inventoryQuery.refetch();
            topProductsQuery.refetch();
            categoryQuery.refetch();
        }
    };
};

/**
 * Get all store analytics in one query (parallel fetching)
 * @param {string} storeId - Store identifier
 */
export const useAllStoreAnalytics = (storeId, options = {}) => {
    const dashboardQuery = useStoreDashboard(storeId, options);
    const inventoryQuery = useStoreInventorySummary(storeId, options);
    const lowStockQuery = useStoreLowStockAnalysis(storeId, options);
    const topProductsQuery = useStoreTopProducts(storeId, 10, options);

    return {
        dashboard: dashboardQuery.data,
        inventorySummary: inventoryQuery.data,
        lowStockAnalysis: lowStockQuery.data,
        topProducts: topProductsQuery.data,
        isLoading: dashboardQuery.isLoading || inventoryQuery.isLoading ||
            lowStockQuery.isLoading || topProductsQuery.isLoading,
        isError: dashboardQuery.isError || inventoryQuery.isError ||
            lowStockQuery.isError || topProductsQuery.isError,
        errors: [dashboardQuery.error, inventoryQuery.error,
        lowStockQuery.error, topProductsQuery.error].filter(Boolean),
        refetchAll: () => {
            dashboardQuery.refetch();
            inventoryQuery.refetch();
            lowStockQuery.refetch();
            topProductsQuery.refetch();
        }
    };
};

/**
 * Smart query that auto-detects scope (global or store)
 * @param {string} storeId - Store identifier (null for global)
 */
export const useSmartAnalytics = (storeId = null, options = {}) => {
    if (storeId) {
        return useAllStoreAnalytics(storeId, options);
    }
    return useAllGlobalAnalytics(options);
};

// ============ MUTATIONS ============

/**
 * Export report (global or store)
 */
export const useExportReport = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ storeId = null, reportType = 'inventory-summary' }) => {
            return productAnalysisApi.downloadCSVReport(storeId, reportType);
        },
        onSuccess: (data, variables) => {
            // Invalidate relevant queries after export
            if (variables.storeId) {
                queryClient.invalidateQueries({
                    queryKey: productAnalysisKeys.store.all(variables.storeId),
                });
            } else {
                queryClient.invalidateQueries({
                    queryKey: productAnalysisKeys.global.all,
                });
            }
        },
        onError: (error) => {
            console.error('Export failed:', error);
        }
    });
};

/**
 * Refresh analytics data
 */
export const useRefreshAnalytics = () => {
    const queryClient = useQueryClient();

    return (storeId = null) => {
        if (storeId) {
            queryClient.invalidateQueries({
                queryKey: productAnalysisKeys.store.all(storeId),
            });
        } else {
            queryClient.invalidateQueries({
                queryKey: productAnalysisKeys.global.all,
            });
        }
    };
};

// ============ PREFETCH FUNCTIONS ============

export const prefetchGlobalDashboard = async (queryClient) => {
    await queryClient.prefetchQuery({
        queryKey: productAnalysisKeys.global.dashboard(),
        queryFn: () => productAnalysisApi.getGlobalDashboard(),
        staleTime: 5 * 60 * 1000,
    });
};

export const prefetchGlobalInventorySummary = async (queryClient) => {
    await queryClient.prefetchQuery({
        queryKey: productAnalysisKeys.global.inventorySummary(),
        queryFn: () => productAnalysisApi.getGlobalInventorySummary(),
        staleTime: 5 * 60 * 1000,
    });
};

export const prefetchStoreDashboard = async (queryClient, storeId) => {
    if (!storeId) return;

    await queryClient.prefetchQuery({
        queryKey: productAnalysisKeys.store.dashboard(storeId),
        queryFn: () => productAnalysisApi.getStoreDashboard(storeId),
        staleTime: 5 * 60 * 1000,
    });
};

export const prefetchStoreLowStock = async (queryClient, storeId) => {
    if (!storeId) return;

    await queryClient.prefetchQuery({
        queryKey: productAnalysisKeys.store.lowStock(storeId),
        queryFn: () => productAnalysisApi.getStoreLowStockAnalysis(storeId),
        staleTime: 3 * 60 * 1000,
    });
};

// ============ UTILITY FUNCTIONS ============

/**
 * Get query status for all analytics
 */
export const getAnalyticsStatus = (storeId = null) => {
    const queryClient = useQueryClient();

    if (storeId) {
        const storeKeys = [
            productAnalysisKeys.store.dashboard(storeId),
            productAnalysisKeys.store.inventorySummary(storeId),
            productAnalysisKeys.store.lowStock(storeId),
            productAnalysisKeys.store.topProducts(storeId, 10)
        ];

        return storeKeys.map(key => ({
            key,
            data: queryClient.getQueryData(key),
            state: queryClient.getQueryState(key)
        }));
    } else {
        const globalKeys = [
            productAnalysisKeys.global.dashboard(),
            productAnalysisKeys.global.inventorySummary(),
            productAnalysisKeys.global.topProducts(10),
            productAnalysisKeys.global.categoryPerformance()
        ];

        return globalKeys.map(key => ({
            key,
            data: queryClient.getQueryData(key),
            state: queryClient.getQueryState(key)
        }));
    }
};




const formatDashboardResponse = (response) => {
    if (!response) return { success: false, data: null };

    // Handle both direct data and wrapped responses
    const data = response.data || response;

    return {
        success: true,
        data: {
            inventorySummary: data?.inventorySummary || data,
            topProducts: data?.topProducts || data?.products || [],
            categoryDistribution: data?.categoryPerformance || data?.categories || [],
            lowStockAlert: data?.lowStockAlerts || {
                summary: {},
                products: []
            },
            alerts: data?.alerts || [],
            store: data?.store || null,
            scope: data?.scope || 'global'
        }
    };
};

const formatInventoryResponse = (response) => {
    if (!response) return { success: false, data: null };

    const data = response.data || response;

    return {
        success: true,
        data: {
            totalProducts: data.totalProducts || 0,
            totalStock: data.totalStock || 0,
            totalValue: data.totalValue || 0,
            totalRevenue: data.totalRevenue || 0,
            totalSold: data.totalItemsSold || data.totalSold || 0,
            lowStockCount: data.lowStockCount || 0,
            outOfStockCount: data.outOfStockCount || 0,
            inStockCount: data.inStockCount || 0,
            avgProfitMargin: data.avgProfitMargin || 0,
            inventoryHealth: data.inventoryHealth || 0,
            // For backwards compatibility with old component
            inventoryStatus: {
                inStock: data.inStockCount || 0,
                lowStock: data.lowStockCount || 0,
                outOfStock: data.outOfStockCount || 0
            },
            stockSummary: {
                inStock: data.inStockCount || 0,
                lowStock: data.lowStockCount || 0,
                outOfStock: data.outOfStockCount || 0
            }
        }
    };
};

const formatLowStockResponse = (response) => {
    if (!response) return { success: false, data: null };

    const data = response.data || response;

    // Handle both old and new response formats
    const summary = data.summary || {};
    const products = data.products || data.items || [];

    return {
        success: true,
        data: {
            summary: {
                totalProducts: summary.totalProducts || summary.totalItems || products.length,
                totalItems: summary.totalItems || products.length,
                totalDeficit: summary.totalDeficit || 0,
                totalRestockValue: summary.totalRestockValue || summary.totalRestockCost || 0,
                criticalCount: summary.critical || summary.criticalCount || 0,
                warningCount: summary.warning || summary.warningCount || 0
            },
            products: products.map(item => ({
                name: item.name || item.productName,
                sku: item.sku,
                stock: item.stock || item.currentStock,
                minStock: item.minStock,
                deficit: item.deficit || (item.minStock - item.stock),
                severity: item.severity || 'warning',
                category: item.category,
                price: item.price,
                costPrice: item.costPrice
            }))
        }
    };
};

const formatTopProductsResponse = (response) => {
    if (!response) return { success: false, data: null };

    const data = response.data || response || [];

    return {
        success: true,
        data: Array.isArray(data) ? data.map(product => ({
            name: product.name || product.productName,
            sku: product.sku,
            totalRevenue: product.totalRevenue || product.revenue || 0,
            totalSold: product.totalSold || product.sales || 0,
            profit: product.profit || 0,
            profitMargin: product.profitMargin ||
                (product.costPrice > 0 ?
                    ((product.price - product.costPrice) / product.costPrice * 100).toFixed(2) : 0),
            price: product.price,
            costPrice: product.costPrice,
            category: product.category,
            stock: product.stock,
            status: product.status
        })) : []
    };
};

const formatCategoryResponse = (response) => {
    if (!response) return { success: false, data: null };

    const data = response.data || response || [];

    return {
        success: true,
        data: Array.isArray(data) ? data.map(category => ({
            category: category.category || category.name,
            name: category.category || category.name,
            count: category.count || category.productCount,
            totalRevenue: category.totalRevenue || category.revenue || 0,
            totalStock: category.totalStock || category.stock || 0,
            totalSold: category.totalSold || category.sales || 0,
            revenuePercentage: category.revenuePercentage || category.percentage || 0,
            percentage: category.revenuePercentage || category.percentage || 0
        })) : []
    };
};

const formatRecommendationsResponse = (response) => {
    if (!response) return { success: false, data: null };

    const data = response.data || response;

    return {
        success: true,
        data: {
            restock: data.restock || [],
            discount: data.discount || [],
            promote: data.promote || [],
            phaseOut: data.phaseOut || []
        }
    };
};

const formatAlertsResponse = (response) => {
    if (!response) return { success: false, data: null };

    const data = response.data || response || [];

    return {
        success: true,
        data: Array.isArray(data) ? data : []
    };
};

// ============ SMART HOOKS (Auto-detect store) ============

/**
 * Smart Dashboard Analytics
 */
export const useSmartDashboardAnalytics = (timeRange = 'month', compare = true, storeId = null, options = {}) => {
    return useQuery({
        queryKey: storeId
            ? productAnalysisKeys.store.dashboard(storeId)
            : productAnalysisKeys.global.dashboard(),
        queryFn: () => storeId
            ? productAnalysisApi.getStoreDashboard(storeId)
            : productAnalysisApi.getGlobalDashboard(),
        enabled: !!storeId || !storeId, // Always enabled for global, only if storeId exists for store
        select: formatDashboardResponse,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        ...options,
    });
};

/**
 * Smart Inventory Summary
 */
export const useSmartInventorySummary = (storeId = null, options = {}) => {
    return useQuery({
        queryKey: storeId
            ? productAnalysisKeys.store.inventorySummary(storeId)
            : productAnalysisKeys.global.inventorySummary(),
        queryFn: () => storeId
            ? productAnalysisApi.getStoreInventorySummary(storeId)
            : productAnalysisApi.getGlobalInventorySummary(),
        enabled: !!storeId || !storeId,
        select: formatInventoryResponse,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        ...options,
    });
};

/**
 * Smart Low Stock Analysis
 */
export const useSmartLowStockAnalysis = (storeId = null, options = {}) => {
    return useQuery({
        queryKey: storeId
            ? productAnalysisKeys.store.lowStock(storeId)
            : productAnalysisKeys.global.lowStockAlerts(),
        queryFn: () => storeId
            ? productAnalysisApi.getStoreLowStockAnalysis(storeId)
            : productAnalysisApi.getGlobalLowStockAlerts(),
        enabled: !!storeId || !storeId,
        select: formatLowStockResponse,
        staleTime: 3 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        ...options,
    });
};

/**
 * Smart Category Distribution
 */
export const useSmartCategoryDistribution = (storeId = null, options = {}) => {
    return useQuery({
        queryKey: storeId
            ? productAnalysisKeys.store.categoryAnalysis(storeId)
            : productAnalysisKeys.global.categoryPerformance(),
        queryFn: () => storeId
            ? productAnalysisApi.getStoreCategoryAnalysis(storeId)
            : productAnalysisApi.getGlobalCategoryPerformance(),
        enabled: !!storeId || !storeId,
        select: formatCategoryResponse,
        staleTime: 15 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        ...options,
    });
};

/**
 * Smart Top Products
 */
export const useSmartTopProducts = (by = 'revenue', limit = 10, storeId = null, options = {}) => {
    return useQuery({
        queryKey: storeId
            ? productAnalysisKeys.store.topProducts(storeId, limit)
            : productAnalysisKeys.global.topProducts(limit),
        queryFn: () => storeId
            ? productAnalysisApi.getStoreTopProducts(storeId, limit)
            : productAnalysisApi.getGlobalTopProducts(limit),
        enabled: !!storeId || !storeId,
        select: formatTopProductsResponse,
        staleTime: 2 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        ...options,
    });
};

/**
 * Smart Alerts
 */
export const useSmartAlerts = (storeId = null, options = {}) => {
    // Alerts are derived from low stock data
    const { data, ...rest } = useSmartLowStockAnalysis(storeId, options);

    return {
        ...rest,
        data: {
            success: data?.success || false,
            data: data?.data?.products?.map(product => ({
                type: 'stock',
                level: product.severity === 'critical' ? 'critical' : 'warning',
                message: `${product.name} (${product.sku}) is ${product.stock === 0 ? 'out of stock' : 'low on stock'}`,
                product: product.name,
                sku: product.sku,
                currentStock: product.stock,
                requiredStock: product.minStock,
                deficit: product.deficit
            })) || []
        }
    };
};

/**
 * Smart Product Recommendations
 */
export const useSmartProductRecommendations = (storeId = null, options = {}) => {
    return useQuery({
        queryKey: storeId
            ? productAnalysisKeys.store.recommendations(storeId)
            : ['product-analysis', 'global', 'recommendations'],
        queryFn: async () => {
            if (storeId) {
                return productAnalysisApi.getStoreRecommendations(storeId);
            } else {
                // For global, create recommendations from other data
                const [lowStock, topProducts] = await Promise.all([
                    productAnalysisApi.getGlobalLowStockAlerts(),
                    productAnalysisApi.getGlobalTopProducts(5)
                ]);

                const lowStockData = lowStock.data || lowStock;
                const topProductsData = topProducts.data || topProducts;

                return {
                    restock: (lowStockData.products || []).slice(0, 3),
                    discount: (topProductsData || []).filter(p => p.totalSold < 10).slice(0, 3),
                    promote: (topProductsData || []).slice(0, 3),
                    phaseOut: []
                };
            }
        },
        enabled: !!storeId || !storeId,
        select: formatRecommendationsResponse,
        staleTime: 10 * 60 * 1000,
        gcTime: 20 * 60 * 1000,
        ...options,
    });
};

// ============ SMART MUTATIONS ============

/**
 * Smart CSV Download
 */
export const useSmartDownloadCSVReport = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (type = 'full', storeId = null) => {
            // Note: You need to implement downloadCSVReport in your API
            throw new Error('downloadCSVReport not implemented in API');
        },
        onSuccess: (data, variables) => {
            const storeId = variables[1]; // Second parameter is storeId
            if (storeId) {
                queryClient.invalidateQueries({
                    queryKey: productAnalysisKeys.store.all(storeId),
                });
            } else {
                queryClient.invalidateQueries({
                    queryKey: productAnalysisKeys.global.all,
                });
            }
        },
    });
};

/**
 * Refresh store analysis
 */
export const useRefreshStoreAnalysis = () => {
    const queryClient = useQueryClient();

    return (storeId = null) => {
        if (storeId) {
            queryClient.invalidateQueries({
                queryKey: productAnalysisKeys.store.all(storeId),
            });
        } else {
            queryClient.invalidateQueries({
                queryKey: productAnalysisKeys.global.all,
            });
        }
    };
};

// ============ LEGACY HOOKS (for compatibility) ============

/**
 * Legacy: Refresh product analysis (for backward compatibility)
 */
export const useRefreshProductAnalysis = () => {
    const queryClient = useQueryClient();

    return () => {
        queryClient.invalidateQueries({
            queryKey: productAnalysisKeys.all,
        });
    };
};

// ============ UTILITY FUNCTIONS ============

/**
 * Get all smart analytics data in one place
 */
export const useAllSmartAnalytics = (storeId = null, options = {}) => {
    const dashboard = useSmartDashboardAnalytics('month', true, storeId, options);
    const inventory = useSmartInventorySummary(storeId, options);
    const lowStock = useSmartLowStockAnalysis(storeId, options);
    const category = useSmartCategoryDistribution(storeId, options);
    const topProducts = useSmartTopProducts('revenue', 10, storeId, options);

    return {
        dashboard: dashboard.data,
        inventorySummary: inventory.data,
        lowStockAnalysis: lowStock.data,
        categoryDistribution: category.data,
        topProducts: topProducts.data,
        isLoading: dashboard.isLoading || inventory.isLoading ||
            lowStock.isLoading || category.isLoading || topProducts.isLoading,
        isError: dashboard.isError || inventory.isError ||
            lowStock.isError || category.isError || topProducts.isError,
        refetchAll: () => {
            dashboard.refetch();
            inventory.refetch();
            lowStock.refetch();
            category.refetch();
            topProducts.refetch();
        }
    };
};