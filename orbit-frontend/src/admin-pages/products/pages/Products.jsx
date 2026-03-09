import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../dashboard/layout/Layout";
import { Package, Globe } from "lucide-react";
import { paymentMethods, categories } from "../data";
import AdminAllProducts from "../components/AdminAllProducts";
import AdminProductsFooterActions from "../components/AdminProductsFooterActions";
import AdminProductsDeleteConfirmationModal from "../components/AdminProductsDeleteConfirmationModal";
import AdminProductsSearchFilters from "../components/AdminProductsSearchFilters";
import AdminProductsHeader from "../components/AdminProductsHeader";

// ✅ Import the skeleton loaders
import {
  ProductSkeletonLoader,
  StatsSkeletonLoader,
} from "../preloaders/ProductsPreloader";

// Import TanStack Query hooks - ONLY GLOBAL PRODUCTS
import {
  useProducts,
  useLowStockProducts,
  useProductStats,
  useSearchProducts,
  useDeleteProduct,
  useUpdateStock,
  useCreateProduct,
  productKeys,
} from "../../hooks/product.hooks";

import { useQueryClient } from "@tanstack/react-query";

import { toast } from "react-hot-toast";

import { useDebounce } from "../../../globals/hooks/useDebounce";

const AdminProducts = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // Daily Sales Data (still mock for now)
  const [dailySales, setDailySales] = useState([]);

  // ========== GLOBAL PRODUCT HOOKS ONLY ==========
  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
    error: productsErrorMessage,
    refetch: refetchProducts,
  } = useProducts(
    {
      category: selectedCategory !== "all" ? selectedCategory : undefined,
      search: searchQuery.trim() ? searchQuery : undefined,
    },
    page,
    limit,
    activeTab === "all" ||
      activeTab === "featured" ||
      activeTab === "top-selling",
  );

  const {
    data: lowStockData,
    isLoading: lowStockLoading,
    isError: lowStockError,
  } = useLowStockProducts(activeTab === "low-stock");

  const {
    data: statsData,
    isLoading: statsLoading,
    isError: statsError,
  } = useProductStats(activeTab === "stats");

  const {
    data: searchData,
    isLoading: searchLoading,
    isError: searchError,
    refetch: refetchSearch,
  } = useSearchProducts(
    debouncedSearchQuery,
    page,
    limit,
    !!debouncedSearchQuery.trim() && activeTab === "all",
  );

  const tabs = [
    {
      id: "all",
      name: "All Products",
      count: productsData?.products?.length || 0,
      description: "All global products",
    },
    {
      id: "featured",
      name: "Featured",
      count: productsData?.products?.filter((p) => p.isFeatured).length || 0,
      description: "Featured globally",
    },
    {
      id: "stats",
      name: "Statistics",
      count: "",
      description: "Product statistics",
    },
  ];

  // ========== MUTATIONS ==========
  const deleteProductMutation = useDeleteProduct();
  const updateStockMutation = useUpdateStock();
  const createProductMutation = useCreateProduct();

  // Get products based on active tab
  const getProductsForTab = () => {
    const baseProducts = productsData?.products || [];

    switch (activeTab) {
      case "all":
        // Use search results if we have a search query
        if (searchQuery.trim() && searchData) {
          return searchData.products || [];
        }
        return baseProducts;
      case "featured":
        return baseProducts.filter((p) => p.isFeatured);
      case "low-stock":
        return lowStockData || [];
      case "top-selling":
        return baseProducts
          .filter((p) => p.totalSold > 0)
          .sort((a, b) => b.totalSold - a.totalSold);
      case "stats":
        return baseProducts; // For stats tab, we still need products for display
      default:
        return [];
    }
  };

  const products = getProductsForTab();

  // Get pagination with proper defaults
  const pagination = (() => {
    if (searchQuery.trim() && searchData) {
      return {
        page: searchData.pagination?.page || 1,
        limit: searchData.pagination?.limit || limit,
        total: searchData.pagination?.total || 0,
        pages: searchData.pagination?.pages || 1,
        hasNext: searchData.pagination?.page < searchData.pagination?.pages,
        hasPrev: searchData.pagination?.page > 1,
      };
    }

    return {
      page: productsData?.pagination?.page || 1,
      limit: productsData?.pagination?.limit || limit,
      total: productsData?.pagination?.total || 0,
      pages: productsData?.pagination?.pages || 1,
      hasNext: productsData?.pagination?.page < productsData?.pagination?.pages,
      hasPrev: productsData?.pagination?.page > 1,
    };
  })();

  // Load data when tab changes
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: productKeys.list() });
  }, [activeTab, page, queryClient]);

  // Handle search with debounce
  useEffect(() => {
    if (searchQuery.trim()) {
      const debounceTimer = setTimeout(() => {
        refetchSearch();
      }, 300);

      return () => clearTimeout(debounceTimer);
    }
  }, [searchQuery, refetchSearch]);

  // Get category icon
  const getCategoryIcon = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.icon : Package;
  };

  useEffect(() => {
    const scrollToElement = () => {
      const element = document.getElementById("all-products");
      if (element) {
        const elementRect = element.getBoundingClientRect();
        const offsetPosition = elementRect.top + window.pageYOffset - 200;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
        return true;
      }
      return false;
    };

    if (!scrollToElement()) {
      const interval = setInterval(() => {
        if (scrollToElement()) {
          clearInterval(interval);
        }
      }, 100);
      setTimeout(() => clearInterval(interval), 2000);
    }
  }, []);

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "In Stock":
        return "bg-green-500/10 text-green-400 border border-green-500/20";
      case "Low Stock":
        return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
      case "Out of Stock":
        return "bg-red-500/10 text-red-400 border border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border border-gray-500/20";
    }
  };

  // Handle delete product
  const handleDeleteProduct = async (productId) => {
    try {
      await deleteProductMutation.mutateAsync(productId);
      setShowDeleteModal(false);
      setSelectedProduct(null);
    } catch (error) {
      toast.error(error.message || "Failed to delete product");
    }
  };

  const handlePageChange = (newPage, newLimit) => {
    console.log("Page change:", { newPage, newLimit, currentLimit: limit });

    // If limit changed, update it and reset to page 1
    if (newLimit && newLimit !== limit) {
      setLimit(newLimit);

      setPage(1); // Reset to first page when changing limit

      // Scroll to top
      window.scrollTo(0, 0);
    } else {
      // Just page change
      setPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  useEffect(() => {
    if (
      activeTab === "all" ||
      activeTab === "featured" ||
      activeTab === "top-selling"
    ) {
      refetchProducts();
    }
  }, [limit, page, selectedCategory, searchQuery, activeTab, refetchProducts]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, searchQuery]);

  // Filter products based on category
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesCategory;
  });

  // Statistics from backend API
  const stats = {
    totalDevices:
      statsData?.totalProducts || productsData?.products?.length || 0,
    totalValue: statsData?.totalValue || 0,
    todaySales: statsData?.totalSold || 0,
    todayRevenue: statsData?.totalRevenue || 0,
    lowStockCount: statsData?.lowStockCount || lowStockData?.length || 0,
    topSelling:
      statsData?.categoryStats?.length > 0
        ? `Top: ${statsData.categoryStats[0]?.category || "None"}`
        : "View Report",
    outOfStockCount: statsData?.outOfStockCount || 0,
    averagePrice: statsData?.averagePrice || 0,
    viewMode: "Global Products",
  };

  // Refresh data
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: productKeys.list() });
    queryClient.invalidateQueries({ queryKey: productKeys.lowStock() });
    queryClient.invalidateQueries({ queryKey: productKeys.stats() });
    queryClient.invalidateQueries({
      queryKey: productKeys.search(debouncedSearchQuery),
    });
    toast.success("Data refreshed");
  };

  // Get loading state
  const loading = () => {
    switch (activeTab) {
      case "all":
        return searchQuery.trim() ? searchLoading : productsLoading;
      case "low-stock":
        return lowStockLoading;
      case "stats":
        return statsLoading;
      default:
        return productsLoading;
    }
  };

  // Get error state
  const error = () => {
    switch (activeTab) {
      case "all":
        return searchQuery.trim() ? searchError : productsError;
      case "low-stock":
        return lowStockError;
      case "stats":
        return statsError;
      default:
        return productsError;
    }
  };

  const isLoading = loading();
  const hasError = error();
  const errorMessage = productsErrorMessage?.message || "An error occurred";

  // Render statistics tab content
  const renderStatsTab = () => {
    if (isLoading) return <StatsSkeletonLoader />;

    if (hasError)
      return (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-sm p-4 mb-4">
          <p className="text-red-600 dark:text-red-400">
            Error loading statistics
          </p>
        </div>
      );

    if (!statsData)
      return (
        <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-8 text-center">
          <Package className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Statistics Available
          </h3>
        </div>
      );

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Product Statistics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Total Stock
              </span>
              <Package className="h-5 w-5 text-green-600 dark:text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {statsData.totalStock}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Total Revenue
              </span>
              <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded">
                KSh
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {statsData.totalRevenue.toLocaleString()}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Total Sold
              </span>
              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded">
                Units
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {statsData.totalSold}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Average Price
              </span>
              <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded">
                KSh
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {statsData.averagePrice.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Category Statistics */}
        {statsData.categoryStats && statsData.categoryStats.length > 0 && (
          <div className="mt-8">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Category Statistics
            </h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Count
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Value (KSh)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
                  {statsData.categoryStats.map((catStat, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {catStat.category}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {catStat.count}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {catStat.value.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-start flex-col md:flex-row justify-between md:items-center mb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 bg-clip-text text-transparent">
              Products in main warehouse
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage inventory, track sales, and monitor stock levels
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-2 md:mt-0">
            {/* Global View Badge */}
            <div className="px-3 py-2 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 rounded-sm text-sm md:text-lg">
              <div className="flex items-center space-x-2">
                <Globe
                  size={16}
                  className="text-purple-600 dark:text-purple-400"
                />
                <span className="text-purple-600 dark:text-purple-400 font-medium">
                  Global View
                </span>
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-lg"
            >
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Header */}
        <AdminProductsHeader
          tabs={tabs}
          stats={stats}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleRefresh={handleRefresh}
          loading={isLoading}
          viewMode="global"
        />

        {/* Search and Filters */}
        {activeTab !== "stats" && (
          <AdminProductsSearchFilters
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            setSearchQuery={setSearchQuery}
            setSelectedCategory={setSelectedCategory}
            selectedPaymentMethod={selectedPaymentMethod}
            setSelectedPaymentMethod={setSelectedPaymentMethod}
            categories={categories}
            paymentMethods={paymentMethods}
            loading={isLoading}
          />
        )}

        {/* ✅ Show skeleton loader for product tabs */}
        {isLoading && activeTab !== "stats" && (
          <div className="space-y-2">
            {activeTab !== "daily" && <ProductSkeletonLoader />}
          </div>
        )}

        {/* Show error message */}
        {hasError && !isLoading && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-sm p-4 mb-4">
            <p className="text-red-600 dark:text-red-400">
              Error: {errorMessage}
            </p>
            <button
              onClick={handleRefresh}
              className="mt-2 px-4 py-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30 rounded-sm transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Show empty state when no products */}
        {!isLoading &&
          !hasError &&
          products.length === 0 &&
          activeTab !== "stats" && (
            <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-8 text-center">
              <Package className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Products Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchQuery.trim()
                  ? "No products match your search"
                  : "No products available globally"}
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-sm transition-colors"
                >
                  Add First Product
                </button>
                {searchQuery.trim() && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-sm transition-colors"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </div>
          )}

        {/* Content based on active tab */}
        {!isLoading && !hasError && (
          <>
            {activeTab === "all" && products.length > 0 && (
              <AdminAllProducts
                filteredProducts={filteredProducts}
                getCategoryIcon={getCategoryIcon}
                categories={categories}
                setSelectedProduct={setSelectedProduct}
                setShowDeleteModal={setShowDeleteModal}
                getStatusColor={getStatusColor}
                pagination={pagination}
                onPageChange={handlePageChange} // Use this instead of inline function
              />
            )}

            {activeTab === "featured" && products.length > 0 && (
              <AdminAllProducts
                filteredProducts={filteredProducts.filter((p) => p.isFeatured)}
                getCategoryIcon={getCategoryIcon}
                categories={categories}
                setSelectedProduct={setSelectedProduct}
                setShowDeleteModal={setShowDeleteModal}
                getStatusColor={getStatusColor}
                title="Featured Products (Global)"
                pagination={pagination}
                onPageChange={handlePageChange} // Use this instead of inline function
              />
            )}

            {activeTab === "stats" && renderStatsTab()}
          </>
        )}

        {/* Footer Actions - Only show when not loading and has products */}
        {!isLoading && products.length > 0 && activeTab !== "stats" && (
          <AdminProductsFooterActions
            activeTab={activeTab}
            filteredProducts={filteredProducts}
            filteredSales={dailySales.filter((sale) => {
              const matchesSearch =
                searchQuery === "" ||
                sale.productName
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                sale.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sale.customer.toLowerCase().includes(searchQuery.toLowerCase());

              const matchesPayment =
                selectedPaymentMethod === "all" ||
                sale.paymentMethod === selectedPaymentMethod;

              return matchesSearch && matchesPayment;
            })}
            storeProducts={filteredProducts}
            pagination={pagination}
            viewMode="global"
          />
        )}

        {/* Info Bar */}
        <div className="mt-6 pt-4 border-t border-gray-300 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <Globe
                size={16}
                className="text-purple-600 dark:text-purple-400"
              />
              <span>Global Products View</span>
            </div>
            {activeTab !== "stats" && (
              <div>
                Showing {filteredProducts.length} of {products.length} products
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProduct && (
        <AdminProductsDeleteConfirmationModal
          setShowDeleteModal={setShowDeleteModal}
          setSelectedProduct={setSelectedProduct}
          selectedProduct={selectedProduct}
          handleDeleteProduct={handleDeleteProduct}
          viewMode="global"
        />
      )}
    </AdminLayout>
  );
};

export default AdminProducts;
