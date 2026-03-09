// features/productModal/productModalSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isModalOpen: false,
    formData: {
        name: '',
        sku: '',
        category: '',
        price: '',
        costPrice: '',
        stock: '',
        minStock: '5',
        description: '',
        brand: '',
        warranty: '1 Year',
        status: 'active',
        isFeatured: false,
        productType: 'gaming',
        weight: '',
        model: '',
        color: '',
        connectivity: '',
        powerConsumption: ''
    },
    specifications: [''],
    features: [''],
    images: [],
    errors: {}
};

export const productModalSlice = createSlice({
    name: 'productModal',
    initialState,
    reducers: {
        // Open and close the modal
        openModal: (state) => {
            state.isModalOpen = true;
        },
        closeModal: (state) => {
            state.isModalOpen = false;
            // Reset to initial state when closing
            Object.assign(state, initialState);
        },
        // Update a field in the main form
        updateFormField: (state, action) => {
            const { name, value, type, checked } = action.payload;
            if (name in state.formData) {
                state.formData[name] = type === 'checkbox' ? checked : value;
            }
            // Clear error for this field if it exists
            if (state.errors[name]) {
                delete state.errors[name];
            }
        },
        // Manage the arrays for specifications and features
        addSpecification: (state) => {
            state.specifications.push('');
        },
        updateSpecification: (state, action) => {
            const { index, value } = action.payload;
            state.specifications[index] = value;
        },
        removeSpecification: (state, action) => {
            const index = action.payload;
            if (state.specifications.length > 1) {
                state.specifications.splice(index, 1);
            }
        },
        addFeature: (state) => {
            state.features.push('');
        },
        updateFeature: (state, action) => {
            const { index, value } = action.payload;
            state.features[index] = value;
        },
        removeFeature: (state, action) => {
            const index = action.payload;
            if (state.features.length > 1) {
                state.features.splice(index, 1);
            }
        },
        // Manage images
        addImages: (state, action) => {
            const newImages = action.payload;
            state.images.push(...newImages);
        },
        removeImage: (state, action) => {
            const index = action.payload;
            state.images.splice(index, 1);
        },
        // Set validation errors
        setErrors: (state, action) => {
            state.errors = action.payload;
        },
        // Clear a specific error
        clearError: (state, action) => {
            const fieldName = action.payload;
            delete state.errors[fieldName];
        },
        // Optional: A reset action for a clean slate
        resetForm: (state) => {
            Object.assign(state, initialState);
        }
    }
});

// Export actions for use in components
export const {
    openModal,
    closeModal,
    updateFormField,
    addSpecification,
    updateSpecification,
    removeSpecification,
    addFeature,
    updateFeature,
    removeFeature,
    addImages,
    removeImage,
    setErrors,
    clearError,
    resetForm
} = productModalSlice.actions;

export default productModalSlice