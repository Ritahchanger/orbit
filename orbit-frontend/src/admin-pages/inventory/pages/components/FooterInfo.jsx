import { CheckCircle, AlertTriangle, XCircle } from "lucide-react"

const FooterInfo = ({ stats }) => {
    return (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-sm">
                {/* Status Indicators */}
                <div className="flex flex-wrap gap-4">
                    {/* In Stock */}
                    <div className="flex items-center gap-2">
                        <div className="p-1 bg-emerald-100 dark:bg-emerald-900/20 rounded-sm">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                            In Stock ({stats.totalItems - (stats.lowStockItems || 0) - (stats.outOfStockItems || 0)})
                        </span>
                    </div>
                    
                    {/* Low Stock */}
                    <div className="flex items-center gap-2">
                        <div className="p-1 bg-amber-100 dark:bg-amber-900/20 rounded-sm">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                            Low Stock ({stats.lowStockItems || 0})
                        </span>
                    </div>
                    
                    {/* Out of Stock */}
                    <div className="flex items-center gap-2">
                        <div className="p-1 bg-rose-100 dark:bg-rose-900/20 rounded-sm">
                            <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                            Out of Stock ({stats.outOfStockItems || 0})
                        </span>
                    </div>
                </div>

                {/* Last Updated */}
                <div className="text-gray-500 dark:text-gray-400 text-sm">
                    {stats.lastUpdated ? (
                        <span className="flex items-center gap-2">
                            <span className="hidden sm:inline">Last updated:</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                {new Date(stats.lastUpdated).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                        </span>
                    ) : ''}
                </div>
            </div>
        </div>
    )
}

export default FooterInfo