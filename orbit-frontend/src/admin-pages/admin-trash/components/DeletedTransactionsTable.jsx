import { RefreshCw, RotateCcw, Trash2, Users } from "lucide-react";

import { useRestoreTransactions,usePermanentDeleteTransactions } from "../../hooks/transaction-delete.mutations";

const DeletedTransactionsTable = ({
  transactionsLoading,
  transactions,
  pagination,
  setCurrentPage,
  activeTab,
  formatCurrency,
  formatDate,
  onRefetch,
}) => {
  const restoreMutation = useRestoreTransactions();
  const permanentDeleteMutation = usePermanentDeleteTransactions();

  const handleRestore = async (id, type) => {
    try {
      await restoreMutation.mutateAsync([id]);
      if (onRefetch) onRefetch();
    } catch (error) {
      console.error("Restore failed:", error);
    }
  };

  const handlePermanentDelete = async (id, type) => {
    if (
      window.confirm(
        `Are you sure you want to permanently delete this ${type}? This cannot be undone.`,
      )
    ) {
      try {
        await permanentDeleteMutation.mutateAsync({
          transactionIds: [id],
          confirm: true,
        });
        if (onRefetch) onRefetch();
      } catch (error) {
        console.error("Permanent delete failed:", error);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-sm shadow overflow-hidden">
      {/* Transactions Tab */}
      {activeTab === "transactions" && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Deleted By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Deleted At
                </th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {transactionsLoading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex justify-center items-center">
                      <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    No deleted transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr
                    key={transaction._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {transaction.transactionId || transaction._id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div>
                        {transaction.customerName || "Walk-in Customer"}
                      </div>
                      {transaction.customerPhone && (
                        <div className="text-xs">
                          {transaction.customerPhone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(transaction.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {transaction.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {transaction.deletedBy?.email || "Unknown"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(transaction.deletedAt)}
                    </td>
                    <td className="pr-2 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleRestore(transaction._id, "transaction")
                          }
                          disabled={restoreMutation.isPending}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          {restoreMutation.isPending
                            ? "Restoring..."
                            : "Restore"}
                        </button>
                        <button
                          onClick={() =>
                            handlePermanentDelete(
                              transaction._id,
                              "transaction",
                            )
                          }
                          disabled={permanentDeleteMutation.isPending}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          {permanentDeleteMutation.isPending
                            ? "Deleting..."
                            : "Delete Permanently"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination for transactions */}
          {pagination?.pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total,
                  )}{" "}
                  of {pagination.total} transactions
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={!pagination.hasPrev}
                    onClick={() => setCurrentPage(pagination.page - 1)}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Previous
                  </button>
                  <button
                    disabled={!pagination.hasNext}
                    onClick={() => setCurrentPage(pagination.page + 1)}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Workers Tab */}
      {activeTab === "workers" && (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">
            Workers Trash Coming Soon
          </h3>
          <p className="text-sm">
            This section will display deleted workers/staff members.
            <br />
            You'll be able to restore or permanently delete worker accounts.
          </p>
        </div>
      )}
    </div>
  );
};

export default DeletedTransactionsTable;
