// hooks/useStores.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import storeApi from "../services/store-api";

// Query keys
export const storeKeys = {
  all: ["stores"],
  lists: () => [...storeKeys.all, "list"],
  list: (filters) => [...storeKeys.lists(), { filters }],
  details: () => [...storeKeys.all, "detail"],
  detail: (id) => [...storeKeys.details(), id],
  stats: (id) => [...storeKeys.detail(id), "stats"],
  users: (id) => [...storeKeys.detail(id), "users"],
  inventory: (id) => [...storeKeys.detail(id), "inventory"],
  sales: (id) => [...storeKeys.detail(id), "sales"],
  workers: (id) => [...storeKeys.detail(id), "workers"], // Add this line
  analytics: (id, timeRange) => [
    ...storeKeys.detail(id),
    "analytics",
    timeRange,
  ],
  performance: (id, period) => [...storeKeys.detail(id), "performance", period],
};

// Custom hooks
export const useStores = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: storeKeys.list(filters),
    queryFn: () => storeApi.getAllStores(filters),
    ...options,
  });
};

export const useStore = (storeId, options = {}) => {
  return useQuery({
    queryKey: storeKeys.detail(storeId),
    queryFn: () => storeApi.getStoreById(storeId),
    enabled: !!storeId,
    // Use initial data from cache if available
    initialData: () => {
      const queryClient = useQueryClient();
      const cachedStores = queryClient.getQueryData(storeKeys.list());
      if (cachedStores?.data) {
        const cachedStore = cachedStores.data.find((s) => s._id === storeId);
        if (cachedStore) {
          return { data: cachedStore, fromCache: true };
        }
      }
      return undefined;
    },

    ...options,
  });
};

export const useStoreWorkers = (id, filters = {}, options = {}) => {
  return useQuery({
    queryKey: [...storeKeys.workers(id), filters],
    queryFn: () => storeApi.getWorkers(id, filters),
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
};

export const useCreateStore = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (storeData) => storeApi.createStore(storeData),
    onSuccess: (data) => {
      // Update the stores list cache
      queryClient.setQueryData(storeKeys.list(), (old) => {
        if (!old) return { data: [data.data] };
        return { ...old, data: [...old.data, data.data] };
      });

      // Invalidate queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: storeKeys.lists() });
    },
    ...options,
  });
};

export const useUpdateStore = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ storeId, updateData }) => {
      console.log("🔍 useUpdateStore - storeId:", storeId);

      if (!storeId) {
        throw new Error("Store ID is required");
      }

      // Clean updateData
      const cleanUpdateData = { ...updateData };
      delete cleanUpdateData._id;
      delete cleanUpdateData.__v;
      delete cleanUpdateData.createdAt;
      delete cleanUpdateData.updatedAt;

      return await storeApi.updateStore(storeId, cleanUpdateData);
    },
    onSuccess: (data, variables) => {
      const { storeId } = variables;

      // Update stores list cache
      queryClient.setQueryData(storeKeys.list(), (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((store) =>
            store._id === storeId
              ? { ...store, ...data.data, updatedAt: new Date().toISOString() }
              : store,
          ),
        };
      });

      // Update individual store cache
      queryClient.setQueryData(storeKeys.detail(storeId), (old) => {
        if (!old) return { data: data.data };
        return { ...old, data: { ...old.data, ...data.data } };
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: storeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: storeKeys.detail(storeId) });
      queryClient.invalidateQueries({ queryKey: storeKeys.stats(storeId) });
      queryClient.invalidateQueries({
        queryKey: storeKeys.performance(storeId),
      });
    },
    onError: (error, variables) => {
      console.error("Update store error:", error);
    },
    ...options,
  });
};

export const useDeleteStore = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (storeId) => storeApi.deleteStore(storeId),
    onSuccess: (_, storeId) => {
      // Update stores list cache
      queryClient.setQueryData(storeKeys.list(), (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter((store) => store._id !== storeId),
        };
      });

      // Remove individual store cache
      queryClient.removeQueries({ queryKey: storeKeys.detail(storeId) });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: storeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: storeKeys.all });
    },
    ...options,
  });
};

export const useStoreStats = (storeId, options = {}) => {
  return useQuery({
    queryKey: storeKeys.stats(storeId),
    queryFn: () => storeApi.getStoreStats(storeId),
    enabled: !!storeId,
    staleTime: 1000 * 60 * 2, // 2 minutes for stats
    ...options,
  });
};

export const useStoreUsers = (storeId, options = {}) => {
  return useQuery({
    queryKey: storeKeys.users(storeId),
    queryFn: () => storeApi.getStoreUsers(storeId),
    enabled: !!storeId,

    ...options,
  });
};

export const useStoreAnalytics = (
  storeId,
  timeRange = "month",
  options = {},
) => {
  return useQuery({
    queryKey: storeKeys.analytics(storeId, timeRange),
    queryFn: () => storeApi.getStoreAnalytics(storeId, timeRange),
    enabled: !!storeId,

    ...options,
  });
};

export const useStorePerformance = (
  storeId,
  period = "month",
  options = {},
) => {
  return useQuery({
    queryKey: storeKeys.performance(storeId, period),
    queryFn: () => storeApi.getStorePerformance(storeId, period),
    enabled: !!storeId,

    ...options,
  });
};

export const useSearchStores = (searchTerm, limit = 10, options = {}) => {
  return useQuery({
    queryKey: ["stores", "search", searchTerm, limit],
    queryFn: () => storeApi.searchStores(searchTerm, limit),
    enabled: !!searchTerm && searchTerm.length >= 2,

    ...options,
  });
};

