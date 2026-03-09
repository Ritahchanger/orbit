// context/roles/RolePermissionContext.jsx
import { createContext, useContext, useMemo, useCallback } from 'react';
import { useAuth } from './authentication/AuthenticationContext';
import { useRoles } from '../admin-pages/hooks/role.hooks';

const RolePermissionContext = createContext();

export const useRoleContext = () => {
    const context = useContext(RolePermissionContext);
    if (!context) {
        throw new Error('useRoleContext must be used within a RolePermissionProvider');
    }
    return context;
};

export const RolePermissionProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const {
        data: rolesData,
        isLoading: rolesLoading,
        error: rolesError
    } = useRoles();

    const allRoles = rolesData?.data || [];

    // Define roleHierarchy with useMemo to make it stable
    const roleHierarchy = useMemo(() => ({
        'superadmin': ['superadmin', 'admin', 'manager', 'cashier', 'staff'],
        'admin': ['admin', 'manager', 'cashier', 'staff'],
        'manager': ['manager', 'cashier', 'staff'],
        'cashier': ['cashier', 'staff'],
        'staff': ['staff']
    }), []);

    // Validate hierarchy keys against actual roles
    const isValidRoleHierarchy = useMemo(() => {
        const roleNames = allRoles.map(role => role.name);
        const hierarchyKeys = Object.keys(roleHierarchy);
        const hierarchyValues = Object.values(roleHierarchy).flat();

        const allValidKeys = hierarchyKeys.every(key => roleNames.includes(key));
        const allValidValues = hierarchyValues.every(value => roleNames.includes(value));

        return allValidKeys && allValidValues;
    }, [allRoles, roleHierarchy]);

    const getUserRole = useCallback(() => {
        if (!user?.role || !allRoles.length) return null;
        return allRoles.find(role => role.name === user.role);
    }, [user, allRoles]);

    const userRole = getUserRole();
    const userPermissions = userRole?.permissions || [];

    const canAccessRole = useCallback((requiredRole) => {
        if (!user?.role || !requiredRole) return false;
        if (user.role === 'superadmin') return true;

        // Check if role exists
        const roleExists = allRoles.some(role => role.name === requiredRole);
        if (!roleExists) return false;

        const accessibleRoles = roleHierarchy[user.role] || [];
        return accessibleRoles.includes(requiredRole);
    }, [user, allRoles, roleHierarchy]);

    const hasPermission = useCallback((permission) => {
        if (!user || !permission) return false;
        if (user.role === 'superadmin') return true;
        return userPermissions.includes(permission);
    }, [user, userPermissions]);

    const hasAnyPermission = useCallback((permissions) => {
        if (!user || !Array.isArray(permissions)) return false;
        if (user.role === 'superadmin') return true;
        return permissions.some(permission => userPermissions.includes(permission));
    }, [user, userPermissions]);

    const hasAllPermissions = useCallback((permissions) => {
        if (!user || !Array.isArray(permissions)) return false;
        if (user.role === 'superadmin') return true;
        return permissions.every(permission => userPermissions.includes(permission));
    }, [user, userPermissions]);

    const canAccessAnyRole = useCallback((requiredRoles) => {
        if (!user?.role || !Array.isArray(requiredRoles)) return false;
        if (user.role === 'superadmin') return true;
        return requiredRoles.some(role => canAccessRole(role));
    }, [user, canAccessRole]);

    // Get roles that current user can manage
    const getManageableRoles = useCallback(() => {
        if (!user?.role) return [];
        if (user.role === 'superadmin') return allRoles;

        const accessibleRoleNames = roleHierarchy[user.role] || [];
        return allRoles.filter(role => accessibleRoleNames.includes(role.name));
    }, [user, allRoles, roleHierarchy]);

    const value = useMemo(() => ({
        // Data
        allRoles,
        loading: rolesLoading,
        error: rolesError,
        isValidRoleHierarchy,

        // User role info
        userRole,
        userPermissions,
        userRoleName: user?.role,

        // Permission checks
        canAccessRole,
        canAccessAnyRole,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,

        // Helper functions
        getRoleByName: (roleName) => {
            return allRoles.find(role => role.name === roleName);
        },
        getManageableRoles,
        canManageRole: (roleName) => canAccessRole(roleName)
    }), [
        allRoles,
        rolesLoading,
        rolesError,
        isValidRoleHierarchy,
        user,
        userRole,
        userPermissions,
        canAccessRole,
        canAccessAnyRole,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        getManageableRoles
    ]);

    return (
        <RolePermissionContext.Provider value={value}>
            {children}
        </RolePermissionContext.Provider>
    );
};

export const useSimpleRolePermissionCheck = () => {
    const { canAccessRole, canAccessAnyRole, userRoleName, loading } = useRoleContext();

    return {
        canAccessRole,
        canAccessAnyRole,
        userRole: userRoleName,
        loading
    };
};

// New hook for permissions-only checks
export const usePermissionCheck = () => {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = useRoleContext();

    return {
        hasPermission,
        hasAnyPermission,
        hasAllPermissions
    };
};