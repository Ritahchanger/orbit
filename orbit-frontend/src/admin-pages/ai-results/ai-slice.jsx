import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isOpen: false,
  isLoading: false,
  results: null,
  error: null,
  context: null,
  viewMode: "summary",
};

const aiResultsSlice = createSlice({
  name: "aiResults",
  initialState,
  reducers: {
    // In ai-slice.js - MODIFIED reducer
    openAiResults: (state, action) => {
      state.isOpen = true;
      state.context = action.payload?.context || null;
      state.viewMode = action.payload?.viewMode || "summary";
      state.results = action.payload?.results || null; // ✅ ADD THIS
      state.error = null;
    },
    closeAiResults: (state) => {
      state.isOpen = false;
      state.results = null;
      state.context = null;
      state.error = null;
    },

    setAiResultsLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setAiResults: (state, action) => {
      state.results = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    setAiResultsError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    changeViewMode: (state, action) => {
      state.viewMode = action.payload;
    },

    clearAiResults: (state) => {
      state.results = null;
      state.error = null;
      state.context = null;
    },
  },
});

export const {
  openAiResults,
  closeAiResults,
  setAiResultsLoading,
  setAiResults,
  setAiResultsError,
  changeViewMode,
  clearAiResults,
} = aiResultsSlice.actions;

export default aiResultsSlice;
