import { Store, CheckCircle, ChevronDown } from "lucide-react"

const StoresSection = ({ userRole, userStores, handlePrimaryStoreChange, selectedStoreId }) => {
    return (
        <>
            {(userRole === 'admin' || userRole === 'superadmin') && userStores.length > 0 && (
                <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                                <Store className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Stores</h3>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {userStores.length} store(s)
                                </span>
                                {userStores.length > 3 && (
                                    <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-sm">
                                        Scroll to view all
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Store list container with conditional scroll */}
                        <div className={`space-y-3 ${userStores.length > 5 ? 'max-h-102 overflow-y-auto ' : ''}`}>
                            {userStores.map((storeItem) => {
                                const store = storeItem.storeId || storeItem;
                                const isPrimary = storeItem.isPrimary || selectedStoreId === store._id;

                                return (
                                    <div
                                        key={store._id}
                                        className={`p-4 rounded-sm border ${isPrimary ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-500/5' : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'} ${userStores.length > 5 ? 'mr-1' : ''}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className={`p-2 rounded-sm ${isPrimary ? 'bg-blue-100 dark:bg-blue-500/20' : 'bg-gray-200 dark:bg-gray-800'}`}>
                                                    <Store className={`w-4 h-4 ${isPrimary ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="font-medium text-gray-900 dark:text-white truncate">{store.name}</h4>
                                                    <div className="flex items-center space-x-2 mt-1 flex-wrap gap-1">
                                                        <span className="text-xs bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                                            {store.code}
                                                        </span>
                                                        <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                                            {store.location || 'No location'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                                                {isPrimary ? (
                                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs rounded-sm flex items-center whitespace-nowrap">
                                                        <CheckCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                                                        Primary
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handlePrimaryStoreChange(store._id)}
                                                        className="px-3 py-1 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-sm transition whitespace-nowrap"
                                                    >
                                                        Set as Primary
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Scroll indicator for mobile */}
                        {userStores.length > 5 && (
                            <div className="mt-4 pt-3 border-t border-gray-300 dark:border-gray-800">
                                <div className="flex items-center justify-center">
                                    <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-500">
                                        <ChevronDown className="w-3 h-3 animate-bounce" />
                                        <span>Scroll to see more stores</span>
                                        <ChevronDown className="w-3 h-3 animate-bounce" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

export default StoresSection