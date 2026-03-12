// hooks/useBusinessMutations.js
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "react-hot-toast";

import businessApi from "../services/business-api";


import { businessKeys } from "./business.queries";


export const useRegisterBusiness = () => {
  return useMutation({
    mutationFn: (businessData) => businessApi.register(businessData),
    onSuccess: (data) => {
      toast.success("Business registered successfully!");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Failed to register business",
      );
    },
  });
};


export const useUpdateBusiness = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => businessApi.update(id, data),
    onSuccess: (data, variables) => {
      toast.success("Business updated successfully!");
      queryClient.invalidateQueries({ queryKey: businessKeys.all() });
      queryClient.invalidateQueries({
        queryKey: businessKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: businessKeys.myBusiness() });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Failed to update business",
      );
    },
  });
};


export const useUpdateBusinessStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reason }) =>
      businessApi.updateStatus(id, status, reason),
    onSuccess: (data, variables) => {
      toast.success(`Business ${variables.status} successfully!`);
      queryClient.invalidateQueries({ queryKey: businessKeys.all() });
      queryClient.invalidateQueries({
        queryKey: businessKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: businessKeys.myBusiness() });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Failed to update business status",
      );
    },
  });
};


export const useDeleteBusiness = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => businessApi.delete(id),
    onSuccess: (_, id) => {
      toast.success("Business deleted successfully!");
      queryClient.invalidateQueries({ queryKey: businessKeys.all() });
      queryClient.removeQueries({ queryKey: businessKeys.detail(id) });
      queryClient.removeQueries({ queryKey: businessKeys.myBusiness() });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Failed to delete business",
      );
    },
  });
};
