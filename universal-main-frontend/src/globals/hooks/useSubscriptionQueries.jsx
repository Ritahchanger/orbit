import { useQuery } from "@tanstack/react-query";
import subscriptionApi from "../services/subscription-api";

// Plan Queries
export const usePlans = (params = {}) => {
  return useQuery({
    queryKey: ["plans", params],
    queryFn: () => subscriptionApi.getAllPlans(params),
  });
};

export const usePlan = (id) => {
  return useQuery({
    queryKey: ["plan", id],
    queryFn: () => subscriptionApi.getPlanById(id),
    enabled: !!id, // Only run if id is provided
  });
};

// Payment Queries
export const usePayments = (params = {}) => {
  return useQuery({
    queryKey: ["payments", params],
    queryFn: () => subscriptionApi.getAllPayments(params),
  });
};

export const usePayment = (id) => {
  return useQuery({
    queryKey: ["payment", id],
    queryFn: () => subscriptionApi.getPaymentById(id),
    enabled: !!id,
  });
};

// Subscription Queries
export const useSubscriptions = (params = {}) => {
  return useQuery({
    queryKey: ["subscriptions", params],
    queryFn: () => subscriptionApi.getAllSubscriptions(params),
  });
};

export const useMySubscription = () => {
  return useQuery({
    queryKey: ["my-subscription"],
    queryFn: () => subscriptionApi.getMySubscription(),
    retry: false, // Don't retry if 404 (no subscription found)
  });
};

export const useSubscription = (id) => {
  return useQuery({
    queryKey: ["subscription", id],
    queryFn: () => subscriptionApi.getSubscriptionById(id),
    enabled: !!id,
  });
};
