// context/StoreContext.jsx - With sessionStorage caching
import { createContext, useState, useContext, useEffect, useMemo, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useStores } from '../../admin-pages/hooks/store-hook';
import { useAuth } from '../authentication/AuthenticationContext';

const StoreContext = createContext();

// Session storage keys
const STORAGE_KEYS = {
    CURRENT_STORE: 'current_store_id',
    IS_INITIALIZED: 'store_context_initialized',
    VIEW_ALL: 'store_view_all'
};

// Stores and users reference each other either by id or as a populated
// {_id, name} object; compare by id.
const toId = (storeOrId) => (storeOrId && typeof storeOrId === 'object' ? storeOrId._id : storeOrId) || null;

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
    const { isAuthenticated, user } = useAuth();
    const queryClient = useQueryClient();

    // Stores are business data: only fetch them once someone is signed in.
    // (Fetching before login failed with 401 and was never retried.)
    const storesQuery = useStores({}, { enabled: !!isAuthenticated });
    
    // Extract with null checks
    const storesData = storesQuery?.data || null;
    const isLoading = storesQuery?.isLoading || false;
    const isFetching = storesQuery?.isFetching || false;
    const isError = storesQuery?.isError || false;
    const error = storesQuery?.error || null;

    const [currentStore, setCurrentStore] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isAllStores, setIsAllStores] = useState(readViewAll);

    // The signed-in user's own store, used as the starting store after login.
    const preferredStoreId = toId(user?.assignedStore);
    // True while currentStore is just "the first store" because nothing better
    // was known yet; the assigned store replaces it once the user loads.
    const isFallbackRef = useRef(false);

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

                // Same tab (refresh): keep the store that was picked. Fresh
                // login: start on the user's assigned store. Otherwise the first.
                const storedStore = storedStoreId && wasInitialized
                    ? stores.find(s => s._id === storedStoreId)
                    : null;
                const preferredStore = preferredStoreId
                    ? stores.find(s => s._id === preferredStoreId)
                    : null;
                setCurrentStore(storedStore || preferredStore || stores[0]);
                isFallbackRef.current = !storedStore && !preferredStore;

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

        // The user's profile can arrive after the stores; if we only fell back
        // to the first store, move to their assigned store now.
        if (isInitialized && isFallbackRef.current && preferredStoreId) {
            const preferredStore = stores.find(s => s._id === preferredStoreId);
            if (preferredStore) {
                isFallbackRef.current = false;
                setCurrentStore(preferredStore);
            }
        }

        // If current store is no longer in the stores list, update it
        if (isInitialized && currentStore &&
            !stores.some(s => s._id === currentStore._id) &&
            stores.length > 0) {
            console.log('Current store no longer available, switching to first store');
            setCurrentStore(stores[0]);
        }
    }, [stores, isInitialized, currentStore, preferredStoreId]);

    // Switch store function (with sessionStorage caching)
    // keepView: change the remembered store without leaving "All stores"
    // (used when restoring the user's assigned store on login/refresh).
    const switchStore = (storeOrId, { keepView = false } = {}) => {
        const storeId = toId(storeOrId);
        if (!storeId || !stores || stores.length === 0) {
            console.error('Cannot switch store: invalid storeId or no stores available');
            return;
        }
        
        const store = stores.find(s => s._id === storeId);
        if (store) {
            console.log('Switching store to:', store.name);
            setCurrentStore(store);
            isFallbackRef.current = false;
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
        setIsInitialized(false);
        isFallbackRef.current = false;
        try {
            sessionStorage.removeItem(STORAGE_KEYS.CURRENT_STORE);
            sessionStorage.removeItem(STORAGE_KEYS.IS_INITIALIZED);
            sessionStorage.removeItem(STORAGE_KEYS.VIEW_ALL);
        } catch (error) {
            console.error('Failed to clear store from sessionStorage:', error);
        }
    };

    // A different account (or none) now: forget the previous session's store
    // choice and every cached query, so nothing carries over between users or
    // businesses on the same tab.
    const sessionUserId = isAuthenticated ? user?._id || null : null;
    const prevUserIdRef = useRef(sessionUserId);
    useEffect(() => {
        const prev = prevUserIdRef.current;
        prevUserIdRef.current = sessionUserId;
        if (prev && prev !== sessionUserId) {
            clearStore();
            queryClient.removeQueries();
        }
    }, [sessionUserId]); // eslint-disable-line react-hooks/exhaustive-deps

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