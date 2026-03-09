import { useState, useEffect } from "react";
import {
  X,
  AlertCircle,
  CheckCircle,
  Receipt,
  ArrowLeftRight,
  DollarSign,
  Loader,
  RotateCcw,
  Printer,
} from "lucide-react";
import { toast } from "react-hot-toast";

import {
  useCashRefund,
  useMpesaRefund,
  useBankRefund,
} from "../../hooks/useRefund";

import { refundReasons } from "./data";

const CashRefundModal = ({
  isOpen,
  onClose,
  transaction,
  formatCurrency,
  formatDate,
  onRefundComplete,
  canProcessRefund = true,
}) => {
  // ✅ FIX: Early return BEFORE any hooks
  if (!isOpen || !transaction) {
    return null;
  }

  // ✅ All hooks come AFTER the early return
  const [refundMethod, setRefundMethod] = useState("cash");
  const [refundReason, setRefundReason] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [isPartialRefund, setIsPartialRefund] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [refundStatus, setRefundStatus] = useState(null);
  const [refundReceipt, setRefundReceipt] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [returnToStock, setReturnToStock] = useState(true);
  const [notes, setNotes] = useState("");

  const cashRefund = useCashRefund();
  const mpesaRefund = useMpesaRefund();
  const bankRefund = useBankRefund();

  const getRefundMutation = () => {
    switch (refundMethod) {
      case "cash":
        return cashRefund;
      case "mpesa":
        return mpesaRefund;
      case "bank":
        return bankRefund;
      default:
        return cashRefund;
    }
  };

  const { mutate, isPending, error } = getRefundMutation();

  useEffect(() => {
    if (isPending) {
      setIsProcessing(true);
      setRefundStatus("processing");
    }
  }, [isPending]);

  useEffect(() => {
    if (error) {
      setIsProcessing(false);
      setRefundStatus("failed");
      toast.error(error.message || "Refund failed");
    }
  }, [error]);

  // Reset state when modal opens or transaction changes
  useEffect(() => {
    if (isOpen && transaction) {
      setRefundAmount(transaction.total?.toString() || "0");
      setRefundStatus(null);
      setRefundReceipt(null);
      setIsPartialRefund(false);
      setSelectedItems([]);
      setRefundReason("");
      setNotes("");
    }
  }, [isOpen, transaction]);

  // Calculate refund amount based on selected items
  useEffect(() => {
    if (isPartialRefund && selectedItems.length > 0) {
      const total = selectedItems.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0,
      );
      setRefundAmount(total.toString());
    }
  }, [selectedItems, isPartialRefund]);

  // Rest of your component remains exactly the same...
  const isCashPayment = transaction.paymentMethod === "cash";
  const maxRefundAmount = transaction.total || 0;
  const refundAmountNum = parseFloat(refundAmount) || 0;

  // ✅ Fixed validation logic
  const isValidRefund =
    refundAmountNum > 0 &&
    refundAmountNum <= maxRefundAmount &&
    refundReason.trim() !== "";

  // Refund reasons presets

  // Add this after your refundReasons array (around line 120)
  const getReasonEnumValue = (displayReason) => {
    const reasonMap = {
      "Customer returned item(s)": "customer_return",
      "Damaged product": "damaged_product",
      "Wrong item shipped": "wrong_item",
      "Customer changed mind": "customer_cancellation",
      "Duplicate transaction": "duplicate_transaction",
      "Technical error": "technical_error",
      "Quality issue": "quality_issue",
      "Missing items": "missing_items",
      other: "other", // ✅ ADD THIS
    };
    return reasonMap[displayReason] || "other";
  };

  // Handle full refund - ✅ Added safe check for items
  const handleFullRefund = () => {
    setRefundAmount(maxRefundAmount.toString());
    setIsPartialRefund(false);
    if (transaction.items && Array.isArray(transaction.items)) {
      setSelectedItems(transaction.items);
    }
  };

  // Handle item selection for partial refund
  const toggleItemSelection = (item) => {
    if (selectedItems.find((i) => i.sku === item.sku)) {
      setSelectedItems(selectedItems.filter((i) => i.sku !== item.sku));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  // REPLACE the entire processRefund function (lines 160-238) with this:
  const processRefund = () => {
    // Validation
    if (!isValidRefund) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate method-specific requirements
    if (refundMethod === "mpesa") {
      const phone = transaction.customerPhone || transaction.mpesaPhone;
      if (!phone) {
        toast.error("Customer phone number is required for M-Pesa refund");
        return;
      }
    }

    if (refundMethod === "bank") {
      toast.error("Please use the Bank Refund modal for bank transfers");
      return;
    }

    // Prepare data for mutation - MATCHING YOUR API EXPECTATIONS
    const refundData = {
      transactionId: transaction._id,
      amount: refundAmountNum,
      method: refundMethod,
      reason: getReasonEnumValue(refundReason),
      ...(refundReason === "other" && { reasonText: notes.trim() }),
      notes: notes.trim(),
      items: selectedItems.map((item) => ({
        saleId: item.saleId,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      returnToStock,
    };

    // Add method-specific fields
    if (refundMethod === "mpesa") {
      refundData.mpesaPhone =
        transaction.customerPhone || transaction.mpesaPhone;
    }

    if (refundMethod === "cash" && transaction.cashReceivedBy) {
      refundData.cashReceivedBy = transaction.cashReceivedBy;
    }

    // Execute mutation
    // ✅ CORRECT - Call with individual parameters
    cashRefund.mutate(
      refundData.transactionId, // 1st param: transactionId
      refundData.amount, // 2nd param: amount
      refundData.reason, // 3rd param: reason
      refundData.items, // 4th param: items
      {
        // 5th param: options object
        returnToStock: refundData.returnToStock,
        notes: refundData.notes,
        cashReceivedBy: refundData.cashReceivedBy,
        onSuccess: (data) => {
          setRefundReceipt(data.data?.refund?.refundId);
          setRefundStatus("success");
          onRefundComplete?.(data.data);
        },
        onError: (err) => {
          console.error("Refund failed:", err);
          setRefundStatus("failed");
        },
      },
    );
  };

  // Print refund receipt
  const printReceipt = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Refund Receipt - ${refundReceipt}</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .details { margin-bottom: 20px; }
            .amount { font-size: 24px; color: #10b981; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Refund Receipt</h1>
            <h2>${refundReceipt}</h2>
            <p>${new Date().toLocaleString()}</p>
          </div>
          <div class="details">
            <p><strong>Original Transaction:</strong> ${transaction.transactionId || transaction._id}</p>
            <p><strong>Refund Amount:</strong> <span class="amount">${formatCurrency(refundAmountNum)}</span></p>
            <p><strong>Reason:</strong> ${refundReason}</p>
            <p><strong>Method:</strong> ${refundMethod.toUpperCase()}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Status renderer
  const renderStatus = () => {
    switch (refundStatus) {
      case "processing":
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Processing Refund
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we process the refund...
            </p>
          </div>
        );

      case "success":
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
              Refund Successful!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Refund amount: {formatCurrency(refundAmountNum)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              Receipt: {refundReceipt}
            </p>
            <div className="flex gap-3">
              <button
                onClick={printReceipt}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-sm flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print Receipt
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-sm"
              >
                Close
              </button>
            </div>
          </div>
        );

      case "failed":
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
              Refund Failed
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Unable to process refund. Please try again.
            </p>
            <button
              onClick={() => setRefundStatus(null)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-sm flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  // Safe check for items
  const hasItems =
    transaction.items &&
    Array.isArray(transaction.items) &&
    transaction.items.length > 0;

  return (
    <div className="fixed inset-0 z-[1000] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 dark:bg-black/80"
        onClick={refundStatus === "processing" ? null : onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 w-full max-w-3xl rounded-sm shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-800 dark:to-orange-900 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-sm">
                  <ArrowLeftRight className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Process Refund</h2>
                  <p className="text-orange-100 text-sm flex items-center gap-2">
                    <Receipt className="w-4 h-4" />
                    Transaction:{" "}
                    {transaction.transactionId || transaction._id.slice(-8)}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={refundStatus === "processing"}
                className="p-1 hover:bg-white/20 rounded-sm transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {refundStatus ? (
              renderStatus()
            ) : (
              <div className="space-y-6">
                {/* Transaction Summary */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-sm">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-orange-600" />
                    Original Transaction Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Date:
                      </span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {formatDate(transaction.createdAt)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Customer:
                      </span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {transaction.customerName || "Walk-in Customer"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Payment:
                      </span>
                      <span className="ml-2 font-medium capitalize text-gray-900 dark:text-white">
                        {transaction.paymentMethod}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Original Amount:
                      </span>
                      <span className="ml-2 font-bold text-gray-900 dark:text-white">
                        {formatCurrency(transaction.total)}
                      </span>
                    </div>
                    {transaction.mpesaReceipt && (
                      <div className="col-span-2">
                        <span className="text-gray-500 dark:text-gray-400">
                          M-Pesa Receipt:
                        </span>
                        <span className="ml-2 font-medium text-green-600 dark:text-green-400">
                          {transaction.mpesaReceipt}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Refund Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Refund Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        handleFullRefund();
                        setIsPartialRefund(false);
                      }}
                      className={`p-3 border rounded-sm text-left transition-all ${
                        !isPartialRefund
                          ? "bg-orange-50 dark:bg-orange-900/30 border-orange-500"
                          : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <span className="font-medium text-gray-900 dark:text-white">
                        Full Refund
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Refund entire transaction amount
                      </p>
                    </button>
                    <button
                      onClick={() => setIsPartialRefund(true)}
                      className={`p-3 border rounded-sm text-left transition-all ${
                        isPartialRefund
                          ? "bg-orange-50 dark:bg-orange-900/30 border-orange-500"
                          : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <span className="font-medium text-gray-900 dark:text-white">
                        Partial Refund
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Refund specific items or amount
                      </p>
                    </button>
                  </div>
                </div>

                {/* Items Selection (for partial refund) - ✅ FIXED with safe check */}
                {isPartialRefund && hasItems && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Items to Refund
                    </label>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-sm max-h-48 overflow-y-auto">
                      {transaction.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedItems.some(
                                (i) => i.sku === item.sku,
                              )}
                              onChange={() => toggleItemSelection(item)}
                              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            />
                            <div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {item.productName || `SKU: ${item.sku}`}
                              </span>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Qty: {item.quantity} ×{" "}
                                {formatCurrency(item.unitPrice)}
                              </p>
                            </div>
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Return to Stock Option */}
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="returnToStock"
                        checked={returnToStock}
                        onChange={(e) => setReturnToStock(e.target.checked)}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <label
                        htmlFor="returnToStock"
                        className="text-sm text-gray-700 dark:text-gray-300"
                      >
                        Return items to inventory
                      </label>
                    </div>
                  </div>
                )}

                {/* Refund Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Refund Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={refundAmount}
                      onChange={(e) => {
                        setRefundAmount(e.target.value);
                        if (parseFloat(e.target.value) < maxRefundAmount) {
                          setIsPartialRefund(true);
                        }
                      }}
                      min="0"
                      max={maxRefundAmount}
                      step="0.01"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Maximum refund: {formatCurrency(maxRefundAmount)}
                    </p>
                    {refundAmountNum > maxRefundAmount && (
                      <p className="text-xs text-red-600">
                        Amount exceeds transaction total
                      </p>
                    )}
                  </div>
                </div>

                {/* Refund Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Refund Method <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setRefundMethod("cash")}
                      className={`p-3 border rounded-sm text-center transition-all ${
                        refundMethod === "cash"
                          ? "bg-green-50 dark:bg-green-900/30 border-green-500"
                          : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <span className="block font-medium text-gray-900 dark:text-white">
                        💵 Cash
                      </span>
                    </button>
                    <button
                      onClick={() => setRefundMethod("bank")}
                      className={`p-3 border rounded-sm text-center transition-all ${
                        refundMethod === "bank"
                          ? "bg-green-50 dark:bg-green-900/30 border-green-500"
                          : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <span className="block font-medium text-gray-900 dark:text-white">
                        🏦 Bank
                      </span>
                    </button>
                    {/* <button
                      onClick={() => setRefundMethod("mpesa")}
                      className={`p-3 border rounded-sm text-center transition-all ${
                        refundMethod === "mpesa"
                          ? "bg-green-50 dark:bg-green-900/30 border-green-500"
                          : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <span className="block font-medium text-gray-900 dark:text-white">
                        📱 M-Pesa
                      </span>
                    </button> */}
                  </div>
                </div>

                {/* Refund Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Refund Reason <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">Select a reason</option>
                    {refundReasons.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Add any additional information about this refund..."
                  />
                </div>

                {/* Warning for non-cash refunds */}
                {refundMethod !== "cash" && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-sm p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                          {refundMethod === "bank" ? "Bank Transfer" : "M-Pesa"}{" "}
                          Refund
                        </h4>
                        <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                          {refundMethod === "bank"
                            ? "Bank transfers may take 1-3 business days to process."
                            : "M-Pesa refunds will be sent to the customer's registered mobile number."}
                        </p>
                        {refundMethod === "mpesa" && (
                          <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400 mt-2">
                            Phone:{" "}
                            {transaction.customerPhone ||
                              transaction.mpesaPhone ||
                              "Not available"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {!refundStatus && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium">Refund Amount:</span>
                  <span className="ml-2 text-lg font-bold text-orange-600 dark:text-orange-400">
                    {formatCurrency(refundAmountNum)}
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={processRefund}
                    disabled={!isValidRefund || isProcessing}
                    className="px-6 py-2 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-medium rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ArrowLeftRight className="w-4 h-4" />
                        Process Refund
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CashRefundModal;
