import TransactionDetailsModal from "./TransactionDetailsModal";
import { useState } from "react";
import {
  Copy,
  Eye,
  Smartphone,
  Receipt,
  CheckCircle,
  AlertCircle,
  Trash2,
  CheckSquare,
  Square,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { usePermissionCheck } from "../../../context/RolePermissionContext";
import { useRoleContext } from "../../../context/RolePermissionContext";
import CashRefundModal from "./CashRefundModal";
import PrintTransactionButton from "./PrintTransactionButton";
import BulkPrintButton from "./BulkPrintButton";
import transactionsApi from "../../services/transaction-api";
import { useSoftDeleteTransactions } from "../../hooks/transaction-delete.mutations";
const Transactions = ({
  transactions,
  pagination,
  setPage,
  getPaymentMethodIcon,
  getStatusBadge,
  formatDate,
  formatCurrency,
  onRefetch, // Add this prop to refresh transactions after delete
}) => {
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [transactionToRefund, setTransactionToRefund] = useState(null);
  const [isFetchingAll, setIsFetchingAll] = useState(false);

  // New state for bulk selection
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Permission hooks
  const { hasPermission } = usePermissionCheck();
  const { userRoleName } = useRoleContext();

  // Soft delete mutation
  const softDeleteMutation = useSoftDeleteTransactions();

  // Superadmin check
  const isSuperAdmin = userRoleName === "superadmin";

  // ============ PERMISSION CHECKS ============
  const canViewTransactionDetails =
    hasPermission("transactions.view.details") ||
    hasPermission("transactions.view") ||
    isSuperAdmin;

  const canViewCustomerInfo =
    hasPermission("customers.view") ||
    hasPermission("transactions.view") ||
    isSuperAdmin;

  const canViewProfit =
    hasPermission("transactions.profit.view") ||
    hasPermission("reports.profit.view") ||
    hasPermission("profit.view") ||
    isSuperAdmin;

  const canViewMargin =
    hasPermission("transactions.margin.view") ||
    hasPermission("profit.margins") ||
    isSuperAdmin;

  const canViewCost =
    hasPermission("transactions.cost.view") ||
    hasPermission("cost.view") ||
    isSuperAdmin;

  const canCopyEmail =
    hasPermission("customers.contact") ||
    hasPermission("transactions.manage") ||
    isSuperAdmin;

  const canViewMpesaDetails =
    hasPermission("transactions.mpesa.view") ||
    hasPermission("transactions.view") ||
    isSuperAdmin;

  const canRefundTransaction =
    hasPermission("transactions.refund") ||
    hasPermission("transactions.manage") ||
    isSuperAdmin;

  const canDeleteTransactions =
    hasPermission("transactions.delete") ||
    hasPermission("transactions.manage") ||
    isSuperAdmin;

  // ============ BULK SELECTION FUNCTIONS ============
  const toggleSelectAll = () => {
    if (selectedTransactions.length === transactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(transactions.map((t) => t._id));
    }
  };

  const toggleSelectTransaction = (transactionId) => {
    setSelectedTransactions((prev) => {
      if (prev.includes(transactionId)) {
        return prev.filter((id) => id !== transactionId);
      } else {
        return [...prev, transactionId];
      }
    });
  };

  const handleDeleteSelected = async () => {
    if (!canDeleteTransactions) {
      toast.error("You don't have permission to delete transactions");
      return;
    }

    if (selectedTransactions.length === 0) {
      toast.error("No transactions selected");
      return;
    }

    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      // Use the soft delete mutation
      await softDeleteMutation.mutateAsync(selectedTransactions);

      // Clear selection after successful deletion
      setSelectedTransactions([]);
      setShowDeleteConfirm(false);

      // Refetch transactions to update the list
      if (onRefetch) {
        onRefetch();
      }
    } catch (error) {
      console.error("Error deleting transactions:", error);
      // Error toast is handled by the mutation
    }
  };

  // ============ HELPER FUNCTIONS ============

  // Calculate margin percentage
  const calculateMargin = (total, profit) => {
    if (!total || !profit || total === 0) return 0;
    return ((profit / total) * 100).toFixed(1);
  };

  // Get M-Pesa status badge
  const getMpesaStatusBadge = (transaction) => {
    if (transaction.paymentMethod !== "mpesa") return null;

    if (transaction.mpesaReceipt) {
      return {
        label: "M-Pesa Confirmed",
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        icon: CheckCircle,
      };
    }

    if (transaction.paymentStatus === "failed") {
      return {
        label: "M-Pesa Failed",
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        icon: AlertCircle,
      };
    }

    if (transaction.paymentStatus === "pending") {
      return {
        label: "M-Pesa Pending",
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        icon: Smartphone,
      };
    }

    return null;
  };

  const formatPhoneDisplay = (phone) => {
    if (!phone) return "";
    if (phone.startsWith("254")) {
      return "0" + phone.slice(3);
    }
    return phone;
  };

  const handleCopy = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success(`${fieldName} copied to clipboard!`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy");
    }
  };

  const handleCopyEmail = async (email) => {
    if (!canCopyEmail) {
      toast.error("You don't have permission to copy customer emails");
      return;
    }
    await handleCopy(email, "Email");
  };

  const handleRefund = (transaction) => {
    if (!canRefundTransaction) {
      toast.error("You don't have permission to refund transactions");
      return;
    }
    setTransactionToRefund(transaction);
    setShowRefundModal(true);
  };

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  // ============ FETCH ALL TRANSACTIONS FOR BULK PRINT ============
  const fetchAllTransactions = async () => {
    try {
      setIsFetchingAll(true);

      let allTransactions = [];
      const totalPages = pagination.pages;
      const limit = pagination.limit;

      const baseParams = {
        limit,
      };

      for (let page = 1; page <= totalPages; page++) {
        const response = await transactionsApi.getAllTransactions({
          ...baseParams,
          page,
        });

        if (response?.transactions) {
          allTransactions = [...allTransactions, ...response.transactions];
        } else if (response?.data) {
          allTransactions = [...allTransactions, ...response.data];
        } else if (Array.isArray(response)) {
          allTransactions = [...allTransactions, ...response];
        }

        if (page < totalPages) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      if (allTransactions.length === 0) {
        toast.error("No transactions found");
        return [];
      }

      return allTransactions;
    } catch (error) {
      console.error("Error fetching all transactions:", error);
      toast.error("Failed to load all transactions");
      throw error;
    } finally {
      setIsFetchingAll(false);
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        {/* Bulk Actions Bar */}
        {canDeleteTransactions && selectedTransactions.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {selectedTransactions.length} transaction(s) selected
              </span>
              <button
                onClick={() => setSelectedTransactions([])}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
              >
                Clear selection
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDeleteSelected}
                disabled={softDeleteMutation.isPending}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-sm"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                {softDeleteMutation.isPending
                  ? "Deleting..."
                  : `Delete Selected (${selectedTransactions.length})`}
              </button>
            </div>
          </div>
        )}

        <div className="mb-4 flex justify-end pt-4 pr-4">
          <BulkPrintButton
            transactions={transactions}
            pagination={pagination}
            onFetchAll={fetchAllTransactions}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            title="Transactions Report"
            isLoading={isFetchingAll}
          />
        </div>

        <table
          className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
          style={{ tableLayout: "fixed" }}
        >
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {/* Checkbox column for selection */}
              {canDeleteTransactions && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-10">
                  <button
                    onClick={toggleSelectAll}
                    className="flex items-center justify-center"
                  >
                    {selectedTransactions.length === transactions.length ? (
                      <CheckSquare className="h-4 w-4 text-primary-600" />
                    ) : (
                      <Square className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[180px]">
                Transaction
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[100px] max-w-[150px] ">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-10">
                Items
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[90px]">
                Amount
              </th>
              {canViewProfit && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-20">
                  Profit
                </th>
              )}
              {canViewMargin && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[70px]">
                  Margin
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[80] ">
                Payment Method
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[100px]">
                Payment Details
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[120px]">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[150px]">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[150px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.map((transaction) => {
              const mpesaStatus = getMpesaStatusBadge(transaction);
              const StatusIcon = mpesaStatus?.icon;
              const isSelected = selectedTransactions.includes(transaction._id);

              return (
                <tr
                  key={transaction._id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    isSelected ? "bg-blue-50/50 dark:bg-blue-900/20" : ""
                  }`}
                >
                  {/* Checkbox cell */}
                  {canDeleteTransactions && (
                    <td className="px-4 py-3 w-10">
                      <button
                        onClick={() => toggleSelectTransaction(transaction._id)}
                        className="flex items-center justify-center"
                      >
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4 text-primary-600" />
                        ) : (
                          <Square className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </td>
                  )}

                  {/* Transaction ID */}
                  <td className="px-4 py-3 w-[180px] max-w-[180px] overflow-hidden">
                    <div className="w-full truncate">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {transaction.transactionId || transaction._id.slice(-8)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {transaction.storeId?.name || "Store"}
                      </div>
                      {transaction.mpesaReceipt && canViewMpesaDetails && (
                        <div className="flex items-center gap-1 mt-1 w-full">
                          <Receipt className="h-3 w-3 text-green-600 dark:text-green-400 flex-shrink-0" />
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium truncate">
                            {transaction.mpesaReceipt}
                          </span>
                          <button
                            onClick={() =>
                              handleCopy(transaction.mpesaReceipt, "Receipt")
                            }
                            className="p-0.5 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex-shrink-0"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="px-4 py-3 w-[100px] max-w-[150px] overflow-hidden">
                    <div className="w-full">
                      <div className="text-sm text-gray-900 dark:text-white truncate">
                        {transaction.customerName || "Walk-in Customer"}
                      </div>
                      {canViewCustomerInfo && transaction.customerPhone && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                          <span className="truncate">
                            {formatPhoneDisplay(transaction.customerPhone)}
                          </span>
                          <button
                            onClick={() =>
                              handleCopy(transaction.customerPhone, "Phone")
                            }
                            className="p-0.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex-shrink-0"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                      {canViewCustomerInfo && transaction.customerEmail && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-xs text-blue-600 dark:text-blue-400 truncate">
                            {transaction.customerEmail}
                          </span>
                          {canCopyEmail && (
                            <button
                              onClick={() =>
                                handleCopyEmail(transaction.customerEmail)
                              }
                              className="p-0.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex-shrink-0"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Items */}
                  <td className="px-4 py-3 w-10 text-center">
                    <div className="text-sm text-left font-semibold text-gray-900 dark:text-white">
                      {transaction.itemsCount}
                    </div>
                    <div className="text-xs text-left text-gray-500 dark:text-gray-400">
                      items
                    </div>
                    {transaction.saleIds?.length > 0 &&
                      transaction.saleIds.length !== transaction.itemsCount && (
                        <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
                          {transaction.saleIds.length} sales
                        </div>
                      )}
                  </td>

                  {/* Amount */}
                  <td className="px-4 py-3 w-[90px] max-w-[120px] overflow-hidden">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {formatCurrency(transaction.total)}
                    </div>
                    {(transaction.discount > 0 || transaction.tax > 0) && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {transaction.discount > 0 &&
                          `Disc: -${formatCurrency(transaction.discount)}`}
                        {transaction.tax > 0 &&
                          ` Tax: +${formatCurrency(transaction.tax)}`}
                      </div>
                    )}
                    {transaction.mpesaAmount &&
                      transaction.mpesaAmount !== transaction.total && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          M-Pesa: {formatCurrency(transaction.mpesaAmount)}
                        </div>
                      )}
                  </td>

                  {/* Profit */}
                  {canViewProfit && (
                    <td className="px-4 py-3 w-[80px] max-w-[120px] overflow-hidden">
                      <div className="text-sm font-semibold text-green-600 dark:text-green-400 truncate">
                        {formatCurrency(transaction.totalProfit || 0)}
                      </div>
                      {canViewCost && transaction.totalCost > 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          Cost: {formatCurrency(transaction.totalCost)}
                        </div>
                      )}
                    </td>
                  )}

                  {/* Margin */}
                  {canViewMargin && (
                    <td className="px-4 py-3 w-[70px] max-w-[100px] overflow-hidden">
                      <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 truncate">
                        {calculateMargin(
                          transaction.total,
                          transaction.totalProfit,
                        )}
                        %
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        margin
                      </div>
                    </td>
                  )}

                  {/* Payment Method */}
                  <td className="px-4 py-3 w-[80px] max-w-[100px] overflow-hidden">
                    <div className="flex items-center">
                      <div className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-700 mr-2 flex-shrink-0">
                        {getPaymentMethodIcon(transaction.paymentMethod)}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white capitalize truncate">
                          {transaction.paymentMethod || "Unknown"}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize truncate">
                          {transaction.paymentStatus || "paid"}
                        </span>
                      </div>
                    </div>
                    {transaction.mpesaCheckoutId && canViewMpesaDetails && (
                      <div className="flex items-center gap-1 mt-1 ml-7">
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[80px]">
                          {transaction.mpesaCheckoutId.slice(-8)}
                        </span>
                        <button
                          onClick={() =>
                            handleCopy(
                              transaction.mpesaCheckoutId,
                              "Checkout ID",
                            )
                          }
                          className="p-0.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex-shrink-0"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Payment Details */}
                  <td className="px-4 py-3 w-[100px] max-w-[140px] overflow-hidden">
                    {transaction.paymentMethod === "cash" ? (
                      <div className="flex flex-col gap-1">
                        {transaction.amountGiven > 0 && (
                          <div className="text-xs truncate">
                            <span className="text-gray-500 dark:text-gray-400">
                              Given:{" "}
                            </span>
                            <span className="font-medium text-green-600 dark:text-green-400">
                              {formatCurrency(transaction.amountGiven)}
                            </span>
                          </div>
                        )}
                        {transaction.change > 0 && (
                          <div className="text-xs truncate">
                            <span className="text-gray-500 dark:text-gray-400">
                              Change:{" "}
                            </span>
                            <span className="font-medium text-blue-600 dark:text-blue-400">
                              {formatCurrency(transaction.change)}
                            </span>
                          </div>
                        )}
                        {transaction.amountGiven === transaction.total && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            Exact payment
                          </span>
                        )}
                      </div>
                    ) : transaction.paymentMethod === "mpesa" &&
                      canViewMpesaDetails ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <Smartphone className="h-3 w-3 text-green-600 dark:text-green-400 flex-shrink-0" />
                          <span className="text-xs font-medium text-gray-900 dark:text-white truncate">
                            {formatPhoneDisplay(
                              transaction.mpesaPhone ||
                                transaction.customerPhone,
                            )}
                          </span>
                        </div>
                        {transaction.mpesaTransactionDate && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {new Date(
                              transaction.mpesaTransactionDate.slice(0, 4) +
                                "-" +
                                transaction.mpesaTransactionDate.slice(4, 6) +
                                "-" +
                                transaction.mpesaTransactionDate.slice(6, 8) +
                                "T" +
                                transaction.mpesaTransactionDate.slice(8, 10) +
                                ":" +
                                transaction.mpesaTransactionDate.slice(10, 12) +
                                ":" +
                                transaction.mpesaTransactionDate.slice(12, 14),
                            ).toLocaleString()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500 italic truncate">
                        No details
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 w-[120px] max-w-[120px] overflow-hidden">
                    <div className="flex flex-col gap-1">
                      <div className="truncate">
                        {getStatusBadge(transaction.status)}
                      </div>
                      {mpesaStatus && (
                        <div
                          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-sm ${mpesaStatus.color} truncate`}
                        >
                          <StatusIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{mpesaStatus.label}</span>
                        </div>
                      )}
                      {transaction.soldBy?.email && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          by {transaction.soldBy.email}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 w-[150px] max-w-[150px] overflow-hidden">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {formatDate(transaction.createdAt)}
                      </span>
                      {transaction.notes && (
                        <div
                          className="text-xs mt-1 text-gray-400 dark:text-gray-500 truncate"
                          title={transaction.notes}
                        >
                          {transaction.notes}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 w-[150px] max-w-[170px]">
                    <div className="flex items-center gap-2">
                      {canViewTransactionDetails && (
                        <>
                          <button
                            onClick={() => handleViewDetails(transaction)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-sm transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Details
                          </button>
                          {/* <PrintTransactionButton
                            transaction={transaction}
                            formatCurrency={formatCurrency}
                            formatDate={formatDate}
                            variant="icon"
                          /> */}
                        </>
                      )}
                      {canRefundTransaction &&
                        transaction.paymentStatus === "paid" &&
                        transaction.status === "completed" && (
                          <button
                            onClick={() => handleRefund(transaction)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 rounded-sm transition-colors"
                          >
                            Refund
                          </button>
                        )}
                      {!canViewTransactionDetails && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                          No access
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination?.pages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} transactions
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center space-x-1">
                  {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    return (
                      <button
                        key={i}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${
                          pagination.page === pageNum
                            ? "bg-primary-600 text-white"
                            : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPage(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirm Deletion
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete {selectedTransactions.length}{" "}
              transaction(s)? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                disabled={softDeleteMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={softDeleteMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {softDeleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <CashRefundModal
        isOpen={showRefundModal}
        onClose={() => {
          setShowRefundModal(false);
          setTransactionToRefund(null);
        }}
        transaction={transactionToRefund}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        onRefundComplete={(refundData) => {
          console.log("Refund completed:", refundData);
          setShowRefundModal(false);
          setTransactionToRefund(null);
          // Refetch after refund
          if (onRefetch) {
            onRefetch();
          }
        }}
        canProcessRefund={canRefundTransaction}
      />

      <TransactionDetailsModal
        transaction={selectedTransaction}
        isOpen={isModalOpen}
        onClose={closeModal}
        getPaymentMethodIcon={getPaymentMethodIcon}
        getStatusBadge={getStatusBadge}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
        canViewProfit={canViewProfit}
        canViewMargin={canViewMargin}
        canViewCost={canViewCost}
        canViewMpesaDetails={canViewMpesaDetails}
        canRefundTransaction={canRefundTransaction}
        onRefund={handleRefund}
      />
    </>
  );
};

export default Transactions;
