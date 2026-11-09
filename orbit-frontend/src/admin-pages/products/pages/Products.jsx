import { statusClass } from "../../../components/common/status/statusStyles";
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
import ManageCategoriesButton from "../components/ManageCategoriesButton";

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
  // One paginated request drives the table: search, category and the
  // Featured tab are all applied on the server, so the page count and
  // totals always describe what is listed.
  const trimmedSearch = debouncedSearchQuery.trim();
  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
    error: productsErrorMessage,
  } = useProducts(
    {
      category: selectedCategory !== "all" ? selectedCategory : undefined,
      search: trimmedSearch || undefined,
      isFeatured: activeTab === "featured" ? true : undefined,
    },
    page,
    limit,
    activeTab === "all" || activeTab === "featured",
  );

  const {
    data: lowStockData,
    isLoading: lowStockLoading,
    isError: lowStockError,
  } = useLowStockProducts(activeTab === "low-stock");

  // Always loaded: the stat cards above the tabs need it on every tab
  const {
    data: statsData,
    isLoading: statsLoading,
    isError: statsError,
  } = useProductStats(true);

  const tabs = [
    {
      id: "all",
      name: "All Products",
      count: statsData?.totalProducts ?? "",
      description: "All global products",
    },
    {
      id: "featured",
      name: "Featured",
      count: activeTab === "featured" ? (productsData?.pagination?.totalProducts ?? "") : "",
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
    switch (activeTab) {
      case "all":
      case "featured":
      case "stats":
        return productsData?.products || [];
      case "low-stock":
        return lowStockData || [];
      default:
        return [];
    }
  };

  const products = getProductsForTab();

  // The API reports {currentPage, totalPages, totalProducts}; the table reads
  // {page, pages, total}. (Reading the API's names directly as page/pages/
  // total left them undefined, so the table thought there was only one page.)
  const apiPagination = productsData?.pagination || {};
  const pagination = {
    page: apiPagination.currentPage || page,
    limit: apiPagination.limit || limit,
    total: apiPagination.totalProducts || 0,
    pages: Math.max(apiPagination.totalPages || 1, 1),
    hasNext: !!apiPagination.hasNext,
    hasPrev: !!apiPagination.hasPrev,
  };

  // Back to page 1 whenever the list being paged changes
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, trimmedSearch, activeTab]);

  // If the last page empties (e.g. after a delete), step back to the new last page
  useEffect(() => {
    if (productsData && page > pagination.pages) setPage(pagination.pages);
  }, [productsData, page, pagination.pages]);

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
  const getStatusColor = statusClass;

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

  // Keep the table in view when paging (it sits below the stat cards)
  const scrollToTable = () => {
    const table = document.getElementById("all-products");
    if (!table) return;
    const top = table.getBoundingClientRect().top + window.scrollY - 200;
    window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
  };

  const handlePageChange = (newPage, newLimit) => {
    if (newLimit && newLimit !== limit) {
      setLimit(newLimit);
      setPage(1);
    } else {
      setPage(newPage);
    }
    scrollToTable();
  };

  // Filter products based on category
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesCategory;
  });

  // Statistics from backend API
  const stats = {
    totalDevices: statsData?.totalProducts || 0,
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
    toast.success("Data refreshed");
  };

  // Get loading state
  const loading = () => {
    switch (activeTab) {
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
          <p className="text-sm text-red-600 dark:text-red-400">
            Error loading statistics
          </p>
        </div>
      );

    if (!statsData)
      return (
        <div className="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-sm p-8 text-center">
          <Package className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
            No Statistics Available
          </h3>
        </div>
      );

    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Product Statistics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Total Stock
              </span>
              <Package className="h-5 w-5 text-green-600 dark:text-green-500" />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {statsData.totalStock}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Total Revenue
              </span>
              <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded">
                KSh
              </span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {statsData.totalRevenue.toLocaleString()}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Total Sold
              </span>
              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded">
                Units
              </span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {statsData.totalSold}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Average Price
              </span>
              <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded">
                KSh
              </span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {statsData.averagePrice.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Category Statistics */}
        {statsData.categoryStats && statsData.categoryStats.length > 0 && (
          <div className="mt-8">
            <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Category Statistics
            </h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-800">
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
                <tbody className="divide-y divide-gray-300 dark:divide-gray-800">
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-start flex-col md:flex-row justify-between md:items-center mb-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Products in main warehouse
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage inventory, track sales, and monitor stock levels
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-2 md:mt-0">
            {/* Global View Badge */}
            <div className="px-3 py-2 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 rounded-sm text-sm">
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

            <ManageCategoriesButton />

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-900 hover:bg-gray-300 dark:hover:bg-gray-800 text-gray-800 dark:text-white rounded-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
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
            <p className="text-sm text-red-600 dark:text-red-400">
              Error: {errorMessage}
            </p>
            <button
              onClick={handleRefresh}
              className="mt-2 px-4 py-2 text-sm font-medium bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30 rounded-sm transition-colors"
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
            <div className="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-sm p-8 text-center">
              <Package className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
                No Products Found
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {searchQuery.trim()
                  ? "No products match your search"
                  : "No products available globally"}
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="px-4 py-2 text-sm font-medium bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-sm transition-colors"
                >
                  Add First Product
                </button>
                {searchQuery.trim() && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="px-4 py-2 text-sm font-medium bg-gray-300 dark:bg-gray-800 hover:bg-gray-400 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-sm transition-colors"
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
                filteredProducts={filteredProducts}
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
            showCount={false}
          />
        )}

        {/* Info Bar */}
        <div className="mt-6 pt-4 border-t border-gray-300 dark:border-gray-800">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <Globe
                size={16}
                className="text-purple-600 dark:text-purple-400"
              />
              <span>Global Products View</span>
            </div>
            {activeTab !== "stats" && pagination.total > 0 && (
              <div>
                {pagination.total} product{pagination.total === 1 ? "" : "s"}
                {pagination.pages > 1 && ` · page ${pagination.page} of ${pagination.pages}`}
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
