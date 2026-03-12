import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { inventoryApi } from "../services/inventory-api";
import { inventoryKeys } from "./store-inventory.queries.js";

// =================== CORE MUTATION HOOKS ===================

/**
 * SMART: Add or update inventory items (handles both single & bulk)
 */
export const useManageInventory = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storeId, items, operation = "add" }) =>
      inventoryApi.manageInventory(storeId, items, operation),

    onMutate: async (variables) => {
      const { storeId, items, operation } = variables;
      const isBulk = Array.isArray(items) && items.length > 1;

      // Cancel outgoing refetches
      if (isBulk) {
        await queryClient.cancelQueries({
          queryKey: inventoryKeys.list(storeId),
        });
      }

      return { storeId, items, operation, isBulk };
    },

    onSuccess: (data, variables, context) => {
      const { storeId, operation, isBulk } = variables;

      // Success message based on operation type
      if (isBulk) {
        const summary = data.summary || {};
        const successCount = summary.successful || 0;
        const failCount = summary.failed || 0;

        if (successCount > 0) {
          toast.success(
            `Bulk ${operation}: ${successCount} successful${failCount > 0 ? `, ${failCount} failed` : ""}`,
          );
        } else if (failCount > 0) {
          toast.error(`Bulk ${operation} failed: ${failCount} items failed`);
        }
      } else {
        const productName = data.data?.product?.name || "Product";
        toast.success(
          `${productName} ${operation === "add" ? "added to" : "updated in"} inventory`,
        );
      }

      // Invalidate relevant queries
      const promises = [
        queryClient.invalidateQueries({
          queryKey: inventoryKeys.list(storeId),
        }),
        queryClient.invalidateQueries({
          queryKey: inventoryKeys.stats(storeId),
        }),
        queryClient.invalidateQueries({
          queryKey: inventoryKeys.alerts(storeId),
        }),
        queryClient.invalidateQueries({
          queryKey: inventoryKeys.available(storeId),
        }),
      ];

      Promise.all(promises).catch(console.error);

      options.onSuccess?.(data, variables, context);
    },

    onError: (error, variables, context) => {
      const { operation, isBulk } = variables;
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Operation failed";

      if (isBulk) {
        toast.error(`Bulk ${operation} failed: ${errorMsg}`);
      } else {
        toast.error(`Failed to ${operation} product: ${errorMsg}`);
      }

      options.onError?.(error, variables, context);
    },

    ...options,
  });
};

/**
 * Quick add product by SKU
 */
export const useQuickAddToInventory = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storeId, sku, quantity = 1 }) =>
      inventoryApi.quickAddBySku(storeId, sku, quantity),

    onMutate: async (variables) => {
      const { storeId } = variables;

      await queryClient.cancelQueries({
        queryKey: inventoryKeys.available(storeId),
      });

      return { storeId };
    },

    onSuccess: (data, variables, context) => {
      const { storeId } = variables;

      toast.success(data.message || "Product added successfully");

      const promises = [
        queryClient.invalidateQueries({
          queryKey: inventoryKeys.list(storeId),
        }),
        queryClient.invalidateQueries({
          queryKey: inventoryKeys.stats(storeId),
        }),
        queryClient.invalidateQueries({
          queryKey: inventoryKeys.available(storeId),
        }),
      ];

      Promise.all(promises).catch(console.error);

      options.onSuccess?.(data, variables, context);
    },

    onError: (error, variables, context) => {
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to add product";

      toast.error(errorMsg);
      options.onError?.(error, variables, context);
    },

    ...options,
  });
};

/**
 * Update specific inventory item
 */
export const useUpdateInventoryItem = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ inventoryId, updateData }) =>
      inventoryApi.updateInventoryItem(inventoryId, updateData),

    onMutate: async (variables) => {
      const { inventoryId } = variables;

      await queryClient.cancelQueries({
        queryKey: inventoryKeys.detail(inventoryId),
      });

      const previousItem = queryClient.getQueryData(
        inventoryKeys.detail(inventoryId),
      );

      // Optimistically update the cache
      if (previousItem) {
        queryClient.setQueryData(inventoryKeys.detail(inventoryId), (old) => ({
          ...old,
          data: {
            ...old.data,
            ...variables.updateData,
            ...(variables.updateData.stock !== undefined && {
              status:
                variables.updateData.stock === 0
                  ? "Out of Stock"
                  : variables.updateData.stock <= old.data.minStock
                    ? "Low Stock"
                    : "In Stock",
            }),
          },
        }));
      }

      return { previousItem, inventoryId };
    },

    onSuccess: (data, variables, context) => {
      const { inventoryId } = variables;

      toast.success(data.message || "Inventory item updated successfully");

      queryClient
        .invalidateQueries({ queryKey: inventoryKeys.detail(inventoryId) })
        .catch(console.error);

      options.onSuccess?.(data, variables, context);
    },

    onError: (error, variables, context) => {
      const { inventoryId } = variables;
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to update inventory";

      // Rollback optimistic update
      if (context?.previousItem) {
        queryClient.setQueryData(
          inventoryKeys.detail(inventoryId),
          context.previousItem,
        );
      }

      toast.error(errorMsg);
      options.onError?.(error, variables, context);
    },

    ...options,
  });
};

