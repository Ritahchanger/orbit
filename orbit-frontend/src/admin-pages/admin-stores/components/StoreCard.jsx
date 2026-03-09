import {
    Store,
    MapPin,
    Phone,
    Clock,
    Trash2,
    MoreVertical,
    CheckCircle,
    XCircle,
    Users,
    AlertTriangle,
    X,
    Package
} from 'lucide-react';

import { useState } from 'react';

import { useRole } from '../../../context/authentication/RoleContext';

import { toast } from "react-hot-toast";

const StoreCard = ({ store, currentStoreId, onViewDetails, onEdit, onDelete, handleStoreSwitch }) => {
    const {
        canAccessStore,
        canManageStore,
        canEditStore,
        canSellInStore,
        isAdmin,
        isSuperadmin,
        getStorePermissions
    } = useRole();

    const isCurrentStore = store._id === currentStoreId;
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    // Check permissions for this specific store
    const canViewStore = canAccessStore(store._id);
    const canEditThisStore = canEditStore(store._id);
    const canManageThisStore = canManageStore(store._id);
    const canDeleteStore = isAdmin || isSuperadmin;
    const canSwitchToStore = canAccessStore(store._id);
    const canSellInThisStore = canSellInStore(store._id);

    // Get detailed permissions
    const storePermissions = getStorePermissions(store._id);

    const handleDeleteClick = () => {
        if (!canDeleteStore) {
            toast.error("You don't have permission to delete stores");
            return;
        }
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!canDeleteStore) {
            toast.error("Permission denied");
            return;
        }

        setIsDeleting(true);
        try {
            await onDelete(store._id);
            toast.success("Store deleted successfully");
        } catch (error) {
            toast.error("Failed to delete store");
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    const handleEditClick = () => {
        if (!canEditThisStore) {
            toast.error("You don't have permission to edit this store");
            return;
        }
        onEdit();
    };

    const handleViewDetailsClick = () => {
        if (!canViewStore) {
            toast.error("You don't have access to view this store");
            return;
        }
        onViewDetails();
    };

    const handleStoreSwitchClick = () => {
        if (!canSwitchToStore) {
            toast.error("You don't have access to this store");
            return;
        }
        handleStoreSwitch(store._id);
    };

    const handleViewProductsClick = () => {
        if (!canViewStore) {
            toast.error("You don't have access to this store's products");
            return;
        }
        handleStoreSwitch(store._id);
        toast.success(`Viewing ${store.name} products`);
    };

    // If user can't view this store at all, don't show the card
    if (!canViewStore && !isAdmin && !isSuperadmin) {
        return null;
    }

    return (
        <>
            <div className={`bg-white dark:bg-gray-800 border rounded-sm p-4 hover:shadow-sm transition-all duration-200 ${isCurrentStore ? 'border-blue-500 dark:border-blue-400' : 'border-gray-300 dark:border-gray-700'}`}>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-sm flex items-center justify-center ${isCurrentStore ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600'}`}>
                            <Store size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{store.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-mono text-gray-600 dark:text-gray-400">{store.code}</span>
                                {isCurrentStore && (
                                    <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-sm">Current</span>
                                )}
                                {/* Permission badges */}
                                {canManageThisStore && (
                                    <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-sm">Manage</span>
                                )}
                                {canSellInThisStore && (
                                    <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-sm">Sell</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <button
                            className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors"
                            onClick={() => setShowMenu(!showMenu)}
                        >
                            <MoreVertical size={18} />
                        </button>

                        {showMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowMenu(false)}
                                />
                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm shadow-lg z-50">
                                    <div className="py-1">
                                        {/* Quick permission summary */}
                                        <div className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400 border-b border-gray-300 dark:border-gray-700">
                                            <p className="font-medium">Permissions:</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {storePermissions.canView && <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">View</span>}
                                                {storePermissions.canEdit && <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded text-xs">Edit</span>}
                                                {storePermissions.canSell && <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded text-xs">Sell</span>}
                                                {storePermissions.canManage && <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded text-xs">Manage</span>}
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleViewDetailsClick}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            View Details
                                        </button>
                                        <button
                                            onClick={handleEditClick}
                                            disabled={!canEditThisStore}
                                            className={`w-full text-left px-4 py-2 text-sm ${canEditThisStore ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10' : 'text-gray-500 dark:text-gray-500 cursor-not-allowed'}`}
                                        >
                                            Edit Store
                                        </button>
                                        <button
                                            onClick={handleDeleteClick}
                                            disabled={!canDeleteStore}
                                            className={`w-full text-left px-4 py-2 text-sm ${canDeleteStore ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10' : 'text-gray-500 dark:text-gray-500 cursor-not-allowed'}`}
                                        >
                                            Delete Store
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <MapPin size={14} className="text-gray-500 dark:text-gray-400" />
                        <span className="truncate">{store.address?.street || 'No address'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Phone size={14} className="text-gray-500 dark:text-gray-400" />
                        <span>{store.phone || 'No phone'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Clock size={14} className="text-gray-500 dark:text-gray-400" />
                        <span>{store.openingHours?.monday?.open === 'Closed' ? 'Closed Today' : 'Open Today'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Users size={14} className="text-gray-500 dark:text-gray-400" />
                        <span>{store.manager ? 'Has Manager' : 'No Manager'}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-300 dark:border-gray-700">
                    <span className={`inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium ${store.status === 'active' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                        {store.status === 'active' ? (
                            <>
                                <CheckCircle size={12} className="mr-1" />
                                Active
                            </>
                        ) : (
                            <>
                                <XCircle size={12} className="mr-1" />
                                Inactive
                            </>
                        )}
                    </span>

                    <div className="flex items-center gap-2">
                        {/* Products button - only if can view store */}
                        {canViewStore && (
                            <button
                                onClick={handleViewProductsClick}
                                className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors flex items-center gap-1"
                                title="View store products"
                            >
                                <Package size={12} />
                                Products
                            </button>
                        )}

                        {/* Select/switch button - only if can access store */}
                        {canSwitchToStore && (
                            <button
                                onClick={handleStoreSwitchClick}
                                className={`text-xs px-2 py-1 rounded-sm transition-colors flex items-center gap-1 ${isCurrentStore ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                title={isCurrentStore ? 'Currently selected' : 'Switch to this store'}
                            >
                                {isCurrentStore ? 'Selected' : 'Select'}
                            </button>
                        )}

                        {/* View button - only if can view store */}
                        {canViewStore && (
                            <button
                                onClick={handleViewDetailsClick}
                                className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors"
                            >
                                View
                            </button>
                        )}

                        {/* Edit button - only if can edit store */}
                        {canEditThisStore && (
                            <button
                                onClick={handleEditClick}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 px-2 py-1 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-sm transition-colors"
                            >
                                Edit
                            </button>
                        )}

                        {/* Delete button - only if can delete stores (admins) */}
                        {canDeleteStore && (
                            <button
                                onClick={handleDeleteClick}
                                className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 px-2 py-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-sm transition-colors"
                                disabled={isDeleting}
                                title={isDeleting ? 'Deleting...' : 'Delete store'}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal - Only show if user has delete permission */}
            {showDeleteModal && canDeleteStore && (
                <div className="fixed inset-0 z-[9999]">
                    <div className="flex items-center justify-center min-h-screen p-4">
                        <div
                            className="fixed inset-0 bg-black/70"
                            onClick={() => !isDeleting && setShowDeleteModal(false)}
                        />

                        <div className="relative z-[10000] w-full max-w-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm shadow-xl">
                            <div className="flex items-center justify-between p-6 border-b border-gray-300 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-sm bg-red-100 dark:bg-red-900/30">
                                        <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delete Store</h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Confirm store deletion</p>
                                    </div>
                                </div>

                                {!isDeleting && (
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>

                            <div className="p-6">
                                <div className="mb-6">
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Are you sure you want to delete the store <span className="font-bold text-gray-900 dark:text-white">{store.name}</span>?
                                    </p>

                                    {/* Store details section */}
                                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-sm">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-sm flex items-center justify-center">
                                                <Store size={16} className="text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{store.name}</p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">Code: {store.code}</p>
                                                {store.address?.street && (
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                        {store.address.street}
                                                    </p>
                                                )}
                                                {store.manager && (
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                        Manager: {store.manager.name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Warning message */}
                                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-sm">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-red-700 dark:text-red-400 font-medium mb-1">⚠️ This action cannot be undone</p>
                                                <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                                                    <li>• All store data will be permanently deleted</li>
                                                    <li>• Associated products and inventory will be removed</li>
                                                    <li>• Store users will lose access to this store</li>
                                                    <li>• This action is irreversible</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Admin warning */}
                                    {!isSuperadmin && (
                                        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-sm">
                                            <div className="flex items-start gap-3">
                                                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-yellow-700 dark:text-yellow-500 font-medium mb-1">Administrative Action Required</p>
                                                    <p className="text-yellow-600 dark:text-yellow-400 text-sm">
                                                        As an admin, you have permission to delete this store. Please ensure this action is authorized.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        disabled={isDeleting}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        disabled={isDeleting}
                                        className="px-4 py-2 text-sm font-medium bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isDeleting ? (
                                            <>
                                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 size={16} />
                                                Delete Store
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default StoreCard;