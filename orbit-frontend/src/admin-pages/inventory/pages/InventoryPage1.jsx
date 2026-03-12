import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  RefreshCw,
  Plus,
  Filter,
  Search,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

import AdminLayout from "../../dashboard/layout/Layout";

import { toast } from "react-hot-toast";

import { tabs, categories } from "./data";

import {
  useInventoryStats,
  useLowStockAlerts,
  useStoreInventory,
} from "../../hooks/store-inventory.queries";

import {
  useInventoryOperations,
  useQuickAddToInventory,
  useDeleteInventory,
} from "../../hooks/store-inventory.hook";

import { useDispatch } from "react-redux";

import { useStoreContext } from "../../../context/store/StoreContext";

import StatsCards from "../components/StatsCards";

import InventoryTable from "../components/InventoryTable";

import QuickAddModal from "../components/QuickAddModal";

import EmptyState from "./components/EmptyState";

import FooterInfo from "./components/FooterInfo";

import ActionsMenu from "./components/ActionsMenu";

import { useAuth } from "../../../context/authentication/AuthenticationContext";

import { openPosModal } from "../../pos/slice/pos-slice";

const InventoryPage = () => {
  const { storeId, currentStore, hasStore } = useStoreContext();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [quickAddSku, setQuickAddSku] = useState("");
  const [quickAddQuantity, setQuickAddQuantity] = useState(1);

  const dispatch = useDispatch();

  const { userRole } = useAuth();

  const deleteInventory = useDeleteInventory();

  // TanStack Query hooks for real data
  const {
    data: inventoryData,
    isLoading: inventoryLoading,
    isError: inventoryError,
    refetch: refetchInventory,
  } = useStoreInventory(
    storeId,
    {
      search: searchQuery || undefined,
      category: selectedCategory !== "all" ? selectedCategory : undefined,
      page: 1,
      limit: 20,
    },
    { enabled: !!storeId && hasStore },
  );

  const {
    data: statsData,
    isLoading: statsLoading,
    isError: statsError,
  } = useInventoryStats(storeId, { enabled: !!storeId && hasStore });

  const {
    data: lowStockData,
    isLoading: lowStockLoading,
    isError: lowStockError,
  } = useLowStockAlerts(storeId, 10, { enabled: !!storeId && hasStore });

  // Mutation hooks
  const inventoryOperations = useInventoryOperations();
  const quickAddMutation = useQuickAddToInventory();

  // Get filtered inventory items
  const inventoryItems = inventoryData?.data || [];
  const pagination = inventoryData?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  };
  const stats = statsData?.data || {};
  const lowStockItems = lowStockData?.data || [];

  // Handle quick add
  const handleQuickAdd = async () => {
    if (!quickAddSku.trim()) {
      toast.error("Please enter a SKU");
      return;
    }

    try {
      await quickAddMutation.mutateAsync({
        storeId,
        sku: quickAddSku.trim(),
        quantity: quickAddQuantity,
      });
      setQuickAddSku("");
      setQuickAddQuantity(1);
      setShowQuickAddModal(false);
      refetchInventory();
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  // Handle restock - ADD LOGGING
  const handleRestock = async (inventoryId, quantity) => {
    try {
      await inventoryOperations.restockProductAsync({
        inventoryId,
        quantity,
      });
      refetchInventory();
    } catch (error) {
      console.error("Restock error:", error);
      console.error("Error response:", error.response?.data);
    }
  };
  // Handle record sale
  const handleRecordSale = async (inventoryId, quantity) => {
    try {
      await inventoryOperations.recordSaleAsync({
        inventoryId,
        quantity,
      });
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  // Handle delete
  const handleDelete = async (
    inventoryId,
    isBulk = false,
    inventoryIds = [],
  ) => {
    // Single delete confirmation
    if (!isBulk) {
      if (
        !window.confirm(
          "Are you sure you want to remove this item from inventory?",
        )
      ) {
        return;
      }
    } else {
      // Bulk delete confirmation
      if (
        !window.confirm(
          `Are you sure you want to remove ${inventoryIds.length} items from inventory?`,
        )
      ) {
        return;
      }
    }

    try {
      if (isBulk) {
        // Bulk delete
        await deleteInventory.mutateAsync({
          storeId,
          inventoryIds,
          options: { force: false },
        });
        toast.success(`${inventoryIds.length} items removed successfully`);
      } else {
        // Single delete
        await deleteInventory.mutateAsync({
          storeId,
          inventoryId,
        });
      }

      // Refresh inventory after deletion
      refetchInventory();
    } catch (error) {
      // Error is handled in the mutation toast
      console.error("Delete error:", error);
    }
  };

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

  // Filter items based on active tab
  const getFilteredItems = () => {
    let items = inventoryItems;

    switch (activeTab) {
      case "low-stock":
        return items.filter((item) => item.status === "Low Stock");
      case "out-of-stock":
        return items.filter((item) => item.status === "Out of Stock");
      default:
        return items;
    }
  };

  const filteredItems = getFilteredItems();

  // Loading state
  const isLoading = inventoryLoading || statsLoading || lowStockLoading;
  const isError = inventoryError || statsError || lowStockError;

  useEffect(() => {
    const scrollToElement = () => {
      const element = document.getElementById("inventory-table");
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

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Inventory Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
              {currentStore
                ? `Managing inventory for ${currentStore.name}`
                : "Select a store to manage inventory"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Actions Button */}
            {(userRole === "superadmin" || userRole === "admin") && (
              <div className="relative grid grid-cols-2 gap-2">
                {/* <button
                  onClick={() => dispatch(openPosModal())}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-sm transition-colors font-medium text-sm"
                  disabled={!hasStore || inventoryOperations.isLoading}
                >
                  <span>Point of Sale</span>
                </button> */}
                <button
                  onClick={() => setShowActionsMenu(!showActionsMenu)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-sm transition-colors font-medium text-sm"
                  disabled={!hasStore || inventoryOperations.isLoading}
                >
                  <Plus size={18} />
                  <span>Actions</span>
                  <ChevronDown size={16} />
                </button>
                {showActionsMenu && (
                  <ActionsMenu
                    setShowActionsMenu={setShowActionsMenu}
                    setShowQuickAddModal={setShowQuickAddModal}
                  />
                )}
              </div>
            )}

            {/* Refresh Button */}
            <button
              onClick={() => refetchInventory()}
              disabled={isLoading || !hasStore}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-sm transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw
                size={18}
                className={isLoading ? "animate-spin" : ""}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards statsLoading={statsLoading} stats={stats} />

        {/* Tabs */}
        <div className="flex gap-1 mb-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-gray-100 dark:scrollbar-track-gray-900">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                disabled={!hasStore}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-sm transition-colors font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Icon size={18} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-2 mb-2">
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                size={18}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by product name, SKU, or brand..."
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                disabled={!hasStore}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm px-3 py-2.5 text-gray-900 dark:text-gray-100 min-w-[160px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!hasStore}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <button
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-700 dark:text-gray-200 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!hasStore}
            >
              <Filter size={18} />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Error State */}
        {isError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 rounded-sm">
            <div className="flex items-center gap-3">
              <AlertCircle
                className="text-red-500 dark:text-red-400"
                size={20}
              />
              <div className="flex-1">
                <p className="font-medium text-red-700 dark:text-red-300 text-sm">
                  Failed to load inventory data
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-xs">
                  Please check your connection and try again
                </p>
              </div>
              <button
                onClick={() => refetchInventory()}
                className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/40 rounded-sm text-sm font-medium transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mb-6 p-8 text-center">
            <div className="inline-flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-3 text-sm">
              Loading inventory data...
            </p>
          </div>
        )}

        {/* No Store Selected */}
        {!hasStore && !isLoading && (
          <div className="mb-6 p-8 text-center bg-gray-100 dark:bg-gray-800/40 rounded-sm border border-gray-200 dark:border-gray-700">
            <Package className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Store Selected
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Please select a store from the navigation bar to view inventory
            </p>
          </div>
        )}

        {/* Empty State */}
        <EmptyState
          hasStore={hasStore}
          isLoading={isLoading}
          isError={isError}
          inventoryItems={inventoryItems}
          setShowQuickAddModal={setShowQuickAddModal}
        />

        {/* Inventory Table */}
        <InventoryTable
          hasStore={hasStore}
          isLoading={isLoading}
          isError={isError}
          inventoryItems={inventoryItems}
          filteredItems={filteredItems}
          currentStore={currentStore}
          handleRecordSale={handleRecordSale}
          handleRestock={handleRestock}
          getStatusColor={getStatusColor}
          handleDelete={handleDelete}
          pagination={pagination}
        />

        {/* Footer Info */}
        <FooterInfo stats={stats} />
      </div>

      {/* Quick Add Modal */}
      {showQuickAddModal && (
        <QuickAddModal
          quickAddSku={quickAddSku}
          setQuickAddSku={setQuickAddSku}
          quickAddQuantity={quickAddQuantity}
          setQuickAddQuantity={setQuickAddQuantity}
          setShowQuickAddModal={setShowQuickAddModal}
          handleQuickAdd={handleQuickAdd}
          quickAddMutation={quickAddMutation}
        />
      )}
    </AdminLayout>
  );
};

export default InventoryPage;
