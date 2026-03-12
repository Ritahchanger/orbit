import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import CashPaymentModal from "./CashpaymentModal";
import { X, ShoppingCart, Building, Plus, Users } from "lucide-react";

import { toast } from "react-hot-toast";

import debounce from "lodash/debounce";

import {
  closePosModal,
  setCustomerName,
  setCustomerPhone,
  setPaymentMethod,
  setDiscount,
  setNotes,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  addToCart,
  createNewSession,
  switchSession,
  closeSession,
  addToSessionCart,
  updateSessionCartItemQuantity,
  removeFromSessionCart,
  clearSessionCart,
  setSessionCustomerName,
  setSessionCustomerPhone,
  setSessionDiscount,
} from "../slice/pos-slice";

import { useStoreInventory } from "../../hooks/store-inventory.queries";

import { useStoreContext } from "../../../context/store/StoreContext";

import CartItems from "./CartItems";

import { useRecordMultipleSale } from "../../hooks/sales.hooks";

import { useAuth } from "../../../context/authentication/AuthenticationContext";

import MPesaPaymentModal from "./mpesa/MpesaPaymentModal";

import ClearCartModal from "./ClearCartItems";

import POSSessionManager from "../POSsessionManager";

import salesApi from "../../services/sales-api";

import CartSummary from "./CartSummary";

import RightPanel from "../components/RightPanel";

import ReceiptPDF from "../components/ReceiptPDF";
import SearchBar from "../components/SearchBar";

