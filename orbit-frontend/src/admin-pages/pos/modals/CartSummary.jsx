import { useDispatch } from "react-redux";
const CartSummary = ({
  displaySubtotal,
  displayDiscount,
  isMultiSessionMode,
  currentSessionId,
  setSessionDiscount,
  setDiscount,
  displayTotal,
  formatCurrency,
}) => {
  const dispatch = useDispatch();
  return (
    <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-800/30">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatCurrency(displaySubtotal)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Discount
          </span>
          <div className="relative w-32">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">KES</span>
            </div>

            <input
              type="number"
              min="0"
              max={displaySubtotal}
              value={displayDiscount || ""}
              onChange={(e) => {
                if (isMultiSessionMode && currentSessionId) {
                  dispatch(
                    setSessionDiscount({
                      sessionId: currentSessionId,
                      discount: e.target.value,
                    }),
                  );
                } else {
                  dispatch(setDiscount(e.target.value));
                }
              }}
              className="w-full pl-12 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-right"
              placeholder="0"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-gray-300 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900 dark:text-white">
              Total
            </span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(displayTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
