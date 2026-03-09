import { useState } from "react";
import AdminLayout from "../../dashboard/layout/Layout";
import {
  Trash2,
  ShoppingBag,
  Users,
  RefreshCw,
  Search,
  Calendar,
  Download,
  XCircle,
} from "lucide-react";
import { useDeletedTransactions } from "../../hooks/transaction-delete.mutations";
import { useDebounce } from "../../../globals/hooks/useDebounce";
import DeletedTransactionsTable from "../components/DeletedTransactionsTable";

const AdminTrash = () => {
  const [activeTab, setActiveTab] = useState("transactions");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch deleted transactions
  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    refetch: refetchTransactions,
  } = useDeletedTransactions({
    page: currentPage,
    limit: 20,
    search: debouncedSearchTerm || undefined,
    startDate: dateFilter || undefined,
  });

  console.log("THIS IS THE TRANSACTIONS DATA", transactionsData);

  const handleClearFilters = () => {
    setSearchTerm("");
    setDateFilter("");
    setCurrentPage(1);
  };

  const handleRestore = (id, type) => {
    // Implement restore logic
    console.log(`Restore ${type} with id:`, id);
  };

  const handlePermanentDelete = (id, type) => {
    // Implement permanent delete logic with confirmation
    if (
      window.confirm(
        `Are you sure you want to permanently delete this ${type}? This cannot be undone.`,
      )
    ) {
      console.log(`Permanently delete ${type} with id:`, id);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get transactions from the correct path in response
  const transactions = transactionsData?.data || [];
  const pagination = transactionsData?.pagination;

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-2 mt-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Trash2 className="w-6 h-6 text-red-500" />
            Trash / Recycle Bin
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage deleted items. Items in trash can be restored or permanently
            deleted.
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-2">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("transactions")}
              className={`
                inline-flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === "transactions"
                    ? "border-primary-500 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }
              `}
            >
              <ShoppingBag className="w-5 h-5" />
              Deleted Transactions
              {pagination?.total > 0 && (
                <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-sm dark:bg-red-900/30 dark:text-red-400">
                  {pagination.total}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("workers")}
              className={`
                inline-flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === "workers"
                    ? "border-primary-500 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }
              `}
            >
              <Users className="w-5 h-5" />
              Deleted Workers
            </button>
          </nav>
        </div>

        {/* Search and Filters */}
        <div className="mb-2 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={`Search deleted ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border text-sm border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 border text-sm border-gray-300 dark:border-gray-600 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="Clear filters"
            >
              <XCircle className="w-5 h-5 text-gray-500" />
            </button>
            <button
              onClick={() => refetchTransactions()}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        {/* deleted transactions table */}
        <DeletedTransactionsTable
          transactionsLoading={transactionsLoading}
          transactions={transactions}
          pagination={pagination}
          setCurrentPage={setCurrentPage}
          activeTab={activeTab}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          onRefetch={refetchTransactions}
          onRestore={handleRestore}
          onPermanentDelete={handlePermanentDelete}
        />

        {/* Bulk Actions Bar */}
        <div className="mt-4 flex justify-end gap-2">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Download className="w-4 h-4 mr-2 inline" />
            Export Trash Data
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminTrash;
