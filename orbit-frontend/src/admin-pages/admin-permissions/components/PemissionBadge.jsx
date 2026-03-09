import { useState } from 'react';
import {
    Users,
    Trash2,
    Globe,
    Store,
    Check,
    X,
    BarChart3,
    Building,
    Package,
    MessageSquare,
    Key
} from 'lucide-react';

const PermissionBadge = ({ permission, scope, store, onRevoke, showActions = true }) => {
    const [showConfirm, setShowConfirm] = useState(false);

    // Handle different data structures:
    // 1. permission could be a string "stores.view" from old structure
    // 2. permission could be an object { permission: "stores.view", scope: "global", store: {...} } from new API
    let permissionKey = permission;
    let permissionScope = scope;
    let storeData = store;

    // If permission is an object (from API response)
    if (typeof permission === 'object' && permission !== null) {
        permissionKey = permission.permission || permission;
        permissionScope = permission.scope || scope;
        storeData = permission.store || store;
    }

    const action = permissionKey?.split('.')[1] || 'view';
    const module = permissionKey?.split('.')[0] || 'unknown';

    const badgeColors = {
        view: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        create: 'bg-green-500/10 text-green-400 border-green-500/20',
        update: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        delete: 'bg-red-500/10 text-red-400 border-red-500/20',
        manage: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        generate: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
    };

    const moduleIcons = {
        stores: Building,
        products: Package,
        workers: Users,
        reports: BarChart3,
        consultations: MessageSquare
    };

    const Icon = moduleIcons[module] || Key;
    const colorClass = badgeColors[action] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';

    // Format permission text nicely
    const formatPermissionText = (permission) => {
        if (!permission) return 'Unknown Permission';
        // Convert "stores.view" to "Stores - View"
        return permission
            .split('.')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' - ');
    };

    // Get store name/identifier
    const getStoreName = () => {
        if (!storeData) return 'Unknown Store';

        // If store is an object
        if (typeof storeData === 'object') {
            return storeData.name || storeData.code || `Store: ${storeData._id?.slice(0, 8)}...`;
        }

        // If store is a string (ID)
        if (typeof storeData === 'string') {
            return `Store: ${storeData.slice(0, 8)}...`;
        }

        return 'Store';
    };

    const handleRevoke = () => {
        if (onRevoke) {
            // Pass the permission object or data needed for revoking
            onRevoke(typeof permission === 'object' ? permission : {
                permission: permissionKey,
                scope: permissionScope,
                store: storeData
            });
        }
        setShowConfirm(false);
    };

    return (
        <div className={`flex items-center justify-between px-3 py-2 rounded-sm border ${colorClass}`}>
            <div className="flex items-center space-x-3">
                <Icon size={16} />
                <div>
                    <div className="font-medium text-sm">
                        {formatPermissionText(permissionKey)}
                    </div>
                    <div className="text-xs opacity-75 flex items-center">
                        {permissionScope === 'global' ? (
                            <>
                                <Globe size={12} className="mr-1" /> Global
                            </>
                        ) : (
                            <>
                                <Store size={12} className="mr-1" /> {getStoreName()}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {showActions && onRevoke && (
                <div className="relative">
                    {!showConfirm ? (
                        <>
                            {/* <button
                                onClick={() => setShowConfirm(true)}
                                className="p-1 hover:bg-red-500/10 rounded transition-colors"
                                title="Revoke Permission"
                            >
                                <Trash2 size={14} className="text-red-400" />
                            </button> */}
                        </>
                    ) : (
                        <div className="flex items-center space-x-1">
                            <button
                                onClick={handleRevoke}
                                className="p-1 bg-red-500/20 hover:bg-red-500/30 rounded transition-colors"
                                title="Confirm Revoke"
                            >
                                <Check size={14} className="text-red-400" />
                            </button>
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="p-1 bg-gray-500/20 hover:bg-gray-500/30 rounded transition-colors"
                                title="Cancel"
                            >
                                <X size={14} className="text-gray-400" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PermissionBadge;