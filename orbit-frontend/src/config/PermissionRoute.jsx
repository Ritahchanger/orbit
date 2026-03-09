// components/auth/PermissionRoute.jsx
import { Navigate } from 'react-router-dom';

import { usePermissions } from '../context/permissions/permissions-context';

const PermissionRoute = ({
    children,
    permission,
    any = [],
    all = [],
    storeId,
    storePermission,
    redirectTo = '/admin/dashboard',
    fallback = null
}) => {
    const {
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        hasStorePermission,
        isAuthenticated
    } = usePermissions();

    // Check if user is authenticated
    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    let hasAccess = false;

    if (storeId && storePermission) {
        // Check store-specific permission
        hasAccess = hasStorePermission(storeId, storePermission);
    } else if (permission) {
        // Check single permission
        hasAccess = hasPermission(permission);
    } else if (any.length > 0) {
        // Check any of the permissions
        hasAccess = hasAnyPermission(any);
    } else if (all.length > 0) {
        // Check all permissions
        hasAccess = hasAllPermissions(all);
    } else {
        // No permission check required
        hasAccess = true;
    }

    if (!hasAccess) {
        if (fallback) {
            return fallback;
        }
        return <Navigate to={redirectTo} replace />;
    }

    return children;
};

export default PermissionRoute;