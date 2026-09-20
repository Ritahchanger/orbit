import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "../../dashboard/layout/Layout";
import ChartWrapper from "../components/Charts/ChartWrapper";
import {
    useGlobalInventorySummary,
    useGlobalTopProducts,
    useGlobalCategoryPerformance,
    useGlobalLowStockAlerts,
    useGlobalStoresInventory,
    productAnalysisKeys,
} from "../../hooks/product-analysis-queries";
import {
    useDashboardStats,
    useSalesTrendReport,
    useStorePerformanceReport,
    usePaymentMethodAnalysis,
} from "../../hooks/reports.hooks";

import {
    TrendingUp,
    Activity,
    RefreshCw,
    Package,
    DollarSign,
    ShoppingCart,
    Calendar,
    BarChart,
    LineChart,
    PieChart as PieChartIcon,
    Store,
    Receipt,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";
import AdminCopySKU from "../../products/components/AdminCopySKU";
import LowStockAlerts from "../components/LowStockAlerts";
import TopProductsComponent from "../components/TopProductsComponent";
import SkeletonPreloader from "../preloaders/AdminProductAnalysis";

const fmt = (amount) =>
    new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount || 0);

const fmtNum = (num) => new Intl.NumberFormat("en-KE").format(num || 0);

const getDateRange = (range) => {
    const end = new Date();
    const start = new Date();
    switch (range) {
        case "7d": start.setDate(start.getDate() - 7); break;
        case "30d": start.setDate(start.getDate() - 30); break;
        case "90d": start.setDate(start.getDate() - 90); break;
        case "1y": start.setFullYear(start.getFullYear() - 1); break;
        default: start.setDate(start.getDate() - 30);
    }
    return {
        startDate: start.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
    };
};

const getTrendPeriod = (range) =>
    range === "7d" || range === "30d" ? "daily" : "monthly";

const CHART_PALETTE = [
    "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
    "#8b5cf6", "#06b6d4", "#f97316", "#84cc16",
];

