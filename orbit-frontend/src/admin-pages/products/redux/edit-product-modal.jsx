// redux/edit-product-modal-slice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isEditModalOpen: false,
  editingProduct: null,
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

export const editProductModalSlice = createSlice({
  name: 'editProductModal',
  initialState,
  reducers: {
    // Open modal with product data
    openEditModal: (state, action) => {
      const product = action.payload;
      state.isEditModalOpen = true;
      state.editingProduct = product;
      
      // Populate form data from product
      state.formData = {
        name: product.name || '',
        sku: product.sku || '',
        category: product.category || '',
        price: product.price || '',
        costPrice: product.costPrice || '',
        stock: product.stock || '',
        minStock: product.minStock || 5,
        description: product.description || '',
        brand: product.brand || '',
        warranty: product.warranty || '1 Year',
        status: product.status || 'active',
        isFeatured: product.isFeatured || false,
        productType: product.productType || 'gaming',
        weight: product.weight || '',
        model: product.model || '',
        color: product.color || '',
        connectivity: product.connectivity || '',
        powerConsumption: product.powerConsumption || ''
      };
      
      // Populate arrays
      state.specifications = product.specifications && product.specifications.length > 0 
        ? product.specifications 
        : [''];
      state.features = product.features && product.features.length > 0 
        ? product.features 
        : [''];
      
      // Populate images (if any)
      if (product.images && product.images.length > 0) {
        state.images = product.images.map(img => ({
          displayUrl: img.displayUrl || img.url,
          gcsFileName: img.gcsFileName || '',
          preview: img.displayUrl || img.url,
          name: img.gcsFileName ? img.gcsFileName.split('/').pop() : 'image',
          isExisting: true
        }));
      } else {
        state.images = [];
      }
    },
    
    // Close modal
    closeEditModal: (state) => {
      state.isEditModalOpen = false;
      state.editingProduct = null;
      // Reset to initial state
      Object.assign(state, initialState);
    },
    
    // Update form fields
    updateEditFormField: (state, action) => {
      const { name, value, type, checked } = action.payload;
      if (name in state.formData) {
        state.formData[name] = type === 'checkbox' ? checked : value;
      }
      // Clear error for this field
      if (state.errors[name]) {
        delete state.errors[name];
      }
    },
    
    // Specifications management
    addEditSpecification: (state) => {
      state.specifications.push('');
    },
    updateEditSpecification: (state, action) => {
      const { index, value } = action.payload;
      state.specifications[index] = value;
    },
    removeEditSpecification: (state, action) => {
      const index = action.payload;
      if (state.specifications.length > 1) {
        state.specifications.splice(index, 1);
      }
    },
    
    // Features management
    addEditFeature: (state) => {
      state.features.push('');
    },
    updateEditFeature: (state, action) => {
      const { index, value } = action.payload;
      state.features[index] = value;
    },
    removeEditFeature: (state, action) => {
      const index = action.payload;
      if (state.features.length > 1) {
        state.features.splice(index, 1);
      }
    },
    
    // Images management
    addEditImages: (state, action) => {
      const newImages = action.payload;
      state.images.push(...newImages);
    },
    removeEditImage: (state, action) => {
      const index = action.payload;
      const image = state.images[index];
      // Only revoke URL for newly uploaded images
      if (image.preview && !image.isExisting) {
        URL.revokeObjectURL(image.preview);
      }
      state.images.splice(index, 1);
    },
    
    // Validation errors
    setEditErrors: (state, action) => {
      state.errors = action.payload;
    },
    
    // Clear image previews
    clearEditImagePreviews: (state) => {
      state.images.forEach(img => {
        if (img.preview && !img.isExisting) {
          URL.revokeObjectURL(img.preview);
        }
      });
    }
  }
});

export const {
  openEditModal,
  closeEditModal,
  updateEditFormField,
  addEditSpecification,
  updateEditSpecification,
  removeEditSpecification,
  addEditFeature,
  updateEditFeature,
  removeEditFeature,
  addEditImages,
  removeEditImage,
  setEditErrors,
  clearEditImagePreviews
} = editProductModalSlice.actions;

export default editProductModalSlice;