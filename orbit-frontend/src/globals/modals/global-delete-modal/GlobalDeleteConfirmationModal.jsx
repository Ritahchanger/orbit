// src/admin-pages/products/components/GlobalDeleteConfirmationModal.jsx
import { AlertTriangle, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { closeDeleteModal, setDeleteModalLoading } from '../slices/delete-modal-slice';
const GlobalDeleteConfirmationModal = () => {
    const dispatch = useDispatch();
    const deleteModal = useSelector(state => state.deleteModal);

    const handleClose = () => {
        dispatch(closeDeleteModal());
    };

    const handleConfirm = async () => {
        if (!deleteModal.onConfirm) return;

        try {
            dispatch(setDeleteModalLoading(true));
            await deleteModal.onConfirm();
            dispatch(closeDeleteModal());
        } catch (error) {
            console.error('Delete failed:', error);
            dispatch(setDeleteModalLoading(false));
        }
    };

    if (!deleteModal.isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-md bg-dark rounded-sm border border-gray-800 shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-800">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="text-red-500" size={24} />
                            <h2 className="text-xl font-bold text-white">{deleteModal.title}</h2>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-gray-800 rounded-sm transition"
                            disabled={deleteModal.isLoading}
                        >
                            <X size={20} className="text-gray-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="mb-6">
                            <p className="text-gray-300 mb-4">
                                {deleteModal.message}
                            </p>
                            {deleteModal.itemName && (
                                <div className="bg-gray-900/50 rounded-sm p-4 mb-4">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {deleteModal.itemName.charAt(0)}
                                        </div>
                                        <div className="ml-3">
                                            <div className="text-sm font-medium text-white">
                                                {deleteModal.itemName}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {deleteModal.itemType}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-red-900/20 border border-red-700 rounded-sm p-3">
                                <p className="text-sm text-red-300">
                                    <AlertTriangle className="inline mr-1" size={14} />
                                    This action cannot be undone. All associated data will be permanently removed.
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={handleClose}
                                disabled={deleteModal.isLoading}
                                className="px-4 py-2 border border-gray-700 text-gray-300 rounded-sm hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {deleteModal.cancelButtonText}
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={deleteModal.isLoading}
                                className="px-4 py-2 bg-red-600 text-white rounded-sm hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {deleteModal.isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle size={16} />
                                        {deleteModal.confirmButtonText}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalDeleteConfirmationModal;