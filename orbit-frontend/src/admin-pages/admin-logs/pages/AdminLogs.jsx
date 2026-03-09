import { useState, useEffect } from "react"; // Added useEffect
import AdminLayout from "../../dashboard/layout/Layout";
import { useQuery } from "@tanstack/react-query";
import {
  useDeleteLog,
  useDeleteLogsBatch,
  useFetchLogs,
  logKeys,
} from "../../hooks/logs.mutations";
import logsApi from "../../services/logs-api";
import {
  Eye,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  X,
  AlertCircle,
  Info,
  AlertTriangle,
  Bug,
  CheckSquare,
  Square,
  Copy,
} from "lucide-react";
import { toast } from "react-hot-toast";

import LogDetailsModal from "../components/LogDetailsModal";
import { useDebounce } from "../../../globals/hooks/useDebounce";

const AdminLogs = () => {
  // State for filters
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    level: "",
    userId: "",
    path: "",
    search: "",
    startDate: "",
    endDate: "",
  });

  // Separate state for search input (for immediate UI updates)
  const [searchInput, setSearchInput] = useState("");

  // Debounce the search input with 500ms delay
  const debouncedSearch = useDebounce(searchInput, 500);

  // Track if search is active for loading state
  const [isSearching, setIsSearching] = useState(false);

  // Update filters when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setIsSearching(true);

      setFilters((prev) => ({
        ...prev,
        search: debouncedSearch,
        page: 1,
      }));

      // Reset searching state after a short delay
      const timer = setTimeout(() => setIsSearching(false), 500);
      return () => clearTimeout(timer);
    }
  }, [debouncedSearch, filters.search]);

  // State for selected logs (batch delete)
  const [selectedLogs, setSelectedLogs] = useState([]);

  // State for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // State for log details modal
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for filter visibility on mobile
  const [showFilters, setShowFilters] = useState(false);

  // Queries
  const {
    data: logsData,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: logKeys.list(filters),
    queryFn: () => logsApi.getLogs(filters),
    keepPreviousData: true, // Keep showing old data while fetching new
  });

  // Mutations
  const deleteLogMutation = useDeleteLog();
  const deleteLogsBatchMutation = useDeleteLogsBatch();
  const fetchLogsMutation = useFetchLogs();

  // ============ HELPER FUNCTIONS ============
  const getLevelBadge = (level) => {
    const badges = {
      info: {
        color:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        icon: Info,
        label: "Info",
      },
      warn: {
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        icon: AlertTriangle,
        label: "Warning",
      },
      error: {
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        icon: AlertCircle,
        label: "Error",
      },
      debug: {
        color:
          "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
        icon: Bug,
        label: "Debug",
      },
    };
    return badges[level] || badges.info;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatMethod = (method) => {
    const colors = {
      GET: "text-green-600 dark:text-green-400",
      POST: "text-blue-600 dark:text-blue-400",
      PUT: "text-yellow-600 dark:text-yellow-400",
      DELETE: "text-red-600 dark:text-red-400",
      PATCH: "text-purple-600 dark:text-purple-400",
    };
    return (
      <span className={`font-mono font-medium ${colors[method] || ""}`}>
        {method}
      </span>
    );
  };

  // ============ HANDLERS ============
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
    setSelectedLogs([]);
  };

  // Handle search input change - updates local state immediately
  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  // Remove the old handleSearch function - we don't need form submission anymore

  const handleRefresh = async () => {
    try {
      await fetchLogsMutation.mutateAsync(filters);
      toast.success("Logs refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh logs");
    }
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 50,
      level: "",
      userId: "",
      path: "",
      search: "",
      startDate: "",
      endDate: "",
    });
    setSearchInput(""); // Clear search input too
    setSelectedLogs([]);
  };

  // ============ BULK SELECTION ============
  const toggleSelectAll = () => {
    if (selectedLogs.length === logsData?.data.length) {
      setSelectedLogs([]);
    } else {
      setSelectedLogs(logsData?.data.map((log) => log._id) || []);
    }
  };

  const toggleSelectLog = (logId) => {
    setSelectedLogs((prev) => {
      if (prev.includes(logId)) {
        return prev.filter((id) => id !== logId);
      } else {
        return [...prev, logId];
      }
    });
  };

  // ============ DELETE HANDLERS ============
  const handleDeleteLog = async (logId) => {
    try {
      await deleteLogMutation.mutateAsync(logId);
      toast.success("Log deleted successfully");
    } catch (error) {
      toast.error("Failed to delete log");
    }
  };

  const handleBatchDelete = async () => {
    try {
      await deleteLogsBatchMutation.mutateAsync(selectedLogs);
      toast.success(`${selectedLogs.length} logs deleted successfully`);
      setSelectedLogs([]);
      setShowDeleteConfirm(false);
    } catch (error) {
      toast.error("Failed to delete logs");
    }
  };

  // ============ VIEW DETAILS ============
  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLog(null);
  };

  // ============ COPY HANDLER ============
  const handleCopy = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${fieldName} copied to clipboard!`);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  if (isError) {
    return (
      <AdminLayout>
        <div className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 dark:text-red-400">Error loading logs</p>
          <button
            onClick={refetch}
            className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              System Logs
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Monitor and manage system activities
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors lg:hidden"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
            <button
              onClick={handleRefresh}
              disabled={fetchLogsMutation.isPending}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${fetchLogsMutation.isPending ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className={`${showFilters ? "block" : "hidden lg:block"} mb-2`}>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-4">
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Filters
              </h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Search - Removed form wrapper */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search logs by message, user, path, error..."
                  value={searchInput}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
                {/* Show typing indicator when debouncing */}
                {searchInput !== filters.search && searchInput && (
                  <p className="text-xs text-gray-500 mt-1">Searching...</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Level Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Log Level
                  </label>
                  <select
                    value={filters.level}
                    onChange={(e) =>
                      handleFilterChange("level", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">All Levels</option>
                    <option value="info">Info</option>
                    <option value="warn">Warning</option>
                    <option value="error">Error</option>
                    <option value="debug">Debug</option>
                  </select>
                </div>

                {/* Path Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Path
                  </label>
                  <input
                    type="text"
                    placeholder="/api/endpoint"
                    value={filters.path}
                    onChange={(e) => handleFilterChange("path", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* User ID Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    User ID
                  </label>
                  <input
                    type="text"
                    placeholder="User ID"
                    value={filters.userId}
                    onChange={(e) =>
                      handleFilterChange("userId", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      From
                    </label>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) =>
                        handleFilterChange("startDate", e.target.value)
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      To
                    </label>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) =>
                        handleFilterChange("endDate", e.target.value)
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-sm transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedLogs.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {selectedLogs.length} log(s) selected
              </span>
              <button
                onClick={() => setSelectedLogs([])}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
              >
                Clear selection
              </button>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleteLogsBatchMutation.isPending}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 transition-colors disabled:opacity-50 rounded-sm"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              {deleteLogsBatchMutation.isPending
                ? "Deleting..."
                : `Delete Selected (${selectedLogs.length})`}
            </button>
          </div>
        )}

        {/* Logs Table */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden">
          {isLoading || isSearching || (isFetching && filters.search) ? (
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {isSearching || (isFetching && filters.search)
                  ? "Searching..."
                  : "Loading logs..."}
              </p>
            </div>
          ) : logsData?.data.length === 0 ? (
            <div className="p-12 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Logs Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {filters.search
                  ? `No results for "${filters.search}"`
                  : filters.level ||
                      filters.path ||
                      filters.userId ||
                      filters.startDate
                    ? "Try adjusting your filters"
                    : "No logs have been recorded yet"}
              </p>
              {(filters.search ||
                filters.level ||
                filters.path ||
                filters.userId ||
                filters.startDate) && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-sm hover:bg-primary-700"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-10">
                        <button
                          onClick={toggleSelectAll}
                          className="flex items-center justify-center"
                        >
                          {selectedLogs.length === logsData?.data.length ? (
                            <CheckSquare className="h-4 w-4 text-primary-600" />
                          ) : (
                            <Square className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Level
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Path
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Message
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[100px]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {logsData?.data.map((log) => {
                      const levelBadge = getLevelBadge(log.level);
                      const LevelIcon = levelBadge.icon;
                      const isSelected = selectedLogs.includes(log._id);

                      return (
                        <tr
                          key={log._id}
                          className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                            isSelected
                              ? "bg-blue-50/50 dark:bg-blue-900/20"
                              : ""
                          }`}
                        >
                          <td className="px-4 py-3 w-10">
                            <button
                              onClick={() => toggleSelectLog(log._id)}
                              className="flex items-center justify-center"
                            >
                              {isSelected ? (
                                <CheckSquare className="h-4 w-4 text-primary-600" />
                              ) : (
                                <Square className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-sm ${levelBadge.color}`}
                            >
                              <LevelIcon className="w-3 h-3 mr-1" />
                              {levelBadge.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {formatDate(log.createdAt)}
                          </td>
                          <td className="px-4 py-3 text-sm font-mono">
                            {formatMethod(log.request?.method)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white max-w-[200px]">
                            <div className="truncate" title={log.request?.path}>
                              {log.request?.path}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-sm ${
                                log.response?.statusCode >= 200 &&
                                log.response?.statusCode < 300
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : log.response?.statusCode >= 400 &&
                                      log.response?.statusCode < 500
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                    : log.response?.statusCode >= 500
                                      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                      : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                              }`}
                            >
                              {log.response?.statusCode || "---"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-[150px]">
                            {log.user ? (
                              <div className="flex items-center gap-1">
                                <span
                                  className="truncate"
                                  title={log.user.email}
                                >
                                  {log.user.email}
                                </span>
                                <button
                                  onClick={() =>
                                    handleCopy(log.user.email, "Email")
                                  }
                                  className="p-0.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                >
                                  <Copy className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500 italic">
                                System
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white max-w-[250px]">
                            <div className="truncate" title={log.message}>
                              {log.message}
                            </div>
                          </td>
                          <td className="px-4 py-3 w-[100px]">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewDetails(log)}
                                className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteLog(log._id)}
                                disabled={deleteLogMutation.isPending}
                                className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-50"
                                title="Delete Log"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {logsData?.meta?.pages > 1 && (
                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Showing{" "}
                      {(logsData.meta.page - 1) * logsData.meta.limit + 1} to{" "}
                      {Math.min(
                        logsData.meta.page * logsData.meta.limit,
                        logsData.meta.total,
                      )}{" "}
                      of {logsData.meta.total} logs
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          handleFilterChange("page", filters.page - 1)
                        }
                        disabled={!logsData.meta.hasPrev}
                        className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      <div className="flex items-center space-x-1">
                        {[...Array(Math.min(5, logsData.meta.pages))].map(
                          (_, i) => {
                            let pageNum;
                            if (logsData.meta.pages <= 5) {
                              pageNum = i + 1;
                            } else if (filters.page <= 3) {
                              pageNum = i + 1;
                            } else if (
                              filters.page >=
                              logsData.meta.pages - 2
                            ) {
                              pageNum = logsData.meta.pages - 4 + i;
                            } else {
                              pageNum = filters.page - 2 + i;
                            }
                            return (
                              <button
                                key={i}
                                onClick={() =>
                                  handleFilterChange("page", pageNum)
                                }
                                className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${
                                  filters.page === pageNum
                                    ? "bg-primary-600 text-white"
                                    : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
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
                          handleFilterChange("page", filters.page + 1)
                        }
                        disabled={!logsData.meta.hasNext}
                        className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirm Deletion
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete {selectedLogs.length} log(s)? This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                disabled={deleteLogsBatchMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleBatchDelete}
                disabled={deleteLogsBatchMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-md transition-colors disabled:opacity-50"
              >
                {deleteLogsBatchMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Details Modal */}
      <LogDetailsModal
        log={selectedLog}
        isOpen={isModalOpen}
        onClose={closeModal}
        formatDate={formatDate}
        formatCurrency={(amount) => {
          return new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
            minimumFractionDigits: 0,
          }).format(amount || 0);
        }}
        onCopy={handleCopy}
      />
    </AdminLayout>
  );
};

export default AdminLogs;
