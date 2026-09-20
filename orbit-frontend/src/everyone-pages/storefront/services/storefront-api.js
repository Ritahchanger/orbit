// storefront-api.js
import { api } from "../../../api/axios-conf";

/**
 * Public storefront API — no auth headers required.
 * Every response payload is `response.data` = { success, message?, data, pagination? }.
 */

/**
 * Get a business's public storefront settings/branding
 * GET /storefront/:slug
 * @param {string} slug
 */
export const getStorefront = async (slug) => {
    const response = await api.get(`/storefront/${slug}`);
    return response.data;
};

/**
 * Get a paginated/filtered list of a storefront's public products
 * GET /storefront/:slug/products
 * @param {string} slug
 * @param {{ page?: number, limit?: number, category?: string, search?: string }} params
 */
export const getStorefrontProducts = async (slug, params = {}) => {
    const response = await api.get(`/storefront/${slug}/products`, { params });
    return response.data;
};

/**
 * Get a single public product from a storefront
 * GET /storefront/:slug/products/:productId
 * @param {string} slug
 * @param {string} productId
 */
export const getStorefrontProduct = async (slug, productId) => {
    const response = await api.get(`/storefront/${slug}/products/${productId}`);
    return response.data;
};

/**
 * Place a guest checkout order against a storefront
 * POST /storefront/:slug/checkout
 * @param {string} slug
 * @param {object} payload - { customer, shippingAddress, items, paymentMethod?, notes? }
 */
export const checkout = async (slug, payload) => {
    const response = await api.post(`/storefront/${slug}/checkout`, payload);
    return response.data;
};

export default {
    getStorefront,
    getStorefrontProducts,
    getStorefrontProduct,
    checkout,
};
