import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import permissionApi from '../services/permission-api';

// Query keys
export const permissionKeys = {
    all: ['permissions'],
    lists: () => [...permissionKeys.all, 'list'],
    list: () => [...permissionKeys.lists()],
    userPermissions: (userId) => [...permissionKeys.all, 'user', userId],
    userStorePermissions: (userId, storeId) => [...permissionKeys.userPermissions(userId), 'store', storeId],
    globalPermissions: (userId) => [...permissionKeys.userPermissions(userId), 'global'],
    available: () => [...permissionKeys.all, 'available']
};
/**
 * Mutation to assign a permission to a user
 */

export const useGetAllPermissions = (options = {}) => {
    return useQuery({
        queryKey: permissionKeys.available(),
        queryFn: async () => {
            return await permissionApi.getAllPermissions();
        },
        ...options
    });
};

export const useGetUserPermissions = (userId, options = {}) => {
    return useQuery({
        queryKey: permissionKeys.userPermissions(userId),
        queryFn: async () => {
            if (!userId) return { success: true, data: [] };
            return await permissionApi.getUserPermissions(userId);
        },
        enabled: !!userId, // Only fetch when userId exists
        ...options
    });
};

export const useAssignPermission = (userId, options = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (permissionData) => {
            return await permissionApi.assignPermission(userId, permissionData);
        },
        onSuccess: (data, variables) => {
            // Invalidate user's permissions cache
            queryClient.invalidateQueries({ queryKey: permissionKeys.userPermissions(userId) });

            // If store-scoped, also invalidate specific store permissions
            if (variables.scope === 'store' && variables.storeId) {
                queryClient.invalidateQueries({
                    queryKey: permissionKeys.userStorePermissions(userId, variables.storeId)
                });
            } else if (variables.scope === 'global') {
                queryClient.invalidateQueries({
                    queryKey: permissionKeys.globalPermissions(userId)
                });
            }
        },
        ...options
    });
};

/**
 * Mutation to revoke a permission from a user
 */
export const useRevokePermission = (userId, options = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (permissionData) => {
            return await permissionApi.revokePermission(userId, permissionData);
        },
        onSuccess: (data, variables) => {
            // Invalidate user's permissions cache
            queryClient.invalidateQueries({ queryKey: permissionKeys.userPermissions(userId) });

            // If store-scoped, also invalidate specific store permissions
            if (variables.scope === 'store' && variables.storeId) {
                queryClient.invalidateQueries({
                    queryKey: permissionKeys.userStorePermissions(userId, variables.storeId)
                });
            } else if (variables.scope === 'global') {
                queryClient.invalidateQueries({
                    queryKey: permissionKeys.globalPermissions(userId)
                });
            }
        },
        ...options
    });
};

/**
 * Mutation to batch assign multiple permissions
 * Note: You'll need to extend your backend API for this
 */
export const useBatchAssignPermissions = (userId, options = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (permissionsArray) => {
            // This assumes you'll add a batch endpoint
            // For now, assign sequentially
            const results = [];
            for (const permissionData of permissionsArray) {
                const result = await permissionApi.assignPermission(userId, permissionData);
                results.push(result);
            }
            return results;
        },
        onSuccess: () => {
            // Invalidate all user permission queries
            queryClient.invalidateQueries({ queryKey: permissionKeys.userPermissions(userId) });
        },
        ...options
    });
};

/**
 * Mutation to batch revoke multiple permissions
 */
export const useBatchRevokePermissions = (userId, options = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (permissionsArray) => {
            // Revoke sequentially
            const results = [];
            for (const permissionData of permissionsArray) {
                const result = await permissionApi.revokePermission(userId, permissionData);
                results.push(result);
            }
            return results;
        },
        onSuccess: () => {
            // Invalidate all user permission queries
            queryClient.invalidateQueries({ queryKey: permissionKeys.userPermissions(userId) });
        },
        ...options
    });
};

/**
 * Optimistic mutation for assigning permissions
 * Updates cache immediately, rolls back on error
 */
export const useOptimisticAssignPermission = (userId, options = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (permissionData) => {
            return await permissionApi.assignPermission(userId, permissionData);
        },
        onMutate: async (permissionData) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: permissionKeys.userPermissions(userId) });

            // Snapshot the previous value
            const previousPermissions = queryClient.getQueryData(permissionKeys.userPermissions(userId));

            // Optimistically update to the new value
            queryClient.setQueryData(permissionKeys.userPermissions(userId), (old) => {
                if (!old?.data) return old;

                const newPermission = {
                    _id: `temp-${Date.now()}`, // Temporary ID
                    user: userId,
                    permission: permissionData.permission,
                    scope: permissionData.scope,
                    store: permissionData.storeId || null,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    __v: 0
                };

                return {
                    ...old,
                    data: [...old.data, newPermission]
                };
            });

            return { previousPermissions };
        },
        onError: (err, variables, context) => {
            // Roll back to previous value on error
            if (context?.previousPermissions) {
                queryClient.setQueryData(permissionKeys.userPermissions(userId), context.previousPermissions);
            }
        },
        onSuccess: (data) => {
            // Replace temporary permission with real one from server
            queryClient.setQueryData(permissionKeys.userPermissions(userId), (old) => {
                if (!old?.data) return old;

                // Remove temporary permission
                const filtered = old.data.filter(p => !p._id.startsWith('temp-'));
                // Add the real permission from server
                return {
                    ...old,
                    data: [...filtered, data.data]
                };
            });
        },
        onSettled: () => {
            // Always refetch after error or success
            queryClient.invalidateQueries({ queryKey: permissionKeys.userPermissions(userId) });
        },
        ...options
    });
};

/**
 * Optimistic mutation for revoking permissions
 */
export const useOptimisticRevokePermission = (userId, options = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (permissionData) => {
            return await permissionApi.revokePermission(userId, permissionData);
        },
        onMutate: async (permissionData) => {
            await queryClient.cancelQueries({ queryKey: permissionKeys.userPermissions(userId) });

            const previousPermissions = queryClient.getQueryData(permissionKeys.userPermissions(userId));

            // Optimistically remove the permission
            queryClient.setQueryData(permissionKeys.userPermissions(userId), (old) => {
                if (!old?.data) return old;

                return {
                    ...old,
                    data: old.data.filter(perm =>
                        !(perm.permission === permissionData.permission &&
                            perm.scope === permissionData.scope &&
                            (perm.scope === 'global' ||
                                perm.store?._id === permissionData.storeId ||
                                perm.store === permissionData.storeId))
                    )
                };
            });

            return { previousPermissions };
        },
        onError: (err, variables, context) => {
            if (context?.previousPermissions) {
                queryClient.setQueryData(permissionKeys.userPermissions(userId), context.previousPermissions);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: permissionKeys.userPermissions(userId) });
        },
        ...options
    });
};

// Export all mutations
export default {
    // Query hooks
    useGetAllPermissions,

    // Mutation hooks
    useAssignPermission,
    useRevokePermission,
    useBatchAssignPermissions,
    useBatchRevokePermissions,
    useOptimisticAssignPermission,
    useOptimisticRevokePermission
};