import { api } from "../../../../api/axios-conf";

const productServices = {
    /**
     * Get all products with filtering and pagination
     * @param {Object} filters - Filter parameters
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     * @returns {Promise} - API response
     */
    getProducts: async (filters = {}, page = 1, limit = 10) => {
        try {
            const params = {
                page,
                limit,
                ...filters
            };

            // Clean up undefined/null values
            Object.keys(params).forEach(key => {
                if (params[key] === undefined || params[key] === null || params[key] === '') {
                    delete params[key];
                }
            });

            const response = await api.get('/products', { params });
            return {
                success: true,
                data: response.data.data,
                pagination: response.data.pagination,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to fetch products',
                data: [],
                pagination: null,
            };
        }
    },

    /**
     * Get single product by ID
     * @param {string} productId - Product ID
     * @returns {Promise} - API response
     */
    getProductById: async (productId) => {
        try {
            const response = await api.get(`/products/${productId}`);
            return {
                success: true,
                data: response.data.data,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to fetch product',
                data: null,
            };
        }
    },

    /**
     * Get product by SKU
     * @param {string} sku - Product SKU
     * @returns {Promise} - API response
     */
    getProductBySKU: async (sku) => {
        try {
            const response = await api.get(`/products/sku/${sku}`);
            return {
                success: true,
                data: response.data.data,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to fetch product',
                data: null,
            };
        }
    },

    /**
     * Create a new product with images
     * @param {Object} productData - Product data
     * @param {Array} files - Image files
     * @returns {Promise} - API response
     */
    createProduct: async (productData, files = []) => {
        try {
            const formData = new FormData();

            // Append product data as JSON
            formData.append('product', JSON.stringify(productData));

            // Append image files
            files.forEach((file, index) => {
                formData.append(`images`, file);
            });

            const response = await api.post('/products', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Product created successfully',
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to create product',
                data: null,
            };
        }
    },

    /**
     * Update existing product
     * @param {string} productId - Product ID
     * @param {Object} productData - Updated product data
     * @param {Array} files - New image files
     * @returns {Promise} - API response
     */
    updateProduct: async (productId, productData, files = []) => {
        try {
            const formData = new FormData();

            // Append product data as JSON
            formData.append('product', JSON.stringify(productData));

            // Append new image files
            files.forEach((file, index) => {
                formData.append(`images`, file);
            });

            const response = await api.put(`/products/${productId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Product updated successfully',
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to update product',
                data: null,
            };
        }
    },

    /**
     * Delete product
     * @param {string} productId - Product ID
     * @returns {Promise} - API response
     */
    deleteProduct: async (productId) => {
        try {
            const response = await api.delete(`/products/${productId}`);
            return {
                success: true,
                message: response.data.message || 'Product deleted successfully',
                deletedImages: response.data.deletedImages,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to delete product',
            };
        }
    },

    /**
     * Update product stock
     * @param {string} productId - Product ID
     * @param {Object} stockData - { stock: number, operation: 'set'|'increment'|'decrement' }
     * @returns {Promise} - API response
     */
    updateStock: async (productId, stockData) => {
        try {
            const response = await api.patch(`/products/${productId}/stock`, stockData);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Stock updated successfully',
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to update stock',
                data: null,
            };
        }
    },

    /**
     * Get low stock products
     * @returns {Promise} - API response
     */
    getLowStockProducts: async () => {
        try {
            const response = await api.get('/products/low-stock');
            return {
                success: true,
                data: response.data.data,
                count: response.data.count,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to fetch low stock products',
                data: [],
            };
        }
    },

    /**
     * Get featured products
     * @param {number} limit - Number of featured products
     * @returns {Promise} - API response
     */
    getFeaturedProducts: async (limit = 10) => {
        try {
            const response = await api.get('/products/featured', {
                params: { limit }
            });
            return {
                success: true,
                data: response.data.data,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to fetch featured products',
                data: [],
            };
        }
    },

    /**
     * Get products by category
     * @param {string} category - Category name
     * @param {number} limit - Items per page
     * @returns {Promise} - API response
     */
    getProductsByCategory: async (category, limit = 20) => {
        try {
            const response = await api.get(`/products/category/${category}`, {
                params: { limit }
            });
            return {
                success: true,
                data: response.data.data,
                category: response.data.category,
                count: response.data.count,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to fetch category products',
                data: [],
            };
        }
    },

    /**
     * Search products
     * @param {string} searchQuery - Search term
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     * @returns {Promise} - API response
     */
    searchProducts: async (searchQuery, page = 1, limit = 10) => {
        try {
            const response = await api.get('/products/search', {
                params: { q: searchQuery, page, limit }
            });
            return {
                success: true,
                data: response.data.data,
                pagination: response.data.pagination,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to search products',
                data: [],
                pagination: null,
            };
        }
    },

    /**
     * Add images to existing product
     * @param {string} productId - Product ID
     * @param {Array} files - Image files
     * @returns {Promise} - API response
     */
    addProductImages: async (productId, files) => {
        try {
            const formData = new FormData();

            // Append image files
            files.forEach((file, index) => {
                formData.append(`images`, file);
            });

            const response = await api.post(`/products/${productId}/images`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Images added successfully',
                addedCount: response.data.addedCount,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to add images',
                data: null,
            };
        }
    },

    /**
     * Remove image from product
     * @param {string} productId - Product ID
     * @param {string} gcsFileName - GCS filename to delete
     * @returns {Promise} - API response
     */
    removeProductImage: async (productId, gcsFileName) => {
        try {
            const response = await api.delete(`/products/${productId}/images`, {
                data: { gcsFileName }
            });
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Image removed successfully',
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to remove image',
            };
        }
    },

    /**
     * Set primary image
     * @param {string} productId - Product ID
     * @param {string} gcsFileName - GCS filename to set as primary
     * @returns {Promise} - API response
     */
    setPrimaryImage: async (productId, gcsFileName) => {
        try {
            const response = await api.patch(`/products/${productId}/primary-image`, { gcsFileName });
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Primary image updated successfully',
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to set primary image',
            };
        }
    },

    /**
     * Record a sale for a product
     * @param {string} productId - Product ID
     * @param {number} quantity - Quantity sold
     * @param {number} sellingPrice - Selling price (optional)
     * @returns {Promise} - API response
     */
    recordSale: async (productId, quantity, sellingPrice = null) => {
        try {
            const data = { quantity };
            if (sellingPrice !== null) data.sellingPrice = sellingPrice;

            const response = await api.post(`/products/${productId}/sales`, data);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Sale recorded successfully',
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to record sale',
                details: error.response?.data?.error?.details,
            };
        }
    },

    /**
     * Restock product
     * @param {string} productId - Product ID
     * @param {number} quantity - Quantity to restock
     * @param {number} buyingPrice - Buying price (optional)
     * @returns {Promise} - API response
     */
    restockProduct: async (productId, quantity, buyingPrice = null) => {
        try {
            const data = { quantity };
            if (buyingPrice !== null) data.buyingPrice = buyingPrice;

            const response = await api.post(`/products/${productId}/restock`, data);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Product restocked successfully',
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to restock product',
            };
        }
    },

    /**
     * Get product statistics
     * @returns {Promise} - API response
     */
    getProductStats: async () => {
        try {
            const response = await api.get('/products/stats');
            return {
                success: true,
                data: response.data.data,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to fetch product statistics',
                data: null,
            };
        }
    },

    /**
     * Get product filters (categories, brands, etc.)
     * @returns {Promise} - API response
     */
    getProductFilters: async () => {
        try {
            const response = await api.get('/products/filters');
            return {
                success: true,
                data: response.data.data,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to fetch product filters',
                data: { categories: [], brands: [] },
            };
        }
    },
};

export default productServices;