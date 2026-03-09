import { createContext, useContext, useMemo } from 'react';
import { useAuth } from '../authentication/AuthenticationContext';

const PermissionsContext = createContext();

// Helper function to extract permissions from user object
const extractUserPermissions = (user) => {
    if (!user) return [];

    // Try different possible locations for permissions
    if (user.permissions && Array.isArray(user.permissions)) {
        return user.permissions;
    }

    if (user.rolePermissions && Array.isArray(user.rolePermissions)) {
        return user.rolePermissions;
    }

    // If user has a role, get permissions from that role
    if (user.role) {
        // Note: This would require having roles data available
        // You might need to fetch role permissions separately
        return [];
    }

    return [];
};

// Hook for component-level permission checks
export const usePermissions = () => {
    const { user, isAuthenticated } = useAuth();

    // Extract and memoize permissions from user object
    const permissions = useMemo(() => {
        if (!isAuthenticated || !user) return [];
        return extractUserPermissions(user);
    }, [user, isAuthenticated]);

    // Permission checking logic
    const checkPermission = (permissionKey, storeId = null) => {
        if (!user || !permissionKey) return false;

        // Superadmin has all permissions
        if (user.role === 'superadmin') return true;

        // Check if user has the method (from enhanced user data)
        if (typeof user.hasPermission === 'function') {
            return user.hasPermission(permissionKey, storeId);
        }

        // Fallback: check permissions array directly
        return permissions.includes(permissionKey);
    };

    const checkAnyPermission = (requiredPermissions) => {
        if (!user || !requiredPermissions || !Array.isArray(requiredPermissions)) {
            return false;
        }

        return requiredPermissions.some(permission =>
            checkPermission(permission)
        );
    };

    const checkAllPermissions = (requiredPermissions) => {
        if (!user || !requiredPermissions || !Array.isArray(requiredPermissions)) {
            return false;
        }

        return requiredPermissions.every(permission =>
            checkPermission(permission)
        );
    };

    // Store-specific permission check (if implemented)
    const checkStorePermission = (storeId, permissionKey) => {
        if (!user || !storeId || !permissionKey) return false;

        // Check if user has store-specific method
        if (typeof user.hasStorePermission === 'function') {
            return user.hasStorePermission(storeId, permissionKey);
        }

        // Fallback to global permission check
        return checkPermission(permissionKey);
    };

    const canAccessStore = (storeId) => {
        if (!user || !storeId) return false;

        // Superadmin and admin can access all stores
        if (user.role === 'superadmin' || user.role === 'admin') return true;

        // Check if user has the method
        if (typeof user.canAccessStore === 'function') {
            return user.canAccessStore(storeId);
        }

        // Check assigned store
        if (user.assignedStore) {
            const assignedStoreId = user.assignedStore._id ?
                user.assignedStore._id.toString() :
                user.assignedStore.toString();
            return assignedStoreId === storeId.toString();
        }

        return false;
    };

    const getStorePermissions = (storeId) => {
        if (!user || !storeId) {
            return { canView: false, canEdit: false, canSell: false, canManage: false };
        }

        // Superadmin gets all permissions
        if (user.role === 'superadmin') {
            return { canView: true, canEdit: true, canSell: true, canManage: true };
        }

        // Check if user has the method
        if (typeof user.getStorePermissions === 'function') {
            return user.getStorePermissions(storeId);
        }

        // Fallback logic
        const storePerms = user.storePermissions || [];
        const storePerm = storePerms.find(perm => {
            if (!perm.store) return false;
            const permStoreId = perm.store._id ?
                perm.store._id.toString() :
                perm.store.toString();
            return permStoreId === storeId.toString();
        });

        if (storePerm) {
            return {
                canView: storePerm.canView || false,
                canEdit: storePerm.canEdit || false,
                canSell: storePerm.canSell || false,
                canManage: storePerm.canManage || false
            };
        }

        // Default permissions based on role
        const rolePermissions = {
            admin: { canView: true, canEdit: true, canSell: true, canManage: true },
            manager: { canView: true, canEdit: true, canSell: true, canManage: false },
            cashier: { canView: true, canEdit: false, canSell: true, canManage: false },
            staff: { canView: true, canEdit: false, canSell: false, canManage: false },
            viewer: { canView: true, canEdit: false, canSell: false, canManage: false }
        };

        return rolePermissions[user.role] || { canView: false, canEdit: false, canSell: false, canManage: false };
    };

    return {
        // Basic info
        user,
        isAuthenticated,
        userRole: user?.role,

        // Permissions data
        permissions,
        rolePermissions: user?.rolePermissions || [],
        accessibleStores: user?.accessibleStores || [],
        storePermissions: user?.storePermissions || [],
        storeRoles: user?.storeRoles || [],

        // Store access info
        assignedStore: user?.assignedStore,
        canAccessAllStores: user?.canAccessAllStores || false,

        // Permission checking methods
        hasPermission: checkPermission,
        hasAnyPermission: checkAnyPermission,
        hasAllPermissions: checkAllPermissions,
        hasStorePermission: checkStorePermission,
        canAccessStore,
        getStorePermissions,

        // Helper to check if user can perform specific actions
        canView: (resource) => checkPermission(`${resource}.view`),
        canCreate: (resource) => checkPermission(`${resource}.create`),
        canUpdate: (resource) => checkPermission(`${resource}.update`),
        canDelete: (resource) => checkPermission(`${resource}.delete`),
        canManage: (resource) => checkPermission(`${resource}.manage`),

        // Permission summary
        permissionsSummary: {
            total: permissions.length,
            fromRole: user?.rolePermissions?.length || 0,
            fromUser: permissions.length - (user?.rolePermissions?.length || 0),
            accessibleStores: user?.accessibleStores?.length || 0
        }
    };
};

