// src/everyone-pages/products/components/ProductGrid.jsx
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import ProductCard from "./ProductCard";

// Import thunks and selectors
import {
  fetchProducts
} from "../../../admin-pages/products/redux/thunks/productThunks";
import {
  selectAllProducts,
  selectPagination,
  selectLoading,
  selectError,
  selectSearchResults,
} from "../../../admin-pages/products/redux/product-slice";

import ProductGridSkeleton from "../../product-details/preloaders/ProductsPreloader";

const ProductGrid = ({ filters, searchQuery = "" }) => {
  const dispatch = useDispatch();
  const [sortBy, setSortBy] = useState("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const [prevFilters, setPrevFilters] = useState({});

  // Redux state
  const products = useSelector(selectAllProducts);
  const searchResults = useSelector(selectSearchResults);
  const pagination = useSelector(selectPagination);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  // Determine which products to display
  const displayProducts = searchQuery ? searchResults.products : products;
  const totalProducts = searchQuery
    ? searchResults.pagination?.totalProducts || 0
    : pagination.totalProducts || 0;

  // Convert frontend filters to backend API format
  const buildFilterParams = () => {
    const params = {};

    // Category filter - matches backend
    if (filters.category) {
      params.category = filters.category;
    }

    // Product Type filter - matches backend
    if (filters.productType) {
      params.productType = filters.productType;
    }

    // Brand filter - matches backend (backend expects single brand string)
    if (filters.brands && filters.brands.length > 0) {
      // If multiple brands, we might need to handle differently
      // For now, take the first brand or join them
      params.brand = filters.brands[0];
    }

    // Price range filter - matches backend
    if (filters.priceRange) {
      if (filters.priceRange.min !== undefined) {
        params.minPrice = filters.priceRange.min;
      }
      if (
        filters.priceRange.max !== undefined &&
        filters.priceRange.max !== null
      ) {
        params.maxPrice = filters.priceRange.max;
      }
    }

    // Individual min/max price (alternative format)
    if (filters.minPrice !== undefined) {
      params.minPrice = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      params.maxPrice = filters.maxPrice;
    }

    // Stock/status filters - map to backend's expected format
    if (filters.inStock) {
      params.stockStatus = "in-stock";
    } else if (filters.outOfStock) {
      params.stockStatus = "out-of-stock";
    } else if (filters.lowStock) {
      params.stockStatus = "low-stock";
    }

    if (filters.status) {
      params.status = filters.status;
    }

    // Featured filter - matches backend
    if (filters.isFeatured) {
      params.isFeatured = true;
    }

    // Add search if provided
    if (searchQuery) {
      params.search = searchQuery;
    }

    // Add sort parameters - convert frontend sort to backend format
    const { sortBy: sortField, sortOrder } = getSortParams(sortBy);
    if (sortField) {
      params.sortBy = sortField;
      params.sortOrder = sortOrder;
    }

    return params;
  };

  // Convert frontend sort option to backend sort parameters
  const getSortParams = (sortOption) => {
    switch (sortOption) {
      case "price-low":
        return { sortBy: "price", sortOrder: "asc" };
      case "price-high":
        return { sortBy: "price", sortOrder: "desc" };
      case "newest":
        return { sortBy: "createdAt", sortOrder: "desc" };
      case "popular":
        return { sortBy: "totalSold", sortOrder: "desc" };
      case "featured":
        return { sortBy: "isFeatured", sortOrder: "desc" };
      case "rating":
        return { sortBy: "rating", sortOrder: "desc" };
      default:
        return { sortBy: "createdAt", sortOrder: "desc" };
    }
  };

  // Fetch products when filters, search, page, or sort changes
  useEffect(() => {
    // Check if filters actually changed to avoid unnecessary API calls
    const filtersChanged =
      JSON.stringify(prevFilters) !==
      JSON.stringify({
        ...filters,
        sortBy,
        searchQuery,
        currentPage,
      });

    if (filtersChanged) {
      const filterParams = buildFilterParams();

      console.log("Fetching products with filters:", filterParams); // Debug log

      // Always use fetchProducts with the built filter params
      // The backend handles both regular filters and search via the 'search' param
      dispatch(
        fetchProducts(
          filterParams,
          currentPage,
          20, // Match your backend default limit
          false,
        ),
      );

      // Update prevFilters
      setPrevFilters({
        ...filters,
        sortBy,
        searchQuery,
        currentPage,
      });
    }
  }, [dispatch, filters, searchQuery, currentPage, sortBy]);

  // Reset to page 1 when filters or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchQuery, sortBy]);

  // Handle sorting change
  const handleSortChange = (e) => {
    const newSortBy = e.target.value;
    setSortBy(newSortBy);
  };

  // Handle "See All Products" - clears filters
  const handleSeeAllProducts = () => {
    // This will trigger the parent component to clear filters
    if (window.clearAllFilters) {
      window.clearAllFilters();
    }
  };

  // Handle pagination
  const handleLoadMore = () => {
    if (pagination.hasNext || searchResults.pagination?.hasNext) {
      setCurrentPage((prev) => prev + 1);

      // Scroll to the product grid header smoothly
      setTimeout(() => {
        const productHeader = document.querySelector(".product-grid-header");
        if (productHeader) {
          productHeader.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    }
  };

  if (loading && displayProducts.length === 0) {
    return <ProductGridSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-white mb-2">
          Error Loading Products
        </h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-primary text-white rounded-sm hover:bg-blue-600 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Check if any filters are active
  const hasActiveFilters =
    filters.category ||
    (filters.brands && filters.brands.length > 0) ||
    filters.priceRange ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.inStock ||
    filters.outOfStock ||
    filters.lowStock ||
    filters.status ||
    filters.isFeatured;

  return (
    <div>
      {/* Sort & Results Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 product-grid-header">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {searchQuery
              ? `Search Results for "${searchQuery}"`
              : filters.category
                ? filters.category
                    .split("-")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")
                : "Gaming Products"}
          </h2>
          <p className="text-gray-400">
            {totalProducts} {totalProducts === 1 ? "product" : "products"} found
            {filters.category && ` in ${filters.category.replace(/-/g, " ")}`}
            {hasActiveFilters && !searchQuery && (
              <span className="ml-2 text-secondary">• Filtered results</span>
            )}
          </p>

          {/* Debug info - remove in production */}
          {process.env.NODE_ENV === "development" && (
            <p className="text-xs text-gray-500 mt-1">
              Filters: {JSON.stringify(buildFilterParams())}
            </p>
          )}
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          {/* See All Products Button (shown when filters are active) */}
          {hasActiveFilters && !searchQuery && (
            <button
              onClick={handleSeeAllProducts}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-sm transition flex items-center gap-2"
              title="Clear all filters and show all products"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              See All Products
            </button>
          )}

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="bg-gray-900 border border-gray-700 text-white rounded-sm px-4 py-2 focus:outline-none focus:border-primary min-w-[180px]"
          >
            <option value="featured">Sort by: Featured</option>
            <option value="newest">Sort by: Newest</option>
            <option value="price-low">Sort by: Price: Low to High</option>
            <option value="price-high">Sort by: Price: High to Low</option>
            <option value="popular">Sort by: Most Popular</option>
            <option value="rating">Sort by: Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {displayProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {displayProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* Pagination/Load More */}
          {(pagination.hasNext || searchResults.pagination?.hasNext) && (
            <div className="text-center mt-8">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Loading..." : "Load More Products"}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">😔</div>
          <h3 className="text-xl font-bold text-white mb-2">
            {searchQuery ? "No Search Results Found" : "No Products Found"}
          </h3>
          <p className="text-gray-400 mb-6">
            {searchQuery
              ? `No products found for "${searchQuery}". Try a different search term.`
              : "Try adjusting your filters or search term"}
          </p>

          {/* Clear Filters Button */}
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={handleSeeAllProducts}
              className="px-6 py-3 bg-primary text-white rounded-sm hover:bg-blue-600 transition"
            >
              See All Products
            </button>

            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-sm transition"
            >
              Reset Page
            </button>
          </div>
        </div>
      )}

      {/* Store Info */}
      {!searchQuery && displayProducts.length > 0 && (
        <div className="mt-12 p-6 bg-linear-to-r from-primary/10 to-secondary/10 rounded-sm border border-primary/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                📍 Visit Our Nairobi Store
              </h3>
              <p className="text-gray-300">
                See these products in person and get expert advice from our
                gaming specialists.
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Tom Mboya Street • 9AM-9PM (Mon-Sat) • +254 700 000 000
              </p>
            </div>
            <button className="px-6 py-3 bg-primary text-white rounded-sm hover:bg-blue-600 transition whitespace-nowrap">
              Get Directions
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
