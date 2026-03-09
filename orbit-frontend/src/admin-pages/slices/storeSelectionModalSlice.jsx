import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isOpen: false,
    user: null,
    selectedStore: null
};

const storeSelectionModalSlice = createSlice({
    name: 'storeSelectionModal',
    initialState,
    reducers: {
        openStoreSelectionModal: (state, action) => {

            state.isOpen = true;
            state.user = action.payload?.user || null;
            state.selectedStore = null;

        },
        closeStoreSelectionModal: (state) => {

            state.isOpen = false;
            state.user = null;
            state.selectedStore = null;
        },
        selectStoreInModal: (state, action) => {

            state.selectedStore = action.payload;
        },
        confirmStoreSelection: (state) => {

            state.isOpen = false;

        }
    }
});

export const {
    openStoreSelectionModal,
    closeStoreSelectionModal,
    selectStoreInModal,
    confirmStoreSelection
} = storeSelectionModalSlice.actions;

export default storeSelectionModalSlice;