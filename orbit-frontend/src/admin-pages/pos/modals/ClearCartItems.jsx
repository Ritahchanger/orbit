import { X, Trash2 } from "lucide-react";

const ClearCartModal = ({ isOpen, onClose, onConfirm, cartCount }) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-sm shadow-xl border border-gray-300 dark:border-gray-700">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-300 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-sm">
                <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Clear Cart
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5">
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to remove all {cartCount} item
              {cartCount !== 1 ? "s" : ""} from the cart?
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-sm transition-colors"
              >
                Clear Cart
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClearCartModal;
