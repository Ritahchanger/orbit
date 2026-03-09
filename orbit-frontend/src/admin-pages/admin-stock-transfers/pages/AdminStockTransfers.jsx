import { useState, useEffect } from "react";
import {
  ArrowRightLeft,
  Search,
  Filter,
  Calendar,
  Store,
  Package,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  RefreshCw,
  X,
} from "lucide-react";

import AdminLayout from "../../dashboard/layout/Layout";
import { useTransferHistory } from "../../hooks/stockTransfer.mutations";
import { format } from "date-fns";
import { useDebounce } from "../../../globals/hooks/useDebounce";

const AdminStockTransfers = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: "",
    sourceStore: "",
    destinationStore: "",
    fromDate: "",
    toDate: "",
    search: "",
  });

  // Separate state for the input field
  const [searchInput, setSearchInput] = useState("");

  // Debounce the search input with 500ms delay
  const debouncedSearch = useDebounce(searchInput, 500);

  const [isSearching, setIsSearching] = useState(false);

  // Update filters when debounced search changes
  useEffect(() => {
    setIsSearching(true);

    setFilters((prev) => ({
      ...prev,
      search: debouncedSearch,
      page: 1,
    }));

    // Reset searching state after a short delay
    const timer = setTimeout(() => setIsSearching(false), 500);
    return () => clearTimeout(timer);
  }, [debouncedSearch]);

  const { data, isLoading, isError, refetch, isFetching } =
    useTransferHistory(filters);

  const transfers = data?.transfers || [];
  const pagination = data?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  };

  // Debug: Log when filters change
  useEffect(() => {
    console.log("📊 Current filters:", filters);
  }, [filters]);

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      completed: {
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
        text: "text-emerald-700 dark:text-emerald-400",
        icon: CheckCircle,
        label: "Completed",
      },
      pending: {
        bg: "bg-amber-100 dark:bg-amber-900/30",
        text: "text-amber-700 dark:text-amber-400",
        icon: Clock,
        label: "Pending",
      },
      cancelled: {
        bg: "bg-rose-100 dark:bg-rose-900/30",
        text: "text-rose-700 dark:text-rose-400",
        icon: XCircle,
        label: "Cancelled",
      },
    };

    const config = statusConfig[status] || statusConfig.completed;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        <Icon size={12} className="mr-1" />
        {config.label}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy • hh:mm a");
    } catch {
      return dateString;
    }
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  // Handle search input change - now just updates the input state
  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  // Remove the handleSearch function since we're using debounce

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      status: "",
      sourceStore: "",
      destinationStore: "",
      fromDate: "",
      toDate: "",
      search: "",
    });
    setSearchInput("");
  };

  // Clear search only
  const clearSearch = () => {
    setSearchInput("");
    // The debounce effect will handle clearing the filters.search
  };

  // Export data
  const handleExport = () => {
    // Implement CSV export
    console.log("Exporting transfers...");
  };

  // Check if any filters are active (including search)
  const hasActiveFilters =
    filters.status || filters.fromDate || filters.toDate || filters.search;

  return (
    <AdminLayout>
      <div className="space-y-2 p-4 sm:p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Stock Transfers
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Track and manage inventory movements between stores
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw
                size={20}
                className={isFetching ? "animate-spin" : ""}
              />
            </button>
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-sm transition-colors text-sm"
            >
              <Download size={18} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search - Removed the form wrapper */}
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by transfer number, product, or store..."
                  value={searchInput}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-sm text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              {/* Show typing indicator when debouncing */}
              {searchInput !== filters.search && searchInput && (
                <p className="text-xs text-gray-500 mt-1">Typing...</p>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2 min-w-[140px]">
              <Filter size={18} className="text-gray-400" />
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="flex items-center space-x-2">
              <Calendar size={18} className="text-gray-400" />
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) => handleFilterChange("fromDate", e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                placeholder="From"
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) => handleFilterChange("toDate", e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                placeholder="To"
              />
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-sm transition-colors whitespace-nowrap"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Active search indicator */}
          {filters.search && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Active search:
              </span>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-sm flex items-center gap-1">
                <Search size={14} />"{filters.search}"
                <button
                  onClick={clearSearch}
                  className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                >
                  <X size={14} />
                </button>
              </span>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Transfers
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {pagination.total}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-sm">
                <ArrowRightLeft
                  className="text-blue-600 dark:text-blue-400"
                  size={24}
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Completed
                </p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {transfers.filter((t) => t.status === "completed").length}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-sm">
                <CheckCircle
                  className="text-emerald-600 dark:text-emerald-400"
                  size={24}
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Items
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {transfers.reduce((acc, t) => acc + t.quantity, 0)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-sm">
                <Package
                  className="text-purple-600 dark:text-purple-400"
                  size={24}
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Unique Products
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {new Set(transfers.map((t) => t.product?._id)).size}
                </p>
              </div>
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-sm">
                <Store
                  className="text-amber-600 dark:text-amber-400"
                  size={24}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Transfers Table */}
        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {isLoading || isSearching || (isFetching && filters.search) ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {isSearching || (isFetching && filters.search)
                  ? "Searching..."
                  : "Loading transfers..."}
              </p>
            </div>
          ) : isError ? (
            <div className="p-8 text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                Failed to Load Transfers
              </h3>
              <button
                onClick={() => refetch()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : transfers.length === 0 ? (
            <div className="p-8 text-center">
              <ArrowRightLeft className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Transfers Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {filters.search
                  ? `No results found for "${filters.search}"`
                  : filters.status || filters.fromDate || filters.toDate
                    ? "Try adjusting your filters"
                    : "No stock transfers have been recorded yet"}
              </p>
              {filters.search && (
                <button
                  onClick={clearSearch}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700/50">
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                        Transfer #
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                        Date & Time
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                        From → To
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                        Product
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                        Quantity
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                        Status
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                        Transferred By
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transfers.map((transfer) => (
                      <tr
                        key={transfer._id}
                        className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <span className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400">
                            {transfer.transferNumber}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm">
                            <p className="text-gray-900 dark:text-white font-medium">
                              {formatDate(transfer.transferredAt)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Created: {formatDate(transfer.createdAt)}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {transfer.sourceStore?.code}
                            </span>
                            <ArrowRightLeft
                              size={14}
                              className="text-gray-400"
                            />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {transfer.destinationStore?.code}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {transfer.sourceStore?.name} →{" "}
                            {transfer.destinationStore?.name}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p
                              className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]"
                              title={transfer.product?.name}
                            >
                              {transfer.product?.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              SKU: {transfer.product?.sku}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {transfer.quantity} units
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {transfer.sourceStockBefore} →{" "}
                              {transfer.sourceStockAfter}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge status={transfer.status} />
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <User size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {transfer.transferredBy?.email}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p
                            className="text-sm text-gray-600 dark:text-gray-400 max-w-[150px] truncate"
                            title={transfer.notes}
                          >
                            {transfer.notes || "-"}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {transfers.length} of {pagination.total} transfers
                      • Page {pagination.page} of {pagination.pages}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          handleFilterChange("page", pagination.page - 1)
                        }
                        disabled={pagination.page === 1}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-sm text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      <div className="flex items-center space-x-1">
                        {Array.from(
                          { length: Math.min(5, pagination.pages) },
                          (_, i) => {
                            let pageNum;
                            if (pagination.pages <= 5) {
                              pageNum = i + 1;
                            } else if (pagination.page <= 3) {
                              pageNum = i + 1;
                            } else if (
                              pagination.page >=
                              pagination.pages - 2
                            ) {
                              pageNum = pagination.pages - 4 + i;
                            } else {
                              pageNum = pagination.page - 2 + i;
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() =>
                                  handleFilterChange("page", pageNum)
                                }
                                className={`px-3 py-1 rounded-sm text-sm transition-colors ${
                                  pagination.page === pageNum
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          },
                        )}
                      </div>
                      <button
                        onClick={() =>
                          handleFilterChange("page", pagination.page + 1)
                        }
                        disabled={pagination.page === pagination.pages}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-sm text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminStockTransfers;