const POSPaymentModal = () => {
  const [wsClientId, setWsClientId] = useState(null);
  const dispatch = useDispatch();

  const {
    cart,
    isPosModalOpen,
    customerName,
    customerPhone,
    paymentMethod,
    discount,
    notes,
    subtotal,
    total,
    activeSessions,
    currentSessionId,
    sessions,
    maxSessions,
  } = useSelector((state) => state.pos);

  const {
    mutate: recordMultipleSale,
    isLoading: isProcessingPayment,
    error: paymentError,
  } = useRecordMultipleSale();

  const [showCashModal, setShowCashModal] = useState(false);
  const [cashPaymentDetails, setCashPaymentDetails] = useState(null);

  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);

  const [showMPesaModal, setShowMPesaModal] = useState(false);
  const [showClearCartModal, setShowClearCartModal] = useState(false);
  const [isMultiSessionMode, setIsMultiSessionMode] = useState(false);
  const [showSessionManager, setShowSessionManager] = useState(true);

  const { storeId, currentStore } = useStoreContext();
  const [skuSearch, setSkuSearch] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const searchInputRef = useRef(null);
  const searchResultsRef = useRef(null);

  // Fetch inventory for search
  const {
    data: searchData,
    isLoading: isSearching,
    refetch: searchProducts,
  } = useStoreInventory(
    storeId,
    {
      search: skuSearch || undefined,
      limit: 10,
      page: 1,
    },
    {
      enabled: false,
      keepPreviousData: true,
    },
  );

  const { user } = useAuth();

  // Initialize WebSocket client ID
  useEffect(() => {
    setWsClientId(
      `pos-client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    );
  }, []);

  // Check if multi-session mode should be enabled
  useEffect(() => {
    // Enable multi-session if there are active sessions
    setIsMultiSessionMode(activeSessions.length > 0);
  }, [activeSessions]);

  // Get current session data (if in multi-session mode)
  const currentSession = currentSessionId ? sessions[currentSessionId] : null;

  // Use session data or single session data
  const displayCart = currentSession ? currentSession.cart : cart;
  const displayCustomerName = currentSession
    ? currentSession.customerName
    : customerName;
  const displayCustomerPhone = currentSession
    ? currentSession.customerPhone
    : customerPhone;
  const displayPaymentMethod =
    isMultiSessionMode && currentSession
      ? currentSession.paymentMethod
      : paymentMethod;
  const displayDiscount =
    isMultiSessionMode && currentSession ? currentSession.discount : discount;
  const displaySubtotal =
    isMultiSessionMode && currentSession ? currentSession.subtotal : subtotal;
  const displayTotal =
    isMultiSessionMode && currentSession ? currentSession.total : total;
  const displayNotes =
    isMultiSessionMode && currentSession ? currentSession.notes : notes;

  // Handle creating a new session
  const handleCreateNewSession = () => {
    if (!user || !currentStore) {
      toast.error("Please login and select a store first");
      return;
    }

    if (activeSessions.length >= maxSessions) {
      toast.error(`Maximum ${maxSessions} sessions allowed`);
      return;
    }

    dispatch(
      createNewSession({
        storeId: currentStore._id,
        userId: user.id,
        customerName: `Customer ${activeSessions.length + 1}`,
      }),
    );

    toast.success(
      `New session created (${activeSessions.length + 1}/${maxSessions})`,
    );
  };

  // Handle switching sessions
  const handleSwitchSession = (sessionId) => {
    dispatch(switchSession(sessionId));
    toast.success(`Switched to session`);
  };

  // Debounced search function
  const debouncedSearch = useRef(
    debounce((searchTerm) => {
      if (searchTerm.trim().length >= 1) {
        searchProducts();
      }
    }, 300),
  ).current;

  // Handle SKU search input
  const handleSkuInputChange = (e) => {
    const value = e.target.value.toUpperCase().trim();
    setSkuSearch(value);

    if (value.length >= 1) {
      setShowSearchResults(true);
      debouncedSearch(value);
    } else {
      setShowSearchResults(false);
    }
  };

  // Handle quick add by pressing Enter
  const handleSkuKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (searchData?.data?.length > 0) {
        handleAddToCart(searchData.data[selectedProductIndex]);
        setSkuSearch("");
        setShowSearchResults(false);
      } else if (skuSearch.trim()) {
        toast.error("No product found with this SKU");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (searchData?.data?.length > 0) {
        setSelectedProductIndex((prev) =>
          Math.min(prev + 1, searchData.data.length - 1),
        );
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedProductIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Escape") {
      setShowSearchResults(false);
    }
  };

  // Add product to cart (updated for multi-session)
  // Add product to cart (FIXED for multi-session)
  const handleAddToCart = (inventoryItem) => {
    if (!inventoryItem) return;

    const product = inventoryItem.product;
    if (!product) {
      toast.error("Product information not available");
      return;
    }

    if (isMultiSessionMode && currentSessionId) {
      // Add to current session in multi-session mode
      dispatch(
        addToSessionCart({
          sessionId: currentSessionId,
          product: {
            ...product,
            inventoryId: inventoryItem._id,
            storeId: inventoryItem.store,
            currentStock: inventoryItem.stock,
          },
          quantity: 1,
        }),
      );
      toast.success(
        `Added ${product.name} to session ${currentSession?.sessionNumber}`,
      );
    } else {
      // Single session mode
      const existingItem = cart.find(
        (item) => item.product._id === product._id,
      );

      if (existingItem) {
        dispatch(
          updateCartItemQuantity({
            productId: product._id,
            quantity: existingItem.quantity + 1,
          }),
        );
        toast.success(`Added another ${product.name} to cart`);
      } else {
        dispatch(
          addToCart({
            product: {
              ...product,
              inventoryId: inventoryItem._id,
              storeId: inventoryItem.store,
              currentStock: inventoryItem.stock,
            },
            quantity: 1,
            unitPrice: product.price || product.sellingPrice || 0,
          }),
        );
        toast.success(`Added ${product.name} to cart`);
      }
    }

    // Clear search
    setSkuSearch("");
    setShowSearchResults(false);
    setSelectedProductIndex(0);

    // Focus back on search input
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "b" && isPosModalOpen) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      if (e.shiftKey && e.key === "P" && isPosModalOpen) {
        e.preventDefault();

        if (displayCart.length === 0) {
          toast.error("No items in cart to process M-Pesa payment");
          return;
        }

        dispatch(setPaymentMethod("mpesa"));
        setShowMPesaModal(true);
      }

      // NEW: Shortcut to create new session (Ctrl+N)
      if (e.ctrlKey && e.key === "n" && isPosModalOpen) {
        e.preventDefault();
        handleCreateNewSession();
      }

      if (e.shiftKey && e.key === "C" && isPosModalOpen) {
        e.preventDefault();

        if (displayCart.length === 0) {
          toast.error("No items in cart to process cash payment");
          return;
        }

        // if (!displayCustomerName.trim()) {
        //   toast.error("Please enter customer name first");
        //   return;
        // }

        dispatch(setPaymentMethod("cash"));
        setShowCashModal(true);
      }

      // NEW: Shortcut to toggle session manager (Ctrl+M)
      if (e.ctrlKey && e.key === "m" && isPosModalOpen) {
        e.preventDefault();
        setShowSessionManager(!showSessionManager);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPosModalOpen, displayCart.length, customerName, dispatch]);

  // Click outside to close search results
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchResultsRef.current &&
        !searchResultsRef.current.contains(e.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResults = searchData?.data || [];

  if (!isPosModalOpen) return null;

  // Helper functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const handleIncrement = (productId) => {
    if (isMultiSessionMode && currentSessionId) {
      const item = displayCart.find((item) => item.product._id === productId);
      if (item) {
        dispatch(
          updateSessionCartItemQuantity({
            sessionId: currentSessionId,
            productId,
            quantity: item.quantity + 1,
          }),
        );
      }
    } else {
      const item = cart.find((item) => item.product._id === productId);
      if (item) {
        dispatch(
          updateCartItemQuantity({
            productId,
            quantity: item.quantity + 1,
          }),
        );
      }
    }
  };

  const handleDecrement = (productId) => {
    if (isMultiSessionMode && currentSessionId) {
      const item = displayCart.find((item) => item.product._id === productId);
      if (item && item.quantity > 1) {
        dispatch(
          updateSessionCartItemQuantity({
            sessionId: currentSessionId,
            productId,
            quantity: item.quantity - 1,
          }),
        );
      }
    } else {
      const item = cart.find((item) => item.product._id === productId);
      if (item && item.quantity > 1) {
        dispatch(
          updateCartItemQuantity({
            productId,
            quantity: item.quantity - 1,
          }),
        );
      }
    }
  };

  const handleQuantityChange = (productId, value) => {
    const quantity = parseInt(value) || 0;
    if (quantity >= 0) {
      if (isMultiSessionMode && currentSessionId) {
        dispatch(
          updateSessionCartItemQuantity({
            sessionId: currentSessionId,
            productId,
            quantity,
          }),
        );
      } else {
        dispatch(updateCartItemQuantity({ productId, quantity }));
      }
    }
  };

  const handleRemoveItem = (productId) => {
    if (window.confirm("Remove item from cart?")) {
      if (isMultiSessionMode && currentSessionId) {
        dispatch(
          removeFromSessionCart({
            sessionId: currentSessionId,
            productId,
          }),
        );
      } else {
        dispatch(removeFromCart(productId));
      }
    }
  };

  const handleMpesaSuccess = async (paymentData) => {
    try {
      // First, record the sale
      const saleData = {
        storeId: currentStore?._id,
        customerName: displayCustomerName.trim(),
        customerPhone:
          paymentData.saleData?.customerPhone || displayCustomerPhone,
        paymentMethod: "mpesa",
        discount: 0,
        tax: 0,
        soldBy: user.employeeId || user.id || user._id,
        items: displayCart.map((item) => ({
          sku: item.product.sku,
          quantity: item.quantity,
          unitPrice: item.unitPrice || item.product.price || 0,
          discount: 0,
          profit:
            (item.unitPrice || item.product.price || 0) -
            (item.product.costPrice || 0),
        })),
      };

      // Record the sale
      const saleResponse = await salesApi.recordMultipleSale(saleData);

      // Extract sale IDs
      const saleIds = saleResponse.data.sales.map((sale) => sale._id);

      // Complete the M-Pesa transaction
      await salesApi.completeTransaction({
        transactionId: paymentData.transactionId,
        saleIds: saleIds,
        transactionSummary: paymentData.transactionSummary,
        clientId: wsClientId,
      });

      setLastTransaction({
        transactionId: paymentData.transactionId,
        timestamp: new Date().toISOString(),
        soldBy: user,
        customerName: displayCustomerName,
        customerPhone: displayCustomerPhone,
        paymentMethod: "mpesa",
        mpesaPayment: {
          transactionCode: paymentData.transactionId,
          phoneNumber: displayCustomerPhone,
        },
      });

      // Show receipt modal
      setShowReceipt(true);
      // ===== END OF ADDED BLOCK =====
      // Show success message
      toast.success(
        `M-Pesa payment completed! Transaction: ${paymentData.transactionId?.slice(-8)}`,
      );

      // If in multi-session mode, close the current session
      if (isMultiSessionMode && currentSessionId) {
        dispatch(closeSession(currentSessionId));
        toast.success("Session completed");
      } else {
        // Single session mode
        dispatch(clearCart());
        // dispatch(closePosModal());
      }

      setShowMPesaModal(false);
    } catch (error) {
      console.error("Error processing M-Pesa sale:", error);
      toast.error("Failed to complete transaction: " + error.message);
    }
  };

  const handleProcessPayment = async () => {
    // Validate cart and customer name (same as before)
    if (displayCart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (!displayCustomerName.trim()) {
      toast.error("Customer name is required");
      return;
    }

    if (!user) {
      toast.error("Please login to process sales");
      return;
    }

    // If payment method is cash, show cash modal
    if (displayPaymentMethod === "cash") {
      setShowCashModal(true);
      return;
    }

    // For other payment methods, proceed as before
    await processPaymentTransaction();
  };

  const processPaymentTransaction = async (cashDetails = null) => {
    try {
      // Validate cash payment if payment method is cash
      if (displayPaymentMethod === "cash" && !cashDetails) {
        throw new Error("Cash payment details are required for cash payments");
      }

      if (displayPaymentMethod === "cash" && cashDetails) {
        // Validate amount given is not less than total
        if (cashDetails.amountGiven < displayTotal) {
          throw new Error(
            `Amount given (${formatCurrency(cashDetails.amountGiven)}) is less than total (${formatCurrency(displayTotal)})`,
          );
        }

        // Validate change calculation
        const expectedChange = cashDetails.amountGiven - displayTotal;
        if (Math.abs(cashDetails.change - expectedChange) > 0.01) {
          // Allow small rounding differences
          throw new Error("Change calculation mismatch");
        }
      }

      // Prepare transaction data with cash details if available
      const transactionData = {
        storeId: currentStore?._id,
        customerName: displayCustomerName.trim(),
        customerPhone: displayCustomerPhone?.trim() || undefined,
        customerEmail: undefined,
        paymentMethod: displayPaymentMethod,
        discount: displayDiscount ? parseFloat(displayDiscount) : 0,
        tax: 0,
        notes: displayNotes?.trim() || undefined,
        soldBy: user.employeeId || user.id || user._id,
        // Add cash payment details if available
        ...(displayPaymentMethod === "cash" &&
          cashDetails && {
            cashPayment: {
              amountGiven: cashDetails.amountGiven,
              change: cashDetails.change,
            },
          }),
        items: displayCart.map((item) => {
          // Check stock availability
          if (item.product.currentStock < item.quantity) {
            throw new Error(
              `Insufficient stock for ${item.product.name}. Available: ${item.product.currentStock}`,
            );
          }

          return {
            sku: item.product.sku,
            quantity: item.quantity,
            unitPrice: item.unitPrice || item.product.price || 0,
            discount: 0,
            profit:
              (item.unitPrice || item.product.price || 0) -
              (item.product.costPrice || 0),
          };
        }),
      };

      console.log("📤 Processing transaction:", transactionData);

      // Call the mutation
      recordMultipleSale(transactionData, {
        onSuccess: (data) => {
          console.log("✅ Transaction successful:", data);
          setLastTransaction({
            transactionId:
              data.data?.transaction?.transactionId || `TRX-${Date.now()}`,
            timestamp: new Date().toISOString(),
            soldBy: user,
            customerName: displayCustomerName,
            customerPhone: displayCustomerPhone,
            paymentMethod: displayPaymentMethod,
            discount: displayDiscount ? parseFloat(displayDiscount) : 0,
            cashPayment: cashDetails
              ? {
                  amountGiven: cashDetails.amountGiven,
                  change: cashDetails.change,
                }
              : null,
            mpesaPayment: data.data?.mpesaPayment || null,
          });
          setShowReceipt(true);
          // Show success message with transaction ID
          let message;
          if (cashDetails) {
            message = `Cash payment of ${formatCurrency(displayTotal)} completed! `;
            message +=
              cashDetails.change > 0
                ? `Change: ${formatCurrency(cashDetails.change)}`
                : "Exact payment received";
            message += ` • Transaction #${data.data?.transaction?.transactionId?.slice(-8) || "completed"}`;
          } else {
            message = `Transaction #${data.data?.transaction?.transactionId?.slice(-8) || "completed"} successful!`;
          }

          toast.success(message, {
            duration: 4000,
            icon: "✅",
            description: cashDetails
              ? `Paid: ${formatCurrency(cashDetails.amountGiven)} • Change: ${formatCurrency(cashDetails.change)}`
              : `Total: ${formatCurrency(displayTotal)} • Method: ${displayPaymentMethod.toUpperCase()}`,
          });

          // If in multi-session mode, close current session
          if (isMultiSessionMode && currentSessionId) {
            dispatch(closeSession(currentSessionId));
            toast.success(
              `Session ${currentSession?.sessionNumber} completed`,
              {
                duration: 3000,
              },
            );
          } else {
            // Single session mode
            dispatch(clearCart());
            // dispatch(closePosModal());
          }

          // Reset form fields for single session
          if (!isMultiSessionMode) {
            dispatch(setCustomerName(""));
            dispatch(setCustomerPhone(""));
            dispatch(setPaymentMethod("cash"));
            dispatch(setDiscount(""));
            dispatch(setNotes(""));
            setSkuSearch("");
            setShowSearchResults(false);
          }
        },
        onError: (error) => {
          console.error("❌ Transaction failed:", error);

          // Handle specific error types
          if (error.message?.includes("Insufficient stock")) {
            toast.error(error.message, {
              duration: 5000,
              icon: "⚠️",
            });
            // Refresh inventory
            searchProducts();
          } else if (error.response?.data?.errors) {
            error.response.data.errors.forEach((err, index) => {
              toast.error(`Item ${index + 1}: ${err}`, {
                duration: 5000,
                icon: "❌",
              });
            });
          } else if (error.response?.data?.message) {
            toast.error(error.response.data.message, {
              duration: 5000,
              icon: "❌",
            });
          } else if (error.message) {
            toast.error(error.message, {
              duration: 5000,
              icon: "❌",
            });
          } else {
            toast.error("Failed to process transaction", {
              duration: 5000,
              icon: "❌",
            });
          }

          // Don't clear cart on error
          if (
            error.message?.includes("stock") ||
            error.response?.data?.message?.includes("stock")
          ) {
            toast.error("Please refresh cart items due to stock changes", {
              duration: 3000,
              icon: "🔄",
            });
          }
        },
      });
    } catch (error) {
      console.error("Validation error:", error);
      toast.error(error.message || "Failed to validate transaction data", {
        duration: 5000,
        icon: "❌",
      });
    }
  };

  const handleCashPaymentConfirm = (cashDetails) => {
    setCashPaymentDetails(cashDetails);
    setShowCashModal(false);

    // Process payment with cash details
    processPaymentTransaction(cashDetails);
  };

  const isPaymentValid = () => {
    return displayCart.length > 0 && displayCustomerName.trim() !== "";
  };

  // Session indicator component
  const SessionIndicator = () => {
    if (!isMultiSessionMode) return null;

    return (
      <div className="flex items-center gap-2 text-sm">
        <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-sm">
          <Users size={12} />
          <span>Multi-Session</span>
        </div>
        <div className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-sm">
          Session {activeSessions.indexOf(currentSessionId) + 1} of{" "}
          {activeSessions.length}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 dark:bg-black/80"
        onClick={() => dispatch(closePosModal())}
      />

      {/* Modal Container */}
      <div className="absolute inset-0 flex items-center justify-center p-0">
        <div className="bg-white dark:bg-gray-900 w-full max-w-10xl h-screen rounded-sm overflow-hidden flex flex-col shadow-2xl">
          {/* Header */}
          <div className="bg-linear-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 p-5 py-3 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-sm">
                  <ShoppingCart size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Point of Sale (POS)</h2>
                  <div className="flex items-center gap-2 text-blue-100 dark:text-blue-200 text-sm">
                    <span>
                      {displayCart.length} item
                      {displayCart.length !== 1 ? "s" : ""} in cart • Total:{" "}
                      {formatCurrency(displayTotal)}
                    </span>
                    <SessionIndicator />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Store Information */}
                <div className="flex flex-col items-end gap-1">
                  <div className="text-sm bg-white/10 px-3 py-1 rounded flex items-center gap-2">
                    <Building size={14} />
                    <span className="font-semibold">
                      {currentStore?.name || "No store selected"}
                    </span>
                  </div>
                  {currentStore && (
                    <div className="flex gap-3 text-xs text-blue-100 dark:text-blue-200">
                      <span className="bg-white/5 px-2 py-0.5 rounded">
                        📍 {currentStore.location || "Location not set"}
                      </span>
                      <span className="bg-white/5 px-2 py-0.5 rounded">
                        🏪 Store ID:{" "}
                        {currentStore.storeCode || currentStore._id?.slice(-6)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Cashier Information */}
                {user && (
                  <div className="text-sm bg-green-600/20 px-3 py-1 rounded border border-green-500/30">
                    <span className="text-green-200">Cashier: </span>
                    <span className="font-semibold text-white">
                      {user.name || user.username || user.employeeId}
                    </span>
                  </div>
                )}

                {/* New Session Button */}
                <button
                  onClick={handleCreateNewSession}
                  disabled={activeSessions.length >= maxSessions}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-sm"
                  title="New Session (Ctrl+N)"
                >
                  <Plus size={16} />
                  <span>New</span>
                </button>

                <button
                  onClick={() => dispatch(closePosModal())}
                  className="p-[0.4rem] bg-red-500 hover:bg-green-400 rounded-sm transition-colors"
                  title="Close POS"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* SKU Search Bar */}
            <SearchBar
              searchInputRef={searchInputRef}
              skuSearch={skuSearch}
              handleSkuInputChange={handleSkuInputChange}
              handleSkuKeyPress={handleSkuKeyPress}
              searchData={searchData}
              isSearching={isSearching}
              searchResults={searchResults}
              handleAddToCart={handleAddToCart}
              setSelectedProductIndex={setSelectedProductIndex}
              formatCurrency={formatCurrency}
              showSearchResults={showSearchResults}
              searchResultsRef={searchResultsRef}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-hidden flex">
            {/* Left Panel - Cart Items */}
            <div className="flex-1 border-r border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col">
              {/* Cart Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Cart Items
                </h3>
                {displayCart.length > 0 && (
                  <button
                    onClick={() => {
                      if (isMultiSessionMode && currentSessionId) {
                        dispatch(clearSessionCart(currentSessionId));
                      } else {
                        setShowClearCartModal(true);
                      }
                    }}
                    className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Cart Items */}
              <CartItems
                cart={displayCart}
                handleDecrement={handleDecrement}
                handleIncrement={handleIncrement}
                handleRemoveItem={handleRemoveItem}
                handleQuantityChange={handleQuantityChange}
                formatCurrency={formatCurrency}
              />

              {/* Cart Summary */}
              {displayCart.length > 0 && (
                <CartSummary
                  displayDiscount={displayDiscount}
                  displaySubtotal={displayTotal}
                  isMultiSessionMode={isMultiSessionMode}
                  currentSessionId={currentSessionId}
                  setSessionDiscount={setSessionDiscount}
                  setDiscount={setDiscount}
                  displayTotal={displayTotal}
                  formatCurrency={formatCurrency}
                />
              )}
            </div>

            {/* Right Panel - Customer & Payment */}
            <RightPanel
              displayCustomerName={displayCustomerName}
              isMultiSessionMode={isMultiSessionMode}
              currentSessionId={currentSessionId}
              displayCustomerPhone={displayCustomerPhone}
              setSessionCustomerPhone={setSessionCustomerPhone}
              setSessionCustomerName={setSessionCustomerName}
              setShowCashModal={setShowCashModal}
              setShowMPesaModal={setShowMPesaModal}
              displayPaymentMethod={displayPaymentMethod}
              formatCurrency={formatCurrency}
              closePosModal={closePosModal}
              handleProcessPayment={handleProcessPayment}
              isPaymentValid={isPaymentValid}
              isProcessingPayment={isProcessingPayment}
              displayTotal={displayTotal}
              setPaymentMethod={setPaymentMethod}
              setCustomerName={setCustomerName}
              setCustomerPhone={setCustomerPhone}
            />
            <ReceiptPDF
              isOpen={showReceipt}
              onClose={() => {
                setShowReceipt(false);
                setLastTransaction(null);
              }}
              transaction={lastTransaction}
              items={displayCart}
              storeDetails={currentStore}
              formatCurrency={formatCurrency}
            />
          </div>
        </div>
      </div>

      {/* Session Manager (Bottom of screen) */}
      {showSessionManager && isMultiSessionMode && (
        <div className="absolute bottom-0 left-0 right-0 z-[110]">
          <POSSessionManager />
        </div>
      )}

      {/* M-Pesa Modal */}
      <MPesaPaymentModal
        isOpen={showMPesaModal}
        onClose={() => setShowMPesaModal(false)}
        totalAmount={displayTotal}
        customerName={displayCustomerName}
        customerPhone={displayCustomerPhone}
        storeId={currentStore?._id}
        soldBy={user?.employeeId || user?.id || user?._id}
        cartItems={displayCart}
        onSuccess={handleMpesaSuccess}
        onError={(error) => {
          toast.error("M-Pesa payment failed: " + error.message);
          setShowMPesaModal(false);
        }}
        formatCurrency={formatCurrency}
        wsClientId={wsClientId}
      />

      {/* Clear Cart Modal */}
      <ClearCartModal
        isOpen={showClearCartModal}
        onClose={() => setShowClearCartModal(false)}
        onConfirm={() => dispatch(clearCart())}
        cartCount={displayCart.length}
      />

      <CashPaymentModal
        isOpen={showCashModal}
        onClose={() => setShowCashModal(false)}
        onConfirm={handleCashPaymentConfirm}
        totalAmount={displayTotal}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};

export default POSPaymentModal;