// =================== DELETION MUTATION HOOKS ===================

/**
 * Unified deletion hook - uses the correct backend endpoints
 *
 * For single delete: uses inventoryApi.removeFromInventory (DELETE /inventory/:inventoryId)
 * For bulk delete: uses inventoryApi.bulkDeleteInventory (DELETE /:storeId/inventory)
 */
export const useDeleteInventory = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storeId,
      inventoryIds = [],
      inventoryId = null,
      options: deleteOptions = {},
    }) => {
      // Case 1: Single delete
      if (inventoryId) {
        return inventoryApi.removeFromInventory(inventoryId);
      }

      // Case 2: Bulk delete
      if (!Array.isArray(inventoryIds) || inventoryIds.length === 0) {
        throw new Error("No items selected for deletion");
      }

      return inventoryApi.bulkDeleteInventory(
        storeId,
        inventoryIds,
        deleteOptions,
      );
    },

    onMutate: async ({ storeId, inventoryIds = [], inventoryId = null }) => {
      const idsToDelete = inventoryId ? [inventoryId] : inventoryIds;

      // Cancel relevant queries
      await Promise.all([
        queryClient.cancelQueries({ queryKey: inventoryKeys.list(storeId) }),
        ...idsToDelete.map((id) =>
          queryClient.cancelQueries({ queryKey: inventoryKeys.detail(id) }),
        ),
      ]);

      // Snapshot previous state
      const previousList = queryClient.getQueryData(
        inventoryKeys.list(storeId),
      );
      const previousItems = {};

      for (const id of idsToDelete) {
        previousItems[id] = queryClient.getQueryData(inventoryKeys.detail(id));
      }

      // Optimistically remove from list cache
      queryClient.setQueryData(inventoryKeys.list(storeId), (old) => {
        if (!old?.data) return old;
        const idSet = new Set(idsToDelete);
        return {
          ...old,
          data: old.data.filter((item) => !idSet.has(item._id)),
        };
      });

      // Remove individual item caches
      idsToDelete.forEach((id) => {
        queryClient.removeQueries({ queryKey: inventoryKeys.detail(id) });
      });

      return { previousList, previousItems, storeId, idsToDelete };
    },

    onSuccess: (data, variables, context) => {
      const { storeId } = variables;
      const message = data.message || "Item(s) removed successfully";

      toast.success(message);

      // Invalidate all store-related queries
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: inventoryKeys.list(storeId),
        }),
        queryClient.invalidateQueries({
          queryKey: inventoryKeys.stats(storeId),
        }),
        queryClient.invalidateQueries({
          queryKey: inventoryKeys.alerts(storeId),
        }),
        queryClient.invalidateQueries({
          queryKey: inventoryKeys.available(storeId),
        }),
      ]).catch(console.error);

      options.onSuccess?.(data, variables, context);
    },

    onError: (error, variables, context) => {
      const {
        storeId,
        previousList,
        previousItems,
        idsToDelete = [],
      } = context || {};

      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Deletion failed";

      // Rollback list cache
      if (previousList) {
        queryClient.setQueryData(inventoryKeys.list(storeId), previousList);
      }

      // Rollback individual item caches
      if (previousItems) {
        Object.entries(previousItems).forEach(([id, item]) => {
          if (item) {
            queryClient.setQueryData(inventoryKeys.detail(id), item);
          }
        });
      }

      toast.error(errorMsg);
      options.onError?.(error, variables, context);
    },

    ...options,
  });
};

/**
 * @deprecated Use useDeleteInventory instead
 */
