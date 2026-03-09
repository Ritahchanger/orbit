import { Building, Check } from "lucide-react"
const Stores = ({ stores, handleStoreSelect, selectedStore }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.map((store) => (
                <div
                    key={store._id}
                    onClick={() => handleStoreSelect(store)}
                    className={`p-5 border-2 rounded-sm cursor-pointer transition-all duration-200 hover:shadow-lg ${selectedStore?._id === store._id
                        ? 'border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500/30'
                        : 'border-gray-300 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-gray-800'
                        }`}
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-lg ${selectedStore?._id === store._id
                                ? 'bg-blue-100 dark:bg-blue-800'
                                : 'bg-gray-100 dark:bg-gray-700'
                                }`}>
                                <Building className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">{store.name}</h4>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Code: {store.code || 'N/A'}</p>
                            </div>
                        </div>
                        {selectedStore?._id === store._id && (
                            <div className="p-1 bg-blue-500 rounded-full">
                                <Check className="h-4 w-4 text-white" />
                            </div>
                        )}
                    </div>

                    {store.location && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-2">
                            <span>📍</span>
                            <span className="truncate">{store.location}</span>
                        </div>
                    )}

                    {store.status && (
                        <div className="flex items-center justify-between mt-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${store.status === 'active'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                }`}>
                                {store.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                Click to select
                            </span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

export default Stores