// store/thunks/productThunks.js
import productServices from "../services/product-api";
// Import all Redux actions from your slice
import {
    setLoading,
    setError,
    setProducts,
    setProductDetails,
    setFeaturedProducts,
    setCategoryProducts,
    setLowStockProducts,
    setProductFilters,
    setProductStats,
    setSearchResults,
    updateProduct as updateProductInState, // Renamed from updateProduct
    addProduct,
    removeProduct,
    updateProductStock as updateProductStockAction // Renamed
} from "../product-slice";

// Cache helper function
const isCacheValid = (timestamp, minutes = 5) => {
    return timestamp && (Date.now() - timestamp < minutes * 60 * 1000);
};

export const fetchProducts = (filters = {}, page = 1, limit = 10, forceRefresh = false) => async (dispatch, getState) => {
    const { products } = getState();
    const cacheKey = `products_${JSON.stringify(filters)}_page${page}_limit${limit}`;

    // Use helper function
    if (!forceRefresh && isCacheValid(products.lastFetched?.[cacheKey])) {
        return; // Cache hit
    }

    try {
        dispatch(setLoading(true));
        const result = await productServices.getProducts(filters, page, limit);

        if (result.success) {
            dispatch(setProducts({
                products: result.data,
                pagination: result.pagination,
                cacheKey
            }));
        } else {
            dispatch(setError(result.error));
        }
    } catch (error) {
        dispatch(setError(error.message));
    }
};




export const fetchProductById = (productId, forceRefresh = false) => async (dispatch, getState) => {
    const { products } = getState();
    const cacheKey = `product_${productId}`;

    if (!forceRefresh && isCacheValid(products.lastFetched?.[cacheKey], 10) && products.productDetails[productId]) {
        return; // Return cached data
    }

    try {
        dispatch(setLoading(true));
        const result = await productServices.getProductById(productId);

        if (result.success) {
            dispatch(setProductDetails(result.data));
        } else {
            dispatch(setError(result.error));
        }
    } catch (error) {
        dispatch(setError(error.message));
    }
};

export const fetchFeaturedProducts = (limit = 10, forceRefresh = false) => async (dispatch, getState) => {
    const { products } = getState();
    const cacheKey = `featured_${limit}`;

    if (!forceRefresh && isCacheValid(products.lastFetched?.[cacheKey], 10)) {
        return;
    }

    try {
        dispatch(setLoading(true));
        const result = await productServices.getFeaturedProducts(limit);

        if (result.success) {
            dispatch(setFeaturedProducts(result.data));
        } else {
            dispatch(setError(result.error));
        }
    } catch (error) {
        dispatch(setError(error.message));
    }
};

export const fetchProductsByCategory = (category, limit = 20, forceRefresh = false) => async (dispatch, getState) => {
    const { products } = getState();
    const cacheKey = `category_${category}_${limit}`;

    if (!forceRefresh && isCacheValid(products.lastFetched?.[cacheKey])) {
        return;
    }

    try {
        dispatch(setLoading(true));
        const result = await productServices.getProductsByCategory(category, limit);

        if (result.success) {
            dispatch(setCategoryProducts({
                category,
                products: result.data,
                pagination: { limit }
            }));
        } else {
            dispatch(setError(result.error));
        }
    } catch (error) {
        dispatch(setError(error.message));
    }
};

export const fetchLowStockProducts = (forceRefresh = false) => async (dispatch, getState) => {
    const { products } = getState();

    if (!forceRefresh && isCacheValid(products.lastFetched?.lowStockProducts, 2)) {
        return;
    }

    try {
        dispatch(setLoading(true));
        const result = await productServices.getLowStockProducts();

        if (result.success) {
            dispatch(setLowStockProducts(result.data));
        } else {
            dispatch(setError(result.error));
        }
    } catch (error) {
        dispatch(setError(error.message));
    }
};

export const fetchProductStats = (forceRefresh = false) => async (dispatch, getState) => {
    const { products } = getState();

    if (!forceRefresh && isCacheValid(products.lastFetched?.stats)) {
        return;
    }

    try {
        dispatch(setLoading(true));
        const result = await productServices.getProductStats();

        if (result.success) {
            dispatch(setProductStats(result.data));
        } else {
            dispatch(setError(result.error));
        }
    } catch (error) {
        dispatch(setError(error.message));
    }
};

export const fetchProductFilters = (forceRefresh = false) => async (dispatch, getState) => {
    const { products } = getState();

    if (!forceRefresh && isCacheValid(products.lastFetched?.filters, 30)) {
        return;
    }

    try {
        dispatch(setLoading(true));
        const result = await productServices.getProductFilters();

        if (result.success) {
            dispatch(setProductFilters(result.data));
        } else {
            dispatch(setError(result.error));
        }
    } catch (error) {
        dispatch(setError(error.message));
    }
};

