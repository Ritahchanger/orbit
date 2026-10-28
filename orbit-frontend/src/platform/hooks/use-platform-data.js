import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import platformApi from "../api/platform-api";
import { platformKeys } from "./use-platform-auth";

export const usePlatformOverview = () =>
  useQuery({
    queryKey: platformKeys.overview(),
    queryFn: () => platformApi.overview().then((r) => r.data),
    staleTime: 60 * 1000,
  });

export const usePlatformActivity = (params) =>
  useQuery({
    queryKey: platformKeys.activity(params),
    queryFn: () => platformApi.activity(params),
    placeholderData: keepPreviousData,
    staleTime: 15 * 1000,
  });

// Quick search; only runs from 2 characters, matching the server's minimum
export const usePlatformSearch = (query) =>
  useQuery({
    queryKey: platformKeys.search(query),
    queryFn: () => platformApi.search(query).then((r) => r.data),
    enabled: query.length >= 2,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

export const usePlatformBusinesses = (params) =>
  useQuery({
    queryKey: platformKeys.businesses(params),
    queryFn: () => platformApi.businesses(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

export const usePlatformBusiness = (id) =>
  useQuery({
    queryKey: platformKeys.business(id),
    queryFn: () => platformApi.business(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 30 * 1000,
  });

export const useChangeBusinessStatus = (id) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ status, reason }) => platformApi.changeBusinessStatus(id, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformKeys.business(id) });
      queryClient.invalidateQueries({ queryKey: ["platform", "businesses"] });
      queryClient.invalidateQueries({ queryKey: platformKeys.overview() });
      queryClient.invalidateQueries({ queryKey: ["platform", "activity"] });
    },
  });
};
