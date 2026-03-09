import { useState, useEffect } from "react";

const CashPaymentModal = ({
  isOpen,
  onClose,
  totalAmount,
  onConfirm,
  formatCurrency,
}) => {
  const [amountGiven, setAmountGiven] = useState("");
  const [change, setChange] = useState(0);
  const [error, setError] = useState("");

  // Calculate change when amount given changes
  useEffect(() => {
    if (amountGiven && !isNaN(amountGiven)) {
      const given = parseFloat(amountGiven);
      const total = parseFloat(totalAmount);
      const calculatedChange = given - total;

      if (calculatedChange < 0) {
        setError(
          `Insufficient amount. Need ${formatCurrency(Math.abs(calculatedChange))} more`,
        );
        setChange(0);
      } else {
        setError("");
        setChange(calculatedChange);
      }
    } else {
      setError("");
      setChange(0);
    }
  }, [amountGiven, totalAmount, formatCurrency]);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setAmountGiven("");
      setChange(0);
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!amountGiven || isNaN(amountGiven)) {
      setError("Please enter a valid amount");
      return;
    }

    const given = parseFloat(amountGiven);
    if (given < totalAmount) {
      setError(
        `Insufficient amount. Need ${formatCurrency(totalAmount - given)} more`,
      );
      return;
    }

    onConfirm({
      amountGiven: given,
      change: change,
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative bg-white dark:bg-gray-800 rounded-sm shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Cash Payment
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Total Amount Display */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-sm border border-blue-100 dark:border-blue-800">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Amount Due
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(totalAmount)}
            </div>
          </div>

          {/* Amount Given Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount Received
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">KES</span>
              </div>
              <input
                type="number"
                value={amountGiven}
                onChange={(e) => setAmountGiven(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-14 pr-4 py-3 text-2xl font-semibold border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                autoFocus
                min="0"
                step="1"
              />
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>

          {/* Change Display */}
          {change > 0 && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-sm border border-green-100 dark:border-green-800">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Change to Give
              </div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(change)}
              </div>
            </div>
          )}

          {/* Quick Amount Buttons */}
          <div className="mb-6">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quick Amounts
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[100, 500, 1000, 2000, 5000, 10000].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setAmountGiven(amount.toString())}
                  className={`py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                    amountGiven === amount.toString()
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {formatCurrency(amount)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-sm transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!amountGiven || change < 0}
            className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-sm transition-colors font-medium"
          >
            Confirm Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default CashPaymentModal;
