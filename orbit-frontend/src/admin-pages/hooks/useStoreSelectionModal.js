import { useDispatch, useSelector } from 'react-redux';
import {
    openStoreSelectionModal,
    closeStoreSelectionModal,
    selectStoreInModal,
    confirmStoreSelection
} from '../slices/storeSelectionModalSlice';

import { useStoreContext } from '../../context/store/StoreContext';

import { toast } from 'react-hot-toast';

import { useQueryClient } from '@tanstack/react-query';

export const useStoreSelectionModal = () => {


    const queryClient = useQueryClient();

    const dispatch = useDispatch();

    const {
        stores,
        isLoading: loadingStores,
        switchStore,
        selectAllStores,
        currentStore,
    } = useStoreContext();

    const modalState = useSelector((state) => state.storeSelectionModal);

    const openModal = (user = null) => {
        dispatch(openStoreSelectionModal({ user }));
        toast.loading('Opening store selection...', { duration: 1000 });
    };

    const closeModal = () => {
        dispatch(closeStoreSelectionModal());
        toast('Store selection closed', { icon: '⏹️' });
    };

    const selectStore = (store) => {
        dispatch(selectStoreInModal(store));
        toast.success(`Selected: ${store.name}`, {
            icon: '✅',
            duration: 2000
        });
    };

    const confirmSelection = () => {
        if (modalState?.selectedStore) {
            // Store in localStorage
            localStorage.setItem('selectedStoreId', modalState.selectedStore._id);
            localStorage.setItem('selectedStoreName', modalState.selectedStore.name);
            localStorage.setItem('selectedStore', JSON.stringify(modalState.selectedStore));

            // Switch to the selected store in context
            if (switchStore) {
                switchStore(modalState.selectedStore._id);
            }

            // Dispatch confirmation action
            dispatch(confirmStoreSelection());

            // Show success message
            toast.success(`Successfully selected "${modalState.selectedStore.name}"!`);

            // Refresh to update the layout
            setTimeout(() => {

                queryClient.invalidateQueries({
                    predicate: (query) => query.queryKey[0] !== 'stores'
                })

            }, 1000);
        } else {
            toast.error('Please select a store first!', {
                icon: '⚠️'
            });
        }
    };

    // Global View is the store strip's "All stores". Single-store pages still
    // need a store, so make sure one is remembered without leaving All stores.
    const handleGlobalSelect = () => {
        if (!currentStore && stores?.length > 0) {
            switchStore(stores[0]._id, { keepView: true });
        }
        selectAllStores();

        // Dispatch confirmation action
        dispatch(confirmStoreSelection());

        toast.success('Showing all stores', {
            duration: 3000,
        });
    };

    return {
        isOpen: modalState?.isOpen || false,
        user: modalState?.user || null,
        selectedStore: modalState?.selectedStore || null,
        stores,
        loadingStores,
        openModal,
        closeModal,
        selectStore,
        confirmSelection,
        handleGlobalSelect
    };
};