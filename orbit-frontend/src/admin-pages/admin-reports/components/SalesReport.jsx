import { useState, useMemo } from "react";
import {
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  Filter,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Info,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  useSalesReport,
  useSalesTrendReport,
  useDailySalesSummary,
  useMonthlySalesSummary,
} from "../../hooks/reports.hooks";
import { format, subDays, subMonths } from "date-fns";
import SalesTrend from "./SalesTrend";
import { useStoreContext } from "../../../context/store/StoreContext";

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

// Helper to format numbers
const formatNumber = (num) => {
  return new Intl.NumberFormat("en-US").format(num || 0);
};

// Helper to format date
const formatDate = (date) => {
  return format(new Date(date), "MMM d, yyyy");
};

const SalesReport = () => {
  const [dateRange, setDateRange] = useState({
    startDate: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
  });
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  // Pagination state for recent sales
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0,
  });

  // Get current store from global context
  const { currentStore } = useStoreContext();

  // Determine storeId based on global selection
  const storeId = useMemo(() => {
    if (!currentStore || currentStore === "global") {
      return undefined; // All stores
    }
    return currentStore._id; // Specific store
  }, [currentStore]);

  // Fetch sales data with pagination
  const {
    data: salesData,
    isLoading: salesLoading,
    refetch: refetchSales,
  } = useSalesReport({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    storeId: storeId,
    page: pagination.page,
    limit: pagination.limit,
  });

  // Fetch sales trend (daily)
  const { data: trendData, isLoading: trendLoading } = useSalesTrendReport(
    "daily",
    {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      storeId: storeId,
    },
  );

  // Fetch today's summary
  const { data: todaySummary, isLoading: todayLoading } = useDailySalesSummary(
    format(new Date(), "yyyy-MM-dd"),
    storeId,
  );

  // Fetch monthly summary
  const currentDate = new Date();
  const { data: monthlySummary, isLoading: monthlyLoading } =
    useMonthlySalesSummary(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      storeId,
    );

  // Update pagination when data changes
  useMemo(() => {
    if (salesData?.data) {
      setPagination((prev) => ({
        ...prev,
        totalItems:
          salesData.data.totalSales || salesData.data.sales?.length || 0,
        totalPages: Math.ceil(
          (salesData.data.totalSales || salesData.data.sales?.length || 0) /
            prev.limit,
        ),
      }));
    }
  }, [salesData]);

  // Calculate metrics based on ACTUAL data structure from console logs
  const metrics = useMemo(() => {
    // Get sales transactions from the correct path
    const salesArray = salesData?.data?.sales || [];
    const trendItems = trendData?.data || [];

    // Calculate from individual sales transactions
    const totalSales = salesArray.reduce(
      (sum, sale) => sum + (sale.total || sale.subtotal || 0),
      0,
    );
    const totalProfit = salesArray.reduce(
      (sum, sale) => sum + (sale.profit || 0),
      0,
    );
    const totalItemsSold = salesArray.reduce(
      (sum, sale) => sum + (sale.quantity || 1),
      0,
    );
    const totalTransactions = salesArray.length; // Each sale object is a transaction

    // Calculate average transaction value
    const avgTransaction =
      totalTransactions > 0 ? totalSales / totalTransactions : 0;

    // Calculate growth from trend data
    let growthPercentage = 0;
    if (trendItems.length >= 2) {
      const currentPeriod = trendItems[trendItems.length - 1]?.totalSales || 0;
      const previousPeriod = trendItems[trendItems.length - 2]?.totalSales || 0;
      if (previousPeriod > 0) {
        growthPercentage =
          ((currentPeriod - previousPeriod) / previousPeriod) * 100;
      } else if (currentPeriod > 0) {
        growthPercentage = 100; // First sale
      }
    }

    return {
      totalSales,
      totalProfit,
      totalItemsSold,
      totalTransactions,
      avgTransaction,
      growthPercentage,
      salesCount: salesArray.length,
    };
  }, [salesData, trendData]);

  // Pagination handlers
  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page }));
      // Scroll to top of table
      const tableElement = document.querySelector("table");
      if (tableElement) {
        tableElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleLimitChange = (limit) => {
    setPagination((prev) => ({
      ...prev,
      limit: parseInt(limit),
      page: 1, // Reset to first page when changing limit
    }));
  };

  // Calculate pagination range
  const getPageRange = () => {
    const range = [];
    const maxPagesToShow = 5;
    let start = Math.max(1, pagination.page - Math.floor(maxPagesToShow / 2));
    let end = Math.min(pagination.totalPages, start + maxPagesToShow - 1);

    if (end - start < maxPagesToShow - 1) {
      start = Math.max(1, end - maxPagesToShow + 1);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    return range;
  };

  // Get trend items
  const trendItems = trendData?.data || [];

  // Get today's data - fix the data access
  const todayData = todaySummary?.data || {};
  const todaySummaryData = todayData.summary || {};

  // Get monthly data - fix the data access
  const monthlyData = monthlySummary?.data || {};
  const monthlySummaryData = monthlyData.summary || {};

  // KPI Cards - with corrected data access
  const kpiCards = [
    {
      title: "Total Sales",
      value: formatCurrency(metrics.totalSales),
      change: `${metrics.growthPercentage >= 0 ? "+" : ""}${metrics.growthPercentage.toFixed(1)}%`,
      icon: DollarSign,
      color: metrics.growthPercentage >= 0 ? "green" : "red",
      description: `vs previous period`,
    },
    {
      title: "Transactions",
      value: formatNumber(metrics.totalTransactions),
      change:
        trendItems.length > 0
          ? `${Math.round(metrics.totalTransactions / trendItems.length)}/day`
          : "0/day",
      icon: ShoppingCart,
      color: "blue",
      description: "Total count",
    },
    {
      title: "Items Sold",
      value: formatNumber(metrics.totalItemsSold),
      change:
        metrics.totalTransactions > 0
          ? `${Math.round(metrics.totalItemsSold / metrics.totalTransactions)}/transaction`
          : "0/transaction",
      icon: Package,
      color: "purple",
      description: "Average per transaction",
    },
    {
      title: "Avg Transaction",
      value: formatCurrency(metrics.avgTransaction),
      change: formatCurrency(todaySummaryData.averageTransaction || 0),
      icon: TrendingUp,
      color: "orange",
      description: "Today's average",
    },
  ];

  // Quick period filters
  const periodFilters = [
    { label: "Today", value: "today" },
    { label: "Last 7 Days", value: "week" },
    { label: "Last 30 Days", value: "month" },
    { label: "Last 90 Days", value: "quarter" },
    { label: "Custom", value: "custom" },
  ];

  // Handle period change
  const handlePeriodChange = (period) => {
    const today = new Date();
    let startDate = new Date();

    switch (period) {
      case "today":
        startDate = today;
        break;
      case "week":
        startDate = subDays(today, 7);
        break;
      case "month":
        startDate = subMonths(today, 1);
        break;
      case "quarter":
        startDate = subMonths(today, 3);
        break;
      case "custom":
        // Will show date pickers
        break;
    }

    if (period !== "custom") {
      setDateRange({
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(today, "yyyy-MM-dd"),
      });
      // Reset to first page when changing period
      setPagination((prev) => ({ ...prev, page: 1 }));
    }

    setSelectedPeriod(period);
  };

  // Handle export
  const handleExport = () => {
    // Export logic here
    console.log("Export sales report");
  };

  // Get current store display name
  const getCurrentStoreDisplay = () => {
    if (!currentStore || currentStore === "global") {
      return "All Stores";
    }
    return currentStore.name;
  };

  // Get sales array for table display
  const salesArray = salesData?.data?.sales || [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Sales Reports
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {getCurrentStoreDisplay()} • {dateRange.startDate} to{" "}
            {dateRange.endDate}
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-sm text-xs font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          <Download className="h-3.5 w-3.5 mr-1.5" />
          Export Report
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Period Filters */}
            <div className="flex items-center space-x-1">
              {periodFilters.map((period) => (
                <button
                  key={period.value}
                  onClick={() => handlePeriodChange(period.value)}
                  className={`px-2.5 py-1 text-xs rounded-sm ${
                    selectedPeriod === period.value
                      ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>

            {/* Store Display (Read-only) */}
            <div className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-sm bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              <span className="font-medium">{getCurrentStoreDisplay()}</span>
            </div>

            {/* Date Range Display */}
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {dateRange.startDate} to {dateRange.endDate}
            </div>
          </div>

          <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-sm text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
            <Filter className="h-3.5 w-3.5 mr-1.5" />
            Advanced Filters
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          const isPositive = !card.color.includes("red");

          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`p-2 rounded-sm ${
                    card.color === "green"
                      ? "bg-green-100 dark:bg-green-900/20"
                      : card.color === "blue"
                        ? "bg-blue-100 dark:bg-blue-900/20"
                        : card.color === "purple"
                          ? "bg-purple-100 dark:bg-purple-900/20"
                          : "bg-orange-100 dark:bg-orange-900/20"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      card.color === "green"
                        ? "text-green-600 dark:text-green-400"
                        : card.color === "blue"
                          ? "text-blue-600 dark:text-blue-400"
                          : card.color === "purple"
                            ? "text-purple-600 dark:text-purple-400"
                            : "text-orange-600 dark:text-orange-400"
                    }`}
                  />
                </div>
                <span
                  className={`text-xs font-medium ${
                    isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {card.change}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {card.value}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-0.5">
                {card.title}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* FIXED: Pass props to SalesTrend */}
      <SalesTrend
        dateRange={dateRange}
        storeId={storeId}
        metrics={{
          avgTransaction: metrics.avgTransaction,
        }}
      />

      {/* Monthly & Today Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today's Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900 dark:text-white">
              Today's Performance
            </h3>
            <Calendar className="h-4 w-4 text-gray-400" />
          </div>

          {todayLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
            </div>
          ) : todaySummaryData.totalSales !== undefined ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Total Sales
                </span>
                <span className="font-medium text-green-600">
                  {formatCurrency(todaySummaryData.totalSales || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Transactions
                </span>
                <span className="font-medium">
                  {todaySummaryData.totalTransactions || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Items Sold
                </span>
                <span className="font-medium">
                  {todaySummaryData.totalItemsSold || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Avg Transaction
                </span>
                <span className="font-medium">
                  {formatCurrency(todaySummaryData.averageTransaction || 0)}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No sales data for today
              </p>
            </div>
          )}
        </div>

        {/* Monthly Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900 dark:text-white">
              {monthlyData.monthName || "Current Month"} Summary
            </h3>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </div>

          {monthlyLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
            </div>
          ) : monthlySummaryData.totalSales !== undefined ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Monthly Sales
                </span>
                <span className="font-medium text-green-600">
                  {formatCurrency(monthlySummaryData.totalSales || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Total Transactions
                </span>
                <span className="font-medium">
                  {monthlySummaryData.totalTransactions || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Items Sold
                </span>
                <span className="font-medium">
                  {monthlySummaryData.totalItemsSold || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Avg Transaction
                </span>
                <span className="font-medium">
                  {formatCurrency(monthlySummaryData.averageTransaction || 0)}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Date Range: {monthlyData.dateRange?.start || ""} to{" "}
                  {monthlyData.dateRange?.end || ""}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No monthly data available
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Sales Table with Pagination */}
      <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                Recent Sales Data
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {salesLoading
                  ? "Loading..."
                  : `Showing ${salesArray.length} of ${pagination.totalItems} sales records`}
              </p>
            </div>

            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Show:
                </span>
                <select
                  value={pagination.limit}
                  onChange={(e) => handleLimitChange(e.target.value)}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-sm px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
              <button className="hidden px-4 py-2.5 rounded-sm bg-linear-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/25 md:flex items-center space-x-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                <Sparkles className="h-4 w-4" />
                <span className="font-semibold text-sm">{"AI Feedback"}</span>
              </button>
            </div>
          </div>
        </div>

        {salesLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
          </div>
        ) : salesArray.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Store
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Profit
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Quantity
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {salesArray.map((sale, index) => (
                    <tr
                      key={`${sale._id}-${index}`}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {formatDate(sale.saleDate || sale.createdAt)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {sale.productName || sale.productId?.name || "N/A"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {sale.storeId?.name || "N/A"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                        {formatCurrency(sale.total || sale.subtotal || 0)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {formatCurrency(sale.profit || 0)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {sale.quantity || 1}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-0">
                  Showing{" "}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {salesArray.length > 0
                      ? (pagination.page - 1) * pagination.limit + 1
                      : 0}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.totalItems,
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {pagination.totalItems}
                  </span>{" "}
                  results
                </div>

                <div className="flex items-center space-x-2">
                  {/* First Page */}
                  <button
                    onClick={() => goToPage(1)}
                    disabled={pagination.page === 1}
                    className={`p-2 rounded-sm ${
                      pagination.page === 1
                        ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </button>

                  {/* Previous Page */}
                  <button
                    onClick={() => goToPage(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className={`p-2 rounded-sm ${
                      pagination.page === 1
                        ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {getPageRange().map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`min-w-[32px] h-8 flex items-center justify-center rounded-sm text-sm ${
                          pagination.page === pageNum
                            ? "bg-primary-600 text-white"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  {/* Next Page */}
                  <button
                    onClick={() => goToPage(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className={`p-2 rounded-sm ${
                      pagination.page === pagination.totalPages
                        ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  {/* Last Page */}
                  <button
                    onClick={() => goToPage(pagination.totalPages)}
                    disabled={pagination.page === pagination.totalPages}
                    className={`p-2 rounded-sm ${
                      pagination.page === pagination.totalPages
                        ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              No sales data available for the selected period
            </p>
          </div>
        )}
      </div>

      {/* Insights & Recommendations */}
      {trendItems.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">
            Insights & Recommendations
          </h3>
          <div className="space-y-2">
            {(() => {
              const insights = [];

              if (trendItems.length > 0) {
                const todaySales =
                  trendItems[trendItems.length - 1]?.totalSales || 0;
                const avgDailySales =
                  trendItems.reduce(
                    (sum, day) => sum + (day.totalSales || 0),
                    0,
                  ) / trendItems.length;

                if (todaySales < avgDailySales * 0.5) {
                  insights.push({
                    type: "warning",
                    icon: AlertCircle,
                    message: `Today's sales are below average (${((todaySales / avgDailySales) * 100).toFixed(0)}% of average)`,
                  });
                }

                if (metrics.growthPercentage < -10) {
                  insights.push({
                    type: "warning",
                    icon: AlertCircle,
                    message: `Sales declined by ${Math.abs(metrics.growthPercentage).toFixed(1)}% compared to previous period`,
                  });
                }

                if (metrics.avgTransaction > avgDailySales * 0.5) {
                  insights.push({
                    type: "success",
                    icon: CheckCircle,
                    message:
                      "Good average transaction value - focus on high-value sales",
                  });
                }

                // Check for low sales days
                const lowSalesDays = trendItems.filter(
                  (day) => (day.totalSales || 0) < avgDailySales * 0.3,
                ).length;
                if (lowSalesDays > 2) {
                  insights.push({
                    type: "warning",
                    icon: AlertCircle,
                    message: `${lowSalesDays} days with significantly low sales - consider promotions`,
                  });
                }

                if (insights.length === 0) {
                  insights.push({
                    type: "info",
                    icon: Info,
                    message:
                      "Sales performance is stable. Consider targeted promotions to boost growth.",
                  });
                }
              }

              return insights.map((insight, index) => {
                const Icon = insight.icon || Info;
                return (
                  <div
                    key={index}
                    className={`flex items-start p-3 rounded-sm ${
                      insight.type === "warning"
                        ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                        : insight.type === "success"
                          ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                          : "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 mr-2 mt-0.5 ${
                        insight.type === "warning"
                          ? "text-yellow-600 dark:text-yellow-400"
                          : insight.type === "success"
                            ? "text-green-600 dark:text-green-400"
                            : "text-blue-600 dark:text-blue-400"
                      }`}
                    />
                    <p
                      className={`text-sm ${
                        insight.type === "warning"
                          ? "text-yellow-800 dark:text-yellow-300"
                          : insight.type === "success"
                            ? "text-green-800 dark:text-green-300"
                            : "text-blue-800 dark:text-blue-300"
                      }`}
                    >
                      {insight.message}
                    </p>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesReport;
