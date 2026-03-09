import { Package, PlusCircle, Search, BarChart, ArrowRight, Upload } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux";
import { useAuth } from "../../../../context/authentication/AuthenticationContext";

const EmptyState = ({
    hasStore,
    isLoading,
    isError,
    inventoryItems,
    setShowQuickAddModal
}) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Don't show if loading, has error, or has no store
    if (isLoading || isError || !hasStore || inventoryItems.length > 0) {
        return null;
    }

    const { userRole } = useAuth();
    const canManageInventory = userRole === "superadmin" || userRole === "admin";

    return (
        <div className="mb-6 p-6 sm:p-8 text-center bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-gray-900/30">
            {/* Icon Section */}
            <div className="relative mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-full flex items-center justify-center mb-4">
                    <Package className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="absolute top-0 right-1/2 translate-x-[60px] sm:translate-x-[70px] w-4 h-4 sm:w-6 sm:h-6 bg-blue-500/20 dark:bg-blue-500/30 rounded-full animate-ping"></div>
            </div>
            
            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                Inventory is Empty
            </h3>
            
            {/* Description */}
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto text-sm sm:text-base leading-relaxed">
                This store doesn't have any inventory items yet. Start by adding products to manage stock, track sales, and generate reports.
            </p>

            {canManageInventory ? (
                <>
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-6">
                        <button
                            onClick={() => setShowQuickAddModal(true)}
                            className="group relative px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-sm text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2"
                        >
                            <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>Quick Add by SKU</span>
                            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <button
                            onClick={() => navigate("/admin/products")}
                            className="px-5 py-2.5 sm:px-6 sm:py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800/50 dark:hover:bg-gray-700/50 border border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white rounded-sm text-sm font-medium transition-all duration-300 hover:scale-105"
                        >
                            Browse Products
                        </button>
                    </div>

                    {/* Stats Placeholder */}
                    <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-md mx-auto p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/30 rounded-sm border border-gray-200 dark:border-gray-700/30 mb-6">
                        <div className="text-center">
                            <div className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">0</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Items</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">KES 0</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Value</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg sm:text-xl font-bold text-amber-600 dark:text-amber-400">0</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Categories</div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/10 border border-amber-200 dark:border-amber-700/30 rounded-xl p-4 mb-6">
                    <p className="text-amber-800 dark:text-amber-200 text-sm font-medium">
                        You don't have permission to add inventory items. Contact an administrator to get started.
                    </p>
                </div>
            )}

            {/* Helpful Tips */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700/50">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">QUICK TIPS</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/30 rounded-sm border border-gray-100 dark:border-gray-700/30">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <Search className="w-3 h-3 text-blue-500" />
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Quick Search</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Use the search bar to quickly find and add existing products</p>
                    </div>
                    
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/30 rounded-sm border border-gray-100 dark:border-gray-700/30">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <Upload className="w-3 h-3 text-green-500" />
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Bulk Import</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Upload CSV files to add multiple products at once</p>
                    </div>
                    
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/30 rounded-sm border border-gray-100 dark:border-gray-700/30">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <BarChart className="w-3 h-3 text-purple-500" />
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Track Everything</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Monitor stock levels, sales performance, and profit margins</p>
                    </div>
                </div>
            </div>

            {/* View All Products Link */}
            <div className="mt-6">
                <button
                    onClick={() => navigate("/admin/products")}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors flex items-center justify-center gap-1 mx-auto"
                >
                    <span>View all products</span>
                    <ArrowRight className="w-3 h-3" />
                </button>
            </div>

            {/* Keyboard Shortcut Hint */}
            {canManageInventory && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700/30">
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
                        <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs">Ctrl</kbd>
                        <span className="text-gray-400">+</span>
                        <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs">N</kbd>
                        <span className="ml-2">to add new product</span>
                    </div>
                </div>
            )}
        </div>
    )
}

export default EmptyState