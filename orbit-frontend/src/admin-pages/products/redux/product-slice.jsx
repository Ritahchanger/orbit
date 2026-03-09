// store/slices/productSlice.js
import { createSlice, createSelector } from '@reduxjs/toolkit';
const initialState = {
    products: [],
    featuredProducts: [],
    categoryProducts: {},
    productDetails: {},
    lowStockProducts: [],
    filters: {
        categories: [],
        brands: [],
    },
    stats: null,
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalProducts: 0,
        limit: 10,
    },
    loading: false,
    error: null,
    lastFetched: {},
    searchResults: {
        query: '',
        products: [],
        pagination: null,
    },
};

const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        clearError: (state) => {
            state.error = null;
        },
        setProducts: (state, action) => {
            const { products, pagination, cacheKey } = action.payload;
            state.products = products;
            state.pagination = pagination;
            if (cacheKey) state.lastFetched[cacheKey] = Date.now();
            state.loading = false;
            state.error = null;
        },
        setFeaturedProducts: (state, action) => {
            state.featuredProducts = action.payload;
            state.lastFetched.featuredProducts = Date.now();
            state.loading = false;
        },
        setCategoryProducts: (state, action) => {
            const { category, products, pagination } = action.payload;
            state.categoryProducts[category] = products;
            state.lastFetched[`category_${category}`] = Date.now();
            state.pagination = pagination || state.pagination;
            state.loading = false;
        },
        setProductDetails: (state, action) => {
            const product = action.payload;
            state.productDetails[product._id] = product;
            state.lastFetched[`product_${product._id}`] = Date.now();
            state.loading = false;
        },
        updateProduct: (state, action) => {
            const updatedProduct = action.payload;
            const productIndex = state.products.findIndex(p => p._id === updatedProduct._id);

            if (productIndex !== -1) state.products[productIndex] = updatedProduct;
            state.productDetails[updatedProduct._id] = updatedProduct;

            Object.keys(state.categoryProducts).forEach(category => {
                const catIndex = state.categoryProducts[category]?.findIndex(p => p._id === updatedProduct._id);
                if (catIndex !== -1) state.categoryProducts[category][catIndex] = updatedProduct;
            });

            const featuredIndex = state.featuredProducts.findIndex(p => p._id === updatedProduct._id);
            if (featuredIndex !== -1) state.featuredProducts[featuredIndex] = updatedProduct;
        },
        addProduct: (state, action) => {
            const newProduct = action.payload;
            state.products.unshift(newProduct);
            state.productDetails[newProduct._id] = newProduct;
            state.pagination.totalProducts += 1;
        },
        removeProduct: (state, action) => {
            const productId = action.payload;
            state.products = state.products.filter(p => p._id !== productId);
            delete state.productDetails[productId];
            Object.keys(state.categoryProducts).forEach(category => {
                state.categoryProducts[category] = state.categoryProducts[category]?.filter(p => p._id !== productId) || [];
            });
            state.featuredProducts = state.featuredProducts.filter(p => p._id !== productId);
            state.pagination.totalProducts = Math.max(0, state.pagination.totalProducts - 1);
        },
        setLowStockProducts: (state, action) => {
            state.lowStockProducts = action.payload;
            state.lastFetched.lowStockProducts = Date.now();
            state.loading = false;
        },
        setProductFilters: (state, action) => {
            state.filters = action.payload;
            state.lastFetched.filters = Date.now();
        },
        setProductStats: (state, action) => {
            state.stats = action.payload;
            state.lastFetched.stats = Date.now();
            state.loading = false;
        },
        setSearchResults: (state, action) => {
            const { query, products, pagination } = action.payload;
            state.searchResults = { query, products, pagination };
            state.lastFetched[`search_${query}`] = Date.now();
            state.loading = false;
        },
        clearSearchResults: (state) => {
            state.searchResults = { query: '', products: [], pagination: null };
        },
        updateProductStock: (state, action) => {
            const { productId, newStock, status } = action.payload;
            const productIndex = state.products.findIndex(p => p._id === productId);
            if (productIndex !== -1) {
                state.products[productIndex].stock = newStock;
                state.products[productIndex].status = status;
            }
            if (state.productDetails[productId]) {
                state.productDetails[productId].stock = newStock;
                state.productDetails[productId].status = status;
            }
            if (status === 'Low Stock') {
                const lowStockIndex = state.lowStockProducts.findIndex(p => p._id === productId);
                if (lowStockIndex === -1) {
                    state.lowStockProducts.push(state.productDetails[productId] || state.products[productIndex]);
                }
            } else {
                state.lowStockProducts = state.lowStockProducts.filter(p => p._id !== productId);
            }
        },
        clearProducts: () => initialState,
    },
});

// Export actions
export const {
    setLoading,
    setError,
    clearError,
    setProducts,
    setFeaturedProducts,
    setCategoryProducts,
    setProductDetails,
    updateProduct,
    addProduct,
    removeProduct,
    setLowStockProducts,
    setProductFilters,
    setProductStats,
    setSearchResults,
    clearSearchResults,
    updateProductStock,
    clearProducts,
} = productSlice.actions;

// Selectors with memoization
export const selectAllProducts = (state) => state.products.products;
export const selectProductDetails = (state, productId) => state.products.productDetails[productId];
export const selectFeaturedProducts = (state) => state.products.featuredProducts;
export const selectCategoryProducts = (state, category) => state.products.categoryProducts[category] || [];
export const selectLowStockProducts = (state) => state.products.lowStockProducts;
export const selectProductFilters = (state) => state.products.filters;
export const selectProductStats = (state) => state.products.stats;
export const selectSearchResults = (state) => state.products.searchResults;
export const selectPagination = (state) => state.products.pagination;
export const selectLoading = (state) => state.products.loading;
export const selectError = (state) => state.products.error;

// Memoized selectors
export const selectProductById = createSelector(
    [selectProductDetails, (state, productId) => productId],
    (productDetails, productId) => productDetails[productId]
);

export const selectProductsByCategory = createSelector(
    [selectCategoryProducts, (state, category) => category],
    (categoryProducts, category) => categoryProducts[category] || []
);

export const selectInStockProducts = createSelector(
    [selectAllProducts],
    (products) => products.filter(p => p.stock > 0)
);

export const selectOutOfStockProducts = createSelector(
    [selectAllProducts],
    (products) => products.filter(p => p.stock === 0)
);

export const selectProductsByType = createSelector(
    [selectAllProducts, (state, productType) => productType],
    (products, productType) => products.filter(p => p.productType === productType)
);

export const selectTotalInventoryValue = createSelector(
    [selectAllProducts],
    (products) => products.reduce((total, product) => total + (product.costPrice * product.stock), 0)
);

export const selectTotalPotentialProfit = createSelector(
    [selectAllProducts],
    (products) => products.reduce((total, product) => total + ((product.price - product.costPrice) * product.stock), 0)
);

export default productSlice;