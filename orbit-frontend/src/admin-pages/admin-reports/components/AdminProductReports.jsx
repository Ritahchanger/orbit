import { useState, useMemo } from "react";
import {
  Package,
  Download,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Search,
  X,
} from "lucide-react";
import { useProductPerformanceReport } from "../../hooks/reports.hooks";
import { useStoreContext } from "../../../context/store/StoreContext";
import AdminProductsPerformanceError from "./errors/AdminProductsPerformance";
import SortingControls from "./products/SortingControls";
import { useDebounce } from "../../../globals/hooks/useDebounce";
import AdminCopySKU from "../../products/components/AdminCopySKU";

import aiApi from "../../services/ai-api";

import { useDispatch } from "react-redux";

import { ProductsAiButton } from "./AIFeedbackButton";

import {
  openAiResults,
  setAiResults,
  setAiResultsError,
} from "../../ai-results/ai-slice";


import ProductVisualization from "./products/ProductVisualization";

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

const AdminProductReports = ({ handleExport }) => {
  const [sortConfig, setSortConfig] = useState({
    key: "totalRevenue",
    direction: "desc",
  });

  const dispatch = useDispatch();

  const [expandedProduct, setExpandedProduct] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'cards'
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Debounce search for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Get current store from context
  const { currentStore } = useStoreContext();

  // Determine storeId for API call
  const storeId = useMemo(() => {
    if (!currentStore || currentStore === "global") {
      return undefined; // All stores
    }
    return currentStore._id; // Specific store
  }, [currentStore]);

  // Fetch product performance data
  const {
    data: productData,
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useProductPerformanceReport({
    sortBy: sortConfig.key,
    sortOrder: sortConfig.direction,
    limit: 50,
  });

  const handleAiProductAnalysis = async (products, metrics) => {
    try {
      // Prepare the data for AI analysis
      const analysisData = {
        products: products.map((p) => ({
          id: p.productId,
          name: p.productName,
          sku: p.sku,
          category: p.category || "Uncategorized",
          brand: p.brand || "No Brand",
          revenue: p.totalRevenue || 0,
          profit: p.totalProfit || 0,
          profitMargin: p.profitMargin || 0,
          unitsSold: p.totalSold || 0,
          currentStock: p.currentStock || 0,
          turnover: p.stockTurnover || 0,
          avgPrice: p.averagePrice || 0,
          storesWithStock: p.storesWithStock || 0,
          storesOutOfStock: p.storesOutOfStock || 0,
          transactionCount: p.transactionCount || 0,
          performance: getPerformanceIndicator(p),
        })),
        summary: {
          totalRevenue: metrics?.totalRevenue || 0,
          totalProfit: metrics?.totalProfit || 0,
          totalUnitsSold: metrics?.totalSold || 0,
          totalTransactions: metrics?.totalTransactions || 0,
          avgProfitMargin: metrics?.avgProfitMargin || 0,
          currentStock: metrics?.currentStock || 0,
          productCount: products.length,
          topProduct: metrics?.topProduct
            ? {
                name: metrics.topProduct.productName,
                revenue: metrics.topProduct.totalRevenue,
              }
            : null,
        },
        context: {
          store: currentStore?.name || "All Stores",
          storeId: storeId || "global",
          filters: {
            category: categoryFilter !== "all" ? categoryFilter : null,
            searchQuery: searchQuery || null,
            sortBy: sortConfig.key,
            sortOrder: sortConfig.direction,
          },
          viewMode,
          timestamp: new Date().toISOString(),
        },
      };

      // Call your AI API
      const response = await aiApi.analyzeProducts(analysisData);

      // Handle the response
      if (response.success) {
        // Open AI results modal/sidebar
        dispatch(
          openAiResults({
            context: "products",
            data: response.data,
          }),
        );

        // Set the AI results in Redux
        dispatch(
          setAiResults({
            context: "products",
            data: response.data,
            summary: response.data.executiveSummary || response.data.summary,
            insights: response.data.insights || [],
            recommendations: response.data.recommendations || [],
            metrics: response.data.keyMetrics || [],
          }),
        );

        // Show success toast
        toast?.success("AI analysis complete! Check the insights panel.");
      } else {
        throw new Error(response.error || "Failed to analyze products");
      }

      return response;
    } catch (error) {
      console.error("AI Product Analysis Failed:", error);

      // Set error in Redux
      dispatch(
        setAiResultsError({
          context: "products",
          error: error.message || "Failed to analyze products",
        }),
      );

      // Show error toast
      toast?.error("Failed to get AI insights. Please try again.");

      throw error;
    } finally {
      dispatch(setAiResultsLoading(false));
    }
  };

  // Extract product performance data
  const products = productData?.data || [];
  const filters = productData?.filters || {};
  const count = productData?.count || 0;

  // Get unique categories for filter
  const uniqueCategories = useMemo(() => {
    const categories = products
      .map((product) => product.category)
      .filter(
        (category, index, self) => category && self.indexOf(category) === index,
      )
      .sort();
    return ["all", ...categories];
  }, [products]);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Apply search filter
      const matchesSearch =
        debouncedSearchQuery === "" ||
        product.productName
          ?.toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase()) ||
        product.sku
          ?.toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase()) ||
        product.brand
          ?.toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase());

      // Apply category filter
      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, debouncedSearchQuery, categoryFilter]);

  // Calculate summary metrics based on filtered products
  const summaryMetrics = useMemo(() => {
    if (!filteredProducts.length) return null;

    const totalRevenue = filteredProducts.reduce(
      (sum, product) => sum + (product.totalRevenue || 0),
      0,
    );
    const totalProfit = filteredProducts.reduce(
      (sum, product) => sum + (product.totalProfit || 0),
      0,
    );
    const totalSold = filteredProducts.reduce(
      (sum, product) => sum + (product.totalSold || 0),
      0,
    );
    const totalTransactions = filteredProducts.reduce(
      (sum, product) => sum + (product.transactionCount || 0),
      0,
    );
    const avgProfitMargin =
      filteredProducts.reduce(
        (sum, product) => sum + (product.profitMargin || 0),
        0,
      ) / filteredProducts.length;
    const currentStock = filteredProducts.reduce(
      (sum, product) => sum + (product.currentStock || 0),
      0,
    );

    // Find top performing product
    const topProduct = filteredProducts.reduce(
      (max, product) =>
        product.totalRevenue > (max?.totalRevenue || 0) ? product : max,
      null,
    );

    return {
      totalRevenue,
      totalProfit,
      totalSold,
      totalTransactions,
      avgProfitMargin,
      currentStock,
      topProduct,
    };
  }, [filteredProducts]);

  // Handle sort
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  // Toggle product details
  const toggleProductDetails = (productId) => {
    setExpandedProduct((prev) => (prev === productId ? null : productId));
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
  };

  // Clear category filter
  const clearCategoryFilter = () => {
    setCategoryFilter("all");
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
  };

  // Get performance indicator
  const getPerformanceIndicator = (product) => {
    const profitMargin = product.profitMargin || 0;
    const stockTurnover = product.stockTurnover || 0;

    if (profitMargin >= 90 && stockTurnover > 0.5) return "excellent";
    if (profitMargin >= 70 && stockTurnover > 0.3) return "good";
    if (profitMargin >= 50 || stockTurnover > 0.1) return "average";
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
        return "Top Performer";
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

  // Get stock status
  const getStockStatus = (product) => {
    if (product.currentStock === 0)
      return {
        label: "Out of Stock",
        color: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20",
      };
    if (product.currentStock <= 5)
      return {
        label: "Low Stock",
        color:
          "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20",
      };
    return {
      label: "In Stock",
      color:
        "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20",
    };
  };

  // Handle export click
  const handleExportClick = () => {
    handleExport("products");
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery !== "" || categoryFilter !== "all";

  if (productsLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-sm h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (productsError) {
    return <AdminProductsPerformanceError refetchProducts={refetchProducts} />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Product Performance Reports
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filteredProducts.length} of {products.length} products • Sorted by{" "}
            {sortConfig.key} {sortConfig.direction === "desc" ? "↓" : "↑"}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-sm overflow-hidden">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 text-xs ${
                viewMode === "table"
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`px-3 py-1.5 text-xs ${
                viewMode === "cards"
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              Cards
            </button>
          </div>
          <button
            onClick={handleExportClick}
            className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-sm text-xs font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export Report
          </button>
          <ProductsAiButton
            onClick={() =>
              handleAiProductAnalysis(filteredProducts, summaryMetrics)
            }
            size="md"
          />
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name, SKU, or brand..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-2 pl-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none"
            >
              {uniqueCategories.map((category) => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <div className="h-2 w-2 rounded-sm bg-gray-400"></div>
            </div>
          </div>

          {/* Filter Stats and Clear Button */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {hasActiveFilters ? (
                <span>
                  Showing {filteredProducts.length} of {products.length}{" "}
                  products
                </span>
              ) : (
                <span>All {products.length} products</span>
              )}
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-sm text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Active filters:
              </span>

              {searchQuery && (
                <span className="inline-flex items-center px-2 py-1 rounded-sm text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                  Search: "{searchQuery}"
                  <button
                    onClick={clearSearch}
                    className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {categoryFilter !== "all" && (
                <span className="inline-flex items-center px-2 py-1 rounded-sm text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">
                  Category: {categoryFilter}
                  <button
                    onClick={clearCategoryFilter}
                    className="ml-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Summary Metrics */}
      {summaryMetrics && filteredProducts.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Total Revenue
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(summaryMetrics.totalRevenue)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {summaryMetrics.totalTransactions} transactions
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Total Profit
            </p>
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(summaryMetrics.totalProfit)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {summaryMetrics.avgProfitMargin.toFixed(1)}% avg margin
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Units Sold
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatNumber(summaryMetrics.totalSold)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {summaryMetrics.totalSold} units
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Current Stock
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatNumber(summaryMetrics.currentStock)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {filteredProducts.length} products
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Avg Price
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(
                summaryMetrics.totalRevenue /
                  Math.max(1, summaryMetrics.totalSold),
              )}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              per unit
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Top Product
            </p>
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
              {summaryMetrics.topProduct?.productName || "N/A"}
            </p>
            <p className="text-xs text-green-600 mt-1">
              {summaryMetrics.topProduct
                ? formatCurrency(summaryMetrics.topProduct.totalRevenue)
                : "N/A"}
            </p>
          </div>
        </div>
      )}

      {/* Sorting Controls */}
      <SortingControls
        sortConfig={sortConfig}
        products={filteredProducts}
        handleSort={handleSort}
        count={filteredProducts.length}
      />

      {/* Products Display - Table View */}
      {viewMode === "table" && filteredProducts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Units Sold
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Avg Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProducts.map((product) => {
                  const performance = getPerformanceIndicator(product);
                  const stockStatus = getStockStatus(product);
                  const isExpanded = expandedProduct === product.productId;

                  return (
                    <>
                      <tr
                        key={product.productId}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => toggleProductDetails(product.productId)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-2">
                              <Package className="h-4 w-4 text-gray-500" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {product.productName}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {product.brand || "No Brand"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <AdminCopySKU productSku={product.sku} />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            {product.category || "Uncategorized"}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">
                            {formatCurrency(product.totalRevenue)}
                          </div>
                          <div className="text-xs text-green-600">
                            Profit: {formatCurrency(product.totalProfit)}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium">
                            {product.totalSold}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {product.transactionCount} trans
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm">
                            {formatCurrency(product.averagePrice)}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded-sm ${stockStatus.color}`}
                          >
                            {product.currentStock} units
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded-sm ${getPerformanceColor(performance)}`}
                          >
                            {getPerformanceLabel(performance)}
                          </span>
                        </td>
                      </tr>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <tr className="bg-gray-50 dark:bg-gray-700">
                          <td colSpan="8" className="px-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              {/* Detailed Metrics */}
                              <div className="space-y-2">
                                <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                                  Performance Details
                                </h5>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">
                                      Profit Margin:
                                    </span>
                                    <span className="font-medium text-green-600">
                                      {product.profitMargin?.toFixed(1)}%
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">
                                      Avg Sale Qty:
                                    </span>
                                    <span className="font-medium">
                                      {product.avgSaleQuantity?.toFixed(1)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">
                                      Stock Turnover:
                                    </span>
                                    <span className="font-medium">
                                      {product.stockTurnover?.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Stock Information */}
                              <div className="space-y-2">
                                <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                                  Stock Information
                                </h5>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">
                                      Current Stock:
                                    </span>
                                    <span className="font-medium">
                                      {product.currentStock}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">
                                      Stores with Stock:
                                    </span>
                                    <span className="font-medium">
                                      {product.storesWithStock}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">
                                      Stores OOS:
                                    </span>
                                    <span className="font-medium text-red-600">
                                      {product.storesOutOfStock}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Business Insights */}
                              <div className="space-y-2">
                                <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                                  Business Insights
                                </h5>
                                <div className="space-y-1">
                                  {product.profitMargin >= 90 && (
                                    <div className="flex items-center text-sm text-green-600">
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Excellent profit margin
                                    </div>
                                  )}
                                  {product.stockTurnover > 0.5 && (
                                    <div className="flex items-center text-sm text-blue-600">
                                      <TrendingUp className="h-4 w-4 mr-1" />
                                      Good stock turnover
                                    </div>
                                  )}
                                  {product.currentStock === 0 && (
                                    <div className="flex items-center text-sm text-red-600">
                                      <AlertCircle className="h-4 w-4 mr-1" />
                                      Out of stock - consider restocking
                                    </div>
                                  )}
                                  {product.currentStock <= 5 &&
                                    product.currentStock > 0 && (
                                      <div className="flex items-center text-sm text-yellow-600">
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        Low stock level
                                      </div>
                                    )}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="space-y-2">
                                <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                                  Quick Actions
                                </h5>
                                <div className="space-y-1">
                                  <button className="w-full text-left px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30">
                                    View Product Details
                                  </button>
                                  <button className="w-full text-left px-3 py-1.5 text-sm bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded hover:bg-green-100 dark:hover:bg-green-900/30">
                                    Update Stock
                                  </button>
                                  <button className="w-full text-left px-3 py-1.5 text-sm bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded hover:bg-yellow-100 dark:hover:bg-yellow-900/30">
                                    View Sales History
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Products Display - Card View */}
      {viewMode === "cards" && filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const performance = getPerformanceIndicator(product);
            const stockStatus = getStockStatus(product);

            return (
              <div
                key={product.productId}
                className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center mb-1">
                      <div className="h-8 w-8 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-2">
                        <Package className="h-4 w-4 text-gray-500" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">
                          {product.productName}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {product.brand || "No Brand"} •{" "}
                          {product.category || "Uncategorized"}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs font-mono text-gray-500 dark:text-gray-400">
                      {product.sku}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-sm ${getPerformanceColor(performance)}`}
                  >
                    {getPerformanceLabel(performance)}
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Revenue & Profit */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Revenue
                      </p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {formatCurrency(product.totalRevenue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Profit
                      </p>
                      <p className="text-sm font-bold text-green-600">
                        {formatCurrency(product.totalProfit)}
                      </p>
                    </div>
                  </div>

                  {/* Sales & Price */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Units Sold
                      </p>
                      <p className="text-sm font-medium">{product.totalSold}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Avg Price
                      </p>
                      <p className="text-sm">
                        {formatCurrency(product.averagePrice)}
                      </p>
                    </div>
                  </div>

                  {/* Stock Information */}
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Stock Status
                    </p>
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-1 text-xs rounded-sm ${stockStatus.color}`}
                      >
                        {product.currentStock} units
                      </span>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {product.storesWithStock} stores
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Margin
                      </p>
                      <p className="text-sm font-medium text-green-600">
                        {product.profitMargin?.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Turnover
                      </p>
                      <p className="text-sm font-medium">
                        {product.stockTurnover?.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex space-x-2">
                      <button className="flex-1 px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30">
                        Details
                      </button>
                      <button className="flex-1 px-2 py-1 text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded hover:bg-green-100 dark:hover:bg-green-900/30">
                        Stock
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {summaryMetrics && (
        <ProductVisualization
          products={filteredProducts}
          summaryMetrics={summaryMetrics}
          onRefresh={refetchProducts}
        />
      )}
      {/* No Data State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-sm bg-gray-100 dark:bg-gray-700 mb-4">
            <Search className="h-6 w-6 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {products.length === 0
              ? "No Product Data Available"
              : "No Matching Products Found"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            {products.length === 0
              ? "There are no product performance records for the selected period. Products will appear here once they have sales data."
              : "No products match your search criteria. Try adjusting your filters or search term."}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminProductReports;
