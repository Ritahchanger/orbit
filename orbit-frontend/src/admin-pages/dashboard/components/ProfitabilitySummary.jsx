const ProfitabilitySummary = ({ isAdmin, isSuperadmin, itemsSold, formatCurrency }) => {
    return (
        <div className="mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Profitability Summary {!isAdmin && !isSuperadmin && "(Your Store)"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-sm">
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Highest Margin</p>
                    {(() => {
                        const highestMargin = itemsSold.reduce((max, item) =>
                            parseFloat(item.profitMargin || 0) > parseFloat(max.profitMargin || 0) ? item : max
                        );
                        return (
                            <>
                                <p className="font-semibold text-gray-900 dark:text-white">{highestMargin.productName}</p>
                                <p className="text-green-600 dark:text-green-500 font-medium">{highestMargin.profitMargin || 0}% margin</p>
                            </>
                        );
                    })()}
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-sm">
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Best Seller</p>
                    {(() => {
                        const bestSeller = itemsSold.reduce((max, item) =>
                            (item.totalQuantitySold || 0) > (max.totalQuantitySold || 0) ? item : max
                        );
                        return (
                            <>
                                <p className="font-semibold text-gray-900 dark:text-white">{bestSeller.productName}</p>
                                <p className="text-gray-900 dark:text-white">{(bestSeller.totalQuantitySold || 0)} units</p>
                            </>
                        );
                    })()}
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-sm">
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Highest Revenue</p>
                    {(() => {
                        const highestRevenue = itemsSold.reduce((max, item) =>
                            (item.totalRevenue || 0) > (max.totalRevenue || 0) ? item : max
                        );
                        return (
                            <>
                                <p className="font-semibold text-gray-900 dark:text-white">{highestRevenue.productName}</p>
                                <p className="text-gray-900 dark:text-white">{formatCurrency(highestRevenue.totalRevenue || 0)}</p>
                            </>
                        );
                    })()}
                </div>
            </div>
        </div>
    )
}

export default ProfitabilitySummary