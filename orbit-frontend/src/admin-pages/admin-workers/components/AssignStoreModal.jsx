const AssignStoreModal = ({selectedUser,storeData,setStoreData,setShowAssignStoreModal,handleAssignStore,assignStoreToUserMutation}) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-6 max-w-md w-full shadow-xl">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Assign Store to User
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Assigning store to <strong className="text-gray-900 dark:text-white">{selectedUser.firstName} {selectedUser.lastName}</strong>
                </p>
                
                <div className="space-y-4">
                    {/* Store ID Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Store ID
                        </label>
                        <input
                            type="text"
                            value={storeData.storeId}
                            onChange={(e) => setStoreData(prev => ({ ...prev, storeId: e.target.value }))}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                            placeholder="Enter store ID"
                        />
                    </div>

                    {/* Permissions Checkboxes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Permissions
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(storeData.permissions).map(([key, value]) => (
                                <label 
                                    key={key} 
                                    className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-sm cursor-pointer transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        checked={value}
                                        onChange={(e) => setStoreData(prev => ({
                                            ...prev,
                                            permissions: { ...prev.permissions, [key]: e.target.checked }
                                        }))}
                                        className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                                        {key.replace('can', 'Can ')}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => {
                            setShowAssignStoreModal(false);
                            setStoreData({
                                storeId: '',
                                permissions: {
                                    canView: true,
                                    canEdit: false,
                                    canSell: false,
                                    canManage: false
                                }
                            });
                        }}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-sm transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAssignStore}
                        disabled={!storeData.storeId || assignStoreToUserMutation.isPending}
                        className="px-4 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-sm transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {assignStoreToUserMutation.isPending ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Assigning...
                            </span>
                        ) : 'Assign Store'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AssignStoreModal