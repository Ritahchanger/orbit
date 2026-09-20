// hooks/useRoles.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import rolesApi from '../services/role-api';

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

