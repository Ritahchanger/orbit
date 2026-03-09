import { createContext, useContext, useCallback, useMemo } from "react";
import { useAuth } from "./AuthenticationContext";

const RoleContext = createContext();

// Helper function to normalize store IDs
const normalizeStoreId = (store) => {
    if (!store) return null;
    if (typeof store === 'string') return store;
    if (store._id) return store._id.toString();
    return store.toString();
};

export const StoreRoleProvider = ({ children }) => {
    const { user, userRole } = useAuth();

    // ============ ROLE CHECKING ============
    const isSuperadmin = useMemo(() => userRole === "superadmin", [userRole]);
    const isAdmin = useMemo(() => userRole === "admin", [userRole]);
    const isManager = useMemo(() => userRole === "manager", [userRole]);
    const isCashier = useMemo(() => userRole === "cashier", [userRole]);
    const isNormalUser = useMemo(() => userRole === "normal-user", [userRole]);

    // Check if user has admin access (superadmin or admin)
    const hasAdminAccess = useMemo(() => isSuperadmin || isAdmin, [isSuperadmin, isAdmin]);

    // Check if user can access admin side
    const canAccessAdmin = useMemo(() => {
        if (isNormalUser) return false;
        return isSuperadmin || isAdmin || isManager || isCashier;
    }, [isSuperadmin, isAdmin, isManager, isCashier, isNormalUser]);

    // Get user's store permissions (matching user model's getStorePermissions method)
    const getStorePermissions = useCallback((storeId) => {
        if (!user || !storeId) {
            return {
                canView: false,
                canEdit: false,
                canSell: false,
                canManage: false,
                canAccess: false
            };
        }

        const normalizedStoreId = normalizeStoreId(storeId);
        if (!normalizedStoreId) {
            return {
                canView: false,
                canEdit: false,
                canSell: false,
                canManage: false,
                canAccess: false
            };
        }

        // Superadmin gets full permissions
        if (isSuperadmin) {
            return {
                canView: true,
                canEdit: true,
                canSell: true,
                canManage: true,
                canAccess: true,
                isSuperadmin: true
            };
        }

        // Users with global access
        if (user.canAccessAllStores) {
            return {
                canView: true,
                canEdit: isAdmin,
                canSell: true,
                canManage: false,
                canAccess: true,
                hasGlobalAccess: true
            };
        }

        // Check assigned store
        if (user.assignedStore) {
            const assignedStoreId = normalizeStoreId(user.assignedStore);

            if (assignedStoreId === normalizedStoreId) {
                return {
                    canView: true,
                    canEdit: isAdmin || isManager,
                    canSell: true,
                    canManage: isAdmin,
                    canAccess: true,
                    isAssignedStore: true
                };
            }
        }

        // Check store permissions array
        const storePermission = user.storePermissions?.find(perm => {
            if (!perm.store) return false;
            const permStoreId = normalizeStoreId(perm.store);
            return permStoreId === normalizedStoreId;
        });

        // Return found permissions
        if (storePermission) {
            return {
                canView: storePermission.canView || false,
                canEdit: storePermission.canEdit || false,
                canSell: storePermission.canSell || false,
                canManage: storePermission.canManage || false,
                canAccess: true,
                hasExplicitPermission: true
            };
        }

        return {
            canView: false,
            canEdit: false,
            canSell: false,
            canManage: false,
            canAccess: false
        };
    }, [user, isSuperadmin, isAdmin, isManager]);

    // ============ STORE PERMISSION CHECKS ============
    const canAccessStore = useCallback((storeId) => {
        if (!user || !storeId) return false;
        return getStorePermissions(storeId).canAccess;
    }, [user, getStorePermissions]);

    const canManageStore = useCallback((storeId) => {
        return getStorePermissions(storeId).canManage;
    }, [getStorePermissions]);

    const canSellInStore = useCallback((storeId) => {
        return getStorePermissions(storeId).canSell;
    }, [getStorePermissions]);

    const canEditStore = useCallback((storeId) => {
        return getStorePermissions(storeId).canEdit;
    }, [getStorePermissions]);

    const canViewStore = useCallback((storeId) => {
        return getStorePermissions(storeId).canView;
    }, [getStorePermissions]);

    // Check if user has any permissions for a store
    const hasAnyStorePermission = useCallback((storeId) => {
        const permissions = getStorePermissions(storeId);
        return permissions.canView || permissions.canEdit ||
            permissions.canSell || permissions.canManage;
    }, [getStorePermissions]);

    // ============ STORE ROLE MANAGEMENT ============
    const getStoreRole = useCallback((storeId) => {
        if (!user || !storeId) return null;

        const normalizedStoreId = normalizeStoreId(storeId);
        const storeRole = user.storeRoles?.find(role => {
            if (!role.store) return false;
            const roleStoreId = normalizeStoreId(role.store);
            return roleStoreId === normalizedStoreId;
        });

        return storeRole?.role || null;
    }, [user]);

    const getPrimaryStore = useCallback(() => {
        if (!user) return null;
        return user.assignedStore;
    }, [user]);

    const canAccessAllStores = useMemo(() => {
        if (!user) return false;
        return user.canAccessAllStores || isSuperadmin || isAdmin;
    }, [user, isSuperadmin, isAdmin]);

    // ============ ACTION PERMISSIONS ============
    const canPerformAction = useCallback((action, storeId = null) => {
        if (!user) return false;

        if (isSuperadmin) return true;

        if (!storeId) {
            if (isAdmin) return true;
            if (user.canAccessAllStores) {
                return isManager || isAdmin;
            }
            return false;
        }

        const permissions = getStorePermissions(storeId);
        switch (action) {
            case 'view': return permissions.canView;
            case 'edit': return permissions.canEdit;
            case 'sell': return permissions.canSell;
            case 'manage': return permissions.canManage;
            case 'access': return permissions.canAccess;
            default: return false;
        }
    }, [user, isSuperadmin, isAdmin, isManager, getStorePermissions]);

    // ============ HELPER FUNCTIONS ============
    const getAccessibleStoreIds = useCallback(() => {
        if (!user) return [];

        const storeIds = new Set();

        if (user.assignedStore) {
            const storeId = normalizeStoreId(user.assignedStore);
            if (storeId) storeIds.add(storeId);
        }

        user.storePermissions?.forEach(perm => {
            if (perm.store) {
                const storeId = normalizeStoreId(perm.store);
                if (storeId) storeIds.add(storeId);
            }
        });

        return Array.from(storeIds);
    }, [user]);

    const getStoresWithPermission = useCallback((permission) => {
        if (!user) return [];

        const storeIds = new Set();
        user.storePermissions?.forEach(perm => {
            if (perm.store && perm[permission]) {
                const storeId = normalizeStoreId(perm.store);
                if (storeId) storeIds.add(storeId);
            }
        });

        return Array.from(storeIds);
    }, [user]);

    const hasStoreAccess = useMemo(() => {
        if (!user) return false;
        return user.canAccessAllStores ||
            user.assignedStore ||
            (user.storePermissions?.length > 0);
    }, [user]);

    const value = {
        // Role checks
        isSuperadmin,
        isAdmin,
        isManager,
        isCashier,
        isNormalUser,
        hasAdminAccess,
        canAccessAdmin,

        // Store permission checks
        canAccessStore,
        canViewStore,
        canEditStore,
        canSellInStore,
        canManageStore,
        getStorePermissions,
        hasAnyStorePermission,

        // Store role management
        getStoreRole,
        getPrimaryStore,
        canAccessAllStores,

        // Action permissions
        canPerformAction,

        // Store lists
        getAccessibleStoreIds,
        getStoresWithPermission,

        // General checks
        hasStoreAccess,

        // Helper functions
        getUserRole: () => userRole,
        getUserData: () => user,
        getUserPermissions: () => ({
            canAccessAllStores: user?.canAccessAllStores || false,
            assignedStore: user?.assignedStore || null,
            storePermissions: user?.storePermissions || [],
            storeRoles: user?.storeRoles || []
        }),

        // Debug helper
        debugPermissions: (storeId) => {
            if (process.env.NODE_ENV === 'development') {
                console.log('=== ROLE CONTEXT DEBUG ===');
                console.log('User:', user);
                console.log('User Role:', userRole);
                console.log('Store ID:', storeId);
                console.log('Permissions:', getStorePermissions(storeId));
                console.log('=====================');
            }
        }
    };

    return (
        <RoleContext.Provider value={value}>
            {children}
        </RoleContext.Provider>
    );
};

export const useRole = () => {
    const context = useContext(RoleContext);
    if (!context) {
        throw new Error("useRole must be used within a StoreRoleProvider");
    }
    return context;
};