import { api } from "../../api/axios-conf"

const productApi = {
    // ============ GLOBAL PRODUCT APIS (with store filter) ============

    getProducts: async (filters = {}, page = 1, limit = 10) => {
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
        return response.data;
    },

    getProductById: async (productId) => {
        const response = await api.get(`/products/${productId}`);
        return response.data;
    },

    getProductBySKU: async (sku) => {
        const response = await api.get(`/products/sku/${sku}`);
        return response;
    },

    // Legacy create product (requires store in body)
    createProduct: async (productData, files = []) => {
        const formData = new FormData();
        formData.append('product', JSON.stringify(productData));
        files.forEach((file) => {
            formData.append(`images`, file);
        });

        const response = await api.post('/products', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Legacy update product
    updateProduct: async (productId, productData, files = []) => {
        const formData = new FormData();
        formData.append('product', JSON.stringify(productData));
        files.forEach((file) => {
            formData.append(`images`, file);
        });

        const response = await api.put(`/products/${productId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    deleteProduct: async (productId) => {
        const response = await api.delete(`/products/${productId}`);
        return response.data;
    },

    updateStock: async (productId, stockData) => {
        const response = await api.patch(`/products/${productId}/stock`, stockData);
        return response.data;
    },

    

    
    getLowStockProducts: async () => {
        const response = await api.get('/products/low-stock');
        return response.data;
    },

    getFeaturedProducts: async (limit = 10) => {
        const response = await api.get('/products/featured', { params: { limit } });
        return response.data;
    },

    getProductsByCategory: async (category, limit = 20) => {
        const response = await api.get(`/products/category/${category}`, { params: { limit } });
        return response.data;
    },

    searchProducts: async (searchQuery, page = 1, limit = 10) => {
        const response = await api.get('/products/search', {
            params: { q: searchQuery, page, limit }
        });
        return response.data;
    },

    getProductStats: async () => {
        const response = await api.get('/products/stats');
        return response.data;
    },

    // ============ STORE-SPECIFIC PRODUCT APIS ============

    // Get products for a specific store
    getProductsByStore: async (storeId, filters = {}, page = 1, limit = 20) => {
        const params = {
            page,
            limit,
            ...filters
        };

        Object.keys(params).forEach(key => {
            if (params[key] === undefined || params[key] === null || params[key] === '') {
                delete params[key];
            }
        });

        const response = await api.get(`/products/stores/${storeId}/products`, { params });
        return response.data;
    },

    // Get store-specific product by ID
    getStoreProductById: async (storeId, productId) => {
        const response = await api.get(`/products/stores/${storeId}/products/${productId}`);
        return response.data;
    },

    // Create product in a specific store
    createStoreProduct: async (storeId, productData, files = []) => {
        const formData = new FormData();
        formData.append('product', JSON.stringify(productData));
        files.forEach((file) => {
            formData.append(`images`, file);
        });

        const response = await api.post(`/products/stores/${storeId}/products`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Update product in a specific store
    updateStoreProduct: async (storeId, productId, productData, files = []) => {
        const formData = new FormData();
        formData.append('product', JSON.stringify(productData));
        files.forEach((file) => {
            formData.append(`images`, file);
        });

        const response = await api.put(`/products/stores/${storeId}/products/${productId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Delete product from a specific store
    deleteStoreProduct: async (storeId, productId) => {
        const response = await api.delete(`/products/stores/${storeId}/products/${productId}`);
        return response.data;
    },

    // Update stock for product in a specific store
    updateStoreProductStock: async (storeId, productId, stockData) => {
        const response = await api.patch(`/products/stores/${storeId}/products/${productId}/stock`, stockData);
        return response.data;
    },

    // Get store-specific low stock products
    getStoreLowStockProducts: async (storeId, limit = 20) => {
        const response = await api.get(`/products/stores/${storeId}/low-stock`, { params: { limit } });
        return response.data;
    },

    // Get store-specific featured products
    getStoreFeaturedProducts: async (storeId, limit = 10) => {
        const response = await api.get(`/products/stores/${storeId}/featured`, { params: { limit } });
        return response.data;
    },

    // Get store-specific products by category
    getStoreProductsByCategory: async (storeId, category, limit = 20) => {
        const response = await api.get(`/products/stores/${storeId}/category/${category}`, {
            params: { limit }
        });
        return response.data;
    },

    // Get store-specific product statistics
    getStoreProductStats: async (storeId) => {
        const response = await api.get(`/products/stores/${storeId}/stats`);
        return response.data;
    },

    // Record sale for product in a specific store
    recordStoreSale: async (storeId, productId, quantity, sellingPrice = null) => {
        const data = { quantity };
        if (sellingPrice !== null) data.sellingPrice = sellingPrice;

        const response = await api.post(`/products/stores/${storeId}/products/${productId}/sale`, data);
        return response.data;
    },

    // ============ UTILITY METHODS ============

    // Helper to get products for current store from context
    getCurrentStoreProducts: async (currentStore, filters = {}, page = 1, limit = 20) => {
        if (!currentStore?._id) {
            throw new Error('No current store selected');
        }
        return productApi.getProductsByStore(currentStore._id, filters, page, limit);
    },

    // Helper to create product in current store
    createProductInCurrentStore: async (currentStore, productData, files = []) => {
        if (!currentStore?._id) {
            throw new Error('No current store selected');
        }
        return productApi.createStoreProduct(currentStore._id, productData, files);
    },

    // Helper to update product in current store
    updateProductInCurrentStore: async (currentStore, productId, productData, files = []) => {
        if (!currentStore?._id) {
            throw new Error('No current store selected');
        }
        return productApi.updateStoreProduct(currentStore._id, productId, productData, files);
    },

    // ============ BACKWARD COMPATIBILITY ============

    // Legacy image methods (need to update routes for these)
    addProductImages: async (productId, files) => {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append(`images`, file);
        });

        const response = await api.post(`/products/${productId}/images`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    removeProductImage: async (productId, gcsFileName) => {
        const response = await api.delete(`/products/${productId}/images`, {
            data: { gcsFileName }
        });
        return response.data;
    },

    setPrimaryImage: async (productId, gcsFileName) => {
        const response = await api.patch(`/products/${productId}/primary-image`, { gcsFileName });
        return response.data;
    },

    // Legacy sale recording
    recordSale: async (productId, quantity, sellingPrice = null) => {
        const data = { quantity };
        if (sellingPrice !== null) data.sellingPrice = sellingPrice;

        const response = await api.post(`/products/${productId}/sales`, data);
        return response.data;
    },

    restockProduct: async (productId, quantity, buyingPrice = null) => {
        const data = { quantity };
        if (buyingPrice !== null) data.buyingPrice = buyingPrice;

        const response = await api.post(`/products/${productId}/restock`, data);
        return response.data;
    },
};

export default productApi;