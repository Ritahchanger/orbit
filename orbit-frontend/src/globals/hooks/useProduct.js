// hooks/useProducts.js
import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useMemo } from 'react';
import {
    setSearchQuery,
    setSearchResults,
    setSearchLoading,
    setLoading,
    setProduct,
    setSortBy,
    resetFilters,
    setRelatedProducts,
    setSuggestions,
    setError,
    updateProductField
} from "../../store/features/SearchModalSlice";

import { mockProducts } from './data';

export const useProducts = () => {
    const dispatch = useDispatch();
    const searchModalState = useSelector((state) => state.searchModal);

    // Handle search with debounce
    const handleSearch = useCallback((query) => {
        dispatch(setLoading(true));
        dispatch(setSearchQuery(query));

        if (query.trim() === '') {
            dispatch(setSearchResults([]));
            dispatch(setLoading(false));
            return;
        }

        // Simulate API call delay
        setTimeout(() => {
            const normalizedQuery = query.toLowerCase();

            const results = mockProducts.filter(product =>
                product.name.toLowerCase().includes(normalizedQuery) ||
                product.category.toLowerCase().includes(normalizedQuery) ||
                product.brand?.toLowerCase().includes(normalizedQuery) ||
                product.tags?.some(tag => tag.toLowerCase().includes(normalizedQuery)) ||
                product.features?.some(feature => feature.toLowerCase().includes(normalizedQuery))
            );

            dispatch(setSearchResults(results));
            dispatch(setLoading(false));
        }, 500);
    }, [dispatch]);

    // Handle sort change
    const handleSortChange = useCallback((sortOption) => {
        dispatch(setSortBy(sortOption));
        dispatch(setSearchLoading(true));

        setTimeout(() => {
            const sortedResults = [...searchModalState.searchResults];

            switch (sortOption) {
                case 'price-low-high':
                    sortedResults.sort((a, b) => a.price - b.price);
                    break;
                case 'price-high-low':
                    sortedResults.sort((a, b) => b.price - a.price);
                    break;
                case 'rating':
                    sortedResults.sort((a, b) => b.rating - a.rating);
                    break;
                case 'newest':
                    sortedResults.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    break;
                case 'discount':
                    sortedResults.sort((a, b) => (b.discount || 0) - (a.discount || 0));
                    break;
                default: // 'relevance' or 'featured'
                    sortedResults.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
            }

            dispatch(setSearchResults(sortedResults));
            dispatch(setSearchLoading(false));
        }, 300);
    }, [dispatch, searchModalState.searchResults]);

    // Reset all filters
    const handleResetFilters = useCallback(() => {
        dispatch(resetFilters());
        dispatch(setSearchResults([]));
        dispatch(setSearchQuery(''));
    }, [dispatch]);

    // Load products by category
    const loadProductsByCategory = useCallback((category) => {
        dispatch(setLoading(true));

        setTimeout(() => {
            const filtered = mockProducts.filter(product => product.category === category);
            dispatch(setSearchResults(filtered));
            dispatch(setLoading(false));
        }, 300);
    }, [dispatch]);

    // Get product by ID
    const getProductById = useCallback((id) => {
        dispatch(setLoading(true));

        return new Promise((resolve) => {
            setTimeout(() => {
                const product = mockProducts.find(p => p.id === id);
                if (product) {
                    dispatch(setProduct(product));
                }
                dispatch(setLoading(false));
                resolve(product);
            }, 200);
        });
    }, [dispatch]);

    // Get product suggestions for search
    const getSearchSuggestions = useCallback((query) => {
        if (!query || query.trim() === '') {
            dispatch(setSuggestions([]));
            return [];
        }

        const normalizedQuery = query.toLowerCase();
        const suggestions = mockProducts
            .filter(product =>
                product.name.toLowerCase().includes(normalizedQuery) ||
                product.category.toLowerCase().includes(normalizedQuery)
            )
            .slice(0, 5)
            .map(product => ({
                id: product.id,
                name: product.name,
                category: product.category,
                price: product.price,
                imageUrl: product.imageUrl,
                type: 'product'
            }));

        dispatch(setSuggestions(suggestions));
        return suggestions;
    }, [dispatch]);

    // Get featured products
    const getFeaturedProducts = useCallback(() => {
        return mockProducts.filter(product => product.isFeatured);
    }, []);

    // Get products by tag
    const getProductsByTag = useCallback((tag) => {
        return mockProducts.filter(product =>
            product.tags?.includes(tag)
        );
    }, []);

    // Calculate price statistics
    const getPriceStats = useMemo(() => {
        if (mockProducts.length === 0) {
            return { min: 0, max: 0, average: 0 };
        }

        const prices = mockProducts.map(p => p.price);
        return {
            min: Math.min(...prices),
            max: Math.max(...prices),
            average: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
        };
    }, []);

    // Check if product is in stock
    const checkProductAvailability = useCallback((productId) => {
        const product = mockProducts.find(p => p.id === productId);
        return {
            inStock: product?.inStock || false,
            storeAvailability: product?.storeAvailability || false,
            stock: product?.stock || 0
        };
    }, []);

    // Clear search
    const clearSearch = useCallback(() => {
        dispatch(setSearchQuery(''));
        dispatch(setSearchResults([]));
        dispatch(setSuggestions([]));
    }, [dispatch]);

    // Load related products
    const loadRelatedProducts = useCallback((productId) => {
        const product = mockProducts.find(p => p.id === productId);
        if (!product) return;

        setTimeout(() => {
            const related = mockProducts
                .filter(p =>
                    p.id !== productId &&
                    p.category === product.category
                )
                .slice(0, 4);

            dispatch(setRelatedProducts(related));
        }, 300);
    }, [dispatch]);

    // Update product field
    const updateProduct = useCallback((field, value) => {
        dispatch(updateProductField({ field, value }));
    }, [dispatch]);

    return {
        // State from search modal
        searchQuery: searchModalState.searchQuery,
        searchResults: searchModalState.searchResults,
        searchLoading: searchModalState.searchLoading,
        loading: searchModalState.loading,
        error: searchModalState.error,
        product: searchModalState.product,
        relatedProducts: searchModalState.relatedProducts,
        suggestions: searchModalState.suggestions,
        sortBy: searchModalState.sortBy,
        filters: searchModalState.filters,
        viewMode: searchModalState.viewMode,

        // Actions
        handleSearch,
        handleSortChange,
        handleResetFilters,
        loadProductsByCategory,
        getProductById,
        getSearchSuggestions,
        getFeaturedProducts,
        getProductsByTag,
        checkProductAvailability,
        clearSearch,
        loadRelatedProducts,
        updateProduct,

        // Computed values from mock data
        totalProducts: mockProducts.length,
        totalFiltered: searchModalState.searchResults.length,
        priceStats: getPriceStats,
        hasSearchResults: searchModalState.searchResults.length > 0,
        isSearching: searchModalState.searchLoading,
        isEmptyResults: !searchModalState.searchLoading &&
            searchModalState.searchQuery !== '' &&
            searchModalState.searchResults.length === 0,

        // Additional data
        categories: [
            { id: 'consoles', name: 'Consoles', icon: '🎮', count: mockProducts.filter(p => p.category === 'consoles').length },
            { id: 'pc-gaming', name: 'PC Gaming', icon: '💻', count: mockProducts.filter(p => p.category === 'pc-gaming').length },
            { id: 'peripherals', name: 'Peripherals', icon: '🎧', count: mockProducts.filter(p => p.category === 'peripherals').length },
            { id: 'accessories', name: 'Accessories', icon: '🛋️', count: mockProducts.filter(p => p.category === 'accessories').length }
        ]
    };
};

