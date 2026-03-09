// hooks/usePaginatedProducts.js
import { useState, useEffect } from "react";

import { useProducts } from "../../hooks/product.hooks";

export const usePaginatedProducts = (storeId = null) => {
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const { data, isLoading, isFetching } = useProducts(
    { storeId },
    page,
    20,
    true, 
  );
  useEffect(() => {
    if (data?.products) {
      setAllProducts((prev) => {
        const newProducts = data.products.filter(
          (newP) => !prev.some((p) => p._id === newP._id),
        );
        return [...prev, ...newProducts];
      });
      setHasMore(data.pagination?.page < data.pagination?.pages);
    }
  }, [data]);

  const loadMore = () => {
    if (!isFetching && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const reset = () => {
    setPage(1);
    setAllProducts([]);
    setHasMore(true);
  };

  return {
    products: allProducts,
    loading: isLoading && page === 1,
    loadingMore: isFetching && page > 1,
    hasMore,
    loadMore,
    reset,
    total: data?.pagination?.total || 0,
  };
};
