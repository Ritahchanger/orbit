// src/hooks/useLogsMutations.js
import { useMutation, useQueryClient } from "@tanstack/react-query";

import logsApi from "../services/logs-api";
/**
 * 1. Mutation: Delete a single log
 */
export const logKeys = {
  all: (params = {}) => ["logs", params],
  detail: (id) => ["logs", "detail", id],
  list: (params = {}) => ["logs", "list", params],
};

export const useDeleteLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (logId) => logsApi.deleteLog(logId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: logKeys.all() });
    },
  });
};

/**
 * 2. Mutation: Batch delete logs
 */
export const useDeleteLogsBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (logIds) => logsApi.deleteLogsBatch(logIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: logKeys.all() });
    },
  });
};

/**
 * 3. Mutation: Fetch logs manually
 * Useful for forcing refresh on-demand
 */
export const useFetchLogs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params = { page: 1, limit: 20 }) => logsApi.getLogs(params),
    onSuccess: (data, params) => {
      // Update the logs cache manually
      queryClient.setQueryData(logKeys.all(), data);
    },
  });
};
