// src/admin-pages/admin-analytics/pages/AdminAnalytics.jsx
import { useState, useMemo, useEffect } from "react";
import AdminLayout from "../../dashboard/layout/Layout";
import ChartWrapper from "../components/Charts/ChartWrapper";
import {
    useGlobalDashboard,
    useGlobalInventorySummary,
    useGlobalTopProducts,
    useGlobalCategoryPerformance,
    useGlobalLowStockAlerts,
    useExportReport,
    useRefreshAnalytics
} from "../../hooks/product-analysis-queries";

import {
    TrendingUp,
    Activity,
    Globe,
    Download,
    RefreshCw,
    AlertTriangle,
    Package,
    DollarSign,
    ShoppingCart,
    Calendar,
    BarChart,
    LineChart,
    PieChart as PieChartIcon,
} from "lucide-react";
import AdminCopySKU from "../../products/components/AdminCopySKU";
import LowStockAlerts from "../components/LowStockAlerts";
import TopProductsComponent from "../components/TopProductsComponent";
import SkeletonPreloader from "../preloaders/AdminProductAnalysis";

// Helper function to format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount || 0);
};

// Helper function to format numbers
const formatNumber = (num) => {
    return new Intl.NumberFormat('en-KE').format(num || 0);
};

const AdminAnalytics = () => {
    const [viewMode, setViewMode] = useState('global');
    const [timeRange, setTimeRange] = useState('30d'); // '7d', '30d', '90d', '1y'
    const [chartType, setChartType] = useState('bar'); // 'bar', 'line', 'pie'
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showFullChart, setShowFullChart] = useState(null);

    // Fetch data using your new hooks
    const {
        data: globalDashboard,
        isLoading: dashboardLoading,
        error: dashboardError,
        refetch: refetchDashboard
    } = useGlobalDashboard();

    const {
        data: inventorySummary,
        isLoading: inventoryLoading,
        error: inventoryError,
        refetch: refetchInventory
    } = useGlobalInventorySummary();

    const {
        data: topProductsData,
        isLoading: topProductsLoading,
        error: topProductsError,
        refetch: refetchTopProducts
    } = useGlobalTopProducts(10);

    const {
        data: categoryData,
        isLoading: categoryLoading,
        error: categoryError,
        refetch: refetchCategory
    } = useGlobalCategoryPerformance();

    const {
        data: lowStockData,
        isLoading: lowStockLoading,
        error: lowStockError,
        refetch: refetchLowStock
    } = useGlobalLowStockAlerts();

    // Mutations
    const { mutate: exportReport, isPending: exporting } = useExportReport();
    const refreshAnalytics = useRefreshAnalytics();

    // Combine loading states
    const isLoading = dashboardLoading || inventoryLoading || topProductsLoading || categoryLoading;
    const hasError = dashboardError || inventoryError || topProductsError || categoryError;

    // Handle refresh
    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await Promise.all([
                refetchDashboard(),
                refetchInventory(),
                refetchTopProducts(),
                refetchCategory(),
                refetchLowStock()
            ]);
        } finally {
            setIsRefreshing(false);
        }
    };

    // Handle export
    const handleExport = () => {
        exportReport({
            storeId: null, // Global export
            reportType: 'inventory-summary'
        });
    };

    // Prepare chart data
    const topProductsChartData = useMemo(() => {
        console.log('🔍 Preparing chart data from:', topProductsData);

        if (!topProductsData?.success || !topProductsData?.data || !Array.isArray(topProductsData.data)) {
            console.log('❌ No valid data found');
            return [];
        }

        console.log('✅ Data is valid array with length:', topProductsData.data.length);

        return topProductsData.data.slice(0, 8).map((product, index) => {
            console.log(`🔍 Processing product ${index + 1}:`, {
                name: product.name,
                revenue: product.totalRevenue,
                sold: product.totalSold,
                margin: product.profitMargin
            });

            return {
                name: product.name?.substring(0, 20) + (product.name?.length > 20 ? "..." : ""),
                revenue: product.totalRevenue || 0,
                unitsSold: product.totalSold || 0,
                profit: product.profit || 0,
                margin: parseFloat(product.profitMargin) || 0,
                sku: product.sku || '',
                status: product.status || 'N/A',
                stock: product.stock || 0,
                // Keep the original product for debugging
                original: product
            };
        });
    }, [topProductsData]);

    const categoryChartData = useMemo(() => {
        if (!categoryData?.data) return [];

        return categoryData.data.slice(0, 6).map(category => ({
            name: category.category || 'Uncategorized',
            revenue: category.totalRevenue || 0,
            count: category.count || 0,
            percentage: category.revenuePercentage || category.percentage || 0
        }));
    }, [categoryData]);

    const lowStockAlerts = useMemo(() => {
        // Debug log to see actual structure
        console.log('🔍 Low Stock Data:', lowStockData);

        // Check the correct path
        if (!lowStockData?.data?.lowStockAlerts?.products) {
            console.log('❌ No low stock products found at path:', 'data.lowStockAlerts.products');
            return [];
        }

        const products = lowStockData.data.lowStockAlerts.products;
        console.log('✅ Found low stock products:', products.length);

        return products.slice(0, 5);
    }, [lowStockData]);
    const inventoryStats = useMemo(() => {
        if (!inventorySummary?.data) return null;

        const data = inventorySummary.data;
        return {
            totalValue: data.totalValue || 0,
            totalRevenue: data.totalRevenue || 0,
            totalProducts: data.totalProducts || 0,
            totalStock: data.totalStock || 0,
            lowStockCount: data.lowStockCount || 0,
            outOfStockCount: data.outOfStockCount || 0,
            inventoryHealth: data.inventoryHealth || 0,
            avgProfitMargin: data.avgProfitMargin || 0
        };
    }, [inventorySummary]);

    // Chart configurations
    const topProductsChartConfig = {
        type: chartType === 'bar' ? 'bar' : 'line',
        data: {
            labels: topProductsChartData.map(item => item.name),
            datasets: [
                {
                    label: 'Revenue (KES)',
                    data: topProductsChartData.map(item => item.revenue),
                    backgroundColor: chartType === 'bar' ? 'rgba(59, 130, 246, 0.7)' : 'rgba(59, 130, 246, 0.1)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: chartType === 'bar' ? 1 : 3,
                    borderRadius: chartType === 'bar' ? 6 : 0,
                    tension: chartType === 'line' ? 0.4 : 0
                },
                {
                    label: 'Units Sold',
                    data: topProductsChartData.map(item => item.unitsSold),
                    backgroundColor: chartType === 'bar' ? 'rgba(16, 185, 129, 0.7)' : 'rgba(16, 185, 129, 0.1)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: chartType === 'bar' ? 1 : 3,
                    borderRadius: chartType === 'bar' ? 6 : 0,
                    tension: chartType === 'line' ? 0.4 : 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#9ca3af',
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#d1d5db',
                    borderColor: 'rgba(55, 65, 81, 0.5)',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(55, 65, 81, 0.3)'
                    },
                    ticks: {
                        color: '#9ca3af',
                        callback: (value) => `KES ${formatNumber(value)}`
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(55, 65, 81, 0.3)'
                    },
                    ticks: {
                        color: '#9ca3af',
                        maxRotation: 45
                    }
                }
            }
        }
    };

    const categoryChartConfig = {
        type: 'pie',
        data: {
            labels: categoryChartData.map(item => item.name),
            datasets: [
                {
                    data: categoryChartData.map(item => item.revenue),
                    backgroundColor: [
                        '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
                        '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'
                    ],
                    borderColor: '#1f2937',
                    borderWidth: 2,
                    hoverOffset: 15
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#9ca3af',
                        padding: 15,
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: KES ${formatNumber(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    };

    const inventoryHealthChartConfig = {
        type: 'doughnut',
        data: {
            labels: ['In Stock', 'Low Stock', 'Out of Stock'],
            datasets: [
                {
                    data: [
                        inventoryStats?.totalProducts - (inventoryStats?.lowStockCount + inventoryStats?.outOfStockCount) || 0,
                        inventoryStats?.lowStockCount || 0,
                        inventoryStats?.outOfStockCount || 0
                    ],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                    borderColor: '#1f2937',
                    borderWidth: 3,
                    hoverOffset: 15
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#9ca3af',
                        padding: 15,
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value} products (${percentage}%)`;
                        }
                    }
                }
            }
        }
    };


    // Time range options
    const timeRangeOptions = [
        { value: '7d', label: 'Last 7 days' },
        { value: '30d', label: 'Last 30 days' },
        { value: '90d', label: 'Last 90 days' },
        { value: '1y', label: 'Last year' }
    ];

    if (isLoading) {
        return (
            <AdminLayout>
                <SkeletonPreloader />
            </AdminLayout>
        );
    }

    if (hasError) {
        return (
            <AdminLayout>
                <div className="min-h-screen bg-white dark:bg-gray-800 p-4 sm:p-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-sm p-8 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-red-100 dark:bg-red-900/30 rounded-full">
                                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Error Loading Analytics
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 mb-2">
                                Failed to load analytics data. Please try again.
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                                There was a problem connecting to the analytics service.
                            </p>
                            <button
                                onClick={handleRefresh}
                                className="px-5 py-2.5 bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white rounded-sm transition-colors flex items-center gap-2 mx-auto"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        );

    }

    return (
        <AdminLayout>
            <div className="min-h-screen bg-white dark:bg-gray-800 p-4 sm:p-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-1 gap-3">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                            Analytics Dashboard
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {viewMode === 'global'
                                ? 'Global analytics across all stores'
                                : 'Store-specific analytics'
                            }
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <div className="w-2 h-2 rounded-sm bg-green-500 animate-pulse"></div>
                            <span>Live Data</span>
                        </div>
                        <span className="text-gray-400 dark:text-gray-600">•</span>
                        <span className="text-gray-500 dark:text-gray-400">Updated in real-time</span>
                    </div>
                </div>

                {/* View Mode Toggle */}
                <div className="mb-2">
                    <div className="flex flex-col md:flex-row gap-2 mb-2">
                        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-1 flex items-center">
                            <button
                                onClick={() => setViewMode('global')}
                                className={`px-4 py-2 rounded-sm text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${viewMode === 'global'
                                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-500 dark:to-purple-600 text-white'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <Globe size={16} />
                                Global View
                            </button>
                        </div>
                    </div>
                </div>

                {/* Controls Bar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                    <div className="flex items-center gap-3">
                        {/* Time Range Selector */}
                        <div className="relative">
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                className="appearance-none bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm px-4 py-2 pl-10 pr-8 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                            >
                                {timeRangeOptions.map(option => (
                                    <option key={option.value} value={option.value} className="text-gray-900 dark:text-white">
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                        </div>

                        {/* Chart Type Selector */}
                        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-1 flex items-center">
                            <button
                                onClick={() => setChartType('bar')}
                                className={`p-2 rounded ${chartType === 'bar'
                                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                title="Bar Chart"
                            >
                                <BarChart size={16} />
                            </button>
                            <button
                                onClick={() => setChartType('line')}
                                className={`p-2 rounded ${chartType === 'line'
                                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                title="Line Chart"
                            >
                                <LineChart size={16} />
                            </button>
                            <button
                                onClick={() => setChartType('pie')}
                                className={`p-2 rounded ${chartType === 'pie'
                                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                title="Pie Chart"
                            >
                                <PieChartIcon size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {isRefreshing ? 'Refreshing...' : 'Refresh'}
                        </button>
                        <button
                            onClick={handleExport}
                            disabled={exporting}
                            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download className="h-4 w-4" />
                            {exporting ? 'Exporting...' : 'Export Report'}
                        </button>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* Total Inventory Value */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Inventory Value</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {formatCurrency(inventoryStats?.totalValue || 0)}
                                </p>
                                <p className="text-green-600 dark:text-green-400 text-xs mt-1 flex items-center">
                                    <TrendingUp size={12} className="mr-1" />
                                    Active Value
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-sm">
                                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </div>

                    {/* Total Revenue */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {formatCurrency(inventoryStats?.totalRevenue || 0)}
                                </p>
                                <p className="text-purple-600 dark:text-purple-400 text-xs mt-1 flex items-center">
                                    <DollarSign size={12} className="mr-1" />
                                    From Sales
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-sm">
                                <ShoppingCart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </div>

                    {/* Inventory Health */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Inventory Health</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {inventoryStats?.inventoryHealth?.toFixed(1) || '0'}%
                                </p>
                                <p className="text-orange-600 dark:text-orange-400 text-xs mt-1 flex items-center">
                                    <Activity size={12} className="mr-1" />
                                    Overall Score
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-sm">
                                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </div>

                    {/* Average Profit Margin */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Avg. Profit Margin</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {inventoryStats?.avgProfitMargin?.toFixed(1) || '0'}%
                                </p>
                                <p className="text-cyan-600 dark:text-cyan-400 text-xs mt-1 flex items-center">
                                    <TrendingUp size={12} className="mr-1" />
                                    Margin Rate
                                </p>
                            </div>
                            <div className="p-3 bg-cyan-100 dark:bg-cyan-900/20 rounded-sm">
                                <TrendingUp className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <TopProductsComponent
                    showFullChart={showFullChart === 'topProducts'}
                    topProductsChartConfig={topProductsChartConfig}
                    chartType={chartType}
                    timeRange={timeRange}
                    setShowFullChart={(maximize) => setShowFullChart(maximize ? 'topProducts' : null)}
                    categoryChartConfig={categoryChartConfig}
                />

                {/* Main Grid Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                    {/* Left Column - Inventory Health */}
                    <div className={`${showFullChart === 'lowStock' ? 'hidden lg:block lg:col-span-1' : 'lg:col-span-1'}`}>
                        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-4 h-full">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Activity size={18} className="text-orange-600 dark:text-orange-500" />
                                    Inventory Status Overview
                                </h3>
                                <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-sm">
                                    Stock Levels
                                </span>
                            </div>
                            <div className="h-64">
                                <ChartWrapper
                                    key={`inventory-health-${timeRange}`}
                                    {...inventoryHealthChartConfig}
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {inventoryStats?.totalProducts - (inventoryStats?.lowStockCount + inventoryStats?.outOfStockCount) || 0}
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">In Stock</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                        {inventoryStats?.lowStockCount || 0}
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">Low Stock</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                        {inventoryStats?.outOfStockCount || 0}
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">Out of Stock</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Low Stock Alerts */}
                    <div className={`${showFullChart === 'lowStock' ? 'lg:col-span-2' : 'lg:col-span-2'}`}>
                        <LowStockAlerts
                            lowStockAlerts={lowStockAlerts}
                            lowStockData={lowStockData}
                            formatCurrency={formatCurrency}
                            formatNumber={formatNumber}
                            showFullChart={showFullChart === 'lowStock'}
                            setShowFullChart={(maximize) => setShowFullChart(maximize ? 'lowStock' : null)}
                        />
                    </div>
                </div>

                {/* Top Products Table */}
                <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-4 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <TrendingUp size={18} className="text-green-600 dark:text-green-500" />
                            Top Performing Products
                        </h3>
                        <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded-sm">
                            Showing {topProductsChartData.length} of {topProductsData?.data?.length || 0} products
                        </span>
                    </div>

                    {topProductsChartData.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <TrendingUp className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-2" />
                            <p>No top products data available</p>
                            <p className="text-sm mt-1">Check console for debugging information</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-300 dark:border-gray-700">
                                        <th className="text-left py-3 px-2 text-gray-700 dark:text-gray-300 text-sm font-medium">#</th>
                                        <th className="text-left py-3 px-2 text-gray-700 dark:text-gray-300 text-sm font-medium">Product</th>
                                        <th className="text-left py-3 px-2 text-gray-700 dark:text-gray-300 text-sm font-medium">SKU</th>
                                        <th className="text-left py-3 px-2 text-gray-700 dark:text-gray-300 text-sm font-medium">Revenue</th>
                                        <th className="text-left py-3 px-2 text-gray-700 dark:text-gray-300 text-sm font-medium">Sold</th>
                                        <th className="text-left py-3 px-2 text-gray-700 dark:text-gray-300 text-sm font-medium">Margin</th>
                                        <th className="text-left py-3 px-2 text-gray-700 dark:text-gray-300 text-sm font-medium">Stock</th>
                                        <th className="text-left py-3 px-2 text-gray-700 dark:text-gray-300 text-sm font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topProductsChartData.map((product, index) => (
                                        <tr key={index} className="border-b border-gray-300 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/30">
                                            <td className="py-3 px-2">
                                                <span className="text-gray-600 dark:text-gray-500 text-sm">{index + 1}</span>
                                            </td>
                                            <td className="py-3 px-2">
                                                <p className="text-gray-900 dark:text-white text-sm font-medium w-[120px]">{product.name}</p>
                                            </td>
                                            <td className="py-3 px-2">
                                                <AdminCopySKU productSku={product.sku} />
                                            </td>
                                            <td className="py-3 px-2">
                                                <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                                                    {formatCurrency(product.revenue)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2">
                                                <span className="text-gray-900 dark:text-gray-300 text-sm">{formatNumber(product.unitsSold)}</span>
                                            </td>
                                            <td className="py-3 px-2">
                                                <span className={`text-xs px-2 py-1 rounded-sm ${product.margin > 30 ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                                                    product.margin > 20 ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' :
                                                        product.margin > 0 ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' :
                                                            'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400'
                                                    }`}>
                                                    {product.margin.toFixed(1)}%
                                                </span>
                                            </td>
                                            <td className="py-3 px-2">
                                                <span className="text-gray-900 dark:text-gray-300 text-sm">{formatNumber(product.stock)}</span>
                                            </td>
                                            <td className="py-3 px-2">
                                                <span className={`text-xs px-2 py-1 rounded-sm ${product.status === 'In Stock' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                                                    product.status === 'Low Stock' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' :
                                                        product.status === 'Out of Stock' ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' :
                                                            'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400'
                                                    }`}>
                                                    {product.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer Note */}
                <div className="text-center text-gray-600 dark:text-gray-400 text-sm pt-6 border-t border-gray-300 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-gray-600 dark:text-gray-400">
                            <span className="text-green-600 dark:text-green-400">💡 Tip:</span>
                            Use the refresh button to get the latest data
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-gray-600 dark:text-gray-400">Last updated: {new Date().toLocaleTimeString()}</span>
                            <span className="text-gray-400 dark:text-gray-600">•</span>
                            <span className="text-gray-600 dark:text-gray-400">Data updates every 5 minutes</span>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminAnalytics;