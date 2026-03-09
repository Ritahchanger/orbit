import { createSlice } from "@reduxjs/toolkit";

// Load initial state from localStorage
const loadState = () => {
    try {
        const serializedState = localStorage.getItem("pageRedirection");
        if (!serializedState) {
            return {
                isOpen: false,
            };
        }
        return JSON.parse(serializedState);
    } catch (err) {
        console.warn("Failed to load pageRedirection from localStorage:", err);
        return {
            isOpen: false,
        };
    }
};

// Save only what is necessaryI
const saveState = (state) => {
    try {
        const serializedState = JSON.stringify({
            isOpen: state.isOpen,
        });
        localStorage.setItem("pageRedirection", serializedState);
    } catch (err) {
        console.warn("Failed to save pageRedirection:", err);
    }
};

const initialState = loadState();

const redirectionSlice = createSlice({
    name: "redirection",
    initialState: { ...initialState, pageToRedirect: null },
    reducers: {
        setPageToRedirect: (state, action) => {
            state.pageToRedirect = action.payload;
            saveState(state);
        },

        // ✅ Clear redirect data
        clearRedirection: (state) => {
            state.pageToRedirect = null;
            saveState(state);
        },

        // ✅ Optional: open modal (like product details)
        openModal: (state) => {
            state.isOpen = true;
            saveState(state);
        },

        // ✅ Optional: close modal
        closeModal: (state) => {
            state.isOpen = false;
            saveState(state);
        },

        // ✅ Remove everything from localStorage
        clearPersistedData: () => {
            localStorage.removeItem("pageRedirection");
        },
    },
});

export const {
    setPageToRedirect,
    clearRedirection,
    openModal,
    closeModal,
    clearPersistedData,
} = redirectionSlice.actions;

export default redirectionSlice;
