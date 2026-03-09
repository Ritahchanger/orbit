// src/hooks/useTransactionDeleteMutations.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import transactionDeleteApi from "../services/transaction-delete";

export const deletedTransactionKeys = {
  all: () => ["deleted-transactions"],
  list: (params) => ["deleted-transactions", "list", params],
  detail: (id) => ["deleted-transactions", "detail", id],
  stats: () => ["deleted-transactions", "stats"],
};

export const useDeletedTransactions = (params = {}) => {
  return useQuery({
    queryKey: deletedTransactionKeys.list(params),
    queryFn: () => transactionDeleteApi.getDeletedTransactions(params),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

export const useDeletedTransactionById = (id) => {
  return useQuery({
    queryKey: deletedTransactionKeys.detail(id),
    queryFn: () => transactionDeleteApi.getDeletedTransactionById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

export const useDeleteStats = () => {
  return useQuery({
    queryKey: deletedTransactionKeys.stats(),
    queryFn: () => transactionDeleteApi.getDeleteStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

export const useSoftDeleteTransactions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (transactionIds) =>
      transactionDeleteApi.softDeleteTransactions(transactionIds),
    onSuccess: (data, variables) => {
      toast.success(data.message || "Transactions soft deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["transactions", "dashboard"],
      });
      queryClient.invalidateQueries({
        queryKey: ["transactions", "today"],
      });
      queryClient.invalidateQueries({
        queryKey: deletedTransactionKeys.all(),
      });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to soft delete transactions",
      );
    },
  });
};

export const usePermanentDeleteTransactions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ transactionIds, confirm }) =>
      transactionDeleteApi.permanentDeleteTransactions(transactionIds, confirm),

    onSuccess: (data, variables) => {
      toast.success(
        data.message || "Transactions permanently deleted successfully",
      );
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
      });

      queryClient.invalidateQueries({
        queryKey: ["transactions", "dashboard"],
      });

      queryClient.invalidateQueries({
        queryKey: ["transactions", "today"],
      });
      queryClient.invalidateQueries({
        queryKey: deletedTransactionKeys.all(),
      });
      queryClient.invalidateQueries({
        queryKey: deletedTransactionKeys.stats(),
      });
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to permanently delete transactions",
      );
    },
  });
};

export const useRestoreTransactions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (transactionIds) =>
      transactionDeleteApi.restoreTransactions(transactionIds),
    onSuccess: (data, variables) => {
      toast.success(data.message || "Transactions restored successfully");
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
      });

      queryClient.invalidateQueries({
        queryKey: ["transactions", "dashboard"],
      });

      queryClient.invalidateQueries({
        queryKey: ["transactions", "today"],
      });

      queryClient.invalidateQueries({
        queryKey: deletedTransactionKeys.all(),
      });

      queryClient.invalidateQueries({
        queryKey: deletedTransactionKeys.stats(),
      });
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to restore transactions",
      );
    },
  });
};

export const useBulkDeleteTransactions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ transactionIds, type, confirm }) =>
      transactionDeleteApi.bulkDeleteTransactions(
        transactionIds,
        type,
        confirm,
      ),

    onSuccess: (data, variables) => {
      toast.success(data.message || "Bulk delete completed successfully");
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["transactions", "dashboard"],
      });
      queryClient.invalidateQueries({
        queryKey: ["transactions", "today"],
      });
      queryClient.invalidateQueries({
        queryKey: deletedTransactionKeys.all(),
      });

      if (variables.type === "permanent") {
        queryClient.invalidateQueries({
          queryKey: deletedTransactionKeys.stats(),
        });
      }
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to bulk delete transactions",
      );
    },
  });
};

export const useCleanupOldDeleted = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (daysOld = 30) =>
      transactionDeleteApi.cleanupOldDeleted(daysOld),
    onSuccess: (data) => {
      toast.success(data.message || "Cleanup completed successfully");
      queryClient.invalidateQueries({
        queryKey: deletedTransactionKeys.all(),
      });
      queryClient.invalidateQueries({
        queryKey: deletedTransactionKeys.stats(),
      });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to cleanup old transactions",
      );
    },
  });
};

/**
 * Hook: Search deleted transactions
 */
export const useSearchDeletedTransactions = (searchTerm, filters = {}) => {
  return useQuery({
    queryKey: [...deletedTransactionKeys.list(filters), "search", searchTerm],
    queryFn: () =>
      transactionDeleteApi.searchDeletedTransactions(searchTerm, filters),
    enabled: searchTerm && searchTerm.trim().length >= 2,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};
