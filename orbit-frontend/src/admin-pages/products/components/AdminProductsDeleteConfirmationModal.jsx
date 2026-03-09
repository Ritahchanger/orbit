import { AlertCircle } from "lucide-react";

const AdminProductsDeleteConfirmationModal = ({
  setShowDeleteModal,
  setSelectedProduct,
  selectedProduct,
  handleDeleteProduct,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-light border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="text-center">
          <div className="bg-red-100 dark:bg-red-500/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-heading font-semibold text-gray-900 dark:text-white mb-2">
            Delete Gaming Device
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to delete{" "}
            <span className="text-gray-900 dark:text-white font-medium">
              {selectedProduct?.name}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => handleDeleteProduct(selectedProduct?.id)}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              Delete Device
            </button>
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedProduct(null);
              }}
              className="px-6 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductsDeleteConfirmationModal;
