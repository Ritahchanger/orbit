import { Settings, Clock, Download, Shield, AlertCircle } from "lucide-react";
import { useState } from "react";
import DeleteConfirmationModal from "./DeleteProfileModal";

const QuickActionsCard = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    l;
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Account deleted");
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Settings className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </h3>
          </div>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition flex items-center justify-between group">
              <span>View Activity Log</span>
              <Clock className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition flex items-center justify-between group">
              <span>Export Data</span>
              <Download className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition flex items-center justify-between group">
              <span>Privacy Settings</span>
              <Shield className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full text-left px-4 py-3 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-sm text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition flex items-center justify-between group"
            >
              <span>Delete Account</span>
              <AlertCircle className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>
      </div>
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="Are you absolutely sure you want to delete your account? This will permanently remove all your data, settings, and transaction history."
        confirmText="Delete Account"
        cancelText="Keep Account"
        isLoading={isDeleting}
      />
    </>
  );
};

export default QuickActionsCard;
