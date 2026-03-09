// store/features/searchModalSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isOpen: false,
  product: null,
  loading: false,
  error: null,
  relatedProducts: [],
  viewMode: 'details', // 'details' | 'specs' | 'availability' | 'reviews'
  searchQuery: '',
  searchResults: [],
  searchLoading: false,
  searchHistory: [],
  filters: {
    category: 'all',
    priceRange: [0, 1000000],
    rating: 0,
    inStock: false,
    storeAvailability: false,
  },
  sortBy: 'relevance',
  selectedProductId: null,
  modalPosition: { x: 0, y: 0 },
  isFullscreen: false,
  suggestions: [],
  selectedSuggestionIndex: -1,
  recentProducts: [],
  quickView: false,
};

const searchModalSlice = createSlice({
  name: 'searchModal',
  initialState,
  reducers: {
    openModal: (state, action) => {
      state.isOpen = true;
      state.product = action.payload;
      state.viewMode = 'details';
      state.error = null;
      state.selectedProductId = action.payload?.id || null;
      state.quickView = false;
      
      // Add to recent products
      if (action.payload) {
        const existingIndex = state.recentProducts.findIndex(p => p.id === action.payload.id);
        if (existingIndex !== -1) {
          state.recentProducts.splice(existingIndex, 1);
        }
        state.recentProducts.unshift(action.payload);
        if (state.recentProducts.length > 10) {
          state.recentProducts.pop();
        }
      }
    },
    
    closeModal: (state) => {
      state.isOpen = false;
      state.product = null;
      state.relatedProducts = [];
      state.viewMode = 'details';
      state.selectedProductId = null;
      state.quickView = false;
    },
    
    openQuickView: (state, action) => {
      state.isOpen = true;
      state.product = action.payload;
      state.viewMode = 'details';
      state.error = null;
      state.quickView = true;
      state.selectedProductId = action.payload?.id || null;
    },
    
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.selectedSuggestionIndex = -1;
    },
    
    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
      state.searchLoading = false;
    },
    
    setSearchLoading: (state, action) => {
      state.searchLoading = action.payload;
    },
    
    setSuggestions: (state, action) => {
      state.suggestions = action.payload;
    },
    
    clearSuggestions: (state) => {
      state.suggestions = [];
      state.selectedSuggestionIndex = -1;
    },
    
    setSelectedSuggestionIndex: (state, action) => {
      state.selectedSuggestionIndex = action.payload;
    },
    
    navigateSuggestions: (state, action) => {
      const { direction } = action.payload;
      if (state.suggestions.length === 0) return;
      
      if (direction === 'up') {
        state.selectedSuggestionIndex = state.selectedSuggestionIndex <= 0 
          ? state.suggestions.length - 1 
          : state.selectedSuggestionIndex - 1;
      } else if (direction === 'down') {
        state.selectedSuggestionIndex = state.selectedSuggestionIndex >= state.suggestions.length - 1 
          ? 0 
          : state.selectedSuggestionIndex + 1;
      }
    },
    
    selectSuggestion: (state) => {
      if (state.selectedSuggestionIndex >= 0 && state.selectedSuggestionIndex < state.suggestions.length) {
        const suggestion = state.suggestions[state.selectedSuggestionIndex];
        state.searchQuery = suggestion.name || suggestion.query || '';
      }
    },
    
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    setError: (state, action) => {
      state.error = action.payload;
    },
    
    setRelatedProducts: (state, action) => {
      state.relatedProducts = action.payload;
    },
    
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    
    setProduct: (state, action) => {
      state.product = action.payload;
      state.selectedProductId = action.payload?.id || null;
    },
    
    updateProductField: (state, action) => {
      const { field, value } = action.payload;
      if (state.product) {
        state.product[field] = value;
      }
    },
    
    setModalPosition: (state, action) => {
      state.modalPosition = action.payload;
    },
    
    toggleFullscreen: (state) => {
      state.isFullscreen = !state.isFullscreen;
    },
    
    addToSearchHistory: (state, action) => {
      const searchItem = {
        query: action.payload,
        timestamp: new Date().toISOString(),
      };
      
      // Remove duplicate if exists
      state.searchHistory = state.searchHistory.filter(
        item => item.query.toLowerCase() !== searchItem.query.toLowerCase()
      );
      
      // Add to beginning
      state.searchHistory.unshift(searchItem);
      
      // Keep only last 10 searches
      if (state.searchHistory.length > 10) {
        state.searchHistory.pop();
      }
    },
    
    clearSearchHistory: (state) => {
      state.searchHistory = [];
    },
    
    removeFromSearchHistory: (state, action) => {
      const index = action.payload;
      if (index >= 0 && index < state.searchHistory.length) {
        state.searchHistory.splice(index, 1);
      }
    },
    
    navigateProduct: (state, action) => {
      const { direction, products } = action.payload;
      if (!products || products.length === 0 || !state.selectedProductId) return;
      
      const currentIndex = products.findIndex(p => p.id === state.selectedProductId);
      if (currentIndex === -1) return;
      
      let newIndex;
      if (direction === 'next') {
        newIndex = (currentIndex + 1) % products.length;
      } else if (direction === 'prev') {
        newIndex = (currentIndex - 1 + products.length) % products.length;
      } else {
        return;
      }
      
      state.product = products[newIndex];
      state.selectedProductId = products[newIndex].id;
      state.viewMode = 'details';
    },
    
    loadRelatedProducts: (state, action) => {
      state.relatedProducts = action.payload;
    },
    
    toggleFavorite: (state) => {
      if (state.product) {
        state.product.isFavorite = !state.product.isFavorite;
      }
    },
    
    compareProduct: (state, action) => {
      // This would typically add product to comparison array
      if (state.product && action.payload) {
        state.product.inComparison = true;
      }
    },
    
    shareProduct: (state) => {
      // This would typically trigger share functionality
      if (state.product) {
        state.product.shareCount = (state.product.shareCount || 0) + 1;
      }
    },
    
    setProductQuantity: (state, action) => {
      if (state.product) {
        state.product.cartQuantity = action.payload;
      }
    },
    
    incrementQuantity: (state) => {
      if (state.product) {
        state.product.cartQuantity = (state.product.cartQuantity || 1) + 1;
      }
    },
    
    decrementQuantity: (state) => {
      if (state.product && state.product.cartQuantity > 1) {
        state.product.cartQuantity -= 1;
      }
    },
    
    resetModal: (state) => {
      return {
        ...initialState,
        searchHistory: state.searchHistory,
        recentProducts: state.recentProducts,
      };
    },
    
    // Async thunks would typically go here, but for simplicity we're using sync actions
    // In a real app, you'd use createAsyncThunk for API calls
  },
});

