import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isOpen: false,
    title: '',
    content: null,
    size: 'md', // sm, md, lg, xl
    position: 'right', // right, left, center
    userData: null,
};

const userSlice = createSlice({
    name: 'user-modal',
    initialState,
    reducers: {
        openModal: (state, action) => {
            const { title = '', content, size = 'md', position = 'right', userData = null } = action.payload;

            state.isOpen = true;
            state.title = title;
            state.content = content;
            state.size = size;
            state.position = position;
            state.userData = userData;
        },

        // Reducers must stay pure, so no close callback is stored or run here
        closeModal: () => initialState,

        updateModalContent: (state, action) => {
            const { title, content, userData } = action.payload;

            if (title !== undefined) state.title = title;
            if (content !== undefined) state.content = content;
            if (userData !== undefined) state.userData = userData;
        },
    },
});

export const { openModal, closeModal, updateModalContent } = userSlice.actions;

export default userSlice;