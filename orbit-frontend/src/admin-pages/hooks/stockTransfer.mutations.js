// hooks/useStockTransfer.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import stockTransferApi from "../services/stock-transfers-api";
import { toast } from "react-hot-toast";
import { inventoryKeys } from "./store-inventory.queries";

// Query keys
export const transferKeys = {
  all: ["transfers"],
  history: (params) => ["transfers", "history", params],
  detail: (transferId) => ["transfers", transferId],
};

// ============ GET TRANSFER HISTORY QUERY ============
export const useTransferHistory = (params = {}) => {
  return useQuery({
    queryKey: transferKeys.history(params), // 👈 Use consistent key pattern
    queryFn: () => stockTransferApi.getTransferHistory(params),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });
};

// ============ GET SINGLE TRANSFER QUERY ============
export const useTransferDetail = (transferId) => {
  return useQuery({
    queryKey: transferKeys.detail(transferId),
    queryFn: () => stockTransferApi.getTransferById(transferId),
    enabled: !!transferId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ============ SINGLE TRANSFER MUTATION ============
export const useTransferStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transferData) => {
      console.log("📤 TransferStock payload:", transferData);
      return stockTransferApi.transferStock(transferData);
    },
    onSuccess: (data, variables) => {
      console.log("✅ Transfer successful:", data);

      // 1. Invalidate transfers history
      queryClient.invalidateQueries({ queryKey: transferKeys.all });
      queryClient.invalidateQueries({ queryKey: transferKeys.history() });

      // 2. INVALIDATE INVENTORY FOR SOURCE STORE
      if (variables.sourceStoreId) {
        // Invalidate all inventory queries for source store
        queryClient.invalidateQueries({
          queryKey: inventoryKeys.list(variables.sourceStoreId),
        });
        queryClient.invalidateQueries({
          queryKey: inventoryKeys.stats(variables.sourceStoreId),
        });
        queryClient.invalidateQueries({
          queryKey: inventoryKeys.alerts(variables.sourceStoreId),
        });

        // Invalidate any infinite queries for source store
        queryClient.invalidateQueries({
          queryKey: [
            ...inventoryKeys.list(variables.sourceStoreId),
            "infinite",
          ],
        });
      }

      // 3. INVALIDATE INVENTORY FOR DESTINATION STORE
      if (variables.destinationStoreId) {
        // Invalidate all inventory queries for destination store
        queryClient.invalidateQueries({
          queryKey: inventoryKeys.list(variables.destinationStoreId),
        });
        queryClient.invalidateQueries({
          queryKey: inventoryKeys.stats(variables.destinationStoreId),
        });
        queryClient.invalidateQueries({
          queryKey: inventoryKeys.alerts(variables.destinationStoreId),
        });

        // Invalidate any infinite queries for destination store
        queryClient.invalidateQueries({
          queryKey: [
            ...inventoryKeys.list(variables.destinationStoreId),
            "infinite",
          ],
        });
      }

      // 4. Also invalidate global inventory keys
      queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) && query.queryKey.includes("inventory"),
      });

      // toast.success(data.message || "Stock transferred successfully!");
      return data;
    },
    onError: (error) => {
      console.error("❌ Transfer error:", error);
      toast.error(error.response?.data?.error || "Failed to transfer stock");
      throw error;
    },
  });
};

