// store/slices/categoryModalSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  categoriesModal: false,
  isCreateModalOpen: false,
  isUpdateModalOpen: false,
  isDeleteModalOpen: false,
  isViewModalOpen: false,
  selectedCategory: null, // Add this to store selected category data
};

const categoryModalSlice = createSlice({
  name: "categoryModal",
  initialState,
  reducers: {
    // ============ CREATE MODAL ACTIONS ============
    openCategoriesModal: (state) => {
      state.categoriesModal = true;
    },
    closeCategoriesModal: (state) => {
      state.categoriesModal = false;
    },
    openCreateModal: (state) => {
      state.isCreateModalOpen = true;
    },
    closeCreateModal: (state) => {
      state.isCreateModalOpen = false;
    },

    // ============ UPDATE MODAL ACTIONS ============
    openUpdateModal: (state, action) => {
      state.isUpdateModalOpen = true;
      state.selectedCategory = action.payload; // Store category being edited
    },
    closeUpdateModal: (state) => {
      state.isUpdateModalOpen = false;
      state.selectedCategory = null; // Clear when closing
    },

    // ============ DELETE MODAL ACTIONS ============
    openDeleteModal: (state, action) => {
      state.isDeleteModalOpen = true;
      state.selectedCategory = action.payload; // Store category being deleted
    },
    closeDeleteModal: (state) => {
      state.isDeleteModalOpen = false;
      state.selectedCategory = null; // Clear when closing
    },

    // ============ VIEW MODAL ACTIONS ============
    openViewModal: (state, action) => {
      state.isViewModalOpen = true;
      state.selectedCategory = action.payload; // Store category being viewed
    },
    closeViewModal: (state) => {
      state.isViewModalOpen = false;
      state.selectedCategory = null; // Clear when closing
    },
  },
});

// Export actions
export const {
  openCreateModal,
  closeCreateModal,
  openUpdateModal,
  closeUpdateModal,
  openDeleteModal,
  openCategoriesModal,
  closeCategoriesModal,
  closeDeleteModal,
  openViewModal,
  closeViewModal,
} = categoryModalSlice.actions;

// Selectors
export const selectIsCreateModalOpen = (state) =>
  state.categoryModal.isCreateModalOpen;
export const selectIsUpdateModalOpen = (state) =>
  state.categoryModal.isUpdateModalOpen;
export const selectIsDeleteModalOpen = (state) =>
  state.categoryModal.isDeleteModalOpen;
export const selectIsViewModalOpen = (state) =>
  state.categoryModal.isViewModalOpen;
export const selectSelectedCategory = (state) =>
  state.categoryModal.selectedCategory;

export default categoryModalSlice;