export const useRemoveFromInventory = (options = {}) => {
  console.warn(
    "Deprecated: This hook doesn't have store context. Use useDeleteInventory instead.",
  );

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inventoryId) => inventoryApi.removeFromInventory(inventoryId),

    onSuccess: (data, inventoryId) => {
      toast.success(data.message || "Item removed");
      queryClient
        .invalidateQueries({ queryKey: ["inventory"] })
        .catch(console.error);
      options.onSuccess?.(data, inventoryId);
    },

    onError: (error, inventoryId) => {
      toast.error(error.message || "Failed to remove");
      options.onError?.(error, inventoryId);
    },

    ...options,
  });
};

/**
 * @deprecated Use useDeleteInventory with inventoryIds instead
 */
export const useBulkDeleteInventory = (options = {}) => {
  console.warn("Deprecated: Use useDeleteInventory with inventoryIds instead");

  const deleteInventory = useDeleteInventory(options);

  return {
    ...deleteInventory,
    mutate: ({ storeId, inventoryIds }) =>
      deleteInventory.mutate({ storeId, inventoryIds }),
    mutateAsync: ({ storeId, inventoryIds }) =>
      deleteInventory.mutateAsync({ storeId, inventoryIds }),
  };
};

/**
 * @deprecated Use useDeleteInventory instead
 */
export const useRemoveFromStoreInventory = (options = {}) => {
  console.warn("Deprecated: Use useDeleteInventory instead");

  const deleteInventory = useDeleteInventory(options);

  return {
    ...deleteInventory,
    mutate: ({ storeId, inventoryId }) =>
      deleteInventory.mutate({ storeId, inventoryId }),
    mutateAsync: ({ storeId, inventoryId }) =>
      deleteInventory.mutateAsync({ storeId, inventoryId }),
  };
};

/**
 * Restock inventory item
 */
export const useRestockProduct = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ inventoryId, quantity }) =>
      inventoryApi.restockProduct(inventoryId, quantity),

    onMutate: async (variables) => {
      const { inventoryId, quantity } = variables;

      await Promise.all([
        queryClient.cancelQueries({
          queryKey: inventoryKeys.detail(inventoryId),
        }),
        queryClient.cancelQueries({ queryKey: ["products"] }),
      ]);

      const previousItem = queryClient.getQueryData(
        inventoryKeys.detail(inventoryId),
      );

      let productId = null;
      if (previousItem?.data?.product) {
        productId = previousItem.data.product._id || previousItem.data.product;
      }

      // Optimistically update stock in inventory cache
      if (previousItem) {
        queryClient.setQueryData(inventoryKeys.detail(inventoryId), (old) => ({
          ...old,
          data: {
            ...old.data,
            stock: old.data.stock + quantity,
            lastRestock: new Date().toISOString(),
            status:
              old.data.stock + quantity === 0
                ? "Out of Stock"
                : old.data.stock + quantity <= old.data.minStock
                  ? "Low Stock"
                  : "In Stock",
          },
        }));
      }

      return { previousItem, inventoryId, productId };
    },

    onSuccess: (data, variables, context) => {
      const { inventoryId, productId } = context || {};

      toast.success(data.message || "Product restocked successfully");

      const promises = [
        queryClient.invalidateQueries({
          queryKey: inventoryKeys.detail(inventoryId),
        }),
      ];

      if (data.data?.store) {
        const storeId = data.data.store._id || data.data.store;
        promises.push(
          queryClient.invalidateQueries({
            queryKey: inventoryKeys.list(storeId),
          }),
        );
      }

      if (productId) {
        promises.push(
          queryClient.invalidateQueries({
            queryKey: ["products", "detail", productId],
          }),
          queryClient.invalidateQueries({ queryKey: ["products", "list"] }),
        );
      } else {
        promises.push(
          queryClient.invalidateQueries({ queryKey: ["products"] }),
        );
      }

      Promise.all(promises).catch(console.error);

      options.onSuccess?.(data, variables, context);
    },

    onError: (error, variables, context) => {
      const { inventoryId } = variables;
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to restock product";

      if (context?.previousItem) {
        queryClient.setQueryData(
          inventoryKeys.detail(inventoryId),
          context.previousItem,
        );
      }

      toast.error(errorMsg);
      options.onError?.(error, variables, context);
    },

    ...options,
  });
};

/**
 * Record sale from inventory
 */