// ============ BULK TRANSFER MUTATION ============
export const useBulkTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bulkData) => {
      console.log("📤 BulkTransfer payload:", bulkData);
      return stockTransferApi.bulkTransfer(bulkData);
    },
    onSuccess: (data, variables) => {
      console.log("✅ Bulk transfer successful:", data);

      // 1. Invalidate transfers history
      queryClient.invalidateQueries({ queryKey: transferKeys.all });
      queryClient.invalidateQueries({ queryKey: transferKeys.history() });

      // 2. INVALIDATE INVENTORY FOR SOURCE STORE
      if (variables.sourceStoreId) {
        // Invalidate all inventory queries for source store
        queryClient.invalidateQueries({
          queryKey: inventoryKeys.list(variables.sourceStoreId),
        });
        queryClient.invalidateQueries({
          queryKey: inventoryKeys.stats(variables.sourceStoreId),
        });
        queryClient.invalidateQueries({
          queryKey: inventoryKeys.alerts(variables.sourceStoreId),
        });

        // Invalidate any filtered views
        queryClient.invalidateQueries({
          queryKey: inventoryKeys.available(variables.sourceStoreId),
        });
        queryClient.invalidateQueries({
          queryKey: inventoryKeys.history(variables.sourceStoreId),
        });

        // Invalidate infinite queries
        queryClient.invalidateQueries({
          queryKey: [
            ...inventoryKeys.list(variables.sourceStoreId),
            "infinite",
          ],
        });
      }

      // 3. INVALIDATE INVENTORY FOR DESTINATION STORE
      if (variables.destinationStoreId) {
        // Invalidate all inventory queries for destination store
        queryClient.invalidateQueries({
          queryKey: inventoryKeys.list(variables.destinationStoreId),
        });
        queryClient.invalidateQueries({
          queryKey: inventoryKeys.stats(variables.destinationStoreId),
        });
        queryClient.invalidateQueries({
          queryKey: inventoryKeys.alerts(variables.destinationStoreId),
        });

        // Invalidate any filtered views
        queryClient.invalidateQueries({
          queryKey: inventoryKeys.available(variables.destinationStoreId),
        });
        queryClient.invalidateQueries({
          queryKey: inventoryKeys.history(variables.destinationStoreId),
        });

        // Invalidate infinite queries
        queryClient.invalidateQueries({
          queryKey: [
            ...inventoryKeys.list(variables.destinationStoreId),
            "infinite",
          ],
        });
      }

      // 4. Also invalidate global inventory keys
      queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) && query.queryKey.includes("inventory"),
      });

      // 5. Invalidate any low stock alerts
      if (variables.sourceStoreId) {
        queryClient.invalidateQueries({
          queryKey: inventoryKeys.alerts(variables.sourceStoreId, 20),
        });
      }
      if (variables.destinationStoreId) {
        queryClient.invalidateQueries({
          queryKey: inventoryKeys.alerts(variables.destinationStoreId, 20),
        });
      }

      toast.success(data.message || "Bulk transfer completed successfully!");
      return data;
    },
    onError: (error) => {
      console.error("❌ Bulk transfer error:", error);
      toast.error(
        error.response?.data?.error || "Failed to process bulk transfer",
      );
      throw error;
    },
  });
};

// ============ CANCEL TRANSFER MUTATION ============
export const useCancelTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ transferId, reason }) => {
      console.log("📤 CancelTransfer:", { transferId, reason });
      return stockTransferApi.cancelTransfer(transferId, { reason });
    },
    onSuccess: (data, variables) => {
      console.log("✅ Transfer cancelled:", data);

      // 1. Invalidate transfers list
      queryClient.invalidateQueries({ queryKey: transferKeys.all });
      queryClient.invalidateQueries({ queryKey: transferKeys.history() });

      // 2. Invalidate specific transfer detail
      queryClient.invalidateQueries({
        queryKey: transferKeys.detail(variables.transferId),
      });

      // 3. Also invalidate inventory if needed (since cancelled transfers might affect stock)
      // You might need to get store IDs from the transfer data
      // This would require the transfer data to include store IDs in the response

      toast.success(data.message || "Transfer cancelled successfully!");
      return data;
    },
    onError: (error) => {
      console.error("❌ Cancel transfer error:", error);
      toast.error(error.response?.data?.error || "Failed to cancel transfer");
      throw error;
    },
  });
};

// Optional: Export combined object if needed
const stockTransferMutations = {
  useTransferStock,
  useBulkTransfer,
  useCancelTransfer,
  useTransferHistory,
  useTransferDetail,
};

export default stockTransferMutations;