export const searchProducts = (query, page = 1, limit = 10, forceRefresh = false) => async (dispatch, getState) => {
    const { products } = getState();
    const cacheKey = `search_${query}_page${page}`;

    if (!forceRefresh && isCacheValid(products.lastFetched?.[cacheKey], 2) && products.searchResults.query === query) {
        return;
    }

    try {
        dispatch(setLoading(true));
        const result = await productServices.searchProducts(query, page, limit);

        if (result.success) {
            dispatch(setSearchResults({
                query,
                products: result.data,
                pagination: result.pagination
            }));
        } else {
            dispatch(setError(result.error));
        }
    } catch (error) {
        dispatch(setError(error.message));
    }
};

export const createProduct = (productData, files = []) => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const result = await productServices.createProduct(productData, files);

        if (result.success) {
            dispatch(addProduct(result.data));
            return { success: true, data: result.data };
        } else {
            dispatch(setError(result.error));
            return { success: false, error: result.error };
        }
    } catch (error) {
        dispatch(setError(error.message));
        return { success: false, error: error.message };
    } finally {
        dispatch(setLoading(false));
    }
};

export const updateProduct = (productId, productData, files = []) => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const result = await productServices.updateProduct(productId, productData, files);

        if (result.success) {
            // Use the renamed import
            dispatch(updateProductInState(result.data));
            return { success: true, data: result.data };
        } else {
            dispatch(setError(result.error));
            return { success: false, error: result.error };
        }
    } catch (error) {
        dispatch(setError(error.message));
        return { success: false, error: error.message };
    } finally {
        dispatch(setLoading(false));
    }
};

export const deleteProduct = (productId) => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const result = await productServices.deleteProduct(productId);

        if (result.success) {
            dispatch(removeProduct(productId));
            return { success: true };
        } else {
            dispatch(setError(result.error));
            return { success: false, error: result.error };
        }
    } catch (error) {
        dispatch(setError(error.message));
        return { success: false, error: error.message };
    } finally {
        dispatch(setLoading(false));
    }
};

export const updateProductStock = (productId, stockData) => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const result = await productServices.updateStock(productId, stockData);

        if (result.success) {
            const { stock, status } = result.data;
            // Use the renamed import (updateProductStockAction)
            dispatch(updateProductStockAction({
                productId,
                newStock: stock,
                status
            }));
            return { success: true, data: result.data };
        } else {
            dispatch(setError(result.error));
            return { success: false, error: result.error };
        }
    } catch (error) {
        dispatch(setError(error.message));
        return { success: false, error: error.message };
    } finally {
        dispatch(setLoading(false));
    }
};

export const addProductImages = (productId, files) => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const result = await productServices.addProductImages(productId, files);

        if (result.success) {
            // Refresh product data
            await dispatch(fetchProductById(productId, true));
            return { success: true, data: result.data };
        } else {
            dispatch(setError(result.error));
            return { success: false, error: result.error };
        }
    } catch (error) {
        dispatch(setError(error.message));
        return { success: false, error: error.message };
    } finally {
        dispatch(setLoading(false));
    }
};

export const removeProductImage = (productId, gcsFileName) => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const result = await productServices.removeProductImage(productId, gcsFileName);

        if (result.success) {
            // Refresh product data
            await dispatch(fetchProductById(productId, true));
            return { success: true };
        } else {
            dispatch(setError(result.error));
            return { success: false, error: result.error };
        }
    } catch (error) {
        dispatch(setError(error.message));
        return { success: false, error: error.message };
    } finally {
        dispatch(setLoading(false));
    }
};

export const setPrimaryProductImage = (productId, gcsFileName) => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const result = await productServices.setPrimaryImage(productId, gcsFileName);

        if (result.success) {
            // Refresh product data
            await dispatch(fetchProductById(productId, true));
            return { success: true };
        } else {
            dispatch(setError(result.error));
            return { success: false, error: result.error };
        }
    } catch (error) {
        dispatch(setError(error.message));
        return { success: false, error: error.message };
    } finally {
        dispatch(setLoading(false));
    }
};

export const recordProductSale = (productId, quantity, sellingPrice) => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const result = await productServices.recordSale(productId, quantity, sellingPrice);

        if (result.success) {
            // Refresh product data and stats
            await Promise.all([
                dispatch(fetchProductById(productId, true)),
                dispatch(fetchProductStats(true))
            ]);
            return { success: true, data: result.data };
        } else {
            dispatch(setError(result.error));
            return { success: false, error: result.error };
        }
    } catch (error) {
        dispatch(setError(error.message));
        return { success: false, error: error.message };
    } finally {
        dispatch(setLoading(false));
    }
};

export const restockProduct = (productId, quantity, buyingPrice) => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const result = await productServices.restockProduct(productId, quantity, buyingPrice);

        if (result.success) {
            // Refresh product data and stats
            await Promise.all([
                dispatch(fetchProductById(productId, true)),
                dispatch(fetchProductStats(true))
            ]);
            return { success: true, data: result.data };
        } else {
            dispatch(setError(result.error));
            return { success: false, error: result.error };
        }
    } catch (error) {
        dispatch(setError(error.message));
        return { success: false, error: error.message };
    } finally {
        dispatch(setLoading(false));
    }
};