// Optional: Custom hook for product recommendations
export const useProductRecommendations = () => {
    const getRecommendations = useCallback((productId, limit = 4) => {
        const currentProduct = mockProducts.find(p => p.id === productId);
        if (!currentProduct) return [];

        // Find products in same category
        const sameCategory = mockProducts
            .filter(p => p.id !== productId && p.category === currentProduct.category)
            .slice(0, limit);

        // If not enough, add products with similar price range
        if (sameCategory.length < limit) {
            const priceRange = currentProduct.price * 0.2; // ±20% price range
            const similarPrice = mockProducts
                .filter(p =>
                    p.id !== productId &&
                    !sameCategory.includes(p) &&
                    Math.abs(p.price - currentProduct.price) <= priceRange
                )
                .slice(0, limit - sameCategory.length);

            return [...sameCategory, ...similarPrice];
        }

        return sameCategory;
    }, []);

    return { getRecommendations };
};

// Optional: Custom hook for product comparisons
export const useProductComparison = () => {
    const compareProducts = useCallback((productIds) => {
        const productsToCompare = mockProducts.filter(p => productIds.includes(p.id));

        // Generate comparison matrix
        const comparison = productsToCompare.map(product => ({
            id: product.id,
            name: product.name,
            price: product.price,
            rating: product.rating,
            category: product.category,
            brand: product.brand,
            features: product.features,
            specs: product.specs,
            warranty: product.warranty
        }));

        return comparison;
    }, []);

    return { compareProducts };
};