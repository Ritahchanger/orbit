// src/hooks/product-analysis-queries.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import productAnalysisApi from '../services/product-analysis-api';

// Remove this - hooks can't be used at module level
// import { useStoreId } from '../../context/store/StoreContext';
// const storeId = useStoreId() // ERROR: Can't use React hooks at module level

// Create BASE_KEY first to avoid circular reference
const BASE_KEY = ['product-analysis'];

// Query keys - FIXED: No circular references
export const productAnalysisKeys = {
    all: BASE_KEY,
    global: {
        all: [...BASE_KEY, 'global'],
        dashboard: () => [...BASE_KEY, 'global', 'dashboard'],
        inventorySummary: () => [...BASE_KEY, 'global', 'inventory-summary'],
        topProducts: (limit) => [...BASE_KEY, 'global', 'top-products', { limit }],
        categoryPerformance: () => [...BASE_KEY, 'global', 'category-performance'],
        lowStockAlerts: () => [...BASE_KEY, 'global', 'low-stock-alerts'],
        brandPerformance: () => [...BASE_KEY, 'global', 'brand-performance'],
    },
    store: {
        all: (storeId) => [...BASE_KEY, 'store', storeId],
        dashboard: (storeId) => [...BASE_KEY, 'store', storeId, 'dashboard'],
        inventorySummary: (storeId) => [...BASE_KEY, 'store', storeId, 'inventory-summary'],
        lowStock: (storeId) => [...BASE_KEY, 'store', storeId, 'low-stock'],
        topProducts: (storeId, limit) => [...BASE_KEY, 'store', storeId, 'top-products', { limit }],
        categoryAnalysis: (storeId) => [...BASE_KEY, 'store', storeId, 'category-analysis'],
        recommendations: (storeId) => [...BASE_KEY, 'store', storeId, 'recommendations'],
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

// ============ SMART HOOKS (Auto-detect store) ============

// Helper to format API response to match component expectations
const formatDashboardResponse = (response) => {
    if (!response) return { success: false, data: null };

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
        enabled: !!storeId || !storeId,
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

/**
 * Legacy refresh hook for backward compatibility
 */
export const useRefreshProductAnalysis = () => {
    const queryClient = useQueryClient();

    return () => {
        queryClient.invalidateQueries({
            queryKey: productAnalysisKeys.all,
        });
    };
};

/**
 * Smart refresh for store analysis
 */
export const useRefreshStoreAnalysis = () => {
    const refresh = useRefreshAnalytics();
    return (storeId = null) => refresh(storeId);
};

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
            const storeId = variables[1];
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