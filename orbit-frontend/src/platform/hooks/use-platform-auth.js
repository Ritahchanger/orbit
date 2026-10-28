import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import platformApi from "../api/platform-api";

export const platformKeys = {
  all: ["platform"],
  me: () => ["platform", "me"],
  overview: () => ["platform", "overview"],
  search: (q) => ["platform", "search", q],
  businesses: (params) => ["platform", "businesses", params],
  business: (id) => ["platform", "business", id],
};

// The signed-in platform admin, or null when there's no valid session
export const usePlatformAdmin = () =>
  useQuery({
    queryKey: platformKeys.me(),
    queryFn: async () => {
      try {
        const { data } = await platformApi.me();
        return data.admin;
      } catch (error) {
        if (error.status === 401) return null;
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

export const usePlatformLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: platformApi.login,
    onSuccess: ({ data }) => queryClient.setQueryData(platformKeys.me(), data.admin),
  });
};

export const usePlatformLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: platformApi.logout,
    onSettled: () => {
      queryClient.removeQueries({ queryKey: platformKeys.all });
      queryClient.setQueryData(platformKeys.me(), null);
    },
  });
};
