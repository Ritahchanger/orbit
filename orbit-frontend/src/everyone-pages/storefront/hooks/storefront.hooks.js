// storefront.hooks.js
import { useQuery, useMutation } from "@tanstack/react-query";
import {
    getStorefront,
    getStorefrontProducts,
    getStorefrontProduct,
    checkout,
} from "../services/storefront-api";

export const storefrontKeys = {
    all: ["storefront"],
    business: (slug) => [...storefrontKeys.all, slug],
    products: (slug, params) => [...storefrontKeys.all, slug, "products", params],
    product: (slug, productId) => [...storefrontKeys.all, slug, "product", productId],
};

/**
 * Public storefront branding/settings
 * @param {string} slug
 */
export const useStorefront = (slug, options = {}) => {
    return useQuery({
        queryKey: storefrontKeys.business(slug),
        queryFn: () => getStorefront(slug),
        enabled: !!slug,
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: false,
        ...options,
    });
};

/**
 * Paginated/filtered storefront product catalog
 * @param {string} slug
 * @param {{ page?: number, limit?: number, category?: string, search?: string }} params
 */
export const useStorefrontProducts = (slug, params = {}, options = {}) => {
    return useQuery({
        queryKey: storefrontKeys.products(slug, params),
        queryFn: () => getStorefrontProducts(slug, params),
        enabled: !!slug,
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        placeholderData: (previousData) => previousData,
        ...options,
    });
};

/**
 * Single storefront product
 * @param {string} slug
 * @param {string} productId
 */
export const useStorefrontProduct = (slug, productId, options = {}) => {
    return useQuery({
        queryKey: storefrontKeys.product(slug, productId),
        queryFn: () => getStorefrontProduct(slug, productId),
        enabled: !!slug && !!productId,
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: false,
        ...options,
    });
};

/**
 * Guest checkout mutation
 * usage: useCheckout().mutate({ slug, payload }, { onSuccess, onError })
 */
export const useCheckout = () => {
    return useMutation({
        mutationFn: ({ slug, payload }) => checkout(slug, payload),
    });
};