export const useRecordSale = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ inventoryId, ...saleData }) =>
      inventoryApi.recordSale(inventoryId, saleData),

    onMutate: async (variables) => {
      const { inventoryId, quantity, sellingPrice } = variables;

      await queryClient.cancelQueries({
        queryKey: inventoryKeys.detail(inventoryId),
      });

      const previousItem = queryClient.getQueryData(
        inventoryKeys.detail(inventoryId),
      );

      // Optimistically update for sale
      if (previousItem) {
        const price = sellingPrice || previousItem.data.price;
        const newStock = previousItem.data.stock - quantity;

        queryClient.setQueryData(inventoryKeys.detail(inventoryId), (old) => ({
          ...old,
          data: {
            ...old.data,
            stock: newStock,
            storeSold: old.data.storeSold + quantity,
            storeRevenue: old.data.storeRevenue + quantity * price,
            status:
              newStock === 0
                ? "Out of Stock"
                : newStock <= old.data.minStock
                  ? "Low Stock"
                  : "In Stock",
          },
        }));
      }

      return { previousItem, inventoryId };
    },

    onSuccess: (data, variables, context) => {
      const { inventoryId } = variables;

      toast.success(data.message || "Sale recorded successfully");

      queryClient
        .invalidateQueries({ queryKey: inventoryKeys.detail(inventoryId) })
        .catch(console.error);

      options.onSuccess?.(data, variables, context);
    },

    onError: (error, variables, context) => {
      const { inventoryId } = variables;
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to record sale";

      if (context?.previousItem) {
        queryClient.setQueryData(
          inventoryKeys.detail(inventoryId),
          context.previousItem,
        );
      }

      toast.error(errorMsg);
      options.onError?.(error, variables, context);
    },

    ...options,
  });
};

/**
 * Adjust stock (increase/decrease)
 */
export const useAdjustStock = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ inventoryId, quantity, reason, note }) =>
      inventoryApi.adjustStock(inventoryId, quantity, reason, note),

    onMutate: async (variables) => {
      const { inventoryId, quantity } = variables;

      await queryClient.cancelQueries({
        queryKey: inventoryKeys.detail(inventoryId),
      });

      const previousItem = queryClient.getQueryData(
        inventoryKeys.detail(inventoryId),
      );

      // Optimistically update stock
      if (previousItem) {
        const newStock = previousItem.data.stock + quantity;

        queryClient.setQueryData(inventoryKeys.detail(inventoryId), (old) => ({
          ...old,
          data: {
            ...old.data,
            stock: newStock,
            status:
              newStock === 0
                ? "Out of Stock"
                : newStock <= old.data.minStock
                  ? "Low Stock"
                  : "In Stock",
          },
        }));
      }

      return { previousItem, inventoryId };
    },

    onSuccess: (data, variables, context) => {
      const { inventoryId } = variables;

      toast.success(data.message || "Stock adjusted successfully");

      queryClient
        .invalidateQueries({ queryKey: inventoryKeys.detail(inventoryId) })
        .catch(console.error);

      options.onSuccess?.(data, variables, context);
    },

    onError: (error, variables, context) => {
      const { inventoryId } = variables;
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to adjust stock";

      if (context?.previousItem) {
        queryClient.setQueryData(
          inventoryKeys.detail(inventoryId),
          context.previousItem,
        );
      }

      toast.error(errorMsg);
      options.onError?.(error, variables, context);
    },

    ...options,
  });
};

// =================== CONVENIENCE HOOKS ===================

/**
 * Single add to inventory (convenience hook)
 */
export const useAddToInventory = (options = {}) => {
  const manageInventory = useManageInventory(options);

  return {
    ...manageInventory,
    mutate: (variables) =>
      manageInventory.mutate({ ...variables, operation: "add" }),
    mutateAsync: (variables) =>
      manageInventory.mutateAsync({ ...variables, operation: "add" }),
  };
};

/**
 * Bulk add to inventory (convenience hook)
 */
export const useBulkAddToInventory = (options = {}) => {
  const manageInventory = useManageInventory(options);

  return {
    ...manageInventory,
    mutate: (variables) =>
      manageInventory.mutate({ ...variables, operation: "add" }),
    mutateAsync: (variables) =>
      manageInventory.mutateAsync({ ...variables, operation: "add" }),
  };
};

/**
 * Bulk update inventory (convenience hook)
 */
export const useBulkUpdateInventory = (options = {}) => {
  const manageInventory = useManageInventory(options);

  return {
    ...manageInventory,
    mutate: (variables) =>
      manageInventory.mutate({ ...variables, operation: "update" }),
    mutateAsync: (variables) =>
      manageInventory.mutateAsync({ ...variables, operation: "update" }),
  };
};

// =================== COMBINED OPERATIONS HOOK ===================

