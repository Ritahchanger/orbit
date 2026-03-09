import { Database, TrendingUp, AlertTriangle, Package } from "lucide-react"

const StatsCards = ({ statsLoading, stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
            {/* Total Items Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-4 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Items</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                            {statsLoading ? '...' : (stats.totalItems || 0).toLocaleString()}
                        </p>
                        <p className="text-blue-500 dark:text-blue-400 text-sm mt-1 font-medium">In inventory</p>
                    </div>
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-sm">
                        <Database className="text-blue-600 dark:text-blue-400" size={24} />
                    </div>
                </div>
            </div>

            {/* Total Value Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-4 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Value</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                            {statsLoading ? '...' : `KSh ${(stats.totalValue || 0).toLocaleString()}`}
                        </p>
                        <p className="text-emerald-500 dark:text-emerald-400 text-sm mt-1 font-medium">Inventory worth</p>
                    </div>
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-sm">
                        <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={24} />
                    </div>
                </div>
            </div>

            {/* Low Stock Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-4 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Low Stock</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                            {statsLoading ? '...' : (stats.lowStockItems || 0).toLocaleString()}
                        </p>
                        <p className="text-amber-500 dark:text-amber-400 text-sm mt-1 font-medium">Needs attention</p>
                    </div>
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-sm">
                        <AlertTriangle className="text-amber-600 dark:text-amber-400" size={24} />
                    </div>
                </div>
            </div>

            {/* Out of Stock Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-4 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Out of Stock</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                            {statsLoading ? '...' : (stats.outOfStockItems || 0).toLocaleString()}
                        </p>
                        <p className="text-rose-500 dark:text-rose-400 text-sm mt-1 font-medium">Restock needed</p>
                    </div>
                    <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-sm">
                        <Package className="text-rose-600 dark:text-rose-400" size={24} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StatsCards