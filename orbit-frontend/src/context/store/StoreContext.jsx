// context/StoreContext.jsx - With sessionStorage caching
import { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { useStores } from '../../admin-pages/hooks/store-hook';

const StoreContext = createContext();

// Session storage keys
const STORAGE_KEYS = {
    CURRENT_STORE: 'current_store_id',
    IS_INITIALIZED: 'store_context_initialized'
};

export const StoreProvider = ({ children }) => {
    // Safely destructure useStores with defaults
    const storesQuery = useStores();
    
    // Extract with null checks
    const storesData = storesQuery?.data || null;
    const isLoading = storesQuery?.isLoading || false;
    const isFetching = storesQuery?.isFetching || false;
    const isError = storesQuery?.isError || false;
    const error = storesQuery?.error || null;

    const [currentStore, setCurrentStore] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Use memo to avoid unnecessary recalculations
    const stores = useMemo(() => {
        // Handle different possible data structures
        if (!storesData) return [];
        
        // If storesData is an array
        if (Array.isArray(storesData)) return storesData;
        
        // If storesData has a data property (common pattern)
        if (storesData.data && Array.isArray(storesData.data)) {
            return storesData.data;
        }
        
        // If storesData has a stores property
        if (storesData.stores && Array.isArray(storesData.stores)) {
            return storesData.stores;
        }
        
        console.warn('Unexpected storesData structure:', storesData);
        return [];
    }, [storesData]);

    // Save current store to sessionStorage whenever it changes
    useEffect(() => {
        if (currentStore && currentStore._id) {
            try {
                sessionStorage.setItem(STORAGE_KEYS.CURRENT_STORE, currentStore._id);
                console.log('Saved store to sessionStorage:', currentStore._id);
            } catch (error) {
                console.error('Failed to save store to sessionStorage:', error);
            }
        }
    }, [currentStore]);

    // Initialize current store when stores are loaded
    useEffect(() => {
        if (stores.length > 0 && !isInitialized) {
            try {
                // Try to get stored store ID from sessionStorage
                const storedStoreId = sessionStorage.getItem(STORAGE_KEYS.CURRENT_STORE);
                const wasInitialized = sessionStorage.getItem(STORAGE_KEYS.IS_INITIALIZED) === 'true';

                console.log('Initializing store context:', {
                    storedStoreId,
                    wasInitialized,
                    storesCount: stores.length
                });

                if (storedStoreId && wasInitialized) {
                    // Try to restore from sessionStorage
                    const storedStore = stores.find(s => s._id === storedStoreId);
                    if (storedStore) {
                        console.log('Restoring store from sessionStorage:', storedStore.name);
                        setCurrentStore(storedStore);
                    } else {
                        // Stored store not found, use first store
                        console.log('Stored store not found, using first store');
                        setCurrentStore(stores[0]);
                    }
                } else {
                    // First time or no stored store, use first store
                    console.log('No stored store, using first store');
                    setCurrentStore(stores[0]);
                }

                // Mark as initialized
                setIsInitialized(true);
                sessionStorage.setItem(STORAGE_KEYS.IS_INITIALIZED, 'true');

            } catch (error) {
                console.error('Error initializing store context:', error);
                // Fallback to first store
                if (stores.length > 0) {
                    setCurrentStore(stores[0]);
                }
                setIsInitialized(true);
            }
        }

        // If current store is no longer in the stores list, update it
        if (isInitialized && currentStore &&
            !stores.some(s => s._id === currentStore._id) &&
            stores.length > 0) {
            console.log('Current store no longer available, switching to first store');
            setCurrentStore(stores[0]);
        }
    }, [stores, isInitialized, currentStore]);

    // Switch store function (with sessionStorage caching)
    const switchStore = (storeId) => {
        if (!storeId || !stores || stores.length === 0) {
            console.error('Cannot switch store: invalid storeId or no stores available');
            return;
        }
        
        const store = stores.find(s => s._id === storeId);
        if (store) {
            console.log('Switching store to:', store.name);
            setCurrentStore(store);

            try {
                sessionStorage.setItem(STORAGE_KEYS.CURRENT_STORE, store._id);
                console.log('Store switched and saved to sessionStorage:', store._id);
            } catch (error) {
                console.error('Failed to save store switch to sessionStorage:', error);
            }
        } else {
            console.error('Store not found for switching:', storeId);
        }
    };
    
    const clearStore = () => {
        console.log('Clearing store selection');
        setCurrentStore(null);
        try {
            sessionStorage.removeItem(STORAGE_KEYS.CURRENT_STORE);
            sessionStorage.removeItem(STORAGE_KEYS.IS_INITIALIZED);
        } catch (error) {
            console.error('Failed to clear store from sessionStorage:', error);
        }
    };

    const contextValue = useMemo(() => ({
        stores,
        currentStore,
        storeId: currentStore?._id || null,
        isLoading: isLoading && stores.length === 0,
        isFetching,
        isError,
        error,
        switchStore,
        hasStore: !!currentStore,
        clearStore,
        isCurrentStore: (storeId) => currentStore?._id === storeId
    }), [
        stores,
        currentStore,
        isLoading,
        isFetching,
        isError,
        error
    ]);

    return (
        <StoreContext.Provider value={contextValue}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStoreContext = () => {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error('useStoreContext must be used within StoreProvider');
    }
    return context;
};

export const useStoreId = () => {
    const context = useStoreContext();
    return context.storeId;
};