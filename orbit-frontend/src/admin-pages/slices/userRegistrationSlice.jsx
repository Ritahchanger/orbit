import { createSlice } from '@reduxjs/toolkit';

const userRegistrationSlice = createSlice({
    name: 'userRegistration',
    initialState: {
        isModalOpen: false,
        isLoading: false,
        error: null,
        success: false,
    },
    reducers: {
        openRegistrationModal: (state) => {
            state.isModalOpen = true;
            state.error = null;
            state.success = false;
        },
        closeRegistrationModal: (state) => {
            state.isModalOpen = false;
            state.error = null;
            state.success = false;
            state.isLoading = false;
        },
        clearError: (state) => {
            state.error = null;
        },
    }
});

export const {
    openRegistrationModal,
    closeRegistrationModal,
    clearError,
} = userRegistrationSlice.actions;

export default userRegistrationSlice;