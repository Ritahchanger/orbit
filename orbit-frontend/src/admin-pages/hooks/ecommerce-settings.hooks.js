import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import ecommerceSettingsApi from "../services/ecommerce-settings-api";

export const ecommerceSettingsKeys = {
    all: ["ecommerce-settings"],
    settings: () => [...ecommerceSettingsKeys.all, "settings"],
};

export const useEcommerceSettings = (options = {}) => {
    return useQuery({
        queryKey: ecommerceSettingsKeys.settings(),
        queryFn: () => ecommerceSettingsApi.getEcommerceSettings(),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        ...options,
    });
};

export const useUpdateEcommerceSettings = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => ecommerceSettingsApi.updateEcommerceSettings(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ecommerceSettingsKeys.settings() });
            toast.success(data?.message || "Storefront settings updated");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update storefront settings");
        },
    });
};
