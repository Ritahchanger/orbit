import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import platformApi from "../api/platform-api";
import { platformKeys } from "./use-platform-auth";

export const useBillingSubscriptions = (params) =>
  useQuery({
    queryKey: platformKeys.subscriptions(params),
    queryFn: () => platformApi.subscriptions(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

export const useBillingPayments = (params) =>
  useQuery({
    queryKey: platformKeys.payments(params),
    queryFn: () => platformApi.payments(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

export const useBillingPlans = () =>
  useQuery({
    queryKey: platformKeys.plans(),
    queryFn: () => platformApi.plans().then((r) => r.data),
    staleTime: 10 * 60 * 1000,
  });

// After any billing action, refresh everything that shows billing data
const useBillingMutation = (mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      ["billing", "business", "businesses", "overview", "activity"].forEach((key) =>
        queryClient.invalidateQueries({ queryKey: ["platform", key] }),
      );
    },
  });
};

export const useExtendTrial = (businessId) =>
  useBillingMutation((body) => platformApi.extendTrial(businessId, body));

export const useChangePlan = (businessId) =>
  useBillingMutation((body) => platformApi.changePlan(businessId, body));

export const useRecordPayment = (businessId) =>
  useBillingMutation((body) => platformApi.recordPayment(businessId, body));
