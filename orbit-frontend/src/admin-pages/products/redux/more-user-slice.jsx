import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isOpen: false,
    title: '',
    content: null,
    size: 'md', // sm, md, lg, xl
    position: 'right', // right, left, center
    userData: null,
    onClose: null,
};

const userSlice = createSlice({
    name: 'user-modal',
    initialState,
    reducers: {
        openModal: (state, action) => {
            const { title = '', content, size = 'md', position = 'right', userData = null, onClose = null } = action.payload;

            state.isOpen = true;
            state.title = title;
            state.content = content;
            state.size = size;
            state.position = position;
            state.userData = userData;
            state.onClose = onClose;
        },

        closeModal: (state) => {
            if (state.onClose) {
                // Execute onClose callback if provided
                state.onClose();
            }

            return initialState;
        },

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