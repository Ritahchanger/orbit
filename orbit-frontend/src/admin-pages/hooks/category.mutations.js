// hooks/useCategories.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import categoriesApi from "../services/categories";

// Query keys
export const categoryKeys = {
  all: ["categories"],
  lists: () => [...categoryKeys.all, "list"],
  list: (filters) => [...categoryKeys.lists(), { filters }],
  details: () => [...categoryKeys.all, "detail"],
  detail: (id) => [...categoryKeys.details(), id],
};

// ============ GET HOOKS ============

export const useCategories = (options = {}) => {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: () => categoriesApi.getAll(),
    ...options,
  });
};

export const useCategory = (categoryId, options = {}) => {
  return useQuery({
    queryKey: categoryKeys.detail(categoryId),
    queryFn: () => categoriesApi.getById(categoryId),
    enabled: !!categoryId,
    ...options,
  });
};

// ============ CREATE MUTATION ============

export const useCreateCategory = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryData) => categoriesApi.create(categoryData),
    onSuccess: (data) => {
      // Invalidate and refetch categories list
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
    ...options,
  });
};

// ============ UPDATE MUTATION ============

export const useUpdateCategory = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...updatedData }) =>
      categoriesApi.update(id, updatedData),
    onSuccess: (data, variables) => {
      // Invalidate both the list and the specific category
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: categoryKeys.detail(variables.id),
      });
    },
    ...options,
  });
};

// ============ DELETE MUTATION ============

export const useDeleteCategory = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => categoriesApi.delete(id),
    onSuccess: (data, id) => {
      // Invalidate categories list
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      // Remove the specific category from cache
      queryClient.removeQueries({ queryKey: categoryKeys.detail(id) });
    },
    ...options,
  });
};
