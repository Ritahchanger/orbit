import { api } from "../../api/axios-conf";

const relatedProductsApi = {
    /**
     * Get related products for a given product
     *
     * @param {string} productId - Source product ID
     * @param {Object} options
     * @param {number} options.limit
     * @param {string} options.strategy
     * @param {string} options.exclude - comma-separated product IDs
     * @param {string} options.category
     * @param {string} options.priceRange - format: "min-max"
     */
    getRelatedProducts: async (
        productId,
        {
            limit = 8,
            strategy = "hybrid",
            exclude = "",
            category = null,
            priceRange = null
        } = {}
    ) => {
        if (!productId) {
            throw new Error("Product ID is required");
        }

        const params = {
            limit,
            strategy,
            exclude,
            category,
            priceRange
        };

        // Remove empty params
        Object.keys(params).forEach(key => {
            if (
                params[key] === undefined ||
                params[key] === null ||
                params[key] === ""
            ) {
                delete params[key];
            }
        });

        const response = await api.get(
            `/products/related/${productId}`,
            { params }
        );

        return response.data;
    }
};

export default relatedProductsApi;