export const {
  openModal,
  closeModal,
  openQuickView,
  setSearchQuery,
  setSearchResults,
  setSearchLoading,
  setSuggestions,
  clearSuggestions,
  setSelectedSuggestionIndex,
  navigateSuggestions,
  selectSuggestion,
  setViewMode,
  setLoading,
  setError,
  setRelatedProducts,
  setFilters,
  resetFilters,
  setSortBy,
  setProduct,
  updateProductField,
  setModalPosition,
  toggleFullscreen,
  addToSearchHistory,
  clearSearchHistory,
  removeFromSearchHistory,
  navigateProduct,
  loadRelatedProducts,
  toggleFavorite,
  compareProduct,
  shareProduct,
  setProductQuantity,
  incrementQuantity,
  decrementQuantity,
  resetModal,
} = searchModalSlice.actions;

// Selectors
export const selectSearchModal = (state) => state.searchModal;
export const selectIsModalOpen = (state) => state.searchModal.isOpen;
export const selectCurrentProduct = (state) => state.searchModal.product;
export const selectViewMode = (state) => state.searchModal.viewMode;
export const selectSearchQuery = (state) => state.searchModal.searchQuery;
export const selectSearchResults = (state) => state.searchModal.searchResults;
export const selectSearchLoading = (state) => state.searchModal.searchLoading;
export const selectSuggestions = (state) => state.searchModal.suggestions;
export const selectedSuggestionIndex = (state) => state.searchModal.selectedSuggestionIndex;
export const selectFilters = (state) => state.searchModal.filters;
export const selectSortBy = (state) => state.searchModal.sortBy;
export const selectSearchHistory = (state) => state.searchModal.searchHistory;
export const selectRecentProducts = (state) => state.searchModal.recentProducts;
export const selectRelatedProducts = (state) => state.searchModal.relatedProducts;
export const selectIsFullscreen = (state) => state.searchModal.isFullscreen;
export const selectIsQuickView = (state) => state.searchModal.quickView;
export const selectModalError = (state) => state.searchModal.error;
export const selectModalLoading = (state) => state.searchModal.loading;

export default searchModalSlice;