const KpiCard = ({ label, value, sub, subPositive, icon: Icon, accent = "blue", loading }) => {
    const colors = {
        blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
        green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
        purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
        amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
        cyan: "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400",
    };
    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-4">
            <div className="flex items-center justify-between">
                <div className="min-w-0">
                    <p className="text-gray-500 dark:text-gray-400 text-sm truncate">{label}</p>
                    {loading ? (
                        <div className="h-7 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1" />
                    ) : (
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5 truncate">{value}</p>
                    )}
                    {sub && (
                        <p className={`text-xs mt-1 flex items-center gap-0.5 ${subPositive === undefined ? "text-gray-500 dark:text-gray-400" : subPositive ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
                            {subPositive === true && <ArrowUpRight size={12} />}
                            {subPositive === false && <ArrowDownRight size={12} />}
                            {sub}
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-sm shrink-0 ${colors[accent]}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
};

const SectionShell = ({ title, subtitle, children, action }) => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-4">
        <div className="flex items-center justify-between mb-4">
            <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
                {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
            </div>
            {action}
        </div>
        {children}
    </div>
);

const EmptyState = ({ message = "No data available for this period" }) => (
    <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500">
        <Activity size={32} className="mb-2 opacity-40" />
        <p className="text-sm">{message}</p>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Sales Overview Tab
// ─────────────────────────────────────────────────────────────────────────────
const SalesOverviewTab = ({ timeRange, chartType }) => {
    const dateFilters = useMemo(() => getDateRange(timeRange), [timeRange]);
    const trendPeriod = getTrendPeriod(timeRange);

    const { data: dashData, isLoading: dashLoading } = useDashboardStats("global");
    const { data: trendData, isLoading: trendLoading } = useSalesTrendReport(
        trendPeriod,
        { storeId: "global", ...dateFilters }
    );
    const { data: storeData, isLoading: storeLoading } = useStorePerformanceReport({
        storeId: "global",
        ...dateFilters,
    });
    const { data: pmData, isLoading: pmLoading } = usePaymentMethodAnalysis({
        storeId: "global",
        ...dateFilters,
    });

    // ── KPI values ──────────────────────────────────────────────────────────
    const today = dashData?.data?.salesSummary?.today || {};
    const month = dashData?.data?.salesSummary?.thisMonth || {};
    const year = dashData?.data?.salesSummary?.thisYear || {};
    const overview = dashData?.data?.overview || {};
    const recentSales = dashData?.data?.recentSales || [];

    // ── Sales trend chart ────────────────────────────────────────────────────
    const trendPoints = trendData?.data || [];
    const salesTrendConfig = useMemo(() => {
        if (!trendPoints.length) return null;
        return {
            type: chartType === "pie" ? "line" : chartType,
            data: {
                labels: trendPoints.map((d) => d._id),
                datasets: [
                    {
                        label: "Revenue (KES)",
                        data: trendPoints.map((d) => d.totalSales || 0),
                        backgroundColor: chartType === "bar" ? "rgba(59,130,246,0.6)" : "rgba(59,130,246,0.1)",
                        borderColor: "rgba(59,130,246,1)",
                        borderWidth: chartType === "bar" ? 1 : 2,
                        borderRadius: chartType === "bar" ? 4 : 0,
                        tension: 0.4,
                        fill: chartType === "line",
                        yAxisID: "y",
                    },
                    {
                        label: "Profit (KES)",
                        data: trendPoints.map((d) => d.totalProfit || 0),
                        backgroundColor: chartType === "bar" ? "rgba(16,185,129,0.6)" : "rgba(16,185,129,0.1)",
                        borderColor: "rgba(16,185,129,1)",
                        borderWidth: chartType === "bar" ? 1 : 2,
                        borderRadius: chartType === "bar" ? 4 : 0,
                        tension: 0.4,
                        fill: false,
                        yAxisID: "y",
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: "index", intersect: false },
                plugins: {
                    legend: { position: "top", labels: { color: "#9ca3af", font: { size: 11 } } },
                    tooltip: {
                        backgroundColor: "rgba(17,24,39,0.95)",
                        titleColor: "#fff",
                        bodyColor: "#d1d5db",
                        callbacks: {
                            label: (ctx) => `${ctx.dataset.label}: KES ${fmtNum(ctx.raw)}`,
                        },
                    },
                },
                scales: {
                    x: {
                        grid: { color: "rgba(55,65,81,0.2)" },
                        ticks: { color: "#9ca3af", maxRotation: 45, font: { size: 10 } },
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: "rgba(55,65,81,0.2)" },
                        ticks: {
                            color: "#9ca3af",
                            font: { size: 10 },
                            callback: (v) => `KES ${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`,
                        },
                    },
                },
            },
        };
    }, [trendPoints, chartType]);

    // ── Store performance chart ──────────────────────────────────────────────
    const stores = storeData?.data || [];
    const storeChartConfig = useMemo(() => {
        if (!stores.length) return null;
        const sorted = [...stores].sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0)).slice(0, 8);
        return {
            type: "bar",
            data: {
                labels: sorted.map((s) => s.storeName || `Store ${s.storeCode || ""}`),
                datasets: [
                    {
                        label: "Revenue (KES)",
                        data: sorted.map((s) => s.totalSales || 0),
                        backgroundColor: CHART_PALETTE.slice(0, sorted.length).map((c) => c + "cc"),
                        borderColor: CHART_PALETTE.slice(0, sorted.length),
                        borderWidth: 1,
                        borderRadius: 4,
                    },
                ],
            },
            options: {
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: "rgba(17,24,39,0.95)",
                        titleColor: "#fff",
                        bodyColor: "#d1d5db",
                        callbacks: {
                            label: (ctx) => `Revenue: KES ${fmtNum(ctx.raw)}`,
                        },
                    },
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: { color: "rgba(55,65,81,0.2)" },
                        ticks: {
                            color: "#9ca3af",
                            font: { size: 10 },
                            callback: (v) => `KES ${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`,
                        },
                    },
                    y: {
                        grid: { display: false },
                        ticks: { color: "#9ca3af", font: { size: 11 } },
                    },
                },
            },
        };
    }, [stores]);

    // ── Payment methods chart ────────────────────────────────────────────────
    const payments = pmData?.data || [];
    const pmChartConfig = useMemo(() => {
        if (!payments.length) return null;
        return {
            type: "doughnut",
            data: {
                labels: payments.map((p) => p.paymentMethod || "Unknown"),
                datasets: [
                    {
                        data: payments.map((p) => p.totalAmount || 0),
                        backgroundColor: CHART_PALETTE.slice(0, payments.length),
                        borderColor: "#1f2937",
                        borderWidth: 2,
                        hoverOffset: 12,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "65%",
                plugins: {
                    legend: {
                        position: "right",
                        labels: { color: "#9ca3af", padding: 12, font: { size: 11 } },
                    },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                const pct = payments[ctx.dataIndex]?.percentageOfTotal || 0;
                                return `${ctx.label}: KES ${fmtNum(ctx.raw)} (${pct}%)`;
                            },
                        },
                    },
                },
            },
        };
    }, [payments]);

    return (
        <div className="space-y-4">
            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <KpiCard
                    label="Today's Revenue"
                    value={fmt(today.revenue)}
                    sub={`${fmtNum(today.count)} transactions`}
                    icon={DollarSign}
                    accent="blue"
                    loading={dashLoading}
                />
                <KpiCard
                    label="Today's Profit"
                    value={fmt(today.profit)}
                    sub={today.revenue > 0 ? `${((today.profit / today.revenue) * 100).toFixed(1)}% margin` : "—"}
                    icon={TrendingUp}
                    accent="green"
                    loading={dashLoading}
                />
                <KpiCard
                    label="This Month Revenue"
                    value={fmt(month.revenue)}
                    sub={`${fmtNum(month.count)} transactions`}
                    icon={Receipt}
                    accent="purple"
                    loading={dashLoading}
                />
                <KpiCard
                    label="This Year Revenue"
                    value={fmt(year.revenue)}
                    sub={`${fmtNum(year.count)} transactions`}
                    icon={ShoppingCart}
                    accent="amber"
                    loading={dashLoading}
                />
            </div>

            {/* Secondary KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <KpiCard
                    label="Active Stores"
                    value={fmtNum(overview.totalStores)}
                    sub="Across this business"
                    icon={Store}
                    accent="cyan"
                    loading={dashLoading}
                />
                <KpiCard
                    label="Monthly Profit"
                    value={fmt(month.profit)}
                    sub={month.revenue > 0 ? `${((month.profit / month.revenue) * 100).toFixed(1)}% margin` : "—"}
                    icon={TrendingUp}
                    accent="green"
                    loading={dashLoading}
                />
                <KpiCard
                    label="Yearly Profit"
                    value={fmt(year.profit)}
                    sub={year.revenue > 0 ? `${((year.profit / year.revenue) * 100).toFixed(1)}% margin` : "—"}
                    icon={TrendingUp}
                    accent="blue"
                    loading={dashLoading}
                />
                <KpiCard
                    label="Total Products"
                    value={fmtNum(overview.totalProducts)}
                    sub="In product catalogue"
                    icon={Package}
                    accent="amber"
                    loading={dashLoading}
                />
            </div>

            {/* Sales Trend Chart */}
            <SectionShell
                title="Sales & Profit Trend"
                subtitle={`${trendPeriod === "daily" ? "Daily" : "Monthly"} breakdown for the selected period`}
                action={
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-sm">
                        {trendPoints.length} data points
                    </span>
                }
            >
                <div className="h-72">
                    {trendLoading ? (
                        <div className="h-full bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                    ) : salesTrendConfig ? (
                        <ChartWrapper key={`trend-${timeRange}-${chartType}`} {...salesTrendConfig} />
                    ) : (
                        <EmptyState />
                    )}
                </div>
            </SectionShell>

            {/* Store Performance + Payment Methods */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <SectionShell
                        title="Store Performance"
                        subtitle="Revenue comparison across all stores"
                        action={
                            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-sm">
                                {stores.length} stores
                            </span>
                        }
                    >
                        <div className="h-72">
                            {storeLoading ? (
                                <div className="h-full bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                            ) : storeChartConfig ? (
                                <ChartWrapper key={`stores-${timeRange}`} {...storeChartConfig} />
                            ) : (
                                <EmptyState message="No store sales data for this period" />
                            )}
                        </div>
                    </SectionShell>
                </div>

                <div className="lg:col-span-1">
                    <SectionShell
                        title="Payment Methods"
                        subtitle="Revenue by payment channel"
                    >
                        <div className="h-64">
                            {pmLoading ? (
                                <div className="h-full bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                            ) : pmChartConfig ? (
                                <ChartWrapper key={`pm-${timeRange}`} {...pmChartConfig} />
                            ) : (
                                <EmptyState />
                            )}
                        </div>
                        {/* Payment method breakdown list */}
                        {payments.length > 0 && (
                            <div className="mt-3 space-y-1.5">
                                {payments.slice(0, 4).map((p, i) => (
                                    <div key={p.paymentMethod} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                                style={{ background: CHART_PALETTE[i] }}
                                            />
                                            <span className="text-gray-700 dark:text-gray-300 capitalize">
                                                {p.paymentMethod || "Unknown"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500 dark:text-gray-400 text-xs">
                                                {p.percentageOfTotal}%
                                            </span>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {fmt(p.totalAmount)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </SectionShell>
                </div>
            </div>

            {/* Store Performance Table */}
            {stores.length > 0 && (
                <SectionShell
                    title="Store Performance Breakdown"
                    subtitle="Detailed per-store metrics"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    {["#", "Store", "Revenue", "Profit", "Margin", "Transactions", "Avg. Sale", "Customers"].map((h) => (
                                        <th key={h} className="text-left py-2.5 px-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {stores.map((s, i) => (
                                    <tr key={s.storeId} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="py-2.5 px-2 text-gray-400 dark:text-gray-500">{i + 1}</td>
                                        <td className="py-2.5 px-2">
                                            <div className="font-medium text-gray-900 dark:text-white">{s.storeName || "—"}</div>
                                            {s.storeCode && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{s.storeCode}</div>
                                            )}
                                        </td>
                                        <td className="py-2.5 px-2 text-green-600 dark:text-green-400 font-medium">{fmt(s.totalSales)}</td>
                                        <td className="py-2.5 px-2 text-blue-600 dark:text-blue-400">{fmt(s.totalProfit)}</td>
                                        <td className="py-2.5 px-2">
                                            <span className={`px-1.5 py-0.5 text-xs rounded-sm ${s.profitMargin >= 20 ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400" : s.profitMargin >= 10 ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"}`}>
                                                {(s.profitMargin || 0).toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-2 text-gray-700 dark:text-gray-300">{fmtNum(s.transactionCount)}</td>
                                        <td className="py-2.5 px-2 text-gray-700 dark:text-gray-300">{fmt(s.averageTransaction)}</td>
                                        <td className="py-2.5 px-2 text-gray-700 dark:text-gray-300">{fmtNum(s.uniqueCustomersCount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </SectionShell>
            )}

            {/* Recent Sales */}
            {recentSales.length > 0 && (
                <SectionShell
                    title="Recent Transactions"
                    subtitle="Latest sales across all stores"
                    action={
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {recentSales.length} entries
                        </span>
                    }
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    {["Product", "Qty", "Total", "Payment", "Customer", "Date"].map((h) => (
                                        <th key={h} className="text-left py-2.5 px-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {recentSales.map((sale, i) => (
                                    <tr key={sale._id || i} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="py-2.5 px-2 font-medium text-gray-900 dark:text-white max-w-[140px] truncate">
                                            {sale.productName || "—"}
                                        </td>
                                        <td className="py-2.5 px-2 text-gray-600 dark:text-gray-400">{sale.quantity}</td>
                                        <td className="py-2.5 px-2 text-green-600 dark:text-green-400 font-medium">{fmt(sale.total)}</td>
                                        <td className="py-2.5 px-2">
                                            <span className="px-2 py-0.5 text-xs rounded-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 capitalize">
                                                {sale.paymentMethod || "—"}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-2 text-gray-600 dark:text-gray-400 max-w-[100px] truncate">
                                            {sale.customerName || "—"}
                                        </td>
                                        <td className="py-2.5 px-2 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                                            {sale.saleDate ? new Date(sale.saleDate).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </SectionShell>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Inventory Tab (existing logic preserved)
// ─────────────────────────────────────────────────────────────────────────────
const InventoryTab = ({ timeRange, chartType, showFullChart, setShowFullChart }) => {
    const { data: inventorySummary, isLoading: inventoryLoading } = useGlobalInventorySummary();
    const { data: topProductsData, isLoading: topProductsLoading } = useGlobalTopProducts(10);
    const { data: categoryData, isLoading: categoryLoading } = useGlobalCategoryPerformance();
    const { data: lowStockData } = useGlobalLowStockAlerts();
    const { data: storeInventoryData, isLoading: storeInventoryLoading } = useGlobalStoresInventory();

    const inventoryStats = useMemo(() => {
        if (!inventorySummary?.data) return null;
        const d = inventorySummary.data;
        return {
            totalValue: d.totalValue || 0,
            totalRevenue: d.totalRevenue || 0,
            totalProducts: d.totalProducts || 0,
            totalStock: d.totalStock || 0,
            lowStockCount: d.lowStockCount || 0,
            outOfStockCount: d.outOfStockCount || 0,
            inventoryHealth: d.inventoryHealth || 0,
            avgProfitMargin: d.avgProfitMargin || 0,
        };
    }, [inventorySummary]);

    const topProductsChartData = useMemo(() => {
        if (!topProductsData?.success || !Array.isArray(topProductsData?.data)) return [];
        return topProductsData.data.slice(0, 8).map((p) => ({
            name: (p.name || "").substring(0, 20) + ((p.name || "").length > 20 ? "…" : ""),
            revenue: p.totalRevenue || 0,
            unitsSold: p.totalSold || 0,
            profit: p.profit || 0,
            margin: parseFloat(p.profitMargin) || 0,
            sku: p.sku || "",
            status: p.status || "N/A",
            stock: p.stock || 0,
        }));
    }, [topProductsData]);

    const categoryChartData = useMemo(() => {
        if (!categoryData?.data) return [];
        return categoryData.data.slice(0, 6).map((c) => ({
            name: c.category || "Uncategorized",
            revenue: c.totalRevenue || 0,
            count: c.count || 0,
            percentage: c.revenuePercentage || c.percentage || 0,
        }));
    }, [categoryData]);

    const lowStockAlerts = useMemo(() => (lowStockData?.products || []).slice(0, 5), [lowStockData]);

    const storeInventories = storeInventoryData?.data || [];

    // Per-store inventory bar chart
    const storeInventoryChartConfig = useMemo(() => {
        if (!storeInventories.length) return null;
        return {
            type: "bar",
            data: {
                labels: storeInventories.map((s) => s.storeName || `Store ${s.storeCode || ""}`),
                datasets: [
                    {
                        label: "Inventory Value (KES)",
                        data: storeInventories.map((s) => s.totalValue || 0),
                        backgroundColor: CHART_PALETTE.slice(0, storeInventories.length).map((c) => c + "bb"),
                        borderColor: CHART_PALETTE.slice(0, storeInventories.length),
                        borderWidth: 1,
                        borderRadius: 4,
                        yAxisID: "y",
                    },
                    {
                        label: "Stock Units",
                        data: storeInventories.map((s) => s.totalStock || 0),
                        backgroundColor: "rgba(139,92,246,0.5)",
                        borderColor: "rgba(139,92,246,1)",
                        borderWidth: 1,
                        borderRadius: 4,
                        yAxisID: "y1",
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: "index", intersect: false },
                plugins: {
                    legend: { position: "top", labels: { color: "#9ca3af", font: { size: 11 } } },
                    tooltip: {
                        backgroundColor: "rgba(17,24,39,0.95)",
                        titleColor: "#fff",
                        bodyColor: "#d1d5db",
                        callbacks: {
                            label: (ctx) =>
                                ctx.datasetIndex === 0
                                    ? `Value: KES ${fmtNum(ctx.raw)}`
                                    : `Units: ${fmtNum(ctx.raw)}`,
                        },
                    },
                },
                scales: {
                    x: { grid: { display: false }, ticks: { color: "#9ca3af", font: { size: 10 }, maxRotation: 35 } },
                    y: {
                        type: "linear", position: "left", beginAtZero: true,
                        grid: { color: "rgba(55,65,81,0.2)" },
                        ticks: { color: "#9ca3af", font: { size: 10 }, callback: (v) => `KES ${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}` },
                    },
                    y1: {
                        type: "linear", position: "right", beginAtZero: true,
                        grid: { display: false },
                        ticks: { color: "#9ca3af", font: { size: 10 }, callback: (v) => fmtNum(v) },
                    },
                },
            },
        };
    }, [storeInventories]);

    // Category stock donut chart
    const categoryStockChartConfig = useMemo(() => {
        if (!categoryData?.data?.length) return null;
        const cats = categoryData.data.slice(0, 7);
        return {
            type: "doughnut",
            data: {
                labels: cats.map((c) => c.category || "Uncategorized"),
                datasets: [{
                    data: cats.map((c) => c.totalStock || 0),
                    backgroundColor: CHART_PALETTE,
                    borderColor: "#1f2937",
                    borderWidth: 2,
                    hoverOffset: 12,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "60%",
                plugins: {
                    legend: { position: "right", labels: { color: "#9ca3af", padding: 10, font: { size: 10 } } },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                const pct = total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : 0;
                                return `${ctx.label}: ${fmtNum(ctx.raw)} units (${pct}%)`;
                            },
                        },
                    },
                },
            },
        };
    }, [categoryData]);

    const topProductsChartConfig = {
        type: chartType === "bar" ? "bar" : "line",
        data: {
            labels: topProductsChartData.map((p) => p.name),
            datasets: [
                {
                    label: "Revenue (KES)",
                    data: topProductsChartData.map((p) => p.revenue),
                    backgroundColor: chartType === "bar" ? "rgba(59,130,246,0.7)" : "rgba(59,130,246,0.1)",
                    borderColor: "rgba(59,130,246,1)",
                    borderWidth: chartType === "bar" ? 1 : 3,
                    borderRadius: chartType === "bar" ? 6 : 0,
                    tension: 0.4,
                },
                {
                    label: "Units Sold",
                    data: topProductsChartData.map((p) => p.unitsSold),
                    backgroundColor: chartType === "bar" ? "rgba(16,185,129,0.7)" : "rgba(16,185,129,0.1)",
                    borderColor: "rgba(16,185,129,1)",
                    borderWidth: chartType === "bar" ? 1 : 3,
                    borderRadius: chartType === "bar" ? 6 : 0,
                    tension: 0.4,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "top", labels: { color: "#9ca3af", font: { size: 12 } } },
                tooltip: { mode: "index", intersect: false },
            },
            scales: {
                y: { beginAtZero: true, grid: { color: "rgba(55,65,81,0.3)" }, ticks: { color: "#9ca3af", callback: (v) => `KES ${fmtNum(v)}` } },
                x: { grid: { color: "rgba(55,65,81,0.3)" }, ticks: { color: "#9ca3af", maxRotation: 45 } },
            },
        },
    };

    const categoryChartConfig = {
        type: "pie",
        data: {
            labels: categoryChartData.map((c) => c.name),
            datasets: [{
                data: categoryChartData.map((c) => c.revenue),
                backgroundColor: CHART_PALETTE,
                borderColor: "#1f2937",
                borderWidth: 2,
                hoverOffset: 15,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "right", labels: { color: "#9ca3af", padding: 15, font: { size: 11 } } },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            const pct = ((ctx.raw / total) * 100).toFixed(1);
                            return `${ctx.label}: KES ${fmtNum(ctx.raw)} (${pct}%)`;
                        },
                    },
                },
            },
        },
    };

    const inventoryHealthChartConfig = {
        type: "doughnut",
        data: {
            labels: ["In Stock", "Low Stock", "Out of Stock"],
            datasets: [{
                data: [
                    Math.max(0, (inventoryStats?.totalProducts || 0) - ((inventoryStats?.lowStockCount || 0) + (inventoryStats?.outOfStockCount || 0))),
                    inventoryStats?.lowStockCount || 0,
                    inventoryStats?.outOfStockCount || 0,
                ],
                backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
                borderColor: "#1f2937",
                borderWidth: 3,
                hoverOffset: 15,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "70%",
            plugins: {
                legend: { position: "right", labels: { color: "#9ca3af", padding: 15, font: { size: 11 } } },
            },
        },
    };

    if (inventoryLoading || topProductsLoading || categoryLoading) {
        return <SkeletonPreloader />;
    }

    return (
        <div className="space-y-4">
            {/* Inventory KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <KpiCard label="Total Inventory Value" value={fmt(inventoryStats?.totalValue)} sub="Active value" icon={Package} accent="blue" />
                <KpiCard label="Total Revenue" value={fmt(inventoryStats?.totalRevenue)} sub="From sales" icon={ShoppingCart} accent="purple" />
                <KpiCard label="Inventory Health" value={`${(inventoryStats?.inventoryHealth || 0).toFixed(1)}%`} sub="Overall score" icon={Activity} accent="green" />
                <KpiCard label="Avg. Profit Margin" value={`${(inventoryStats?.avgProfitMargin || 0).toFixed(1)}%`} sub="Margin rate" icon={TrendingUp} accent="cyan" />
            </div>

            {/* ── Global Inventory by Store ──────────────────────────────── */}
            <SectionShell
                title="Inventory by Store"
                subtitle="Stock value and unit count per store across the entire business"
                action={
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-sm">
                        {storeInventories.length} stores
                    </span>
                }
            >
                {storeInventoryLoading ? (
                    <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                ) : storeInventoryChartConfig ? (
                    <>
                        <div className="h-64">
                            <ChartWrapper key={`store-inv-${timeRange}`} {...storeInventoryChartConfig} />
                        </div>

                        {/* Per-store breakdown table */}
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700">
                                        {["#", "Store", "Products", "Total Stock", "Inv. Value", "Retail Value", "In Stock", "Low Stock", "Out of Stock", "Health"].map((h) => (
                                            <th key={h} className="text-left py-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {storeInventories.map((s, i) => (
                                        <tr key={String(s.storeId)} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="py-2.5 px-2 text-gray-400">{i + 1}</td>
                                            <td className="py-2.5 px-2">
                                                <div className="font-medium text-gray-900 dark:text-white">{s.storeName || "—"}</div>
                                                {s.storeCode && <div className="text-xs text-gray-400">{s.storeCode}</div>}
                                            </td>
                                            <td className="py-2.5 px-2 text-gray-700 dark:text-gray-300">{fmtNum(s.totalItems)}</td>
                                            <td className="py-2.5 px-2 text-gray-700 dark:text-gray-300">{fmtNum(s.totalStock)}</td>
                                            <td className="py-2.5 px-2 font-medium text-blue-600 dark:text-blue-400">{fmt(s.totalValue)}</td>
                                            <td className="py-2.5 px-2 text-gray-600 dark:text-gray-400">{fmt(s.totalRetailValue)}</td>
                                            <td className="py-2.5 px-2 text-green-600 dark:text-green-400">{fmtNum(s.inStockCount)}</td>
                                            <td className="py-2.5 px-2 text-yellow-600 dark:text-yellow-400">{fmtNum(s.lowStockCount)}</td>
                                            <td className="py-2.5 px-2 text-red-600 dark:text-red-400">{fmtNum(s.outOfStockCount)}</td>
                                            <td className="py-2.5 px-2">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${s.inventoryHealth >= 80 ? "bg-green-500" : s.inventoryHealth >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                                                            style={{ width: `${s.inventoryHealth || 0}%` }}
                                                        />
                                                    </div>
                                                    <span className={`text-xs font-medium ${s.inventoryHealth >= 80 ? "text-green-600 dark:text-green-400" : s.inventoryHealth >= 50 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"}`}>
                                                        {(s.inventoryHealth || 0).toFixed(0)}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <EmptyState message="No store inventory data found" />
                )}
            </SectionShell>

            {/* ── Category Stock Distribution ────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <SectionShell
                    title="Stock by Category"
                    subtitle="Units in stock per product category"
                >
                    <div className="h-64">
                        {categoryLoading ? (
                            <div className="h-full bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                        ) : categoryStockChartConfig ? (
                            <ChartWrapper key="cat-stock" {...categoryStockChartConfig} />
                        ) : (
                            <EmptyState />
                        )}
                    </div>
                </SectionShell>

                <SectionShell
                    title="Category Revenue & Volume"
                    subtitle="Revenue earned per category"
                >
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {(categoryData?.data || []).slice(0, 8).map((c, i) => {
                            const totalRev = (categoryData?.data || []).reduce((s, x) => s + (x.totalRevenue || 0), 0);
                            const pct = totalRev > 0 ? ((c.totalRevenue / totalRev) * 100).toFixed(1) : 0;
                            return (
                                <div key={c.category || i} className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CHART_PALETTE[i % CHART_PALETTE.length] }} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <span className="text-sm text-gray-800 dark:text-gray-200 capitalize truncate">{c.category || "Uncategorized"}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0 ml-2">{pct}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{ width: `${pct}%`, background: CHART_PALETTE[i % CHART_PALETTE.length] }}
                                            />
                                        </div>
                                        <div className="flex gap-3 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                            <span>{fmt(c.totalRevenue)} rev</span>
                                            <span>{fmtNum(c.totalStock)} units</span>
                                            <span>{fmtNum(c.productCount || c.count)} products</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {!(categoryData?.data?.length) && <EmptyState />}
                    </div>
                </SectionShell>
            </div>

            {/* Top Products + Category */}
            <TopProductsComponent
                showFullChart={showFullChart === "topProducts"}
                topProductsChartConfig={topProductsChartConfig}
                chartType={chartType}
                timeRange={timeRange}
                setShowFullChart={(m) => setShowFullChart(m ? "topProducts" : null)}
                categoryChartConfig={categoryChartConfig}
            />

            {/* Inventory health + Low stock */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                    <SectionShell title="Inventory Status" action={<span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-sm">Stock Levels</span>}>
                        <div className="h-64">
                            <ChartWrapper key={`inv-health-${timeRange}`} {...inventoryHealthChartConfig} />
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {Math.max(0, (inventoryStats?.totalProducts || 0) - ((inventoryStats?.lowStockCount || 0) + (inventoryStats?.outOfStockCount || 0)))}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">In Stock</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{inventoryStats?.lowStockCount || 0}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Low Stock</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{inventoryStats?.outOfStockCount || 0}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Out of Stock</div>
                            </div>
                        </div>
                    </SectionShell>
                </div>
                <div className="lg:col-span-2">
                    <LowStockAlerts
                        lowStockAlerts={lowStockAlerts}
                        lowStockData={lowStockData}
                        formatCurrency={fmt}
                        formatNumber={fmtNum}
                        showFullChart={showFullChart === "lowStock"}
                        setShowFullChart={(m) => setShowFullChart(m ? "lowStock" : null)}
                    />
                </div>
            </div>

            {/* Top products table */}
            {topProductsChartData.length > 0 && (
                <SectionShell
                    title="Top Performing Products"
                    action={
                        <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-1 rounded-sm">
                            {topProductsChartData.length} products
                        </span>
                    }
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    {["#", "Product", "SKU", "Revenue", "Sold", "Margin", "Stock", "Status"].map((h) => (
                                        <th key={h} className="text-left py-2.5 px-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {topProductsChartData.map((p, i) => (
                                    <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="py-2.5 px-2 text-gray-400 dark:text-gray-500">{i + 1}</td>
                                        <td className="py-2.5 px-2 font-medium text-gray-900 dark:text-white w-[120px]">{p.name}</td>
                                        <td className="py-2.5 px-2"><AdminCopySKU productSku={p.sku} /></td>
                                        <td className="py-2.5 px-2 text-green-600 dark:text-green-400 font-medium">{fmt(p.revenue)}</td>
                                        <td className="py-2.5 px-2 text-gray-700 dark:text-gray-300">{fmtNum(p.unitsSold)}</td>
                                        <td className="py-2.5 px-2">
                                            <span className={`text-xs px-1.5 py-0.5 rounded-sm ${p.margin > 30 ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400" : p.margin > 20 ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" : p.margin > 0 ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"}`}>
                                                {p.margin.toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-2 text-gray-700 dark:text-gray-300">{fmtNum(p.stock)}</td>
                                        <td className="py-2.5 px-2">
                                            <span className={`text-xs px-1.5 py-0.5 rounded-sm ${p.status === "In Stock" ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400" : p.status === "Low Stock" ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400" : p.status === "Out of Stock" ? "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400" : "bg-gray-100 dark:bg-gray-700 text-gray-500"}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </SectionShell>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
const AdminAnalytics = () => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("sales");
    const [timeRange, setTimeRange] = useState("30d");
    const [chartType, setChartType] = useState("bar");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showFullChart, setShowFullChart] = useState(null);

    const timeRangeOptions = [
        { value: "7d", label: "Last 7 days" },
        { value: "30d", label: "Last 30 days" },
        { value: "90d", label: "Last 90 days" },
        { value: "1y", label: "Last year" },
    ];

    const tabs = [
        { id: "sales", label: "Sales Overview", icon: TrendingUp },
        { id: "inventory", label: "Inventory", icon: Package },
    ];

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["reports"] }),
                queryClient.invalidateQueries({ queryKey: productAnalysisKeys.all }),
            ]);
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <AdminLayout>
            <div className="min-h-screen bg-white dark:bg-gray-800 p-4 sm:p-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-sm">
                            Global analytics across all stores of this business
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-green-600 dark:text-green-400">Live Data</span>
                    </div>
                </div>

                {/* Tabs + Controls Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 border-b border-gray-200 dark:border-gray-700 pb-3">
                    {/* Tab switcher */}
                    <div className="flex gap-1">
                        {tabs.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium transition-colors ${activeTab === id
                                    ? "bg-blue-600 dark:bg-blue-500 text-white"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                                    }`}
                            >
                                <Icon size={15} />
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Time range */}
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                className="appearance-none bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm pl-9 pr-7 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {timeRangeOptions.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Chart type */}
                        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-1 flex items-center gap-0.5">
                            {[{ type: "bar", Icon: BarChart }, { type: "line", Icon: LineChart }, { type: "pie", Icon: PieChartIcon }].map(({ type, Icon }) => (
                                <button
                                    key={type}
                                    onClick={() => setChartType(type)}
                                    title={`${type.charAt(0).toUpperCase() + type.slice(1)} chart`}
                                    className={`p-1.5 rounded transition-colors ${chartType === type ? "bg-blue-600 dark:bg-blue-500 text-white" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                                >
                                    <Icon size={15} />
                                </button>
                            ))}
                        </div>

                        {/* Refresh */}
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-sm transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                            {isRefreshing ? "Refreshing…" : "Refresh"}
                        </button>
                    </div>
                </div>

                {/* Tab content */}
                {activeTab === "sales" ? (
                    <SalesOverviewTab timeRange={timeRange} chartType={chartType} />
                ) : (
                    <InventoryTab
                        timeRange={timeRange}
                        chartType={chartType}
                        showFullChart={showFullChart}
                        setShowFullChart={setShowFullChart}
                    />
                )}

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span>
                        <span className="text-green-500">●</span> Data updates automatically — use Refresh for latest figures
                    </span>
                    <span>Last rendered: {new Date().toLocaleTimeString()}</span>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminAnalytics;
