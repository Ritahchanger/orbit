// SellModalSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-hot-toast';


// Async thunk for processing sale
export const processSale = createAsyncThunk(
    'sellModal/processSale',
    async (saleData, { getState, rejectWithValue }) => {
        try {
            // Your API endpoint for processing sales
            const response = await fetch('/api/sales/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add auth headers if needed
                    // 'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(saleData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to process sale');
            }

            const data = await response.json();

            // Show success toast
            toast.success(`Sale recorded: ${saleData.quantity}x ${saleData.productName} - KSh ${saleData.total.toLocaleString()}`);

            return data;

        } catch (error) {
            // Show error toast
            toast.error(error.message || 'Failed to process sale');
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk for checking stock
export const checkStockAvailability = createAsyncThunk(
    'sellModal/checkStock',
    async ({ productId, quantity }, { rejectWithValue }) => {
        try {
            const response = await fetch(`/api/products/${productId}/stock?quantity=${quantity}`);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to check stock');
            }

            const data = await response.json();
            return data;

        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    isOpen: false,
    product: null,
    saleData: {
        quantity: 1,
        paymentMethod: 'cash',
        customerName: '',
        customerPhone: '',
        discount: 0,
        notes: ''
    },
    loading: false,
    error: null,
    stockCheck: {
        isChecking: false,
        isAvailable: true,
        message: ''
    }
};

const SellModalSlice = createSlice({
    name: 'sellModal',
    initialState,
    reducers: {
        openSellModal: (state, action) => {
            const { product, initialData = {} } = action.payload;

            state.isOpen = true;
            state.product = product;
            state.error = null;

            // Reset sale data with any initial data provided
            state.saleData = {
                ...initialState.saleData,
                ...initialData,
                quantity: Math.min(initialData.quantity || 1, product?.quantity || 1)
            };

            // Reset stock check
            state.stockCheck = initialState.stockCheck;
        },

        closeSellModal: (state) => {
            state.isOpen = false;
            state.product = null;
            state.saleData = initialState.saleData;
            state.loading = false;
            state.error = null;
            state.stockCheck = initialState.stockCheck;
        },

        updateSaleData: (state, action) => {
            const { field, value } = action.payload;

            // Special handling for quantity to ensure it doesn't exceed stock
            if (field === 'quantity') {
                const maxQuantity = state.product?.quantity || 1;
                state.saleData.quantity = Math.min(maxQuantity, Math.max(1, parseInt(value) || 1));

                // Reset discount if it exceeds new subtotal
                const newSubtotal = state.product?.sellingPrice * state.saleData.quantity || 0;
                if (state.saleData.discount > newSubtotal) {
                    state.saleData.discount = newSubtotal;
                }
            }
            // Special handling for discount
            else if (field === 'discount') {
                const maxDiscount = state.product?.sellingPrice * state.saleData.quantity || 0;
                state.saleData.discount = Math.min(maxDiscount, Math.max(0, parseFloat(value) || 0));
            }
            // Handle other fields
            else {
                state.saleData[field] = value;
            }
        },

        incrementQuantity: (state) => {
            const max = state.product?.quantity || 1;
            if (state.saleData.quantity < max) {
                state.saleData.quantity += 1;
            }
        },

        decrementQuantity: (state) => {
            if (state.saleData.quantity > 1) {
                state.saleData.quantity -= 1;
            }
        },

        setMaxQuantity: (state) => {
            const max = state.product?.quantity || 1;
            state.saleData.quantity = max;
        },

        resetSaleData: (state) => {
            state.saleData = initialState.saleData;
        },

        clearError: (state) => {
            state.error = null;
        },

        // Quick actions for common customer types
        setCustomerType: (state, action) => {
            const type = action.payload;

            switch (type) {
                case 'walk-in':
                    state.saleData.customerName = 'Walk-in Customer';
                    state.saleData.customerPhone = '';
                    break;
                case 'regular':
                    state.saleData.customerName = 'Regular Customer';
                    state.saleData.customerPhone = '';
                    break;
                case 'online':
                    state.saleData.customerName = 'Online Customer';
                    state.saleData.customerPhone = '';
                    break;
                default:
                    break;
            }
        }
    },

    extraReducers: (builder) => {
        // Process sale async thunk
        builder
            .addCase(processSale.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(processSale.fulfilled, (state) => {
                state.loading = false;
                // Modal will be closed by the component on success
            })
            .addCase(processSale.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to process sale';
            });

        // Check stock async thunk
        builder
            .addCase(checkStockAvailability.pending, (state) => {
                state.stockCheck.isChecking = true;
                state.stockCheck.message = '';
            })
            .addCase(checkStockAvailability.fulfilled, (state, action) => {
                state.stockCheck.isChecking = false;
                state.stockCheck.isAvailable = action.payload.isAvailable;
                state.stockCheck.message = action.payload.message || '';
            })
            .addCase(checkStockAvailability.rejected, (state, action) => {
                state.stockCheck.isChecking = false;
                state.stockCheck.isAvailable = false;
                state.stockCheck.message = action.payload || 'Failed to check stock availability';
            });
    }
});

// Selectors
export const selectSellModal = (state) => state.sellModal;
export const selectIsSellModalOpen = (state) => state.sellModal.isOpen;
export const selectSaleProduct = (state) => state.sellModal.product;
export const selectSaleData = (state) => state.sellModal.saleData;
export const selectSaleLoading = (state) => state.sellModal.loading;
export const selectSaleError = (state) => state.sellModal.error;
export const selectStockCheck = (state) => state.sellModal.stockCheck;

// Calculated selectors
export const selectSaleTotals = (state) => {
    const product = state.sellModal.product;
    const saleData = state.sellModal.saleData;

    if (!product) return { subtotal: 0, total: 0, profit: 0 };

    const subtotal = product.sellingPrice * saleData.quantity;
    const total = subtotal - saleData.discount;
    const profit = (product.sellingPrice - (product.buyingPrice || 0)) * saleData.quantity;

    return { subtotal, total, profit };
};

export const selectCanSubmitSale = (state) => {
    const saleData = state.sellModal.saleData;
    const product = state.sellModal.product;

    if (!product) return false;
    if (product.quantity < saleData.quantity) return false;
    if (!saleData.customerName.trim()) return false;
    if (saleData.paymentMethod === 'mpesa' && !saleData.customerPhone.trim()) {
        return false;
    }

    return true;
};

// Action creators
export const {
    openSellModal,
    closeSellModal,
    updateSaleData,
    incrementQuantity,
    decrementQuantity,
    setMaxQuantity,
    resetSaleData,
    clearError,
    setCustomerType
} = SellModalSlice.actions;

export default SellModalSlice;