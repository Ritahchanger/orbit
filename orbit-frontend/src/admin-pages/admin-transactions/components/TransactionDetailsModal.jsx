import {
  X,
  User,
  ShoppingBag,
  Calendar,
  CreditCard,
  DollarSign,
  FileText,
  Package,
  Receipt,
  CircleDollarSign,
  Coins,
  CheckCircle,
  TrendingUp,
  Percent,
  Smartphone, // ✅ ADDED: For M-Pesa
  Copy, // ✅ ADDED: For copy functionality
  AlertCircle, // ✅ ADDED: For failed status
  Clock, // ✅ ADDED: For pending status
  Download, // ✅ ADDED: For export
  Printer, // ✅ ADDED: For print
  RefreshCw, // ✅ ADDED: For refund/void
} from "lucide-react";
import AdminCopySKU from "../../products/components/AdminCopySKU";
import { usePermissionCheck } from "../../../context/RolePermissionContext";
import { useRoleContext } from "../../../context/RolePermissionContext";
import { useState } from "react"; // ✅ ADDED
import { toast } from "react-hot-toast"; // ✅ ADDED

const TransactionDetailsModal = ({
  transaction,
  isOpen,
  onClose,
  getPaymentMethodIcon,
  getStatusBadge,
  formatDate,
  formatCurrency,
  // Props from parent component
  canViewProfit = false,
  canViewMargin = false,
  canViewCost = false,
  canViewMpesaDetails = false, // ✅ ADDED
  canRefundTransaction = false, // ✅ ADDED
  onRefund, // ✅ ADDED
}) => {
  const [copiedField, setCopiedField] = useState(null); // ✅ ADDED
  const [isRefunding, setIsRefunding] = useState(false); // ✅ ADDED

  if (!isOpen || !transaction) return null;

  // Permission hooks
  const { hasPermission } = usePermissionCheck();
  const { userRoleName } = useRoleContext();

  // Superadmin sees everything
  const isSuperAdmin = userRoleName === "superadmin";

  // ============ PERMISSION CHECKS ============
  const canViewProfitDetails =
    canViewProfit ||
    isSuperAdmin ||
    hasPermission("transactions.profit.view") ||
    hasPermission("reports.profit.view") ||
    hasPermission("profit.view");

  const canViewMarginDetails =
    canViewMargin ||
    isSuperAdmin ||
    hasPermission("transactions.margin.view") ||
    hasPermission("profit.margins");

  const canViewCostDetails =
    canViewCost ||
    isSuperAdmin ||
    hasPermission("transactions.cost.view") ||
    hasPermission("cost.view");

  const canViewMpesa = // ✅ ADDED
    canViewMpesaDetails ||
    isSuperAdmin ||
    hasPermission("transactions.mpesa.view") ||
    hasPermission("transactions.view");

  const canRefund = // ✅ ADDED
    canRefundTransaction ||
    isSuperAdmin ||
    hasPermission("transactions.refund") ||
    hasPermission("transactions.manage");

  // ============ HELPER FUNCTIONS ============

  // Helper function for currency formatting
  const formatMoney = (amount) => {
    if (!amount && amount !== 0) return "KES 0";
    if (formatCurrency) {
      return formatCurrency(amount);
    }
    return `KES ${amount?.toLocaleString() || 0}`;
  };

  // ✅ ADDED: Format phone number for display (254XXX -> 0XXX)
  const formatPhoneDisplay = (phone) => {
    if (!phone) return "";
    if (phone.startsWith("254")) {
      return "0" + phone.slice(3);
    }
    return phone;
  };

  // Calculate margin percentage
  const calculateMargin = (total, profit) => {
    if (!total || !profit || total === 0) return "0.0";
    return ((profit / total) * 100).toFixed(1);
  };

  // ✅ ADDED: Copy to clipboard with feedback
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

  // ✅ ADDED: Handle refund with confirmation
  const handleRefund = async () => {
    if (!canRefund) {
      toast.error("You don't have permission to refund transactions");
      return;
    }

    if (onRefund) {
      setIsRefunding(true);
      try {
        await onRefund(transaction);
      } finally {
        setIsRefunding(false);
      }
    }
  };

  // ✅ ADDED: Format M-Pesa transaction date
  const formatMpesaDate = (dateString) => {
    if (!dateString) return null;
    try {
      // Format: YYYYMMDDHHmmss
      const year = dateString.slice(0, 4);
      const month = dateString.slice(4, 6);
      const day = dateString.slice(6, 8);
      const hour = dateString.slice(8, 10);
      const minute = dateString.slice(10, 12);
      const second = dateString.slice(12, 14);

      return new Date(
        `${year}-${month}-${day}T${hour}:${minute}:${second}`,
      ).toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  // Check if it's a cash transaction with change
  const isCashPayment = transaction.paymentMethod === "cash";
  const isMpesaPayment = transaction.paymentMethod === "mpesa"; // ✅ ADDED
  const hasChange = isCashPayment && transaction.change > 0;
  const exactPayment =
    isCashPayment && transaction.amountGiven === transaction.total;

  // ✅ ADDED: Get M-Pesa status
  const getMpesaStatus = () => {
    if (!isMpesaPayment) return null;

    if (transaction.mpesaReceipt) {
      return {
        label: "Confirmed",
        color: "text-green-600 dark:text-green-400",
        bg: "bg-green-100 dark:bg-green-900/30",
        icon: CheckCircle,
      };
    }

    if (transaction.paymentStatus === "failed") {
      return {
        label: "Failed",
        color: "text-red-600 dark:text-red-400",
        bg: "bg-red-100 dark:bg-red-900/30",
        icon: AlertCircle,
      };
    }

    if (transaction.paymentStatus === "pending") {
      return {
        label: "Pending",
        color: "text-yellow-600 dark:text-yellow-400",
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        icon: Clock,
      };
    }

    return null;
  };

  const mpesaStatus = getMpesaStatus();
  const StatusIcon = mpesaStatus?.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70" onClick={onClose}></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-sm shadow-xl max-w-8xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ShoppingBag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                    Transaction Details
                  </h3>
                  <div className="flex items-center gap-2">
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                      {transaction.transactionId || transaction._id.slice(-12)}
                    </p>
                    <button
                      onClick={() =>
                        handleCopy(
                          transaction.transactionId || transaction._id,
                          "Transaction ID",
                        )
                      }
                      className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Transaction Summary */}
              <div className="lg:col-span-2 space-y-4">
                {/* Cash Payment Banner */}
                {isCashPayment && (
                  <div
                    className={`rounded-sm p-4 border ${
                      hasChange
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
                        : exactPayment
                          ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700"
                          : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            hasChange
                              ? "bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300"
                              : exactPayment
                                ? "bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300"
                                : "bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-300"
                          }`}
                        >
                          {hasChange ? (
                            <Coins className="h-5 w-5" />
                          ) : exactPayment ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <CircleDollarSign className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Cash Payment
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {hasChange
                              ? `Change of ${formatMoney(transaction.change)} given`
                              : exactPayment
                                ? "Exact payment received"
                                : "Payment processed"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                          {formatMoney(
                            transaction.amountGiven || transaction.total,
                          )}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Amount Given
                        </p>
                      </div>
                    </div>

                    {/* Cash Payment Details */}
                    {transaction.amountGiven > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Given
                          </p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {formatMoney(transaction.amountGiven)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Total
                          </p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {formatMoney(transaction.total)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Change
                          </p>
                          <p
                            className={`text-sm font-semibold ${
                              transaction.change > 0
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-green-600 dark:text-green-400"
                            }`}
                          >
                            {formatMoney(transaction.change)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ✅ ADDED: M-Pesa Payment Banner */}
                {isMpesaPayment && transaction.mpesaReceipt && canViewMpesa && (
                  <div className="rounded-sm p-4 border bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300">
                          <Smartphone className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                            M-Pesa Payment
                          </h4>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Receipt: {transaction.mpesaReceipt}
                            </p>
                            <button
                              onClick={() =>
                                handleCopy(
                                  transaction.mpesaReceipt,
                                  "Receipt Number",
                                )
                              }
                              className="p-0.5 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                          {formatMoney(
                            transaction.mpesaAmount || transaction.total,
                          )}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          M-Pesa Amount
                        </p>
                      </div>
                    </div>

                    {/* M-Pesa Details */}
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Phone
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatPhoneDisplay(
                            transaction.mpesaPhone || transaction.customerPhone,
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Date
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatMpesaDate(transaction.mpesaTransactionDate) ||
                            formatDate(transaction.createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Checkout ID
                        </p>
                        <div className="flex items-center gap-1">
                          <p className="text-xs font-medium text-gray-900 dark:text-white">
                            {transaction.mpesaCheckoutId?.slice(-8)}
                          </p>
                          <button
                            onClick={() =>
                              handleCopy(
                                transaction.mpesaCheckoutId,
                                "Checkout ID",
                              )
                            }
                            className="p-0.5 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          >
                            <Copy className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </p>
                        <div className="flex items-center gap-1">
                          {mpesaStatus && (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-sm ${mpesaStatus.bg} ${mpesaStatus.color}`}
                            >
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {mpesaStatus.label}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 dark:bg-gray-900 rounded-sm p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <ShoppingBag className="h-4 w-4" />
                    Transaction Summary
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Store
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {transaction.storeId?.name || "Unknown Store"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Items
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {transaction.itemsCount} items
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Subtotal
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatMoney(transaction.subtotal)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Discount
                      </p>
                      <p
                        className={`text-sm font-medium ${
                          transaction.discount > 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        -{formatMoney(transaction.discount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Tax
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatMoney(transaction.tax)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total
                      </p>
                      <p className="text-base font-bold text-gray-900 dark:text-white">
                        {formatMoney(transaction.total)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-sm p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <Package className="h-4 w-4" />
                    Items Purchased ({transaction.saleIds?.length || 0})
                  </h4>
                  <div className="space-y-3">
                    {transaction.saleIds?.length > 0 ? (
                      transaction.saleIds?.map((item, index) => (
                        <div
                          key={item._id || index}
                          className="border border-gray-200 dark:border-gray-700 rounded p-3 bg-white dark:bg-gray-800"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {item.productName}
                              </p>
                              <AdminCopySKU productSku={item.sku} />
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {formatMoney(item.unitPrice)} x {item.quantity}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Total: {formatMoney(item.total)}
                              </p>
                            </div>
                          </div>

                          {/* Profit & Margin - Only show if has permission */}
                          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                            {canViewProfitDetails && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Profit:
                                </span>
                                <span className="ml-2 text-green-600 dark:text-green-400 font-medium">
                                  {formatMoney(item.profit)}
                                </span>
                              </div>
                            )}
                            {canViewMarginDetails &&
                              item.total > 0 &&
                              item.profit > 0 && (
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Margin:
                                  </span>
                                  <span className="ml-2 text-blue-600 dark:text-blue-400 font-medium">
                                    {calculateMargin(item.total, item.profit)}%
                                  </span>
                                </div>
                              )}
                            {canViewCostDetails && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Cost:
                                </span>
                                <span className="ml-2 text-gray-700 dark:text-gray-300 font-medium">
                                  {formatMoney(item.costPrice || 0)}
                                </span>
                              </div>
                            )}
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Payment:
                              </span>
                              <span className="ml-2 capitalize text-gray-700 dark:text-gray-300">
                                {item.paymentMethod}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                        <Package className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No items linked to this transaction
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          This is a payment-only transaction
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Customer & Payment Info */}
              <div className="space-y-4">
                {/* Customer Info */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-sm p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <User className="h-4 w-4" />
                    Customer Information
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Name
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {transaction.customerName || "Walk-in Customer"}
                      </p>
                    </div>
                    {transaction.customerPhone && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Phone
                        </p>
                        <div className="flex items-center gap-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatPhoneDisplay(transaction.customerPhone)}
                          </p>
                          <button
                            onClick={() =>
                              handleCopy(transaction.customerPhone, "Phone")
                            }
                            className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                    {transaction.customerEmail && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Email
                        </p>
                        <div className="flex items-center gap-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white break-all">
                            {transaction.customerEmail}
                          </p>
                          <button
                            onClick={() =>
                              handleCopy(transaction.customerEmail, "Email")
                            }
                            className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Details */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-sm p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <CreditCard className="h-4 w-4" />
                    Payment Details
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Method:
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-gray-100 dark:bg-gray-700">
                          {getPaymentMethodIcon(transaction.paymentMethod)}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {transaction.paymentMethod}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status:
                      </span>
                      {getStatusBadge(
                        transaction.paymentStatus || transaction.status,
                      )}
                    </div>

                    {/* ✅ ADDED: M-Pesa Specific Payment Details */}
                    {isMpesaPayment && canViewMpesa && (
                      <>
                        {transaction.mpesaReceipt && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Receipt:
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {transaction.mpesaReceipt}
                              </span>
                              <button
                                onClick={() =>
                                  handleCopy(
                                    transaction.mpesaReceipt,
                                    "Receipt",
                                  )
                                }
                                className="p-0.5 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        )}
                        {transaction.mpesaPhone && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Phone:
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatPhoneDisplay(transaction.mpesaPhone)}
                            </span>
                          </div>
                        )}
                        {transaction.mpesaAmount && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              M-Pesa Amount:
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatMoney(transaction.mpesaAmount)}
                            </span>
                          </div>
                        )}
                      </>
                    )}

                    {/* Cash Payment Summary */}
                    {isCashPayment && transaction.amountGiven > 0 && (
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Amount Given:
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatMoney(transaction.amountGiven)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Transaction Total:
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatMoney(transaction.total)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Change Given:
                          </span>
                          <span
                            className={`text-sm font-medium ${
                              transaction.change > 0
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-green-600 dark:text-green-400"
                            }`}
                          >
                            {formatMoney(transaction.change)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Total Profit - Only show if has permission */}
                    {canViewProfitDetails && (
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Total Profit:
                          </span>
                          <span className="text-base font-bold text-green-600 dark:text-green-400">
                            {formatMoney(transaction.totalProfit)}
                          </span>
                        </div>
                        {canViewMarginDetails &&
                          transaction.total > 0 &&
                          transaction.totalProfit > 0 && (
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Margin:
                              </span>
                              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                {calculateMargin(
                                  transaction.total,
                                  transaction.totalProfit,
                                )}
                                %
                              </span>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Transaction Meta */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-sm p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <Calendar className="h-4 w-4" />
                    Transaction Info
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Sold By
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {transaction.soldBy?.name ||
                          transaction.soldBy?.email ||
                          "Unknown"}
                      </p>
                    </div>
                    {transaction.notes && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Notes
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white whitespace-pre-wrap">
                          {transaction.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ✅ ADDED: Refund Section */}
                {canRefund &&
                  transaction.paymentStatus === "paid" &&
                  transaction.status === "completed" && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-sm p-4 border border-orange-200 dark:border-orange-700">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2 uppercase tracking-wider">
                        <RefreshCw className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        Refund
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        Process a refund for this transaction
                      </p>
                      <button
                        onClick={handleRefund}
                        disabled={isRefunding}
                        className="w-full px-4 py-2 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 rounded-sm transition-colors uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isRefunding ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4" />
                            Refund Transaction
                          </>
                        )}
                      </button>
                    </div>
                  )}
              </div>
            </div>

            {/* Profit Summary - Only show if has permission */}
            {canViewProfitDetails && transaction.saleIds?.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-sm p-4 border border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
                      <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                      Profit Summary
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Breakdown of profits from this transaction
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatMoney(transaction.totalProfit)}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Total Profit
                    </p>
                    {canViewMarginDetails && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        Margin:{" "}
                        {calculateMargin(
                          transaction.total,
                          transaction.totalProfit,
                        )}
                        %
                      </p>
                    )}
                  </div>
                </div>

                {/* Item-wise Profit Breakdown */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {transaction.saleIds?.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 rounded p-3 border border-gray-200 dark:border-gray-700"
                    >
                      <p
                        className="text-xs font-medium text-gray-900 dark:text-white truncate"
                        title={item.productName}
                      >
                        {item.productName}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Profit
                        </span>
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                          {formatMoney(item.profit)}
                        </span>
                      </div>
                      {canViewMarginDetails && (
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Margin
                          </span>
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                            {calculateMargin(item.total, item.profit)}%
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Qty: {item.quantity}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Total: {formatMoney(item.total)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Access Message */}
            {!canViewProfitDetails && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-sm p-4 border border-gray-200 dark:border-gray-700 text-center">
                <DollarSign className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  You don't have permission to view profit information
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-white dark:bg-gray-800">
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <span>
                  Transaction ID:{" "}
                  {transaction.transactionId || transaction._id.slice(-12)}
                </span>
                {transaction.mpesaReceipt && canViewMpesa && (
                  <>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <span className="flex items-center gap-1">
                      <Receipt className="h-3 w-3" />
                      Receipt: {transaction.mpesaReceipt}
                    </span>
                  </>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-sm transition-colors uppercase tracking-wider"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 rounded-sm transition-colors flex items-center gap-2 uppercase tracking-wider"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </button>
                <button
                  onClick={() => {
                    const receiptData = {
                      transactionId:
                        transaction.transactionId || transaction._id,
                      date: formatDate(transaction.createdAt),
                      customer: transaction.customerName || "Walk-in Customer",
                      total: formatMoney(transaction.total),
                      paymentMethod: transaction.paymentMethod,
                      items: transaction.saleIds?.length || 0,
                      ...(isCashPayment && {
                        amountGiven: formatMoney(transaction.amountGiven),
                        change: formatMoney(transaction.change),
                      }),
                      ...(isMpesaPayment &&
                        canViewMpesa && {
                          mpesaReceipt: transaction.mpesaReceipt,
                          mpesaPhone: formatPhoneDisplay(
                            transaction.mpesaPhone || transaction.customerPhone,
                          ),
                        }),
                    };
                    console.log("Receipt data:", receiptData);
                    // Create downloadable JSON
                    const dataStr = JSON.stringify(receiptData, null, 2);
                    const dataUri =
                      "data:application/json;charset=utf-8," +
                      encodeURIComponent(dataStr);
                    const exportFileDefaultName = `receipt-${transaction.transactionId || transaction._id.slice(-8)}.json`;
                    const linkElement = document.createElement("a");
                    linkElement.setAttribute("href", dataUri);
                    linkElement.setAttribute("download", exportFileDefaultName);
                    linkElement.click();
                    toast.success("Receipt exported successfully");
                  }}
                  className="px-4 py-2 text-xs font-medium text-white bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600 rounded-sm transition-colors flex items-center gap-2 uppercase tracking-wider"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsModal;
