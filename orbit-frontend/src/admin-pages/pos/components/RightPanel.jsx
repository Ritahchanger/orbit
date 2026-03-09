import { User, CreditCard, Receipt } from "lucide-react";
import { useDispatch } from "react-redux";
import { paymentMethods } from "../modals/payments.methods";
const RightPanel = ({
  displayCustomerName,
  isMultiSessionMode,
  currentSessionId,
  displayCustomerPhone,
  setSessionCustomerPhone,
  setSessionCustomerName,
  setShowCashModal,
  setShowMPesaModal,
  displayPaymentMethod,
  formatCurrency,
  closePosModal,
  handleProcessPayment,
  isPaymentValid,
  isProcessingPayment,
  displayTotal,
  setCustomerName,
  setPaymentMethod,
  setCustomerPhone
}) => {
  const dispatch = useDispatch();
  return (
    <div className="w-96 flex flex-col overflow-y-scroll">
      {/* Customer Information */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <User size={18} />
          Customer Information
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={displayCustomerName}
              onChange={(e) => {
                if (isMultiSessionMode && currentSessionId) {
                  dispatch(
                    setSessionCustomerName({
                      sessionId: currentSessionId,
                      customerName: e.target.value,
                    }),
                  );
                } else {
                  dispatch(setCustomerName(e.target.value));
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Enter customer name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={displayCustomerPhone}
              onChange={(e) => {
                if (isMultiSessionMode && currentSessionId) {
                  dispatch(
                    setSessionCustomerPhone({
                      sessionId: currentSessionId,
                      customerPhone: e.target.value,
                    }),
                  );
                } else {
                  dispatch(setCustomerPhone(e.target.value));
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="0712 345 678"
            />
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <CreditCard size={18} />
          Payment Method
        </h3>

        <div className="grid grid-cols-3 gap-2">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => {
                dispatch(setPaymentMethod(method.id));
                if (method.id === "mpesa") {
                  if (displayCart.length === 0) {
                    toast.error("Add items to cart first");
                    return;
                  }
                  setShowMPesaModal(true);
                }
                // Add this for cash method
                if (method.id === "cash") {
                  if (displayCart.length === 0) {
                    toast.error("Add items to cart first");
                    return;
                  }
                  // if (!displayCustomerName.trim()) {
                  //   toast.error("Please enter customer name first");
                  //   return;
                  // }
                  setShowCashModal(true);
                }
              }}
              className={`p-3 rounded-sm border transition-all relative ${
                displayPaymentMethod === method.id
                  ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400"
                  : "bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600"
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl">{method.icon}</span>
                <span className="text-xs font-medium">{method.name}</span>
              </div>
              {method.id === "mpesa" && (
                <div className="absolute -top-1 -right-1">
                  <kbd className="px-1.5 py-0.5 text-xs bg-blue-500 text-white rounded-sm">
                    ⇧P
                  </kbd>
                </div>
              )}
              {/* Add shortcut for cash */}
              {/* {method.id === "cash" && (
                        <div className="absolute -top-1 -right-1">
                          <kbd className="px-1.5 py-0.5 text-xs bg-green-500 text-white rounded-sm">
                            Ctrl+C
                          </kbd>
                        </div>
                      )} */}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/30">
        <div className="space-y-3">
          <button
            onClick={handleProcessPayment}
            disabled={!isPaymentValid() || isProcessingPayment}
            className="w-full py-3 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessingPayment ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                <Receipt size={20} />
                Process Payment - {formatCurrency(displayTotal)}
              </>
            )}
          </button>

          <button
            onClick={() => dispatch(closePosModal())}
            className="w-full py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-sm transition-colors"
          >
            Cancel Sale
          </button>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
