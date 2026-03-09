import { AlertCircle } from "lucide-react"

const DeleteModal = ({ setShowDeleteModal, selectedUser, handleDeleteUser, deleteUserMutation }) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-6 max-w-md w-full shadow-xl">
                <div className="flex items-center mb-4">
                    <AlertCircle className="text-red-600 dark:text-red-400 mr-3" size={24} />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Delete User
                    </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Are you sure you want to delete <strong className="text-gray-900 dark:text-white">{selectedUser.firstName} {selectedUser.lastName}</strong> ({selectedUser.email})? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setShowDeleteModal(false)}
                        className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-sm transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDeleteUser}
                        disabled={deleteUserMutation.isPending}
                        className="px-4 py-2.5 bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white rounded-sm transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {deleteUserMutation.isPending ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Deleting...
                            </>
                        ) : 'Delete User'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DeleteModal