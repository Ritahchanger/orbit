import { useState, useEffect, useRef } from "react";

import {
  X,
  Phone,
  Loader,
  CheckCircle,
  AlertCircle,
  Shield,
  Smartphone,
  Receipt,
} from "lucide-react";

import { toast } from "react-hot-toast";

import salesApi from "../../../services/sales-api";

const MPesaPaymentModal = ({
  isOpen,
  onClose,
  totalAmount,
  customerName,
  customerPhone: initialPhone,
  storeId,
  soldBy,
  saleIds = [],
  cartItems = [],
  onSuccess,
  onError,
  formatCurrency,
  wsClientId, // WebSocket client ID from parent
}) => {
  const [phoneNumber, setPhoneNumber] = useState(initialPhone || "");
  const [isValidPhone, setIsValidPhone] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [mpesaCheckoutId, setMpesaCheckoutId] = useState(null);
  const [transactionMongoId, setTransactionMongoId] = useState(null);
  const [transactionCustomId, setTransactionCustomId] = useState(null);
  const [websocketTimeout, setWebsocketTimeout] = useState(false);

  const wsRef = useRef(null);
  const wsConnectedRef = useRef(false);
  const websocketTimeoutRef = useRef(null);
  const transactionIdRef = useRef(null); // ✅ REF to persist across reconnections

  // ============ FIXED WebSocket Setup - NO paymentStatus dependency ============
  useEffect(() => {
    if (!isOpen) return;

    const clientIdParam = wsClientId ? `?clientId=${wsClientId}` : "";
    const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:5000";

    console.log("🔌 Connecting WebSocket:", `${WS_URL}${clientIdParam}`);

    wsRef.current = new WebSocket(`${WS_URL}${clientIdParam}`);

    wsRef.current.onopen = () => {
      console.log("✅ WebSocket connected:", wsClientId);
      wsConnectedRef.current = true;
      setWebsocketTimeout(false);
    };

    wsRef.current.onmessage = (message) => {
      try {
        const parsed = JSON.parse(message.data);
        console.log("📨 WebSocket message:", parsed);

        // Reset timeout on any message
        setWebsocketTimeout(false);
        if (websocketTimeoutRef.current) {
          clearTimeout(websocketTimeoutRef.current);
          websocketTimeoutRef.current = null;
        }

        if (parsed.event === "mpesa_status") {
          handleWebSocketStatus(parsed.data);
        }
      } catch (err) {
        console.error("❌ WS message parse error:", err);
      }
    };

    wsRef.current.onclose = () => {
      console.log("🔌 WebSocket disconnected");
      wsConnectedRef.current = false;
    };

    wsRef.current.onerror = (err) => {
      console.error("❌ WebSocket error:", err);
      wsConnectedRef.current = false;
    };

    return () => {
      console.log("🧹 Cleaning up WebSocket");
      wsRef.current?.close();
      wsConnectedRef.current = false;

      if (websocketTimeoutRef.current) {
        clearTimeout(websocketTimeoutRef.current);
        websocketTimeoutRef.current = null;
      }
    };
  }, [isOpen, wsClientId]); // ✅ REMOVED paymentStatus dependency!

  // ============ SEPARATE Effect for timeout ============
  useEffect(() => {
    if (paymentStatus === "pending" && !wsConnectedRef.current) {
      websocketTimeoutRef.current = setTimeout(() => {
        setWebsocketTimeout(true);
        toast.error(
          "Still waiting for payment confirmation. Please check your phone.",
        );
      }, 30000);
    }

    return () => {
      if (websocketTimeoutRef.current) {
        clearTimeout(websocketTimeoutRef.current);
        websocketTimeoutRef.current = null;
      }
    };
  }, [paymentStatus]); // ✅ Only depends on paymentStatus

  // ============ FIXED Handle WebSocket Status Updates ============
  const handleWebSocketStatus = (data) => {
    const { status, transactionId, mpesaCheckoutId: wsCheckoutId } = data;

    console.log("📊 WebSocket status update:", {
      status,
      transactionId,
      mpesaCheckoutId: wsCheckoutId,
      currentTransactionId: transactionMongoId,
      currentCheckoutId: mpesaCheckoutId,
      refTransactionId: transactionIdRef.current,
    });

    // ✅ CRITICAL: Store transactionId in ref immediately when received
    if (transactionId && !transactionIdRef.current) {
      transactionIdRef.current = transactionId;
    }

    // ✅ FIXED: Always process success messages - use ref as fallback
    if (status === "success") {
      console.log(
        "✅ Processing success message - transaction ID:",
        transactionId || transactionIdRef.current,
      );

      // Get the transaction ID from message, state, or ref
      const mongoId =
        transactionId || transactionMongoId || transactionIdRef.current;

      if (!mongoId) {
        console.error("❌ No transaction ID available!");
        return;
      }

      // Save to state if we got it from ref/message
      if (!transactionMongoId && mongoId) {
        setTransactionMongoId(mongoId);
      }

      // Save checkout ID if we don't have it yet
      if (!mpesaCheckoutId && wsCheckoutId) {
        setMpesaCheckoutId(wsCheckoutId);
      }

      handlePaymentSuccess({
        ...data,
        transactionId: mongoId, // ✅ Pass the ID explicitly
      });
      return;
    }

    // For other statuses, check if this message is for our transaction
    const isOurTransaction =
      (transactionMongoId && transactionId === transactionMongoId) ||
      (mpesaCheckoutId && wsCheckoutId === mpesaCheckoutId) ||
      (transactionIdRef.current &&
        transactionId === transactionIdRef.current) ||
      (!transactionMongoId && !mpesaCheckoutId);

    if (!isOurTransaction) {
      console.log("⏭️ Ignoring - different transaction", {
        ourTransactionId: transactionMongoId,
        receivedTransactionId: transactionId,
        ourCheckoutId: mpesaCheckoutId,
        receivedCheckoutId: wsCheckoutId,
        refTransactionId: transactionIdRef.current,
      });
      return;
    }

    // Process other statuses
    switch (status) {
      case "initiating":
        console.log("🔄 Payment initiating...");
        setPaymentStatus("initiating");
        break;

      case "stk_sent":
        console.log("📱 STK Push sent to customer");
        setPaymentStatus("pending");

        // Save checkout ID if we don't have it yet
        if (!mpesaCheckoutId && wsCheckoutId) {
          setMpesaCheckoutId(wsCheckoutId);
        }

        // Store transaction ID in ref if we have it
        if (transactionId && !transactionIdRef.current) {
          transactionIdRef.current = transactionId;
        }
        break;

      case "failed":
        console.log("❌ Payment failed via WebSocket");
        handlePaymentFailed(data);
        break;

      case "completed":
        console.log("🎉 Transaction completed via WebSocket");
        if (data.transactionNumber) {
          setTransactionCustomId(data.transactionNumber);
        }
        break;

      default:
        console.log("ℹ️ Unknown status:", status);
    }
  };

  // ============ Phone Validation ============
  const validatePhone = async (phone) => {
    try {
      const response = await salesApi.validatePhone({ phone });
      return response.data?.isValid || false;
    } catch (error) {
      console.error("Phone validation failed:", error);
      return false;
    }
  };

  useEffect(() => {
    const checkPhoneValidity = async () => {
      if (phoneNumber.trim()) {
        const isValid = await validatePhone(phoneNumber);
        setIsValidPhone(isValid);
      } else {
        setIsValidPhone(false);
      }
    };

    const timeoutId = setTimeout(checkPhoneValidity, 500);
    return () => clearTimeout(timeoutId);
  }, [phoneNumber]);

  // ============ Initiate STK Push ============
  const initiateSTKPush = async () => {
    if (!isValidPhone) {
      toast.error("Please enter a valid Kenyan phone number");
      return;
    }

    if (!storeId) {
      toast.error("Store ID is required");
      return;
    }

    if (!customerName) {
      toast.error("Customer name is required");
      return;
    }

    setIsProcessing(true);
    setPaymentStatus("initiating");
    setWebsocketTimeout(false);

    try {
      const paymentData = {
        phone: phoneNumber,
        amount: totalAmount,
        customerName: customerName,
        storeId: storeId,
        soldBy: soldBy,
        saleIds: saleIds,
        notes: `POS Sale - ${cartItems.length} items`,
        clientId: wsClientId,
      };

      const response = await salesApi.initiatePayment(paymentData);

      console.log("📤 M-Pesa initiation response:", response);

      if (response.success) {
        const { data } = response;

        // ✅ Store in BOTH state AND ref for persistence
        setTransactionMongoId(data.transactionId);
        transactionIdRef.current = data.transactionId; // ✅ CRITICAL: Store in ref
        setMpesaCheckoutId(data.mpesaCheckoutId);

        console.log("🔔 Waiting for WebSocket notification...");
        console.log(
          "💾 Stored transaction ID in ref:",
          transactionIdRef.current,
        );

        toast.success(
          "STK Push sent! Check your phone for the M-Pesa prompt.",
          {
            duration: 5000,
            icon: "📱",
          },
        );
      } else {
        throw new Error(response.message || "Failed to initiate payment");
      }
    } catch (error) {
      console.error("❌ STK Push Error:", error);
      setPaymentStatus("failed");
      toast.error(error.message || "Failed to initiate M-Pesa payment");
      onError?.(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // ============ FIXED Handle Payment Success ============
  // In MPesaPaymentModal.jsx - handlePaymentSuccess
  const handlePaymentSuccess = async (paymentData) => {
    const mongoId =
      paymentData.transactionId ||
      transactionMongoId ||
      transactionIdRef.current;

    if (!mongoId) {
      console.error("❌ Missing transaction MongoDB ID");
      toast.error("Transaction ID missing. Please contact support.");
      return;
    }

    setPaymentStatus("success");

    try {
      console.log("🔄 Completing transaction with items:", cartItems.length);

      // Send the ACTUAL cart items to create sales records
      const completeResponse = await salesApi.completeTransaction({
        transactionId: mongoId,
        // Send cart items instead of empty saleIds
        items: cartItems.map((item) => ({
          sku: item.sku,
          quantity: item.quantity,
          unitPrice: item.price,
          discount: item.discount || 0,
        })),
        storeId,
        customerName,
        customerPhone: phoneNumber,
        mpesaReceipt: paymentData.mpesaReceipt,
        mpesaCheckoutId,
        soldBy,
        transactionSummary: {
          itemsCount: cartItems.length,
          subtotal: totalAmount,
          discount: 0,
          tax: 0,
          total: totalAmount,
          totalProfit: 0,
        },
        clientId: wsClientId,
      });

      console.log("✅ Transaction completed with sales:", completeResponse);

      const customTxnId = completeResponse.data?.transactionId;
      setTransactionCustomId(customTxnId);

      onSuccess?.({
        transactionId: mongoId,
        mpesaCheckoutId,
        mpesaReceipt: paymentData.mpesaReceipt,
        amount: paymentData.amount || totalAmount,
        phone: paymentData.phone || phoneNumber,
        transactionCustomId: customTxnId,
        saleIds: completeResponse.data?.saleIds,
      });

      toast.success("✅ Payment successful! Transaction completed.");
    } catch (error) {
      console.error("❌ Failed to complete transaction:", error);
      toast.error("Payment received but failed to complete transaction");
      onError?.(error);
    }
  };
  // ============ Handle Payment Failed ============
  const handlePaymentFailed = (errorData) => {
    setPaymentStatus("failed");

    // Clear timeout
    if (websocketTimeoutRef.current) {
      clearTimeout(websocketTimeoutRef.current);
      websocketTimeoutRef.current = null;
    }

    const errorMessage = salesApi.getStatusDescription(
      parseInt(errorData.ResultCode || errorData.resultCode),
    );

    toast.error(`❌ Payment failed: ${errorMessage}`);
    onError?.(new Error(errorMessage));
  };

  // ============ Handle Manual Status Check (Fallback) ============
  const checkStatusManually = async () => {
    if (!mpesaCheckoutId) return;

    try {
      toast.loading("Checking payment status...", { id: "status-check" });
      const response = await salesApi.getTransaction(mpesaCheckoutId);

      if (response.success) {
        const { paymentStatus, mpesaReceipt } = response.data;

        if (paymentStatus === "paid") {
          toast.dismiss("status-check");
          handlePaymentSuccess({
            mpesaReceipt,
            amount: totalAmount,
          });
        } else if (paymentStatus === "failed") {
          toast.dismiss("status-check");
          setPaymentStatus("failed");
        } else {
          toast.dismiss("status-check");
          toast.info("Payment still pending. Please check your phone.");
        }
      }
    } catch (error) {
      toast.dismiss("status-check");
      toast.error("Failed to check status");
    }
  };

  // ============ Cleanup on unmount ============
  useEffect(() => {
    return () => {
      if (websocketTimeoutRef.current) {
        clearTimeout(websocketTimeoutRef.current);
        websocketTimeoutRef.current = null;
      }
    };
  }, []);

  // ============ Handle Modal Close ============
  const handleClose = () => {
    if (websocketTimeoutRef.current) {
      clearTimeout(websocketTimeoutRef.current);
      websocketTimeoutRef.current = null;
    }

    setPaymentStatus(null);
    setMpesaCheckoutId(null);
    setTransactionMongoId(null);
    setTransactionCustomId(null);
    setWebsocketTimeout(false);
    transactionIdRef.current = null; // ✅ Clear ref on close

    onClose();
  };

  // ============ Render Status UI ============
  const renderStatus = () => {
    switch (paymentStatus) {
      case "initiating":
        return (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-emerald-200 rounded-sm animate-spin mb-6"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader className="w-10 h-10 text-emerald-600 animate-pulse" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Initiating Payment
            </h3>
            <p className="text-gray-700 dark:text-gray-300 font-medium text-lg">
              Connecting to M-Pesa...
            </p>
            {wsConnectedRef.current && (
              <p className="text-xs text-emerald-600 mt-2">
                🔌 WebSocket connected
              </p>
            )}
          </div>
        );

      case "pending":
        return (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="relative mb-6">
              <div className="w-28 h-28 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-sm flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-pulse">
                <Smartphone className="w-14 h-14 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              📱 Check Your Phone
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-center text-lg mb-4 max-w-md">
              We've sent an{" "}
              <strong className="text-emerald-600">STK Push</strong> to
            </p>
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-sm mb-6">
              <span className="text-xl font-bold tracking-wider">
                {phoneNumber}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              📱 Please enter your M-Pesa PIN to complete the payment
            </p>

            {/* WebSocket Status */}
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
              {wsConnectedRef.current ? (
                <span className="text-emerald-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  🔌 Live updates enabled
                </span>
              ) : websocketTimeout ? (
                <span className="text-yellow-600 flex items-center gap-1">
                  ⚠️ Connection lost -
                  <button
                    onClick={checkStatusManually}
                    className="underline hover:no-underline"
                  >
                    check status
                  </button>
                </span>
              ) : (
                <span className="text-yellow-600 flex items-center gap-1">
                  ⏳ Waiting for connection...
                </span>
              )}
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Checkout: {mpesaCheckoutId?.slice(-8)}
            </p>
          </div>
        );

      case "success":
        return (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="relative mb-6">
              <div className="w-28 h-28 bg-gradient-to-br from-green-500 to-green-600 rounded-sm flex items-center justify-center shadow-lg shadow-green-500/30">
                <CheckCircle className="w-16 h-16 text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              ✅ Payment Successful!
            </h3>
            <div className="text-center mb-6">
              <p className="text-4xl font-bold text-green-600 mb-2">
                {formatCurrency(totalAmount)}
              </p>
              <p className="text-gray-600 dark:text-gray-400">received from</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {phoneNumber}
              </p>
            </div>
            {transactionCustomId && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Transaction: {transactionCustomId}
              </p>
            )}
            <button
              onClick={handleClose}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-sm hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
            >
              Close
            </button>
          </div>
        );

      case "failed":
        return (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="relative mb-6">
              <div className="w-28 h-28 bg-gradient-to-br from-red-500 to-red-600 rounded-sm flex items-center justify-center shadow-lg shadow-red-500/30">
                <AlertCircle className="w-16 h-16 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              ❌ Payment Failed
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
              Unable to process payment. Please try again or use another payment
              method.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setPaymentStatus(null);
                  setMpesaCheckoutId(null);
                  setTransactionMongoId(null);
                  setTransactionCustomId(null);
                  setWebsocketTimeout(false);
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-sm hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
              >
                Try Again
              </button>
              <button
                onClick={handleClose}
                className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/10"
        onClick={paymentStatus === "pending" ? undefined : handleClose}
      />

      {/* Modal Container */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-sm overflow-hidden shadow-2xl border border-gray-300 dark:border-gray-700">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-sm">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">M-Pesa Payment</h2>
                  <p className="text-emerald-100 text-sm">
                    Total: {formatCurrency(totalAmount)} • {cartItems.length}{" "}
                    items
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={paymentStatus === "pending"}
                className="p-1 hover:bg-white/20 rounded-sm transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {paymentStatus ? (
              renderStatus()
            ) : (
              <>
                {/* Customer Info */}
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Customer
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {customerName || "Walk-in Customer"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Items
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {cartItems.length} items
                    </span>
                  </div>
                </div>

                {/* Phone Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    M-Pesa Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🇰🇪</span>
                        <span className="text-gray-700 dark:text-gray-300 font-bold">
                          +254
                        </span>
                      </div>
                    </div>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-20 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      placeholder="712 345 678"
                      autoFocus
                    />
                    {phoneNumber && isValidPhone && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-5 h-5 bg-emerald-500 rounded-sm flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  {phoneNumber && !isValidPhone && (
                    <p className="mt-2 text-sm text-red-600">
                      Please enter a valid Kenyan phone number
                    </p>
                  )}
                </div>

                {/* Payment Details */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-sm">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    Payment Details
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Amount
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Service Fee
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(0)}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          Total
                        </span>
                        <span className="text-xl font-bold text-emerald-600">
                          {formatCurrency(totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={initiateSTKPush}
                    disabled={!isValidPhone || isProcessing}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Smartphone className="w-5 h-5" />
                        <span>Send STK Push</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleClose}
                    className="w-full py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span className="text-gray-600 dark:text-gray-400">
                  Secure Payment • Encrypted
                </span>
              </div>
              <div className="text-gray-500 dark:text-gray-400">
                Powered by Safaricom M-Pesa
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MPesaPaymentModal;
