// context/StoreContext.jsx - With sessionStorage caching
import { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { useStores } from '../../admin-pages/hooks/store-hook';

const StoreContext = createContext();

// Session storage keys
const STORAGE_KEYS = {
    CURRENT_STORE: 'current_store_id',
    IS_INITIALIZED: 'store_context_initialized',
    VIEW_ALL: 'store_view_all'
};

// "All stores" view: true/false once chosen, null until the store strip has
// applied the default for the user's role.
const readViewAll = () => {
    try {
        const saved = sessionStorage.getItem(STORAGE_KEYS.VIEW_ALL);
        return saved === null ? null : saved === 'true';
    } catch {
        return null;
    }
};

const saveViewAll = (value) => {
    try {
        sessionStorage.setItem(STORAGE_KEYS.VIEW_ALL, String(value));
    } catch (error) {
        console.error('Failed to save store view to sessionStorage:', error);
    }
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
    const [isAllStores, setIsAllStores] = useState(readViewAll);

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
    // keepView: change the remembered store without leaving "All stores"
    // (used when restoring the user's assigned store on login/refresh).
    const switchStore = (storeId, { keepView = false } = {}) => {
        if (!storeId || !stores || stores.length === 0) {
            console.error('Cannot switch store: invalid storeId or no stores available');
            return;
        }
        
        const store = stores.find(s => s._id === storeId);
        if (store) {
            console.log('Switching store to:', store.name);
            setCurrentStore(store);
            if (!keepView) {
                setIsAllStores(false);
                saveViewAll(false);
            }

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
    
    // Show every store on pages that support it. Single-store pages (POS,
    // inventory) keep using currentStore, the last store that was picked.
    const selectAllStores = () => {
        setIsAllStores(true);
        saveViewAll(true);
    };

    // Used by the store strip to apply the role-based default once.
    const setDefaultView = (viewAll) => {
        setIsAllStores(viewAll);
        saveViewAll(viewAll);
    };

    const clearStore = () => {
        console.log('Clearing store selection');
        setCurrentStore(null);
        setIsAllStores(null);
        try {
            sessionStorage.removeItem(STORAGE_KEYS.CURRENT_STORE);
            sessionStorage.removeItem(STORAGE_KEYS.IS_INITIALIZED);
            sessionStorage.removeItem(STORAGE_KEYS.VIEW_ALL);
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
        isCurrentStore: (storeId) => currentStore?._id === storeId,
        isAllStores: isAllStores === true,
        isViewResolved: isAllStores !== null,
        selectAllStores,
        setDefaultView,
    }), [
        stores,
        currentStore,
        isAllStores,
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

/**
 * What a page that can show several stores should display, as chosen in the
 * store strip. storeId is null and store is null when "All stores" is
 * selected; scopeKey is the store id or "global" (what the report hooks take).
 */
export const useStoreScope = () => {
    const { currentStore, isAllStores, isViewResolved } = useStoreContext();
    const store = isAllStores ? null : currentStore;
    return {
        isAllStores,
        isReady: isViewResolved && (isAllStores || !!currentStore),
        store,
        storeId: store?._id || null,
        scopeKey: store?._id || 'global',
    };
};