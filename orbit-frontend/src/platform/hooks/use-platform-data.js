import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import platformApi from "../api/platform-api";
import { platformKeys } from "./use-platform-auth";

export const usePlatformOverview = () =>
  useQuery({
    queryKey: platformKeys.overview(),
    queryFn: () => platformApi.overview().then((r) => r.data),
    staleTime: 60 * 1000,
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
    },
  });
};
