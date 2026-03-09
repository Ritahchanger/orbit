// hooks/useRefund.js
import refundApi from "../services/refund-api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

// ============ QUERY KEYS ============
export const refundKeys = {
  all: ["refunds"],
  lists: () => [...refundKeys.all, "list"],
  list: (filters) => [...refundKeys.lists(), filters],
  details: () => [...refundKeys.all, "detail"],
  detail: (id) => [...refundKeys.details(), id],
  transaction: (id) => [...refundKeys.all, "transaction", id],
  summary: (storeId, days) => [...refundKeys.all, "summary", storeId, days],
  eligibility: (id, amount) => [...refundKeys.all, "eligibility", id, amount],
};

// ============ QUERIES ============

export const useRefund = (refundId) => {
  return useQuery({
    queryKey: refundKeys.detail(refundId),
    queryFn: () => refundApi.getRefundById(refundId),
    enabled: !!refundId,
  });
};

export const useTransactionRefunds = (transactionId) => {
  return useQuery({
    queryKey: refundKeys.transaction(transactionId),
    queryFn: () => refundApi.getRefundsByTransaction(transactionId),
    enabled: !!transactionId,
  });
};

export const useStoreRefunds = (storeId, params = {}) => {
  return useQuery({
    queryKey: refundKeys.list({ storeId, ...params }),
    queryFn: () => refundApi.getRefundsByStore(storeId, params),
    enabled: !!storeId,
  });
};

export const useRefundEligibility = (transactionId, amount = null) => {
  return useQuery({
    queryKey: refundKeys.eligibility(transactionId, amount),
    queryFn: () => refundApi.checkRefundEligibility(transactionId, amount),
    enabled: !!transactionId,
    staleTime: 1000 * 30, // 30 seconds
  });
};

export const useRefundSummary = (storeId = null, days = 30) => {
  return useQuery({
    queryKey: refundKeys.summary(storeId, days),
    queryFn: () => refundApi.getRefundSummary(storeId, days),
  });
};

// ============ MUTATIONS ============

export const useProcessRefund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (refundData) => refundApi.processRefund(refundData),
    onSuccess: (data, variables) => {
      toast.success(
        variables.method === "mpesa"
          ? `✅ Refund processed: Customer received ${data.data?.customerReceived || data.data?.refund?.amount} KES (88%)`
          : `✅ Refund processed: ${data.data?.refund?.refundId}`,
      );

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: refundKeys.transaction(variables.transactionId),
      });
      queryClient.invalidateQueries({
        queryKey: refundKeys.eligibility(variables.transactionId),
      });
      queryClient.invalidateQueries({
        queryKey: refundKeys.summary(),
      });
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to process refund");
    },
  });
};

export const useApproveRefund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (refundId) => refundApi.approveRefund(refundId),
    onSuccess: (data, refundId) => {
      toast.success("✅ Refund approved");
      queryClient.invalidateQueries({ queryKey: refundKeys.detail(refundId) });
      queryClient.invalidateQueries({ queryKey: refundKeys.lists() });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to approve refund");
    },
  });
};

// ============ CONVENIENCE HOOKS ============

export const useCashRefund = () => {
  const { mutate, ...rest } = useProcessRefund();

  return {
    ...rest,
    mutate: (transactionId, amount, reason, items = [], options = {}) =>
      mutate(
        {
          transactionId,
          amount,
          method: "cash",
          reason,
          items,
          returnToStock: options.returnToStock ?? true,
          cashReceivedBy: options.cashReceivedBy,
          notes: options.notes,
        },
        options,
      ),
  };
};

export const useMpesaRefund = () => {
  const { mutate, ...rest } = useProcessRefund();

  return {
    ...rest,
    mutate: (
      transactionId,
      amount,
      reason,
      mpesaPhone,
      items = [],
      options = {},
    ) =>
      mutate(
        {
          transactionId,
          amount,
          method: "mpesa",
          reason,
          mpesaPhone,
          items,
          returnToStock: options.returnToStock ?? true,
          notes: options.notes,
        },
        options,
      ),
  };
};

export const useBankRefund = () => {
  const { mutate, ...rest } = useProcessRefund();

  return {
    ...rest,
    mutate: (
      transactionId,
      amount,
      reason,
      bankDetails,
      items = [],
      options = {},
    ) =>
      mutate(
        {
          transactionId,
          amount,
          method: "bank",
          reason,
          items,
          returnToStock: options.returnToStock ?? true,
          bankReference: bankDetails.reference,
          bankAccount: bankDetails.account,
          bankName: bankDetails.name,
          notes: options.notes,
        },
        options,
      ),
  };
};

// ============ EXPORT ============

export default {
  // Queries
  useRefund,
  useTransactionRefunds,
  useStoreRefunds,
  useRefundEligibility,
  useRefundSummary,

  // Mutations
  useProcessRefund,
  useApproveRefund,

  // Convenience
  useCashRefund,
  useMpesaRefund,
  useBankRefund,
};
