// hooks/useRoles.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import rolesApi from '../services/role-api';


import permissionApi from '../services/permission-api';

export const useRoles = (options = {}) => {
    return useQuery({
        queryKey: ['roles', options],
        queryFn: () => rolesApi.getAllRoles(options),
        ...options
    });
};

export const useRole = (roleId, options = {}) => {
    return useQuery({
        queryKey: ['roles', roleId],
        queryFn: () => rolesApi.getRoleById(roleId),
        enabled: !!roleId,
        ...options
    });
};

    export const useCreateRole = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (roleData) => rolesApi.createRole(roleData),
        onSuccess: () => {
            queryClient.invalidateQueries(['roles']);
        }
    });
};

export const useUpdateRole = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ roleId, updates }) => rolesApi.updateRole(roleId, updates),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(['roles']);
            queryClient.invalidateQueries(['roles', variables.roleId]);
        }
    });
};

export const useDeleteRole = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (roleId) => rolesApi.deleteRole(roleId),
        onSuccess: () => {
            queryClient.invalidateQueries(['roles']);
        }
    });
};

export const useRoleUsers = (roleId, options = {}) => {
    return useQuery({
        queryKey: ['roles', roleId, 'users', options],
        queryFn: () => rolesApi.getRoleUsers(roleId, options),
        enabled: !!roleId,
        ...options
    });
};

export const useAddPermissionToRole = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ roleId, permissionKey }) =>
            rolesApi.addPermissionToRole(roleId, permissionKey),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(['roles', variables.roleId]);
            queryClient.invalidateQueries(['permissions', 'user']);
        }
    });
};

export const useRemovePermissionFromRole = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ roleId, permissionKey }) =>
            rolesApi.removePermissionFromRole(roleId, permissionKey),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(['roles', variables.roleId]);
            queryClient.invalidateQueries(['permissions', 'user']);
        }
    });
};

export const useRoleStatistics = () => {
    return useQuery({
        queryKey: ['roles', 'statistics'],
        queryFn: () => rolesApi.getRoleStatistics()
    });
};

export const useAssignableRoles = (roleName) => {
    return useQuery({
        queryKey: ['roles', 'assignable', roleName],
        queryFn: () => rolesApi.getAssignableRoles(roleName),
        enabled: !!roleName
    });
};

// Combined permissions hook (roles + user-specific)
export const useUserAllPermissions = (userId) => {
    return useQuery({
        queryKey: ['permissions', 'user', userId],
        queryFn: async () => {
            const [rolePerms, userPerms] = await Promise.all([
                // Get user's role to get role permissions
                // This is a simplified version - you might need to adjust based on your user data
                rolesApi.getRoleByName('user-role-placeholder').catch(() => ({ data: { permissions: [] } })),
                permissionApi.getUserPermissions(userId)
            ]);

            // Combine role and user-specific permissions
            const allPermissions = [
                ...(rolePerms.data?.permissions || []),
                ...(userPerms.data?.permissions || []).map(p => p.permission || p.key)
            ];

            return [...new Set(allPermissions)]; // Remove duplicates
        },
        enabled: !!userId
    });
};