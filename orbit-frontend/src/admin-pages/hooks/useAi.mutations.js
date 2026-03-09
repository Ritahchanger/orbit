import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import aiApi from "../services/ai-api";

import { toast } from "react-hot-toast";

// ============ QUERY KEYS ============
export const aiKeys = {
  all: ["ai"],
  health: () => [...aiKeys.all, "health"],
  status: () => [...aiKeys.all, "status"],
};

// ============ QUERIES ============

/**
 * Get AI service health status
 */
export const useAIHealth = (options = {}) => {
  return useQuery({
    queryKey: aiKeys.health(),
    queryFn: () => aiApi.healthCheck(),
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000,
    ...options,
  });
};

/**
 * Get AI service status
 */
export const useAIStatus = (options = {}) => {
  return useQuery({
    queryKey: aiKeys.status(),
    queryFn: () => aiApi.getStatus(),
    refetchInterval: 60000,
    staleTime: 30000,
    ...options,
  });
};

// ============ MUTATIONS ============

/**
 * Analyze any data with AI
 */
export const useAnalyzeData = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      context,
      type,
      format,
      audience,
      language,
      detailed,
    }) =>
      aiApi.analyze(data, {
        context,
        type,
        format,
        audience,
        language,
        detailed,
      }),

    onSuccess: (data, variables, context) => {
      // Optional: Show success toast
      if (options.showToast !== false) {
        toast.success("Analysis completed successfully");
      }

      // Call custom onSuccess if provided
      options.onSuccess?.(data, variables, context);
    },

    onError: (error, variables, context) => {
      console.error("Analysis failed:", error);

      if (options.showToast !== false) {
        toast.error(error.response?.data?.error || "Failed to analyze data");
      }

      options.onError?.(error, variables, context);
    },

    ...options,
  });
};

/**
 * Analyze dashboard data
 */
export const useAnalyzeDashboard = (options = {}) => {
  return useMutation({
    mutationFn: (dashboardData) => aiApi.analyzeDashboard(dashboardData),

    onSuccess: (data, variables, context) => {
      if (options.showToast !== false) {
        toast.success("Dashboard analysis complete");
      }
      options.onSuccess?.(data, variables, context);
    },

    onError: (error, variables, context) => {
      console.error("Dashboard analysis failed:", error);
      if (options.showToast !== false) {
        toast.error("Failed to analyze dashboard");
      }
      options.onError?.(error, variables, context);
    },

    ...options,
  });
};

/**
 * Analyze products data
 */
export const useAnalyzeProducts = (options = {}) => {
  return useMutation({
    mutationFn: (productsData) => aiApi.analyzeProducts(productsData),

    onSuccess: (data, variables, context) => {
      if (options.showToast !== false) {
        toast.success("Product analysis complete");
      }
      options.onSuccess?.(data, variables, context);
    },

    onError: (error, variables, context) => {
      console.error("Product analysis failed:", error);
      if (options.showToast !== false) {
        toast.error("Failed to analyze products");
      }
      options.onError?.(error, variables, context);
    },

    ...options,
  });
};

/**
 * Analyze transactions data
 */
export const useAnalyzeTransactions = (options = {}) => {
  return useMutation({
    mutationFn: (transactionsData) =>
      aiApi.analyzeTransactions(transactionsData),

    onSuccess: (data, variables, context) => {
      if (options.showToast !== false) {
        toast.success("Transaction analysis complete");
      }
      options.onSuccess?.(data, variables, context);
    },

    onError: (error, variables, context) => {
      console.error("Transaction analysis failed:", error);
      if (options.showToast !== false) {
        toast.error("Failed to analyze transactions");
      }
      options.onError?.(error, variables, context);
    },

    ...options,
  });
};

/**
 * Analyze inventory data
 */
export const useAnalyzeInventory = (options = {}) => {
  return useMutation({
    mutationFn: (inventoryData) => aiApi.analyzeInventory(inventoryData),

    onSuccess: (data, variables, context) => {
      if (options.showToast !== false) {
        toast.success("Inventory analysis complete");
      }
      options.onSuccess?.(data, variables, context);
    },

    onError: (error, variables, context) => {
      console.error("Inventory analysis failed:", error);
      if (options.showToast !== false) {
        toast.error("Failed to analyze inventory");
      }
      options.onError?.(error, variables, context);
    },

    ...options,
  });
};

/**
 * Generate AI report
 */
export const useGenerateReport = (options = {}) => {
  return useMutation({
    mutationFn: ({ data, reportType }) =>
      aiApi.generateReport(data, reportType),

    onSuccess: (data, variables, context) => {
      if (options.showToast !== false) {
        toast.success("Report generated successfully");
      }
      options.onSuccess?.(data, variables, context);
    },

    onError: (error, variables, context) => {
      console.error("Report generation failed:", error);
      if (options.showToast !== false) {
        toast.error("Failed to generate report");
      }
      options.onError?.(error, variables, context);
    },

    ...options,
  });
};

/**
 * Chat with AI assistant
 */
export const useAIChat = (options = {}) => {
  return useMutation({
    mutationFn: ({ message, history }) => aiApi.chat(message, history),

    onSuccess: (data, variables, context) => {
      options.onSuccess?.(data, variables, context);
    },

    onError: (error, variables, context) => {
      console.error("Chat failed:", error);
      toast.error("Failed to send message");
      options.onError?.(error, variables, context);
    },

    ...options,
  });
};

// ============ COMPOSED HOOK ============

/**
 * Combined AI mutations for convenience
 */
export const useAIActions = () => {
  const analyze = useAnalyzeData();
  const analyzeDashboard = useAnalyzeDashboard();
  const analyzeProducts = useAnalyzeProducts();
  const analyzeTransactions = useAnalyzeTransactions();
  const analyzeInventory = useAnalyzeInventory();
  const generateReport = useGenerateReport();
  const chat = useAIChat();
  const { data: health, refetch: refetchHealth } = useAIHealth();
  const { data: status, refetch: refetchStatus } = useAIStatus();

  return {
    // Mutations
    analyze,
    analyzeDashboard,
    analyzeProducts,
    analyzeTransactions,
    analyzeInventory,
    generateReport,
    chat,

    // Queries
    health,
    status,
    refetchHealth,
    refetchStatus,

    // Loading states
    isLoading:
      analyze.isPending ||
      analyzeDashboard.isPending ||
      generateReport.isPending,

    // Errors
    error: analyze.error || analyzeDashboard.error || generateReport.error,
  };
};
