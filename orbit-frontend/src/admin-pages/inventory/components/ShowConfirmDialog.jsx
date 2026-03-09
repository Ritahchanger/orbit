const ShowConfirmDialog = ({
  confirmAction,
  quantity,
  setQuantity,
  handleConfirmedAction,
  getConfirmationMessage,
  closeConfirmDialog,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm max-w-md w-full shadow-lg">
        <div className="p-6">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {confirmAction === "restock" && "Confirm Restock"}
            {confirmAction === "sell" && "Confirm Sale"}
            {confirmAction === "delete" && "Confirm Removal"}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            {getConfirmationMessage()}
          </p>

          {/* Quantity selector for restock/sell */}
          {(confirmAction === "restock" || confirmAction === "sell") && (
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-2 uppercase tracking-wider">
                Quantity
              </label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white rounded-sm text-sm font-medium transition-colors border border-gray-300 dark:border-gray-600"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-20 px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm text-center text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  min="1"
                />
                <button
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white rounded-sm text-sm font-medium transition-colors border border-gray-300 dark:border-gray-600"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={closeConfirmDialog}
              className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-white rounded-sm text-xs md:text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmedAction}
              className={`px-4 py-2 text-white rounded-sm text-xs md:text-sm font-medium transition-colors ${
                confirmAction === "restock"
                  ? "bg-green-600 hover:bg-green-700"
                  : confirmAction === "sell"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {confirmAction === "restock" && "Add Stock"}
              {confirmAction === "sell" && "Record Sale"}
              {confirmAction === "delete" && "Remove Item"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowConfirmDialog;