export const useAssignUserToStore = (storeId, options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, permissions }) =>
      storeApi.assignUserToStore(storeId, userId, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeKeys.users(storeId) });
    },
    ...options,
  });
};

export const useStoreInventory = (storeId, filters = {}, options = {}) => {
  return useQuery({
    queryKey: [...storeKeys.inventory(storeId), filters],
    queryFn: () => storeApi.getStoreInventory(storeId, filters),
    enabled: !!storeId,

    ...options,
  });
};

export const useStoreSales = (storeId, filters = {}, options = {}) => {
  return useQuery({
    queryKey: [...storeKeys.sales(storeId), filters],
    queryFn: () => storeApi.getStoreSales(storeId, filters),
    enabled: !!storeId,

    ...options,
  });
};

// Store context manager hook - using React state for current store
export const useStoreManager = (userId) => {
  const [currentStoreId, setCurrentStoreId] = useState(null);
  const queryClient = useQueryClient();

  const { data: storesResponse, isLoading, error, refetch } = useStores();
  const stores = storesResponse?.data || [];

  // Get current store from cache on mount
  useEffect(() => {
    if (stores.length > 0 && !currentStoreId) {
      // Try to get last selected store from stores cache
      const firstStore = stores[0];
      if (firstStore) {
        setCurrentStoreId(firstStore._id);
      }
    }
  }, [stores, currentStoreId]);

  const switchStore = (storeId) => {
    setCurrentStoreId(storeId);
  };

  const currentStore =
    stores.find((store) => store._id === currentStoreId) || stores[0];

  const getStoreNameById = (id) => {
    if (!stores.length) return id;
    const store = stores.find((s) => s._id === id);
    return store?.name || id;
  };

  const getStoreDetails = (id) => {
    if (!stores.length) return null;
    const store = stores.find((s) => s._id === id);
    return store
      ? {
          name: store.name,
          code: store.code || "",
          location: store.location || "",
          _id: store._id,
          logo: store.logo || null,
        }
      : null;
  };

  const refreshStores = () => {
    queryClient.invalidateQueries({ queryKey: storeKeys.lists() });
    refetch();
  };

  return {
    stores,
    currentStore,
    currentStoreId,
    switchStore,
    getStoreNameById,
    getStoreDetails,
    isLoading,
    error,
    refreshStores,
    refetchStores: refetch,
  };
};

// Hook for getting store names using TanStack Query cache
export const useStoreNames = () => {
  const queryClient = useQueryClient();

  const {
    data: storesResponse,
    isLoading,
    refetch,
  } = useStores({
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const stores = storesResponse?.data || [];

  const storeNames = stores.reduce((acc, store) => {
    if (store._id && store.name) {
      acc[store._id] = {
        name: store.name,
        code: store.code || "",
        location: store.location || "",
        _id: store._id,
        logo: store.logo || null,
      };
    }
    return acc;
  }, {});

  const getStoreName = (storeId) => {
    return storeNames[storeId]?.name || storeId;
  };

  const getStoreInfo = (storeId) => {
    return storeNames[storeId] || null;
  };

  const refreshStoreNames = async () => {
    await queryClient.invalidateQueries({ queryKey: storeKeys.lists() });
    await refetch();
  };

  return {
    storeNames,
    getStoreName,
    getStoreInfo,
    isLoading,
    refreshStoreNames,
  };
};

// Utility function to get store name from TanStack Query cache
export const getStoreNameFromCache = (storeId) => {
  // Note: This can only be used within React components or with access to queryClient
  return storeId; // Simplified - in real usage, you'd need queryClient context
};

// Utility function to get all stores from cache
export const getStoresFromCache = () => {
  // Note: This can only be used within React components or with access to queryClient
  return null; // Simplified - in real usage, you'd need queryClient context
};

// Hook for current store persistence using React state
export const useCurrentStore = () => {
  const [currentStoreId, setCurrentStoreId] = useState(null);
  const queryClient = useQueryClient();

  const setCurrentStore = (storeId) => {
    setCurrentStoreId(storeId);
  };

  const clearCurrentStore = () => {
    setCurrentStoreId(null);
  };

  // Get current store data from cache
  const currentStore = queryClient.getQueryData(
    storeKeys.detail(currentStoreId),
  )?.data;

  return {
    currentStoreId,
    currentStore,
    setCurrentStore,
    clearCurrentStore,
  };
};

// Optimistic updates helper
export const useOptimisticStoreUpdate = () => {
  const queryClient = useQueryClient();

  const optimisticUpdate = (storeId, updateData) => {
    queryClient.setQueryData(storeKeys.detail(storeId), (old) => {
      if (!old) return { data: updateData };
      return { ...old, data: { ...old.data, ...updateData } };
    });

    queryClient.setQueryData(storeKeys.list(), (old) => {
      if (!old?.data) return old;
      return {
        ...old,
        data: old.data.map((store) =>
          store._id === storeId ? { ...store, ...updateData } : store,
        ),
      };
    });
  };

  const cancelOptimisticUpdate = (storeId) => {
    queryClient.invalidateQueries({ queryKey: storeKeys.detail(storeId) });
    queryClient.invalidateQueries({ queryKey: storeKeys.lists() });
  };

  return {
    optimisticUpdate,
    cancelOptimisticUpdate,
  };
};

export default {
  useStores,
  useStore,
  useCreateStore,
  useUpdateStore,
  useDeleteStore,
  useStoreStats,
  useStoreUsers,
  useStoreAnalytics,
  useStorePerformance,
  useSearchStores,
  useAssignUserToStore,
  useStoreInventory,
  useStoreSales,
  useStoreManager,
  useStoreNames,
  useCurrentStore,
  useOptimisticStoreUpdate,
  getStoreNameFromCache,
  getStoresFromCache,
};
