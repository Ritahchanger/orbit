// users.hook.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import UserApi from "../services/user-api";

// Query keys for users
export const userKeys = {
  all: ["users"],
  lists: () => [...userKeys.all, "list"],
  list: (filters) => [...userKeys.lists(), { filters }],
  details: () => [...userKeys.all, "detail"],
  detail: (id) => [...userKeys.details(), id],
  stats: () => [...userKeys.all, "stats"],
  admins: () => [...userKeys.all, "admins"],
  userStores: (userId) => [...userKeys.detail(userId), "stores"],
  storePermissions: (userId, storeId) => [
    ...userKeys.detail(userId),
    "stores",
    storeId,
    "permissions",
  ],
};

// ============ QUERY HOOKS ============

// Get all users
export const useGetAllUsers = (params = {}) => {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => UserApi.getAllUsers(params),
  });
};

// Get user stats
export const useGetUserStats = () => {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: () => UserApi.getUserStats(),
  });
};

// Get all admins
export const useGetAllAdmins = (params = {}) => {
  return useQuery({
    queryKey: [...userKeys.admins(), params],
    queryFn: () => UserApi.getAllAdmins(params),
  });
};

// Get user by ID
export const useGetUserById = (id) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => UserApi.getUserById(id),
    enabled: !!id, // Only run query if id exists
  });
};

// Get user stores
export const useGetUserStores = (userId) => {
  return useQuery({
    queryKey: userKeys.userStores(userId),
    queryFn: () => UserApi.getUserStores(userId),
    enabled: !!userId,
  });
};

// Get user store permissions
export const useGetUserStorePermissions = (userId, storeId) => {
  return useQuery({
    queryKey: userKeys.storePermissions(userId, storeId),
    queryFn: () => UserApi.getUserStorePermissions(userId, storeId),
    enabled: !!userId && !!storeId,
  });
};

// Get my profile
export const useGetMyProfile = () => {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: () => UserApi.getUserById("me"),
  });
};

// Get my stores
export const useGetMyStores = () => {
  return useQuery({
    queryKey: ["user", "me", "stores"],
    queryFn: () => UserApi.getMyStores(),
  });
};

// ============ MUTATION HOOKS ============

export const useUserMutations = () => {
  const queryClient = useQueryClient();

  // ============ PUBLIC MUTATIONS ============
  const registerMutation = useMutation({
    mutationFn: UserApi.register,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });

  // ============ USER PROFILE MUTATIONS ============
  const updateProfileMutation = useMutation({
    mutationFn: (updateData) => UserApi.updateProfile(updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });

  const changeMyPasswordMutation = useMutation({
    mutationFn: (passwordData) => UserApi.changeMyPassword(passwordData),
  });

  // ============ USER STORE MUTATIONS ============
  const setMyPrimaryStoreMutation = useMutation({
    mutationFn: (storeId) => UserApi.setMyPrimaryStore(storeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
      queryClient.invalidateQueries({ queryKey: ["user", "me", "stores"] });
    },
  });

  // ============ ADMIN USER MANAGEMENT MUTATIONS ============
  const deleteUserMutation = useMutation({
    mutationFn: (id) => UserApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.admins() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: ({ id, role }) => UserApi.updateUserRole(id, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: userKeys.admins() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
    },
  });

  const changeUserPasswordMutation = useMutation({
    mutationFn: ({ id, ...passwordData }) =>
      UserApi.changeUserPassword(id, passwordData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(variables.id),
      });
    },
  });

  // ============ ADMIN STORE ASSIGNMENT MUTATIONS ============
  const assignStoreToUserMutation = useMutation({
    mutationFn: ({ userId, storeData }) =>
      UserApi.assignStoreToUser(userId, storeData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: userKeys.userStores(variables.userId),
      });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });

  const removeStoreFromUserMutation = useMutation({
    mutationFn: ({ userId, storeId }) =>
      UserApi.removeStoreFromUser(userId, storeId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: userKeys.userStores(variables.userId),
      });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });

  const setUserPrimaryStoreMutation = useMutation({
    mutationFn: ({ userId, storeId }) =>
      UserApi.setUserPrimaryStore(userId, storeId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: userKeys.userStores(variables.userId),
      });
    },
  });

  const suspendUserMutation = useMutation({
    mutationFn: ({ userId, reason }) => UserApi.suspendUser(userId, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(variables.userId),
      });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.admins() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
    },
  });

  const unsuspendUserMutation = useMutation({
    mutationFn: (userId) => UserApi.unsuspendUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.admins() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
    },
  });

  return {
    // Public
    registerMutation,

    // User Profile
    updateProfileMutation,

    changeMyPasswordMutation,

    // User Stores
    setMyPrimaryStoreMutation,

    // Admin User Management
    deleteUserMutation,

    updateUserRoleMutation,

    changeUserPasswordMutation,

    // Admin Store Assignments
    assignStoreToUserMutation,

    removeStoreFromUserMutation,

    setUserPrimaryStoreMutation,

    suspendUserMutation,

    unsuspendUserMutation,
  };
};

// Export individual mutations for direct use
export const useRegisterMutation = () => useUserMutations().registerMutation;
export const useUpdateProfileMutation = () =>
  useUserMutations().updateProfileMutation;
export const useChangeMyPasswordMutation = () =>
  useUserMutations().changeMyPasswordMutation;
export const useDeleteUserMutation = () =>
  useUserMutations().deleteUserMutation;
export const useUpdateUserRoleMutation = () =>
  useUserMutations().updateUserRoleMutation;
export const useChangeUserPasswordMutation = () =>
  useUserMutations().changeUserPasswordMutation;
export const useAssignStoreToUserMutation = () =>
  useUserMutations().assignStoreToUserMutation;
export const useRemoveStoreFromUserMutation = () =>
  useUserMutations().removeStoreFromUserMutation;
export const useSetUserPrimaryStoreMutation = () =>
  useUserMutations().setUserPrimaryStoreMutation;
export const useSuspendUserMutation = () =>
  useUserMutations().suspendUserMutation;
export const useUnsuspendUserMutation = () =>
  useUserMutations().unsuspendUserMutation;
