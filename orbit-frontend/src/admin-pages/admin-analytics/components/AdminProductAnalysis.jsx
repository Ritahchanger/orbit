import { useState, useMemo, useEffect } from "react";
import {
    useRefreshProductAnalysis,
} from "../../hooks/product-analysis.hook";



import {
    useRefreshStoreAnalysis,
    useSmartDashboardAnalytics,
    useSmartInventorySummary,
    useSmartLowStockAnalysis,
    useSmartCategoryDistribution,
    useSmartTopProducts,
    useSmartAlerts,
    useSmartProductRecommendations,
    useSmartDownloadCSVReport
} from "../../hooks/store-product-analysis-hooks";

import {
    Package,
    TrendingUp,
    Tag,
    Megaphone,
    X,
    AlertTriangle,
    DollarSign,
    ShoppingCart,
    Layers,
    BarChart3,
    PieChart as PieChartIcon,
    LineChart as LineChartIcon,
    Store,
    Globe,
} from "lucide-react";
import ProductAnalysisSkeleton from "../preloaders/AdminProductAnalysis";
import AdminProductAnalysisTimeRangeSelector from "./AdminProductAnalysisTimeRangeSelector";

const AdminProductAnalysis = ({ viewMode = 'store', currentStore = null }) => {
    const [timeRange, setTimeRange] = useState("month");
    const [chartView, setChartView] = useState("bar");
    const [activeView, setActiveView] = useState(viewMode);

    // Use smart hooks that auto-switch based on view mode
    const {
        data: dashboardData,
        isLoading: dashboardLoading,
        error: dashboardError
    } = useSmartDashboardAnalytics(timeRange, true, activeView === 'store' && currentStore);

    const {
        data: inventoryData,
        isLoading: inventoryLoading,
        error: inventoryError
    } = useSmartInventorySummary(activeView === 'store' && currentStore);

    const {
        data: lowStockData,
        isLoading: lowStockLoading,
        error: lowStockError
    } = useSmartLowStockAnalysis(activeView === 'store' && currentStore);

    const {
        data: categoryData,
        isLoading: categoryLoading,
        error: categoryError
    } = useSmartCategoryDistribution(activeView === 'store' && currentStore);

    const {
        data: topProductsData,
        isLoading: topProductsLoading,
        error: topProductsError
    } = useSmartTopProducts("revenue", 10, activeView === 'store' && currentStore);

    const {
        data: alertsData,
        isLoading: alertsLoading,
        error: alertsError
    } = useSmartAlerts(activeView === 'store' && currentStore);

    const {
        data: recommendationsData,
        isLoading: recommendationsLoading,
        error: recommendationsError
    } = useSmartProductRecommendations(activeView === 'store' && currentStore);

    // Mutations
    const { mutate: downloadCSV, isLoading: downloading } = useSmartDownloadCSVReport();
    const refreshData = useRefreshProductAnalysis();
    const refreshStoreData = useRefreshStoreAnalysis();

    // Handle errors
    const hasError = dashboardError || inventoryError || lowStockError || categoryError || topProductsError;
    const errorMessage = dashboardError?.message || inventoryError?.message || "An error occurred";

    // Loading states
    const isLoading = dashboardLoading || inventoryLoading || categoryLoading;

    // Handle view mode changes from parent
    useEffect(() => {
        setActiveView(viewMode);
    }, [viewMode]);

    // Memoize chart data for better performance
    const chartData = useMemo(() => {
        // Extract categories from data (handles both store and global formats)
        const categories = categoryData?.data?.categories || categoryData?.data || [];

        // Category distribution data for pie chart - FIXED LOGIC
        const categoryChartData = categories.map(cat => ({
            name: cat.category || cat.name || 'Unknown',
            value: cat.totalRevenue || cat.revenue || 0,
            count: cat.count || cat.productCount || 0,
            // Handle both percentage formats
            percentage: parseFloat(cat.revenuePercentage || cat.percentage ||
                (cat.totalRevenue && inventoryData?.data?.totalRevenue
                    ? (cat.totalRevenue / inventoryData.data.totalRevenue * 100).toFixed(1)
                    : 0)) || 0,
        })).filter(cat => cat.name !== 'Unknown' && cat.percentage > 0) || [];

        // Top products data for bar/line chart
        const topProducts = topProductsData?.data || [];
        const topProductsChartData = topProducts.slice(0, 8).map(product => ({
            name: product.name ? product.name.substring(0, 15) + (product.name.length > 15 ? "..." : "") : "Unknown",
            revenue: product.totalRevenue || product.revenue || 0,
            sales: product.totalSold || product.salesCount || 0,
            profit: product.profit || 0,
        })).filter(p => p.name !== 'Unknown') || [];

        // Inventory status data for doughnut chart - FIXED LOGIC
        const inventorySummary = inventoryData?.data || {};

        // Handle both store and global response structures
        const inStockCount = inventorySummary.inStockCount ||
            inventorySummary.inventoryStatus?.inStock ||
            inventorySummary.stockSummary?.inStock || 0;

        const lowStockCount = inventorySummary.lowStockCount ||
            inventorySummary.inventoryStatus?.lowStock ||
            inventorySummary.stockSummary?.lowStock || 0;

        const outOfStockCount = inventorySummary.outOfStockCount ||
            inventorySummary.inventoryStatus?.outOfStock ||
            inventorySummary.stockSummary?.outOfStock || 0;

        const inventoryStatusData = [
            {
                name: "In Stock",
                value: inStockCount,
                color: "#10b981"
            },
            {
                name: "Low Stock",
                value: lowStockCount,
                color: "#f59e0b"
            },
            {
                name: "Out of Stock",
                value: outOfStockCount,
                color: "#ef4444"
            },
        ];

        return {
            categoryChartData,
            topProductsChartData,
            inventoryStatusData,
            hasCategoryData: categoryChartData.length > 0,
            hasInventoryData: inStockCount > 0 || lowStockCount > 0 || outOfStockCount > 0
        };
    }, [categoryData, topProductsData, inventoryData]);

    // Chart.js configuration for Category Revenue Distribution
    const categoryChartConfig = useMemo(() => {
        const { categoryChartData } = chartData;

        return {
            type: 'pie',
            data: {
                labels: categoryChartData.map(item => item.name),
                datasets: [
                    {
                        data: categoryChartData.map(item => item.percentage),
                        backgroundColor: [
                            '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
                            '#8884d8', '#82ca9d', '#ff6b6b', '#4ecdc4'
                        ],
                        borderColor: '#1f2937',
                        borderWidth: 2,
                        hoverOffset: 15,
                    },
                ],
            },
            options: {
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#9ca3af',
                            padding: 20,
                            font: {
                                size: 11,
                            },
                        },
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value}% (${percentage}% of total)`;
                            },
                        },
                    },
                },
            },
        };
    }, [chartData.categoryChartData]);

    // Chart.js configuration for Top Products
    const topProductsChartConfig = useMemo(() => {
        const { topProductsChartData } = chartData;

        return chartView === 'bar' ? {
            type: 'bar',
            data: {
                labels: topProductsChartData.map(item => item.name),
                datasets: [
                    {
                        label: 'Revenue (Ksh)',
                        data: topProductsChartData.map(item => item.revenue),
                        backgroundColor: 'rgba(136, 132, 216, 0.8)',
                        borderColor: 'rgba(136, 132, 216, 1)',
                        borderWidth: 1,
                        borderRadius: 4,
                    },
                    {
                        label: 'Units Sold',
                        data: topProductsChartData.map(item => item.sales),
                        backgroundColor: 'rgba(130, 202, 157, 0.8)',
                        borderColor: 'rgba(130, 202, 157, 1)',
                        borderWidth: 1,
                        borderRadius: 4,
                    },
                ],
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(55, 65, 81, 0.3)',
                        },
                        ticks: {
                            color: '#9ca3af',
                            callback: (value) => `Ksh${value.toLocaleString()}`,
                        },
                    },
                    x: {
                        grid: {
                            color: 'rgba(55, 65, 81, 0.3)',
                        },
                        ticks: {
                            color: '#9ca3af',
                            maxRotation: 45,
                        },
                    },
                },
            },
        } : {
            type: 'line',
            data: {
                labels: topProductsChartData.map(item => item.name),
                datasets: [
                    {
                        label: 'Revenue (Ksh)',
                        data: topProductsChartData.map(item => item.revenue),
                        borderColor: 'rgba(136, 132, 216, 1)',
                        backgroundColor: 'rgba(136, 132, 216, 0.1)',
                        borderWidth: 3,
                        tension: 0.3,
                        fill: true,
                    },
                    {
                        label: 'Units Sold',
                        data: topProductsChartData.map(item => item.sales),
                        borderColor: 'rgba(130, 202, 157, 1)',
                        backgroundColor: 'rgba(130, 202, 157, 0.1)',
                        borderWidth: 3,
                        tension: 0.3,
                        fill: true,
                    },
                ],
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(55, 65, 81, 0.3)',
                        },
                        ticks: {
                            color: '#9ca3af',
                            callback: (value) => `Ksh${value.toLocaleString()}`,
                        },
                    },
                    x: {
                        grid: {
                            color: 'rgba(55, 65, 81, 0.3)',
                        },
                        ticks: {
                            color: '#9ca3af',
                            maxRotation: 45,
                        },
                    },
                },
            },
        };
    }, [chartData.topProductsChartData, chartView]);

    // Chart.js configuration for Inventory Status
    const inventoryStatusChartConfig = useMemo(() => {
        const { inventoryStatusData } = chartData;

        return {
            type: 'doughnut',
            data: {
                labels: inventoryStatusData.map(item => item.name),
                datasets: [
                    {
                        data: inventoryStatusData.map(item => item.value),
                        backgroundColor: inventoryStatusData.map(item => item.color),
                        borderColor: '#1f2937',
                        borderWidth: 3,
                        hoverOffset: 15,
                    },
                ],
            },
            options: {
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#9ca3af',
                            padding: 15,
                            font: {
                                size: 11,
                            },
                        },
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} items (${percentage}%)`;
                            },
                        },
                    },
                },
            },
        };
    }, [chartData.inventoryStatusData]);

    // Calculate metrics
    const metrics = inventoryData?.data ? {
        totalValue: new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES'
        }).format(inventoryData.data.totalValue || 0),

        avgProfitMargin: `${(inventoryData.data.avgProfitMargin || 0).toFixed(1)}%`,

        totalRevenue: new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES'
        }).format(inventoryData.data.totalRevenue || 0),

        totalItemsSold: (inventoryData.data.totalItemsSold || 0).toLocaleString(),
    } : {};

    // Handle CSV download
    const handleExportCSV = () => {
        downloadCSV("full", {
            onSuccess: () => {
                console.log("Export successful!");
            },
            onError: (error) => {
                console.error("Export failed:", error);
            },
        });
    };

    // Handle refresh
    const handleRefresh = () => {
        if (activeView === 'store' && currentStore) {
            refreshStoreData();
        } else {
            refreshData();
        }
    };

    if (isLoading) {
        return <ProductAnalysisSkeleton />;
    }

    if (hasError) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 rounded-sm p-8 text-center">
                <AlertTriangle className="w-12 h-12 mx-auto text-red-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Error Loading Analytics</h3>
                <p className="text-gray-400 mb-4">{errorMessage}</p>
                <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-sm transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6" id="product-analysis">
            {/* View Mode Header */}
            <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${activeView === 'store' ? 'bg-blue-500/20' : 'bg-purple-500/20'}`}>
                            {activeView === 'store' ? (
                                <Store className="h-5 w-5 text-blue-400" />
                            ) : (
                                <Globe className="h-5 w-5 text-purple-400" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">
                                {activeView === 'store' && currentStore
                                    ? `${currentStore.name} Product Analytics`
                                    : 'Global Product Analytics'
                                }
                            </h3>
                            <p className="text-gray-400 text-sm">
                                {activeView === 'store' && currentStore
                                    ? `Viewing analytics for ${currentStore.name} (${currentStore.code})`
                                    : 'Viewing combined analytics across all stores'
                                }
                            </p>
                        </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${activeView === 'store'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        }`}>
                        {activeView === 'store' ? 'Store View' : 'Global View'}
                    </div>
                </div>
            </div>

            {/* Header with Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-xl font-semibold text-white">Product Analytics Overview</h3>
                    <p className="text-gray-400 text-sm">
                        Real-time insights into product performance and inventory
                    </p>
                </div>
                <AdminProductAnalysisTimeRangeSelector
                    timeRange={timeRange}
                    setTimeRange={setTimeRange}
                    refreshData={handleRefresh}
                    handleExportCSV={handleExportCSV}
                    downloading={downloading}
                />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Inventory Value */}
                <div className="bg-dark-light border border-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Inventory Value</p>
                            <p className="text-2xl font-bold text-white mt-1">{metrics.totalValue || "Ksh 0"}</p>
                            <p className="text-green-400 text-xs mt-1 flex items-center">
                                <TrendingUp size={12} className="mr-1" />
                                Active Value
                            </p>
                        </div>
                        <div className="p-3 bg-blue-500/20 rounded-lg">
                            <DollarSign className="h-6 w-6 text-blue-500" />
                        </div>
                    </div>
                </div>

                {/* Average Profit Margin */}
                <div className="bg-dark-light border border-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Avg. Profit Margin</p>
                            <p className="text-2xl font-bold text-white mt-1">{metrics.avgProfitMargin || "0%"}</p>
                            <p className="text-green-400 text-xs mt-1 flex items-center">
                                <TrendingUp size={12} className="mr-1" />
                                Margin Rate
                            </p>
                        </div>
                        <div className="p-3 bg-green-500/20 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-green-500" />
                        </div>
                    </div>
                </div>

                {/* Total Revenue */}
                <div className="bg-dark-light border border-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Revenue</p>
                            <p className="text-2xl font-bold text-white mt-1">{metrics.totalRevenue || "Ksh 0"}</p>
                            <p className="text-blue-400 text-xs mt-1 flex items-center">
                                <BarChart3 size={12} className="mr-1" />
                                From Sales
                            </p>
                        </div>
                        <div className="p-3 bg-purple-500/20 rounded-lg">
                            <ShoppingCart className="h-6 w-6 text-purple-500" />
                        </div>
                    </div>
                </div>

                {/* Items Sold */}
                <div className="bg-dark-light border border-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Items Sold</p>
                            <p className="text-2xl font-bold text-white mt-1">{metrics.totalItemsSold || "0"}</p>
                            <p className="text-orange-400 text-xs mt-1 flex items-center">
                                <Package size={12} className="mr-1" />
                                All Time
                            </p>
                        </div>
                        <div className="p-3 bg-orange-500/20 rounded-lg">
                            <Layers className="h-6 w-6 text-orange-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Revenue Distribution */}
                <div className="bg-dark-light border border-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                            <PieChartIcon size={18} className="text-primary" />
                            Category Revenue Distribution
                        </h4>
                        <span className="text-xs text-gray-400 bg-gray-900/50 px-2 py-1 rounded">
                            By Revenue
                        </span>
                    </div>
                    <div className="h-72">
                        <ChartWrapper
                            {...categoryChartConfig}
                            className="w-full h-full"
                        />
                    </div>
                </div>

                {/* Top Products Performance */}
                <div className="bg-dark-light border border-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                            <BarChart3 size={18} className="text-green-500" />
                            Top Products by Revenue
                        </h4>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setChartView("bar")}
                                className={`px-3 py-1 text-xs rounded ${chartView === "bar" ? "bg-primary text-white" : "bg-gray-800 text-gray-300"}`}
                            >
                                Bar
                            </button>
                            <button
                                onClick={() => setChartView("line")}
                                className={`px-3 py-1 text-xs rounded ${chartView === "line" ? "bg-primary text-white" : "bg-gray-800 text-gray-300"}`}
                            >
                                Line
                            </button>
                        </div>
                    </div>
                    <div className="h-72">
                        <ChartWrapper
                            {...topProductsChartConfig}
                            className="w-full h-full"
                        />
                    </div>
                </div>
            </div>

            {/* Inventory Status Chart */}
            <div className="bg-dark-light border border-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                        <PieChartIcon size={18} className="text-orange-500" />
                        Inventory Status Overview
                    </h4>
                    <span className="text-xs text-gray-400 bg-gray-900/50 px-2 py-1 rounded">
                        Stock Levels
                    </span>
                </div>
                <div className="h-64">
                    <ChartWrapper
                        {...inventoryStatusChartConfig}
                        className="w-full h-full"
                    />
                </div>
            </div>

            {/* Tables Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Low Stock Alerts */}
                <div className="bg-dark-light border border-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                            <AlertTriangle size={18} className="text-red-500" />
                            Low Stock Alerts
                        </h4>
                        <span className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded">
                            {lowStockData?.data?.summary?.totalProducts || lowStockData?.data?.totalProducts || 0} Products
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-800">
                                    <th className="text-left py-3 px-2 text-gray-400 text-sm font-medium">Product</th>
                                    <th className="text-left py-3 px-2 text-gray-400 text-sm font-medium">Current Stock</th>
                                    <th className="text-left py-3 px-2 text-gray-400 text-sm font-medium">Min Stock</th>
                                    <th className="text-left py-3 px-2 text-gray-400 text-sm font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lowStockData?.data?.products?.slice(0, 5).map((product, index) => (
                                    <tr key={index} className="border-b border-gray-800/50 hover:bg-gray-900/30">
                                        <td className="py-3 px-2">
                                            <div>
                                                <p className="text-white text-sm font-medium">{product.name}</p>
                                                <p className="text-gray-500 text-xs">{product.sku}</p>
                                            </div>
                                        </td>
                                        <td className="py-3 px-2">
                                            <span className={`text-sm font-medium ${product.stock === 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="py-3 px-2">
                                            <span className="text-gray-300 text-sm">{product.minStock}</span>
                                        </td>
                                        <td className="py-3 px-2">
                                            <span className={`text-xs px-2 py-1 rounded-full ${product.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                {product.severity === 'critical' ? 'Critical' : 'Warning'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Products Table */}
                <div className="bg-dark-light border border-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                            <TrendingUp size={18} className="text-green-500" />
                            Top Performing Products
                        </h4>
                        <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded">
                            By Revenue
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-800">
                                    <th className="text-left py-3 px-2 text-gray-400 text-sm font-medium">Product</th>
                                    <th className="text-left py-3 px-2 text-gray-400 text-sm font-medium">Revenue</th>
                                    <th className="text-left py-3 px-2 text-gray-400 text-sm font-medium">Units Sold</th>
                                    <th className="text-left py-3 px-2 text-gray-400 text-sm font-medium">Margin</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topProductsData?.data?.slice(0, 5).map((product, index) => (
                                    <tr key={index} className="border-b border-gray-800/50 hover:bg-gray-900/30">
                                        <td className="py-3 px-2">
                                            <div>
                                                <p className="text-white text-sm font-medium">{product.name}</p>
                                                <p className="text-gray-500 text-xs">{product.sku}</p>
                                            </div>
                                        </td>
                                        <td className="py-3 px-2">
                                            <span className="text-green-400 text-sm font-medium">
                                                Ksh. {(product.totalRevenue || 0).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="py-3 px-2">
                                            <span className="text-gray-300 text-sm">{product.totalSold || 0}</span>
                                        </td>
                                        <td className="py-3 px-2">
                                            <span className={`text-xs px-2 py-1 rounded-full ${(parseFloat(product.profitMargin) || 0) > 20 ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                {(parseFloat(product.profitMargin) || 0).toFixed(1)}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Recommendations Section */}
            {recommendationsData?.data && (
                <div className="bg-dark-light border border-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Package size={18} className="text-blue-500" />
                            Product Recommendations
                        </h4>
                        <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                            Smart Suggestions
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Restock Recommendations */}
                        <div className="bg-gray-900/30 border border-gray-800 rounded-md p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 bg-blue-500/20 rounded">
                                    <Package size={14} className="text-blue-400" />
                                </div>
                                <h5 className="text-sm font-medium text-white">Restock Needed</h5>
                            </div>
                            <p className="text-gray-400 text-xs">
                                {recommendationsData.data.restock?.length || 0} products need immediate restocking
                            </p>
                        </div>

                        {/* Discount Candidates */}
                        <div className="bg-gray-900/30 border border-gray-800 rounded-md p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 bg-yellow-500/20 rounded">
                                    <Tag size={14} className="text-yellow-400" />
                                </div>
                                <h5 className="text-sm font-medium text-white">Discount Candidates</h5>
                            </div>
                            <p className="text-gray-400 text-xs">
                                {recommendationsData.data.discount?.length || 0} products could use discounts
                            </p>
                        </div>

                        {/* Promotional Opportunities */}
                        <div className="bg-gray-900/30 border border-gray-800 rounded-md p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 bg-green-500/20 rounded">
                                    <Megaphone size={14} className="text-green-400" />
                                </div>
                                <h5 className="text-sm font-medium text-white">Promote</h5>
                            </div>
                            <p className="text-gray-400 text-xs">
                                {recommendationsData.data.promote?.length || 0} products should be featured
                            </p>
                        </div>

                        {/* Phase Out Suggestions */}
                        <div className="bg-gray-900/30 border border-gray-800 rounded-md p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 bg-red-500/20 rounded">
                                    <X size={14} className="text-red-400" />
                                </div>
                                <h5 className="text-sm font-medium text-white">Consider Phasing Out</h5>
                            </div>
                            <p className="text-gray-400 text-xs">
                                {recommendationsData.data.phaseOut?.length || 0} slow-moving products
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Last Updated */}
            <div className="text-center text-gray-500 text-sm pt-4 border-t border-gray-800">
                <p>Data last updated: {new Date().toLocaleTimeString()}</p>
                <p className="text-xs mt-1">Click refresh to get the latest data</p>
            </div>
        </div>
    );
};

export default AdminProductAnalysis;