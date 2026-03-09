import { Building, Globe, Check, Home } from "lucide-react"
const ModalFooter = ({ selectedStore, handleCancel, handleConfirmSelection }) => {
    return (
        <div className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-300 dark:border-gray-700 p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                        {selectedStore ? (
                            <>
                                <Building className="h-5 w-5 text-green-600 dark:text-green-400" />
                                <span className="font-medium text-gray-900 dark:text-white">
                                    Selected: <span className="text-blue-600 dark:text-blue-400">{selectedStore.name}</span>
                                </span>
                            </>
                        ) : (
                            <>
                                <Globe className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-400">
                                    Click on Global View or select a specific store
                                </span>
                            </>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        You can change this selection anytime from the top navigation bar
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleCancel}
                        className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-sm transition-colors flex items-center gap-2 font-medium"
                    >
                        <Home className="h-4 w-4" />
                        Back to Home
                    </button>
                    <button
                        onClick={handleConfirmSelection}
                        disabled={!selectedStore}
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
                    >
                        <Check className="h-4 w-4" />
                        {selectedStore ? `Enter ${selectedStore.name}` : 'Select a Store'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ModalFooter