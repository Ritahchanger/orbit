import { useState, useMemo } from "react";
import { useStoreContext } from "../../../context/store/StoreContext";

export const usePaginatedStores = () => {
  const { stores } = useStoreContext();

  const [searchTerm, setSearchTerm] = useState("");


  const filteredStores = useMemo(() => {

    if (!searchTerm.trim()) return stores || [];

    return (stores || []).filter(
      (store) =>
        store.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.code?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [stores, searchTerm]);

  return {
    stores: filteredStores,
    allStores: stores || [],
    loading: false, 
    loadingMore: false,
    hasMore: false, 
    loadMore: () => {}, 
    reset: () => setSearchTerm(""), 
    total: stores?.length || 0,
    searchTerm,
    setSearchTerm,
  };
};