// Permission wrapper component for conditional rendering
export const WithPermission = ({
    children,
    permission,
    any = [],
    all = [],
    storeId,
    storePermission,
    fallback = null,
    showFallback = true
}) => {
    const {
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        hasStorePermission,
        isAuthenticated
    } = usePermissions();

    // If not authenticated, show fallback
    if (!isAuthenticated) {
        return showFallback ? fallback : null;
    }

    let hasAccess = false;

    if (storeId && storePermission) {
        hasAccess = hasStorePermission(storeId, storePermission);
    } else if (permission) {
        hasAccess = hasPermission(permission);
    } else if (any.length > 0) {
        hasAccess = hasAnyPermission(any);
    } else if (all.length > 0) {
        hasAccess = hasAllPermissions(all);
    } else {
        // No permission requirements specified, allow access
        hasAccess = true;
    }

    return hasAccess ? children : (showFallback ? fallback : null);
};

// Higher-Order Component for permission-based component rendering
export const withPermission = (WrappedComponent, permissionConfig = {}) => {
    return function WithPermissionHOC(props) {
        const permissions = usePermissions();

        let hasAccess = false;

        if (permissionConfig) {
            const { permission, any = [], all = [], storeId, storePermission } = permissionConfig;

            if (storeId && storePermission) {
                hasAccess = permissions.hasStorePermission(storeId, storePermission);
            } else if (permission) {
                hasAccess = permissions.hasPermission(permission);
            } else if (any.length > 0) {
                hasAccess = permissions.hasAnyPermission(any);
            } else if (all.length > 0) {
                hasAccess = permissions.hasAllPermissions(all);
            }
        } else {
            // If no config, allow access
            hasAccess = true;
        }

        if (!hasAccess) {
            // You could return null, a fallback component, or redirect
            if (permissionConfig.fallback) {
                return permissionConfig.fallback;
            }
            return null;
        }

        return <WrappedComponent {...props} permissions={permissions} />;
    };
};

// Provider Component (simplified)
export const PermissionsProvider = ({ children }) => {
    return (
        <PermissionsContext.Provider value={null}>
            {children}
        </PermissionsContext.Provider>
    );
};

// Custom hook to use permissions context directly
export const usePermissionsContext = () => {
    const context = useContext(PermissionsContext);
    if (!context) {
        throw new Error('usePermissionsContext must be used within a PermissionsProvider');
    }
    return context;
};

// Helper to create permission-based route guards
export const requirePermission = (permission, storeId = null) => {
    return (Component) => {
        return function ProtectedComponent(props) {
            const { hasPermission, isAuthenticated } = usePermissions();

            if (!isAuthenticated) {
                // Redirect to login
                window.location.href = '/admin/login';
                return null;
            }

            if (!hasPermission(permission, storeId)) {
                // Show access denied
                return (
                    <div className="min-h-screen bg-dark text-white p-4 sm:p-6 flex items-center justify-center">
                        <div className="text-center">
                            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
                            <p className="text-gray-400">
                                You don't have permission to access this page.
                            </p>
                            <button
                                onClick={() => window.history.back()}
                                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-sm transition"
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                );
            }

            return <Component {...props} />;
        };
    };
};

// Quick permission checkers for common scenarios
export const PermissionHelpers = {
    // Check if user can view a specific module
    canViewModule: (moduleName) => {
        const { hasPermission } = usePermissions();
        return hasPermission(`${moduleName}.view`);
    },

    // Check if user can edit a specific module
    canEditModule: (moduleName) => {
        const { hasPermission } = usePermissions();
        return hasPermission(`${moduleName}.update`) || hasPermission(`${moduleName}.manage`);
    },

    // Check if user can manage a specific module
    canManageModule: (moduleName) => {
        const { hasPermission } = usePermissions();
        return hasPermission(`${moduleName}.manage`);
    },

    // Check if user can access admin features
    canAccessAdmin: () => {
        const { userRole } = usePermissions();
        return ['superadmin', 'admin', 'manager'].includes(userRole);
    },

    // Check if user can access superadmin features
    canAccessSuperAdmin: () => {
        const { userRole } = usePermissions();
        return userRole === 'superadmin';
    }
};