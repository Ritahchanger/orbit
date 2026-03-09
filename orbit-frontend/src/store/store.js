import { configureStore } from "@reduxjs/toolkit";

import searchModalSlice from "./features/SearchModalSlice";

import redirectionSlice from "../context/authentication/RedirectionSlice";

import productSlice from "../admin-pages/products/redux/product-slice";

import SellModalSlice from "../admin-pages/products/redux/sell-modal-slice";

import productModalSlice from "../admin-pages/products/redux/add-product-modal-slice";

import editProductModalSlice from "../admin-pages/products/redux/edit-product-modal";

import storeSelectionModalSlice from "../admin-pages/slices/storeSelectionModalSlice";

import userRegistrationSlice from "../admin-pages/slices/userRegistrationSlice";

import deleteModalSlice from "../globals/modals/slices/delete-modal-slice";

import userSlice from "../admin-pages/products/redux/more-user-slice";

import roleManagementSlice from "../admin-pages/admin-permissions/slices/RoleManagementSlice";

import posSlice from "../admin-pages/pos/slice/pos-slice";

import aiResultsSlice from "../admin-pages/ai-results/ai-slice";

import categoryModalSlice from "./features/categoryModalSlice";

export const store = configureStore({
  reducer: {
    searchModal: searchModalSlice.reducer,

    redirection: redirectionSlice.reducer,

    products: productSlice.reducer,

    sellModal: SellModalSlice.reducer,

    productModal: productModalSlice.reducer,

    editProductModal: editProductModalSlice.reducer,

    storeSelectionModal: storeSelectionModalSlice.reducer,

    userRegistration: userRegistrationSlice.reducer,

    deleteModal: deleteModalSlice.reducer,

    userModal: userSlice.reducer,

    roleManagement: roleManagementSlice.reducer,

    pos: posSlice.reducer,

    aiResults: aiResultsSlice.reducer,

    categoryModal: categoryModalSlice.reducer,
  },
});
