// src/redux/delete-modal-slice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isOpen: false,
    title: "Confirm Delete",
    message: "Are you sure you want to delete this item?",
    itemName: "",
    itemType: "item",
    confirmButtonText: "Delete",
    cancelButtonText: "Cancel",
    isLoading: false,
    onConfirm: null
};

const deleteModalSlice = createSlice({
    name: 'deleteModal',
    initialState,
    reducers: {
        openDeleteModal: (state, action) => {
            state.isOpen = true;
            state.title = action.payload.title || "Confirm Delete";
            state.message = action.payload.message || "Are you sure you want to delete this item?";
            state.itemName = action.payload.itemName || "";
            state.itemType = action.payload.itemType || "item";
            state.confirmButtonText = action.payload.confirmButtonText || "Delete";
            state.cancelButtonText = action.payload.cancelButtonText || "Cancel";
            state.onConfirm = action.payload.onConfirm;
            state.isLoading = false;
        },
        closeDeleteModal: (state) => {
            state.isOpen = false;
            state.isLoading = false;
            state.onConfirm = null;
        },
        setDeleteModalLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        resetDeleteModal: (state) => {
            return initialState;
        }
    }
});

export const { openDeleteModal, closeDeleteModal, setDeleteModalLoading, resetDeleteModal } = deleteModalSlice.actions;
export default deleteModalSlice;