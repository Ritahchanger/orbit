import { Store, AlertCircle, ShoppingCart, Package, Download, RefreshCw, Calendar } from "lucide-react"

const AdminHeader = ({
    handleStoreChange,
    isAdmin,
    isSuperadmin,
    primaryStore,
    storeOptions,
    isViewingAllStores,
    getSelectValue,
    dateString,
    handleDateChange,
    handleTodayClick,
    itemsSold,
    handleExportCSV,
    navigateToInventory,
    navigateToAllProducts,
    selectedDate,
    format,
    actualStoreLabel,
    isManager,
    userRole
}) => {

    const canSelectStore = isAdmin || isSuperadmin;

    // For non-admins (managers, cashiers), show a store info badge instead of dropdown
    const renderStoreInfo = () => {
        if (canSelectStore) return null;

        return (
            <div className="relative flex items-center min-w-[180px]">
                <Store className="absolute left-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <div className="pl-9 pr-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white text-sm w-full">
                    <div className="flex flex-col">
                        <p className="font-medium truncate">
                            {primaryStore?.name || 'My Store'}
                        </p>
                        {primaryStore?.code && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Code: {primaryStore.code}</p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-2">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Daily Product Sales</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Track product performance for {format(selectedDate, "MMMM d, yyyy")}
                    <span className="ml-2 text-blue-600 dark:text-blue-400 font-medium">{actualStoreLabel}</span>
                    {!isAdmin && !isSuperadmin && (
                        <span className="ml-2 text-blue-600 dark:text-blue-400 text-sm">
                            <Store size={12} className="inline mr-1" />
                            {userRole === 'manager' ? 'Manager' : userRole === 'cashier' ? 'Cashier' : 'User'} View
                        </span>
                    )}
                </p>
                {isAdmin && !isSuperadmin && primaryStore && (
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        Assigned to: <span className="text-gray-700 dark:text-gray-300">{primaryStore.name}</span>
                    </p>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-2">
                {/* Store Selector - Only for admins and superadmins */}
                {canSelectStore && storeOptions.length > 0 && (
                    <div className="relative">
                        <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <select
                            value={getSelectValue()}
                            onChange={handleStoreChange}
                            className="pl-9 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 min-w-[180px]"
                        >
                            {storeOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            {isViewingAllStores && !isAdmin && !isSuperadmin && (
                                <AlertCircle size={12} className="text-blue-500 dark:text-blue-400" title="Showing data from your assigned store" />
                            )}
                        </div>
                    </div>
                )}

                {/* Store Info Badge - For non-admins */}
                {/* {!canSelectStore && renderStoreInfo()} */}

                {/* Date Selector */}
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <input
                        type="date"
                        value={dateString}
                        onChange={handleDateChange}
                        className="pl-9 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                    />
                </div>

                <button
                    onClick={handleTodayClick}
                    className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors flex items-center gap-2 text-sm"
                >
                    <RefreshCw className="h-3 w-3" />
                    Today
                </button>

                {/* Export button - allowed for managers and admins */}
                {itemsSold.length > 0 && (isAdmin || isSuperadmin || isManager) && (
                    <button
                        onClick={handleExportCSV}
                        className="px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 rounded-sm transition-colors flex items-center gap-2 text-sm"
                        title={isAdmin || isSuperadmin ? "Export all data" : "Export my store data"}
                    >
                        <Download className="h-3 w-3" />
                        Export
                    </button>
                )}

                {/* Store Items Button - for managers and admins */}
                {/* {(isAdmin || isSuperadmin || isManager) && (
                    <button
                        onClick={navigateToInventory}
                        className="px-4 py-2 rounded-sm bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 flex items-center space-x-2"
                        title="View inventory"
                    >
                        <ShoppingCart className="h-4 w-4" />
                        <span className='text-sm'>STORE ITEMS</span>
                    </button>
                )} */}

                {/* All Products Button - for managers and admins */}
                {(isAdmin || isSuperadmin || isManager) && (
                    <button
                        onClick={navigateToAllProducts}
                        className="px-4 py-2 rounded-sm bg-gradient-to-r from-green-600 to-green-700 dark:from-green-500 dark:to-green-600 text-white hover:from-green-700 hover:to-green-800 dark:hover:from-green-600 dark:hover:to-green-700 flex items-center space-x-2"
                        title="View all products"
                    >
                        <Package className="h-4 w-4" />
                        <span className='text-sm'>ALL PRODUCTS</span>
                    </button>
                )}
            </div>
        </div>
    )
}

export default AdminHeader