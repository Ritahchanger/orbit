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

      // Return context for rollback
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

      // Cancel available products query
      await queryClient.cancelQueries({
        queryKey: inventoryKeys.available(storeId),
      });

      return { storeId };
    },

    onSuccess: (data, variables, context) => {
      const { storeId } = variables;

      toast.success(data.message || "Product added successfully");

      // Invalidate queries
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

      // Cancel the specific item query
      await queryClient.cancelQueries({
        queryKey: inventoryKeys.detail(inventoryId),
      });

      // Get previous value for optimistic update
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

      // Invalidate the item query to get fresh data
      queryClient
        .invalidateQueries({
          queryKey: inventoryKeys.detail(inventoryId),
        })
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

/**
 * Remove product from inventory
 */
export const useRemoveFromInventory = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inventoryId) => inventoryApi.removeFromInventory(inventoryId),

    onMutate: async (inventoryId) => {
      // Get the item to be removed
      const previousItem = queryClient.getQueryData(
        inventoryKeys.detail(inventoryId),
      );

      // Get storeId from the item for cache invalidation
      let storeId = null;
      if (previousItem?.data?.store) {
        storeId = previousItem.data.store._id || previousItem.data.store;
      }

      // Remove the item from cache
      queryClient.removeQueries({
        queryKey: inventoryKeys.detail(inventoryId),
      });

      return { previousItem, inventoryId, storeId };
    },

    onSuccess: (data, inventoryId, context) => {
      const { storeId } = context || {};

      toast.success(data.message || "Product removed from inventory");

      // Invalidate list queries if we have storeId
      if (storeId) {
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
      }

      options.onSuccess?.(data, inventoryId, context);
    },

    onError: (error, inventoryId, context) => {
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to remove product";

      // Restore the item to cache
      if (context?.previousItem) {
        queryClient.setQueryData(
          inventoryKeys.detail(inventoryId),
          context.previousItem,
        );
      }

      toast.error(errorMsg);
      options.onError?.(error, inventoryId, context);
    },

    ...options,
  });
};

/**
 * Restock inventory item
 */
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

      // Cancel both inventory and product queries
      await Promise.all([
        queryClient.cancelQueries({
          queryKey: inventoryKeys.detail(inventoryId),
        }),
        queryClient.cancelQueries({
          queryKey: ["products"], // Global products query key
        }),
      ]);

      const previousItem = queryClient.getQueryData(
        inventoryKeys.detail(inventoryId),
      );

      // Get the product ID from the inventory item for product cache invalidation
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

        // Also update the product cache if we have productId
        if (productId) {
          // Update the product cache to reflect new stock
          const productQueryKey = ["products", "detail", productId];
          const previousProduct = queryClient.getQueryData(productQueryKey);

          if (previousProduct?.data) {
            queryClient.setQueryData(productQueryKey, (old) => ({
              ...old,
              data: {
                ...old.data,
                stock: old.data.stock + quantity,
                ...(old.data.stock + quantity === 0
                  ? { status: "Out of Stock" }
                  : old.data.stock + quantity <= (old.data.minStock || 5)
                    ? { status: "Low Stock" }
                    : { status: "In Stock" }),
              },
            }));
          }
        }
      }

      return { previousItem, inventoryId, productId };
    },

    onSuccess: (data, variables, context) => {
      const { inventoryId, productId } = context || {};

      toast.success(data.message || "Product restocked successfully");

      // Invalidate inventory queries
      const promises = [
        queryClient.invalidateQueries({
          queryKey: inventoryKeys.detail(inventoryId),
        }),
      ];

      // Invalidate store inventory list if we have store info
      if (data.data?.store) {
        const storeId = data.data.store._id || data.data.store;
        promises.push(
          queryClient.invalidateQueries({
            queryKey: inventoryKeys.list(storeId),
          }),
        );
      }

      // ✅ CRITICAL: Invalidate global product queries
      // This ensures the products list shows updated stock
      if (productId) {
        promises.push(
          queryClient.invalidateQueries({
            queryKey: ["products", "detail", productId],
          }),
          queryClient.invalidateQueries({
            queryKey: ["products", "list"], // Products list query
          }),
        );
      } else {
        // If we don't have productId, invalidate all product queries
        promises.push(
          queryClient.invalidateQueries({
            queryKey: ["products"],
          }),
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

      // Rollback optimistic update for inventory
      if (context?.previousItem) {
        queryClient.setQueryData(
          inventoryKeys.detail(inventoryId),
          context.previousItem,
        );
      }

      // Rollback optimistic update for product if we have productId
      if (context?.productId) {
        const productQueryKey = ["products", "detail", context.productId];
        // We don't have previousProduct stored, so just invalidate
        queryClient
          .invalidateQueries({
            queryKey: productQueryKey,
          })
          .catch(console.error);
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

      // Invalidate to get fresh data
      queryClient
        .invalidateQueries({
          queryKey: inventoryKeys.detail(inventoryId),
        })
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

      // Invalidate to get fresh data
      queryClient
        .invalidateQueries({
          queryKey: inventoryKeys.detail(inventoryId),
        })
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
  const removeMutation = useRemoveFromInventory();
  const restockMutation = useRestockProduct();
  const saleMutation = useRecordSale();
  const adjustMutation = useAdjustStock();

  return {
    // Single operations
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

    // Remove
    removeFromInventory: removeMutation.mutate,
    removeFromInventoryAsync: removeMutation.mutateAsync,
    isRemoving: removeMutation.isPending,

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
      removeMutation.isPending ||
      restockMutation.isPending ||
      saleMutation.isPending ||
      adjustMutation.isPending,

    // Individual mutation states for fine-grained control
    mutations: {
      add: addMutation,
      quickAdd: quickAddMutation,
      update: updateMutation,
      remove: removeMutation,
      restock: restockMutation,
      sale: saleMutation,
      adjust: adjustMutation,
    },
  };
};

// =================== BATCH OPERATIONS HOOK ===================

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
          case "remove":
            result = await operations.removeFromInventoryAsync(
              operation.data.inventoryId,
            );
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
    // Set up polling for inventory data
    const interval = setInterval(() => {
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.list(storeId),
      });
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.alerts(storeId),
      });
    }, pollInterval);

    return () => clearInterval(interval);
  };
};
