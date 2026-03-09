import { Store, Building2, ChevronRight, Lock } from "lucide-react";
import { Link } from "react-router-dom";

const StoresControls = ({
    accessibleStores,
    stores,
    hasMultipleAccessibleStores,
    showStoresMenu,
    toggleStoresMenu,
    setShowStoresMenu,
    handleQuickSwitch,
    isAdmin,
    isSuperadmin,
    hasPermission,
    canManageStore,
    currentStore,
    canAccessStore,
    getPermissionsForStore
}) => {
    return (
        <div className="flex items-center gap-2">
            {/* Store Count */}
            <span className="text-sm text-gray-600 dark:text-gray-400 hidden md:block">
                {accessibleStores.length} of {stores.length} stores
                {accessibleStores.length < stores.length && (
                    <span className="text-yellow-600 dark:text-yellow-400 ml-1">(restricted)</span>
                )}
            </span>

            {/* Quick Store Switch (only show if user has multiple accessible stores) */}
            {hasMultipleAccessibleStores && (
                <div className="relative">
                    <button
                        onClick={toggleStoresMenu}
                        className="p-1.5 py-[0.6rem] px-[0.6rem] flex items-center justify-center  text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white transition rounded-sm bg-gray-100 dark:bg-gray-800/50 hover:bg-blue-100 dark:hover:bg-gray-700"
                        title="Quick switch stores"
                    >
                        <ChevronRight size={14} className={`transition-transform duration-200 ${showStoresMenu ? 'rotate-90' : ''}`} />
                    </button>

                    {/* Quick Store Dropdown */}
                    {showStoresMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowStoresMenu(false)}
                            />
                            <div className="absolute right-0 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-sm shadow-2xl backdrop-blur-xl  py-0 z-50 overflow-hidden">
                                <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Switch Store</p>
                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                            {accessibleStores.length} accessible
                                        </span>
                                    </div>
                                </div>

                                <div className="max-h-60 overflow-y-auto">
                                    {stores.map(store => {
                                        const isAccessible = canAccessStore(store._id);
                                        const isCurrent = currentStore?._id === store._id;
                                        const permissions = getPermissionsForStore(store._id);

                                        return (
                                            <button
                                                key={store._id}
                                                onClick={() => isAccessible && handleQuickSwitch(store._id)}
                                                disabled={!isAccessible}
                                                className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors duration-150 ${!isAccessible
                                                    ? 'text-gray-500 dark:text-gray-500 cursor-not-allowed bg-gray-100 dark:bg-gray-900/50'
                                                    : isCurrent
                                                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-600/10 dark:to-indigo-600/10 border-l-2 border-blue-500'
                                                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                                    }`}
                                                title={!isAccessible ? "No access to this store" : `Switch to ${store.name}`}
                                            >
                                                <div className="flex items-center gap-2 flex-1">
                                                    {!isAccessible ? (
                                                        <Lock size={12} className="text-gray-500 dark:text-gray-400" />
                                                    ) : (
                                                        <Store size={14} className={isCurrent ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"} />
                                                    )}
                                                    <div className="text-left flex-1">
                                                        <div className="flex items-center gap-1">
                                                            <p className={`text-sm font-medium ${!isAccessible
                                                                ? 'text-gray-500 dark:text-gray-400'
                                                                : isCurrent
                                                                    ? 'text-blue-600 dark:text-blue-400 font-semibold'
                                                                    : 'text-gray-800 dark:text-white'
                                                                }`}>
                                                                {store.name}
                                                            </p>
                                                            {permissions.canManage && (
                                                                <span className="text-[10px] bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">M</span>
                                                            )}
                                                            {permissions.canSell && (
                                                                <span className="text-[10px] bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded">S</span>
                                                            )}
                                                            {permissions.canEdit && (
                                                                <span className="text-[10px] bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-1.5 py-0.5 rounded">E</span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400">{store.code}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {isCurrent && (
                                                        <div className="w-2 h-2 rounded-sm bg-blue-600 dark:bg-blue-400"></div>
                                                    )}
                                                    {!isAccessible && (
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">No Access</span>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Manage Stores Link (only for admins/superadmins or users with stores.manage permission) */}
                                {(isAdmin || isSuperadmin || hasPermission("stores.manage") || canManageStore(currentStore?._id)) && (
                                    <>
                                        <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                                        <Link
                                            to="/admin/stores"
                                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150"
                                            onClick={() => setShowStoresMenu(false)}
                                        >
                                            <Building2 className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-400" />
                                            Manage All Stores
                                        </Link>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export default StoresControls;