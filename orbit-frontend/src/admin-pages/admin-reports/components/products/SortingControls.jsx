const SortingControls = ({sortConfig,products,handleSort,count}) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Sort by:</span>
                    <button
                        onClick={() => handleSort('totalRevenue')}
                        className={`px-3 py-1 text-xs rounded-md ${sortConfig.key === 'totalRevenue'
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                    >
                        Revenue {sortConfig.key === 'totalRevenue' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </button>
                    <button
                        onClick={() => handleSort('totalSold')}
                        className={`px-3 py-1 text-xs rounded-md ${sortConfig.key === 'totalSold'
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                    >
                        Units Sold {sortConfig.key === 'totalSold' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </button>
                    <button
                        onClick={() => handleSort('profitMargin')}
                        className={`px-3 py-1 text-xs rounded-md ${sortConfig.key === 'profitMargin'
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                    >
                        Profit Margin {sortConfig.key === 'profitMargin' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </button>
                    <button
                        onClick={() => handleSort('averagePrice')}
                        className={`px-3 py-1 text-xs rounded-md ${sortConfig.key === 'averagePrice'
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                    >
                        Avg Price {sortConfig.key === 'averagePrice' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </button>
                    <button
                        onClick={() => handleSort('stockTurnover')}
                        className={`px-3 py-1 text-xs rounded-md ${sortConfig.key === 'stockTurnover'
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                    >
                        Stock Turnover {sortConfig.key === 'stockTurnover' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </button>
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {products.length} of {count} products
                </div>
            </div>
        </div>
    )
}

export default SortingControls