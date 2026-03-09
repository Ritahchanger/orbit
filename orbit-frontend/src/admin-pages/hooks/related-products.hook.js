// related-products.hook.js
import { useQuery } from "@tanstack/react-query";
import relatedProductsApi from "../services/related-products-api";

// Minimal query key for related products
const relatedProductKeys = {
    all: ["products"],
    related: (productId, filters) => [...relatedProductKeys.all, "related", productId, filters],
};

export const useRelatedProducts = (
    productId,
    {
        limit = 8,
        strategy = "hybrid",
        exclude = "",
        category = null,
        priceRange = null,
        enabled = true,
    } = {}
) => {
    return useQuery({
        queryKey: relatedProductKeys.related(productId, { limit, strategy, exclude, category, priceRange }),
        queryFn: () =>
            relatedProductsApi.getRelatedProducts(productId, { limit, strategy, exclude, category, priceRange }),
        enabled: !!productId && enabled,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30,   // 30 minutes
        retry: 2,
        select: (data) => ({
            products: data.data || [],
            count: data.count || 0,
            strategy: data.strategy,
            sourceProduct: data.sourceProduct,
        }),
    });
};
