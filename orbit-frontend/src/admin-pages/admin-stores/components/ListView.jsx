import { Store, MapPin, Clock, Edit, Eye, Trash2, Package, ShoppingCart } from "lucide-react"
import { useRole } from "../../../context/authentication/RoleContext";
import { toast } from "react-hot-toast";

const ListView = ({
    filteredStores,
    currentStore,
    formatOpeningHours,
    handleViewDetails,
    handleEditStore,
    handleDeleteStore,
    handleStoreSwitch
}) => {
    const {
        canAccessStore,
        canManageStore,
        canEditStore,
        canSellInStore,
        isAdmin,
        isSuperadmin,
        getStorePermissions
    } = useRole();

    const handleViewProducts = (store) => {
        if (!canAccessStore(store._id)) {
            toast.error("You don't have access to this store's products");
            return;
        }
        handleStoreSwitch(store._id);
        toast.success(`Viewing ${store.name} products`);
    };

    const handleStoreSelect = (store) => {
        if (!canAccessStore(store._id)) {
            toast.error("You don't have access to this store");
            return;
        }
        handleStoreSwitch(store._id);
        toast.success(`Switched to ${store.name}`);
    };

    const handleViewStoreDetails = (store) => {
        if (!canAccessStore(store._id)) {
            toast.error("You don't have access to view this store");
            return;
        }
        handleViewDetails(store);
    };

    const handleEditStoreClick = (store) => {
        if (!canEditStore(store._id)) {
            toast.error("You don't have permission to edit this store");
            return;
        }
        handleEditStore(store);
    };

    const handleDeleteStoreClick = (storeId) => {
        if (!isAdmin && !isSuperadmin) {
            toast.error("Only admins can delete stores");
            return;
        }
        handleDeleteStore(storeId);
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                        <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-300 font-medium text-sm">Store</th>
                        <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-300 font-medium text-sm">Code</th>
                        <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-300 font-medium text-sm">Location</th>
                        <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-300 font-medium text-sm">Opening Hours</th>
                        <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-300 font-medium text-sm">Status</th>
                        <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-300 font-medium text-sm">Manager</th>
                        <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-300 font-medium text-sm">Access</th>
                        <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-300 font-medium text-sm">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
                    {filteredStores.map(store => {
                        const storePermissions = getStorePermissions(store._id);
                        const canViewStore = canAccessStore(store._id);
                        const canEditThisStore = canEditStore(store._id);
                        const canSellInThisStore = canSellInStore(store._id);
                        const canDeleteThisStore = isAdmin || isSuperadmin;
                        const isCurrentStore = store._id === currentStore?._id;

                        // Hide store if user can't view it (unless admin)
                        if (!canViewStore && !isAdmin && !isSuperadmin) {
                            return null;
                        }

                        return (
                            <tr key={store._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-sm flex items-center justify-center border ${isCurrentStore ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-800' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600'}`}>
                                            <Store size={18} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{store.name}</p>
                                            <div className="flex gap-1 mt-1">
                                                {isCurrentStore && (
                                                    <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded-sm">Current</span>
                                                )}
                                                {storePermissions.canManage && (
                                                    <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded-sm">Manage</span>
                                                )}
                                                {storePermissions.canSell && (
                                                    <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-sm">Sell</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <span className="font-mono text-sm text-gray-700 dark:text-gray-300">{store.code}</span>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <MapPin size={14} className="text-gray-600 dark:text-gray-400" />
                                        <span className="max-w-[150px] truncate" title={store.address?.street || 'N/A'}>
                                            {store.address?.street || 'N/A'}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock size={14} className="text-gray-600 dark:text-gray-400" />
                                        <span className={`${store.openingHours?.monday?.open === 'Closed' ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {formatOpeningHours(store.openingHours)}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium ${store.status === 'active'
                                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                        : store.status === 'inactive'
                                            ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                            : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'}`}>
                                        {store.status === 'active' ? 'Active' : store.status === 'inactive' ? 'Inactive' : 'Maintenance'}
                                    </span>
                                </td>
                                <td className="py-4 px-4">
                                    {store.manager ? (
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Assigned</span>
                                    ) : (
                                        <span className="text-sm text-gray-600 dark:text-gray-500">No manager</span>
                                    )}
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex flex-col gap-1">
                                        <span className={`text-xs ${canViewStore ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {canViewStore ? 'Can View' : 'No Access'}
                                        </span>
                                        {canEditThisStore && (
                                            <span className="text-xs text-blue-600 dark:text-blue-400">Can Edit</span>
                                        )}
                                        {canSellInThisStore && (
                                            <span className="text-xs text-green-600 dark:text-green-400">Can Sell</span>
                                        )}
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-2">
                                        {/* Products button - only if can view store */}
                                        {canViewStore && (
                                            <button
                                                onClick={() => handleViewProducts(store)}
                                                className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors flex items-center gap-1"
                                                title="View store products"
                                            >
                                                <Package size={12} />
                                                Products
                                            </button>
                                        )}

                                        {/* Sell button - only if can sell in store */}
                                        {canSellInThisStore && (
                                            <button
                                                onClick={() => handleStoreSelect(store)}
                                                className="text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 px-2 py-1 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-sm transition-colors flex items-center gap-1"
                                                title="Make sales in this store"
                                            >
                                                <ShoppingCart size={12} />
                                                Sell
                                            </button>
                                        )}

                                        {/* View button - only if can view store */}
                                        {canViewStore && (
                                            <button
                                                onClick={() => handleViewStoreDetails(store)}
                                                className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors"
                                                title="View details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        )}

                                        {/* Edit button - only if can edit store */}
                                        {canEditThisStore && (
                                            <button
                                                onClick={() => handleEditStoreClick(store)}
                                                className="p-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-sm transition-colors"
                                                title="Edit store"
                                            >
                                                <Edit size={16} />
                                            </button>
                                        )}

                                        {/* Delete button - only if can delete stores (admins) */}
                                        {canDeleteThisStore && (
                                            <button
                                                onClick={() => handleDeleteStoreClick(store._id)}
                                                className="p-1.5 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-sm transition-colors"
                                                title="Delete store"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Show message if no stores are visible due to permissions */}
            {filteredStores.length > 0 && filteredStores.every(store => {
                const canViewStore = canAccessStore(store._id);
                return !canViewStore && !isAdmin && !isSuperadmin;
            }) && (
                    <div className="p-8 text-center">
                        <p className="text-gray-600 dark:text-gray-400">You don't have access to any of these stores</p>
                    </div>
                )}
        </div>
    );
}

export default ListView;