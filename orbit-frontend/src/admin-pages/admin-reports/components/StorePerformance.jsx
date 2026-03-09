import { useState, useMemo, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  Sparkles,
  Store,
  Download,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Brain,
  Lightbulb,
  Target,
  Zap,
} from "lucide-react";
import { useStorePerformanceReport } from "../../hooks/reports.hooks";
import { useStoreContext } from "../../../context/store/StoreContext";
import { useAnalyzeDashboard, useAIHealth } from "../../hooks/useAi.mutations";

import { useDispatch } from "react-redux";

import { openAiResults } from "../../ai-results/ai-slice";

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

const StorePerformance = () => {
  const dispatch = useDispatch();
  const [sortConfig, setSortConfig] = useState({
    key: "totalSales",
    direction: "desc",
  });
  const [expandedStore, setExpandedStore] = useState(null);
  const [aiAnalysisTriggered, setAiAnalysisTriggered] = useState(false);

  // Get current store from context
  const { currentStore } = useStoreContext();

  // AI Mutations
  const analyzeDashboard = useAnalyzeDashboard({
    onSuccess: (data) => {
      // Open AI results modal with the analysis
      dispatch(
        openAiResults({
          results: data.data,
          context: {
            title: "Store Performance Analysis",
            analyzing: "Analyzing store performance metrics...",
            type: "dashboard",
          },
          viewMode: "summary",
        }),
      );
      setAiAnalysisTriggered(false);
    },
    onError: (error) => {
      console.error("AI Analysis failed:", error);
      setAiAnalysisTriggered(false);
    },
    showToast: true,
  });

  // Check AI health
  const { data: aiHealth } = useAIHealth({
    refetchInterval: 60000, // Check every minute
  });

  // Determine storeId for API call
  const storeId = useMemo(() => {
    if (!currentStore || currentStore === "global") {
      return undefined; // All stores
    }
    return currentStore._id; // Specific store
  }, [currentStore]);

  // Fetch store performance data
  const {
    data: storeData,
    isLoading: storesLoading,
    error: storesError,
    refetch: refetchStores,
  } = useStorePerformanceReport({
    sortBy: sortConfig.key,
    sortOrder: sortConfig.direction,
    storeId: storeId,
  });

  // Extract store performance data
  const stores = storeData?.data || [];
  const filters = storeData?.filters || {};

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    if (!stores.length) return null;

    return {
      totalSales: stores.reduce(
        (sum, store) => sum + (store.totalSales || 0),
        0,
      ),
      totalProfit: stores.reduce(
        (sum, store) => sum + (store.totalProfit || 0),
        0,
      ),
      totalTransactions: stores.reduce(
        (sum, store) => sum + (store.transactionCount || 0),
        0,
      ),
      totalItemsSold: stores.reduce(
        (sum, store) => sum + (store.totalItemsSold || 0),
        0,
      ),
      averageProfitMargin:
        stores.reduce((sum, store) => sum + (store.profitMargin || 0), 0) /
        stores.length,
      totalCustomers: stores.reduce(
        (sum, store) => sum + (store.uniqueCustomersCount || 0),
        0,
      ),
      totalInventoryValue: stores.reduce(
        (sum, store) => sum + (store.inventoryValue || 0),
        0,
      ),
      averageTransactionValue:
        stores.reduce((sum, store) => sum + (store.totalSales || 0), 0) /
        Math.max(
          1,
          stores.reduce((sum, store) => sum + (store.transactionCount || 0), 0),
        ),
    };
  }, [stores]);

  // ============ AI ANALYSIS FUNCTION ============
  const handleAIAnalysis = () => {
    if (!stores.length) {
      toast.error("No store data available to analyze");
      return;
    }

    setAiAnalysisTriggered(true);

    // Prepare data for AI analysis
    const analysisData = {
      period: filters.dateRange || "Current period",
      summary: summaryMetrics,
      stores: stores.map((store) => ({
        id: store.storeId,
        name: store.storeName,
        code: store.storeCode,
        status: store.storeStatus,
        location: store.address?.city || "Unknown",
        performance: getPerformanceIndicator(store),
        metrics: {
          revenue: store.totalSales,
          profit: store.totalProfit,
          profitMargin: store.profitMargin,
          transactions: store.transactionCount,
          averageTransaction: store.averageTransaction,
          itemsSold: store.totalItemsSold,
          customers: store.uniqueCustomersCount,
          inventoryValue: store.inventoryValue,
          inventoryItems: store.inventoryItems,
        },
      })),
      topPerformers: getTopPerformers(),
      needsAttention: getNeedsAttention(),
      comparison: calculateComparisons(),
    };

    // Trigger AI analysis
    analyzeDashboard.mutate(analysisData);
  };

  // Helper functions for AI analysis
  const getTopPerformers = () => {
    if (!stores.length) return [];
    return stores
      .filter((s) => getPerformanceIndicator(s) === "excellent")
      .map((s) => ({
        name: s.storeName,
        revenue: s.totalSales,
        profit: s.totalProfit,
        margin: s.profitMargin,
      }))
      .slice(0, 3);
  };

  const getNeedsAttention = () => {
    if (!stores.length) return [];
    return stores
      .filter((s) => getPerformanceIndicator(s) === "poor")
      .map((s) => ({
        name: s.storeName,
        revenue: s.totalSales,
        profit: s.totalProfit,
        margin: s.profitMargin,
      }));
  };

  const calculateComparisons = () => {
    if (!stores.length) return null;
    const avgRevenue =
      stores.reduce((sum, s) => sum + (s.totalSales || 0), 0) / stores.length;
    const avgProfit =
      stores.reduce((sum, s) => sum + (s.totalProfit || 0), 0) / stores.length;
    const avgMargin =
      stores.reduce((sum, s) => sum + (s.profitMargin || 0), 0) / stores.length;

    return {
      averageRevenue: avgRevenue,
      averageProfit: avgProfit,
      averageMargin: avgMargin,
    };
  };

  // Handle sort
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  // Handle expand/collapse store details
  const toggleStoreDetails = (storeId) => {
    setExpandedStore((prev) => (prev === storeId ? null : storeId));
  };

  // Performance indicators based on data
  const getPerformanceIndicator = (store) => {
    const profitMargin = store.profitMargin || 0;
    const avgTransaction = store.averageTransaction || 0;

    if (profitMargin >= 95 && avgTransaction > 50000) return "excellent";
    if (profitMargin >= 80 && avgTransaction > 20000) return "good";
    if (profitMargin >= 60) return "average";
    return "poor";
  };

  // Get performance color
  const getPerformanceColor = (performance) => {
    switch (performance) {
      case "excellent":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800";
      case "good":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "average":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800";
      case "poor":
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800";
      default:
        return "bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-800";
    }
  };

  // Get performance label
  const getPerformanceLabel = (performance) => {
    switch (performance) {
      case "excellent":
        return "Excellent";
      case "good":
        return "Good";
      case "average":
        return "Average";
      case "poor":
        return "Needs Attention";
      default:
        return "Unknown";
    }
  };

  // Get store status badge
  const getStoreStatusBadge = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800";
      case "inactive":
        return "bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-800";
      case "maintenance":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800";
      case "closed":
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800";
      default:
        return "bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-800";
    }
  };

  // Handle export
  const handleExport = () => {
    console.log("Export store performance report");
  };

  // Get current store display
  const getCurrentStoreDisplay = () => {
    if (!currentStore || currentStore === "global") {
      return "All Stores";
    }
    return currentStore.name;
  };

  if (storesLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-sm h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (storesError) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-sm bg-red-100 dark:bg-red-900/20 mb-3">
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
          Error Loading Data
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Failed to load store performance data
        </p>
        <button
          onClick={() => refetchStores()}
          className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-sm text-xs font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Store Performance
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {getCurrentStoreDisplay()} • {stores.length} stores • Sorted by{" "}
            {filters.sortBy || "totalSales"} {filters.sortOrder || "desc"}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-sm text-xs font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export Report
          </button>
          <button
            onClick={handleAIAnalysis}
            disabled={
              !stores.length ||
              analyzeDashboard.isPending ||
              aiAnalysisTriggered
            }
            className={`px-4 py-2.5 rounded-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/25 flex items-center space-x-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative group`}
          >
            {analyzeDashboard.isPending || aiAnalysisTriggered ? (
              <>
                <div className="animate-spin rounded-sm h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span className="font-semibold text-sm">Analyzing...</span>
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 group-hover:animate-pulse" />
                <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-yellow-300" />
                <span className="font-semibold text-sm">AI Insights</span>
              </>
            )}
          </button>
          {aiHealth?.status === "healthy" && (
            <div className="hidden md:flex items-center space-x-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 rounded-sm">
              <div className="w-2 h-2 bg-green-500 rounded-sm animate-pulse"></div>
              <span className="text-xs text-green-700 dark:text-green-300">
                AI Ready
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {summaryMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Total Revenue
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(summaryMetrics.totalSales)}
                </p>
              </div>
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {summaryMetrics.totalTransactions} transactions
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Total Profit
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(summaryMetrics.totalProfit)}
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {summaryMetrics.averageProfitMargin.toFixed(1)}% avg margin
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Items Sold
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatNumber(summaryMetrics.totalItemsSold)}
                </p>
              </div>
              <Package className="h-5 w-5 text-purple-500" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {summaryMetrics.totalCustomers} unique customers
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Avg. Transaction
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(summaryMetrics.averageTransactionValue)}
                </p>
              </div>
              <ShoppingCart className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatCurrency(summaryMetrics.totalInventoryValue)} inventory
              value
            </p>
          </div>
        </div>
      )}

      {/* Store Performance Table */}
      <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-medium text-gray-900 dark:text-white">
            Store Performance Details
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Click on any store to view detailed metrics
          </p>
        </div>

        {stores.length === 0 ? (
          <div className="text-center py-8">
            <Store className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
              No Store Data Available
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {getCurrentStoreDisplay()} has no performance data for the
              selected period
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {stores.map((store) => {
              const performance = getPerformanceIndicator(store);
              const isExpanded = expandedStore === store.storeId;

              return (
                <div
                  key={store.storeId}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  {/* Store Summary Row */}
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => toggleStoreDetails(store.storeId)}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      {/* Store Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {store.storeName}
                              </h4>
                              <span
                                className={`px-2 py-0.5 text-xs rounded-sm ${getStoreStatusBadge(store.storeStatus)}`}
                              >
                                {store.storeStatus}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                              <span className="text-gray-500 dark:text-gray-400">
                                Code: {store.storeCode}
                              </span>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-500 dark:text-gray-400">
                                {store.address?.city || "N/A"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span
                              className={`px-2 py-1 text-xs rounded-sm ${getPerformanceColor(performance)}`}
                            >
                              {getPerformanceLabel(performance)}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-gray-400 ml-2" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-400 ml-2" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:w-2/3">
                        <div className="text-center">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Revenue
                          </p>
                          <p className="text-base font-bold text-gray-900 dark:text-white">
                            {formatCurrency(store.totalSales)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Profit
                          </p>
                          <p className="text-base font-bold text-green-600">
                            {formatCurrency(store.totalProfit)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Transactions
                          </p>
                          <p className="text-base font-bold text-gray-900 dark:text-white">
                            {store.transactionCount}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Avg. Trans
                          </p>
                          <p className="text-base font-bold text-gray-900 dark:text-white">
                            {formatCurrency(store.averageTransaction)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Detailed Metrics */}
                        <div className="space-y-3">
                          <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                            Sales Performance
                          </h5>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400">
                                Items Sold
                              </span>
                              <span className="font-medium">
                                {store.totalItemsSold}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400">
                                Profit Margin
                              </span>
                              <span className="font-medium text-green-600">
                                {store.profitMargin?.toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400">
                                Unique Customers
                              </span>
                              <span className="font-medium">
                                {store.uniqueCustomersCount}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Inventory Metrics */}
                        <div className="space-y-3">
                          <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                            Inventory
                          </h5>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400">
                                Inventory Value
                              </span>
                              <span className="font-medium">
                                {store.inventoryValue}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400">
                                Inventory Items
                              </span>
                              <span className="font-medium">
                                {store.inventoryItems}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400">
                                Avg Value per Item
                              </span>
                              <span className="font-medium">
                                {formatCurrency(
                                  (store.inventoryValue || 0) /
                                    Math.max(1, store.inventoryItems || 1),
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Store Details */}
                        <div className="space-y-3">
                          <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                            Store Details
                          </h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500 dark:text-gray-400">
                                Code
                              </span>
                              <span className="font-medium">
                                {store.storeCode}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500 dark:text-gray-400">
                                Status
                              </span>
                              <span className="font-medium capitalize">
                                {store.storeStatus}
                              </span>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-gray-400 mb-1">
                                Address
                              </p>
                              <p className="text-gray-900 dark:text-white">
                                {store.address?.building},{" "}
                                {store.address?.street}
                                {store.address?.floor && (
                                  <>
                                    <br />
                                    {store.address.floor}
                                  </>
                                )}
                                <br />
                                {store.address?.city}, {store.address?.county}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Performance Insights */}
                      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/30 rounded-sm">
                        <h5 className="font-medium text-gray-900 dark:text-white text-sm mb-2">
                          Performance Insights
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {performance === "excellent" && (
                            <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded">
                              Outstanding profit margin
                            </span>
                          )}
                          {store.averageTransaction > 100000 && (
                            <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded">
                              High-value transactions
                            </span>
                          )}
                          {store.uniqueCustomersCount > 10 && (
                            <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 rounded">
                              Strong customer base
                            </span>
                          )}
                          {store.profitMargin >= 100 && (
                            <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded">
                              Perfect profit margin
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sorting Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-3">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Sort By
        </h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSort("totalSales")}
            className={`px-3 py-1.5 text-xs rounded-sm ${
              sortConfig.key === "totalSales"
                ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Revenue{" "}
            {sortConfig.key === "totalSales" &&
              (sortConfig.direction === "asc" ? "↑" : "↓")}
          </button>
          <button
            onClick={() => handleSort("totalProfit")}
            className={`px-3 py-1.5 text-xs rounded-sm ${
              sortConfig.key === "totalProfit"
                ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Profit{" "}
            {sortConfig.key === "totalProfit" &&
              (sortConfig.direction === "asc" ? "↑" : "↓")}
          </button>
          <button
            onClick={() => handleSort("transactionCount")}
            className={`px-3 py-1.5 text-xs rounded-sm ${
              sortConfig.key === "transactionCount"
                ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Transactions{" "}
            {sortConfig.key === "transactionCount" &&
              (sortConfig.direction === "asc" ? "↑" : "↓")}
          </button>
          <button
            onClick={() => handleSort("averageTransaction")}
            className={`px-3 py-1.5 text-xs rounded-sm ${
              sortConfig.key === "averageTransaction"
                ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Avg. Transaction{" "}
            {sortConfig.key === "averageTransaction" &&
              (sortConfig.direction === "asc" ? "↑" : "↓")}
          </button>
          <button
            onClick={() => handleSort("profitMargin")}
            className={`px-3 py-1.5 text-xs rounded-sm ${
              sortConfig.key === "profitMargin"
                ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Profit Margin{" "}
            {sortConfig.key === "profitMargin" &&
              (sortConfig.direction === "asc" ? "↑" : "↓")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StorePerformance;
