import { AlertTriangle, X, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom"; // Add this import

import { useDeleteUserMutation } from "../../hooks/users.hook";
import { useAuth } from "../../../context/authentication/AuthenticationContext";

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Account",
  message = "Are you sure you want to delete your account? This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  isDanger = true,
  isLoading = false,
}) => {
  const [confirmInput, setConfirmInput] = useState("");
  const [showConfirmInput, setShowConfirmInput] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const deleteUserMutation = useDeleteUserMutation();

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (showConfirmInput && confirmInput !== "DELETE") {
      return;
    }

    setIsDeleting(true);

    try {
      // Call the provided onConfirm prop first (if any)
      if (onConfirm) {
        await onConfirm();
      }

      // Delete the user account
      await deleteUserMutation.mutateAsync(user?.id);

      // Logout the user
      await logout();

      // Redirect to login page or home
      navigate("/login", {
        replace: true,
        state: { message: "Your account has been successfully deleted." },
      });
    } catch (error) {
      console.error("Failed to delete account:", error);
      // You might want to show an error toast here
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop with blur effect */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={isLoading || isDeleting ? null : onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div
          className="relative bg-white dark:bg-gray-800 rounded-sm shadow-2xl max-w-md w-full mx-auto transform transition-all animate-in fade-in zoom-in duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 dark:bg-red-500/10 rounded-sm">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading || isDeleting}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">{message}</p>

              {/* Warning Box */}
              <div className="bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-sm p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">
                    <p className="font-medium mb-1">
                      This action is permanent!
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-yellow-600 dark:text-yellow-400">
                      <li>All your personal data will be erased</li>
                      <li>You will lose access to your account</li>
                      <li>You will be logged out immediately</li>
                      <li>This cannot be reversed</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Confirmation Input (Optional - for extra safety) */}
              {showConfirmInput && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Type <span className="font-mono font-bold">DELETE</span> to
                    confirm
                  </label>
                  <input
                    type="text"
                    value={confirmInput}
                    onChange={(e) => setConfirmInput(e.target.value)}
                    placeholder="DELETE"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    autoFocus
                    disabled={isDeleting}
                  />
                </div>
              )}

              {/* Toggle confirmation input */}
              {!showConfirmInput && !isDeleting && (
                <button
                  onClick={() => setShowConfirmInput(true)}
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline"
                >
                  Require confirmation text for extra safety
                </button>
              )}

              {/* Deleting message */}
              {isDeleting && (
                <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  Deleting your account and logging out...
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl">
            <button
              onClick={onClose}
              disabled={isLoading || isDeleting}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={
                isLoading ||
                isDeleting ||
                (showConfirmInput && confirmInput !== "DELETE")
              }
              className={`px-4 py-2 text-sm font-medium text-white rounded-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 ${
                isDanger
                  ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                  : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
              }`}
            >
              {(isLoading || isDeleting) && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              <span>
                {isDeleting
                  ? "Deleting..."
                  : isLoading
                    ? "Processing..."
                    : confirmText}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default DeleteConfirmationModal;
