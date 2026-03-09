import { Package, Plus, Minus } from "lucide-react";

const AdminUpdateProductStockModal = ({
  handleCloseStockModal,
  updatingProduct,
  categories,
  setOperation,
  operation,
  stockAmount,
  setStockAmount,
  handleUpdateStock,
  updateStockMutation,
  getStatusColor,
}) => {

  const handleStockAmountChange = (e) => {
    const value = e.target.value;

    if (value === "") {
      setStockAmount("");
      return;
    }

    const parsedValue = parseInt(value, 10);

    if (!isNaN(parsedValue) && parsedValue >= 0) {
      setStockAmount(parsedValue);
    }
  };

  const numericStockAmount = stockAmount === "" ? 0 : Number(stockAmount);

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-sm shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-blue-600 dark:text-blue-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Update Stock
              </h2>
            </div>
            <button
              onClick={handleCloseStockModal}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>

          {/* Product Info */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {updatingProduct.name}
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <code className="bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded text-xs text-gray-800 dark:text-gray-300">
                    {updatingProduct.sku}
                  </code>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Current Stock:
                    </span>
                    <span className="ml-2 text-gray-900 dark:text-white font-medium">
                      {updatingProduct.quantity} units
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Min Stock:
                    </span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {updatingProduct.minStock} units
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Status:
                    </span>
                    <span
                      className={`ml-2 ${getStatusColor(updatingProduct.status)}`}
                    >
                      {updatingProduct.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Category:
                    </span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {
                        categories.find(
                          (c) => c.id === updatingProduct.category,
                        )?.name
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stock Update Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                Operation
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setOperation("increment")}
                  className={`py-2 rounded-sm border transition-colors ${
                    operation === "increment"
                      ? "bg-green-100 dark:bg-green-600/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-500/30"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Add Stock</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setOperation("decrement")}
                  className={`py-2 rounded-sm border transition-colors ${
                    operation === "decrement"
                      ? "bg-red-100 dark:bg-red-600/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/30"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Minus className="h-4 w-4" />
                    <span>Reduce Stock</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setOperation("set")}
                  className={`py-2 rounded-sm border transition-colors ${
                    operation === "set"
                      ? "bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-500/30"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Package className="h-4 w-4" />
                    <span>Set Stock</span>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                {operation === "increment"
                  ? "Add Amount"
                  : operation === "decrement"
                    ? "Reduce Amount"
                    : "Set Stock To"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={stockAmount}
                  onChange={handleStockAmountChange}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter amount"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  units
                </div>
              </div>

              {/* Quick action buttons */}
              <div className="flex gap-2 mt-3">
                {[10, 50, 100].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setStockAmount(amount)}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-sm hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700"
                  >
                    {operation === "increment"
                      ? `+${amount}`
                      : operation === "decrement"
                        ? `-${amount}`
                        : amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Result Preview */}
            {numericStockAmount > 0 && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-sm border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    New Stock:
                  </span>
                  <span
                    className={`text-lg font-bold ${
                      operation === "decrement" &&
                      updatingProduct.quantity - numericStockAmount <
                        updatingProduct.minStock
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {operation === "increment"
                      ? updatingProduct.quantity + numericStockAmount
                      : operation === "decrement"
                        ? Math.max(
                            0,
                            updatingProduct.quantity - numericStockAmount,
                          )
                        : numericStockAmount}{" "}
                    units
                  </span>
                </div>
                {operation === "decrement" &&
                  updatingProduct.quantity - numericStockAmount <
                    updatingProduct.minStock && (
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                      ⚠️ This will put the product below minimum stock level
                    </p>
                  )}
                {operation === "set" &&
                  numericStockAmount < updatingProduct.minStock && (
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                      ⚠️ Setting below minimum stock level
                    </p>
                  )}
              </div>
            )}

            {/* Warning for low stock */}
            {updatingProduct.quantity <= updatingProduct.minStock &&
              operation !== "increment" && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/30 rounded-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-600 dark:text-yellow-400">
                      ⚠
                    </span>
                    <span className="text-sm text-yellow-700 dark:text-yellow-300">
                      Product is currently at or below minimum stock level
                    </span>
                  </div>
                </div>
              )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={handleCloseStockModal}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpdateStock}
              disabled={
                updateStockMutation.isPending || numericStockAmount <= 0
              }
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-sm flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateStockMutation.isPending ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Package className="h-4 w-4" />
                  {operation === "increment"
                    ? "Add Stock"
                    : operation === "decrement"
                      ? "Reduce Stock"
                      : "Set Stock"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUpdateProductStockModal;