/**
 * Consolidated hook for all inventory operations
 */
export const useInventoryOperations = () => {
  const addMutation = useAddToInventory();
  const quickAddMutation = useQuickAddToInventory();
  const updateMutation = useUpdateInventoryItem();
  const deleteMutation = useDeleteInventory(); // ✅ Use the new unified hook
  const restockMutation = useRestockProduct();
  const saleMutation = useRecordSale();
  const adjustMutation = useAdjustStock();

  return {
    // Add
    addToInventory: addMutation.mutate,
    addToInventoryAsync: addMutation.mutateAsync,
    isAdding: addMutation.isPending,

    // Quick add
    quickAddToInventory: quickAddMutation.mutate,
    quickAddToInventoryAsync: quickAddMutation.mutateAsync,
    isQuickAdding: quickAddMutation.isPending,

    // Update
    updateInventoryItem: updateMutation.mutate,
    updateInventoryItemAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    // ✅ NEW: Unified delete (preferred)
    deleteInventory: deleteMutation.mutate,
    deleteInventoryAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,

    // ⚠️ Legacy - kept for backward compatibility but will show warnings
    removeFromInventory: (inventoryId) => {
      console.warn("Deprecated: Use deleteInventory with inventoryId instead");
      return deleteMutation.mutate({ inventoryId });
    },
    removeFromInventoryAsync: async (inventoryId) => {
      console.warn(
        "Deprecated: Use deleteInventoryAsync with inventoryId instead",
      );
      return deleteMutation.mutateAsync({ inventoryId });
    },
    isRemoving: deleteMutation.isPending,

    // Restock
    restockProduct: restockMutation.mutate,
    restockProductAsync: restockMutation.mutateAsync,
    isRestocking: restockMutation.isPending,

    // Sales
    recordSale: saleMutation.mutate,
    recordSaleAsync: saleMutation.mutateAsync,
    isRecordingSale: saleMutation.isPending,

    // Adjust
    adjustStock: adjustMutation.mutate,
    adjustStockAsync: adjustMutation.mutateAsync,
    isAdjusting: adjustMutation.isPending,

    // Combined loading state
    isLoading:
      addMutation.isPending ||
      quickAddMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      restockMutation.isPending ||
      saleMutation.isPending ||
      adjustMutation.isPending,

    mutations: {
      add: addMutation,
      quickAdd: quickAddMutation,
      update: updateMutation,
      delete: deleteMutation, // ✅ New
      restock: restockMutation,
      sale: saleMutation,
      adjust: adjustMutation,
    },
  };
};

/**
 * Execute multiple inventory operations in batch
 */
export const useBatchInventoryOperations = () => {
  const operations = useInventoryOperations();

  const executeBatch = async (batchOperations) => {
    const results = [];

    for (const operation of batchOperations) {
      try {
        let result;

        switch (operation.type) {
          case "add":
            result = await operations.addToInventoryAsync(operation.data);
            break;
          case "quickAdd":
            result = await operations.quickAddToInventoryAsync(operation.data);
            break;
          case "update":
            result = await operations.updateInventoryItemAsync(operation.data);
            break;
          case "delete":
            result = await operations.deleteInventoryAsync(operation.data);
            break;
          case "restock":
            result = await operations.restockProductAsync(operation.data);
            break;
          case "sale":
            result = await operations.recordSaleAsync(operation.data);
            break;
          case "adjust":
            result = await operations.adjustStockAsync(operation.data);
            break;
          default:
            throw new Error(`Unknown operation type: ${operation.type}`);
        }

        results.push({ success: true, data: result, operation });
      } catch (error) {
        results.push({
          success: false,
          error: error.message,
          operation,
        });
      }
    }

    return results;
  };

  return {
    executeBatch,
    isLoading: operations.isLoading,
  };
};

// =================== UTILITY HOOKS ===================

/**
 * Prefetch inventory data
 */
export const usePrefetchInventory = () => {
  const queryClient = useQueryClient();

  return (storeId, filters = {}) => {
    queryClient.prefetchQuery({
      queryKey: inventoryKeys.list(storeId, filters),
      queryFn: () => inventoryApi.getStoreInventory(storeId, filters),
    });
  };
};

/**
 * Hook for real-time inventory monitoring with polling
 */
export const useInventoryMonitor = (storeId, pollInterval = 30000) => {
  const queryClient = useQueryClient();

  return () => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.list(storeId) });
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.alerts(storeId),
      });
    }, pollInterval);

    return () => clearInterval(interval);
  };
};
