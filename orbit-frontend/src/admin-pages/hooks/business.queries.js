// hooks/useBusinessQueries.js
import { useQuery } from "@tanstack/react-query";



// ── Centralized query keys ────────────────────────────────────────────────────
export const businessKeys = {
  all: () => ["businesses"],
  list: (filters) => ["businesses", "list", filters],
  detail: (id) => ["businesses", "detail", id],
  myBusiness: () => ["businesses", "my-business"],
  search: (query) => ["businesses", "search", query],
};

// ── Get all businesses (protected — admin/superadmin) ─────────────────────────
export const useGetAllBusinesses = (filters = {}) => {
  return useQuery({
    queryKey: businessKeys.list(filters),
    queryFn: () => businessApi.getAll(filters),
    staleTime: 1000 * 60 * 5,
  });
};

// ── Get single business by ID ─────────────────────────────────────────────────
export const useGetBusinessById = (id) => {
  return useQuery({
    queryKey: businessKeys.detail(id),
    queryFn: () => businessApi.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

// ── Get logged-in owner's business ───────────────────────────────────────────
export const useGetMyBusiness = (options = {}) => {
  return useQuery({
    queryKey: businessKeys.myBusiness(),
    queryFn: () => businessApi.getMyBusiness(),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

// ── Public search — used on login page, no token needed ──────────────────────
export const useSearchBusinesses = (query = "", options = {}) => {
  return useQuery({
    queryKey: businessKeys.search(query),
    queryFn: () => businessApi.search(query),
    staleTime: 1000 * 60 * 2, // 2 min — search results go stale faster
    enabled: true, // always runs, even with empty query (returns all active)
    ...options,
  });
};
