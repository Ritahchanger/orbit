import { useState } from "react";
import AdminLayout from "../../dashboard/layout/Layout";
import {
  useTransactions,
  useTodaySummary,
} from "../../hooks/transaction-mutations";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Filter,
  Download,
  Search,
  RefreshCw,
  BarChart3,
  CreditCard,
  Wallet,
  Smartphone,
  AlertCircle, // Added missing import
} from "lucide-react";

import Transactions from "../components/Transactions";

import { useStoreContext } from "../../../context/store/StoreContext";

const AdminTransactions = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [status, setStatus] = useState("");

  // Fetch today's summary
  const {
    data: todayData,
    isLoading: todayLoading,
    error: todayError,
    refetch: refetchToday,
  } = useTodaySummary();

  // Fetch transactions with pagination
  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useTransactions({
    page,
    limit,
    ...(searchTerm && { customerName: searchTerm }),
    ...(paymentMethod && { paymentMethod }),
    ...(status && { status }),
  });

  // Extract data
  const todaySummary = todayData?.data || {};
  const transactions = transactionsData?.data || [];
  const pagination = transactionsData?.pagination || {};
  const summary = transactionsData?.summary || {};

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    refetchTransactions();
  };

  const { currentStore } = useStoreContext();

  console.log(currentStore);

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setPaymentMethod("");
    setStatus("");
    setPage(1);
    refetchTransactions();
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-KE", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `KES ${amount?.toLocaleString() || 0}`;
  };

  // Get payment method icon
  const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case "cash":
        return <Wallet className="h-4 w-4" />;
      case "mpesa":
        return <Smartphone className="h-4 w-4" />;
      case "card":
        return <CreditCard className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const config = {
      completed: {
        color:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        label: "Completed",
      },
      pending: {
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        label: "Pending",
      },
      cancelled: {
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        label: "Cancelled",
      },
      refunded: {
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        label: "Refunded",
      },
    };

    const cfg = config[status?.toLowerCase()] || config.completed;
    return (
      <span
        className={`px-2 py-1 rounded-full text-center text-xs font-medium ${cfg.color}`}
      >
        {cfg.label}
      </span>
    );
  };

  // Refresh all data
  const refreshAll = () => {
    refetchToday();
    refetchTransactions();
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-2">
        {/* Header - FIXED: Uniform font sizes */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Transactions
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Monitor and manage all store transactions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshAll}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Refresh
            </button>
            <button className="inline-flex items-center px-3 py-2 border border-transparent rounded-sm text-xs sm:text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors">
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export
            </button>
          </div>
        </div>

        {/* Today's Summary Cards - FIXED: Uniform typography */}
        {!todayLoading && !todayError && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-2">
            <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Today's Revenue
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {formatCurrency(todaySummary.totalRevenue)}
                  </p>
                </div>
                <div className="p-2 rounded-sm bg-green-100 dark:bg-green-900/30">
                  <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="flex items-center mt-3">
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  {todaySummary.totalTransactions || 0} transactions
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Items Sold
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {todaySummary.totalItems?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="p-2 rounded-sm bg-blue-100 dark:bg-blue-900/30">
                  <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="flex items-center mt-3">
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  Avg:{" "}
                  {Math.round(todaySummary.averageItemsPerTransaction) || 0} per
                  transaction
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Transactions
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {todaySummary.totalTransactions || 0}
                  </p>
                </div>
                <div className="p-2 rounded-sm bg-purple-100 dark:bg-purple-900/30">
                  <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="flex items-center mt-3">
                <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  Avg:{" "}
                  {formatCurrency(Math.round(todaySummary.averageTransaction))}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Today's Profit
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {formatCurrency(todaySummary.totalProfit)}
                  </p>
                </div>
                <div className="p-2 rounded-sm bg-orange-100 dark:bg-orange-900/30">
                  <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div className="flex items-center mt-3">
                <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                  Margin:{" "}
                  {(
                    (todaySummary.totalProfit /
                      (todaySummary.totalRevenue || 1)) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Loading state for summary - FIXED: Consistent sizing */}
        {todayLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="animate-pulse">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters Section - FIXED: Uniform typography */}
        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4 md:p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Filter className="h-4 w-4 md:h-5 md:w-5 mr-1.5" />
                Filter Transactions
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Filter transactions by various criteria
              </p>
            </div>

            {summary.totalTransactions > 0 && (
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-sm">
                Showing {transactions.length} of {summary.totalTransactions}{" "}
                transactions
              </div>
            )}
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              {/* Search Input */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                  Search Customer
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by customer name..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Payment Method Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Methods</option>
                  <option value="cash">Cash</option>
                  <option value="mpesa">M-Pesa</option>
                  <option value="card">Card</option>
                  <option value="paybill">Paybill</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Clear Filters
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPage(1);
                    refetchTransactions();
                  }}
                  className="px-3 py-1.5 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs md:text-sm font-medium text-white bg-primary-600 rounded-sm hover:bg-primary-700 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Transactions Table - FIXED: Consistent header typography */}
        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Table Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="flex items-center justify-between">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                Recent Transactions
              </h3>
              {summary.totalRevenue > 0 && (
                <div className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total: {formatCurrency(summary.totalRevenue)}
                </div>
              )}
            </div>
          </div>

          {/* Loading State */}
          {transactionsLoading && (
            <div className="p-6">
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error State */}
          {transactionsError && (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-3">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
                Error Loading Transactions
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {transactionsError.message || "Failed to load transactions"}
              </p>
              <button
                onClick={refetchTransactions}
                className="px-4 py-2 text-xs md:text-sm font-medium text-white bg-primary-600 rounded-sm hover:bg-primary-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!transactionsLoading &&
            !transactionsError &&
            transactions.length === 0 && (
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 mb-3">
                  <ShoppingCart className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                </div>
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
                  No Transactions Found in <p>
                    
                  </p>
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
                  {searchTerm || paymentMethod || status
                    ? "No transactions match your filters. Try adjusting your criteria."
                    : "There are no transactions yet. Transactions will appear here once sales are made."}
                </p>
                {(searchTerm || paymentMethod || status) && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-xs md:text-sm font-medium text-white bg-primary-600 rounded-sm hover:bg-primary-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}

          {/* Transactions List */}
          {!transactionsLoading &&
            !transactionsError &&
            transactions.length > 0 && (
              <Transactions
                transactions={transactions}
                pagination={pagination}
                setPage={setPage}
                getPaymentMethodIcon={getPaymentMethodIcon}
                getStatusBadge={getStatusBadge}
                formatDate={formatDate}
                formatCurrency={formatCurrency}
              />
            )}
        </div>

        {/* Summary Footer - FIXED: Uniform typography */}
        {!transactionsLoading &&
          !transactionsError &&
          summary.totalTransactions > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4 md:p-5">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Transaction Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-sm">
                  <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    {summary.totalTransactions}
                  </div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">
                    Total Transactions
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-sm">
                  <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(summary.totalRevenue)}
                  </div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">
                    Total Revenue
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-sm">
                  <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(Math.round(summary.averageTransaction))}
                  </div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">
                    Average Transaction
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>
    </AdminLayout>
  );
};

export default AdminTransactions;
