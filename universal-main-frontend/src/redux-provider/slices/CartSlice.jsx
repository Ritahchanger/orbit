import { createSlice } from '@reduxjs/toolkit';

// Load cart from localStorage if available
const loadCartFromStorage = () => {
  try {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      return JSON.parse(savedCart);
    }
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error);
  }
  return {
    items: [],
    totalQuantity: 0,
    totalAmount: 0,
    coupon: null,
    discount: 0,
    shipping: 0,
    tax: 0,
  };
};

const initialState = loadCartFromStorage();

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { id, name, price, image, quantity = 1, stock, ...rest } = action.payload;
      
      // Check if item already exists
      const existingItemIndex = state.items.findIndex(item => item.id === id);
      
      if (existingItemIndex >= 0) {
        // Item exists - update quantity
        const existingItem = state.items[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;
        
        // Check stock limit if provided
        if (stock && newQuantity > stock) {
          return; // Don't add if exceeds stock
        }
        
        state.items[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
          totalPrice: (existingItem.price * newQuantity).toFixed(2),
        };
      } else {
        // New item - add to cart
        state.items.push({
          id,
          name,
          price,
          image,
          quantity,
          stock: stock || Infinity,
          totalPrice: (price * quantity).toFixed(2),
          ...rest,
        });
      }
      
      // Recalculate totals
      cartSlice.caseReducers.calculateTotals(state);
    },
    
    removeFromCart: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter(item => item.id !== id);
      cartSlice.caseReducers.calculateTotals(state);
    },
    
    increaseQuantity: (state, action) => {
      const id = action.payload;
      const item = state.items.find(item => item.id === id);
      
      if (item) {
        // Check stock limit
        if (item.stock && item.quantity >= item.stock) {
          return; // Can't exceed stock
        }
        
        item.quantity += 1;
        item.totalPrice = (item.price * item.quantity).toFixed(2);
        cartSlice.caseReducers.calculateTotals(state);
      }
    },
    
    decreaseQuantity: (state, action) => {
      const id = action.payload;
      const item = state.items.find(item => item.id === id);
      
      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
          item.totalPrice = (item.price * item.quantity).toFixed(2);
        } else {
          // Remove item if quantity becomes 0
          state.items = state.items.filter(item => item.id !== id);
        }
        cartSlice.caseReducers.calculateTotals(state);
      }
    },
    
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      
      if (item && quantity > 0) {
        // Check stock limit
        if (item.stock && quantity > item.stock) {
          item.quantity = item.stock;
        } else {
          item.quantity = quantity;
        }
        item.totalPrice = (item.price * item.quantity).toFixed(2);
        cartSlice.caseReducers.calculateTotals(state);
      }
    },
    
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
      state.coupon = null;
      state.discount = 0;

      cartSlice.caseReducers.calculateTotals(state);
    },
    
    applyCoupon: (state, action) => {
      const { code, discountType, discountValue } = action.payload;
      
      // Simple coupon logic
      state.coupon = {
        code,
        discountType, // 'percentage' or 'fixed'
        discountValue,
      };
      
      cartSlice.caseReducers.calculateTotals(state);
    },
    
    removeCoupon: (state) => {
      state.coupon = null;
      state.discount = 0;
      cartSlice.caseReducers.calculateTotals(state);
    },
    
    setShipping: (state, action) => {
      state.shipping = action.payload;
      cartSlice.caseReducers.calculateTotals(state);
    },
    
    calculateTotals: (state) => {
      // Calculate total quantity
      state.totalQuantity = state.items.reduce((total, item) => total + item.quantity, 0);
      
      // Calculate subtotal
      const subtotal = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      // Apply coupon discount
      let discountAmount = 0;
      if (state.coupon) {
        if (state.coupon.discountType === 'percentage') {
          discountAmount = (subtotal * state.coupon.discountValue) / 100;
        } else {
          discountAmount = state.coupon.discountValue;
        }
      }
      state.discount = discountAmount;
      
      // Calculate tax (example: 10% tax)
      state.tax = (subtotal - discountAmount) * 0.1;
      
      // Calculate total amount
      state.totalAmount = (subtotal - discountAmount + state.tax + state.shipping).toFixed(2);
      
      // Save to localStorage
      try {
        localStorage.setItem('cart', JSON.stringify(state));
      } catch (error) {
        console.error('Failed to save cart to localStorage:', error);
      }
    },
    
    mergeCarts: (state, action) => {
      // For merging guest cart with user cart after login
      const guestCart = action.payload;
      
      guestCart.items.forEach(guestItem => {
        const existingItem = state.items.find(item => item.id === guestItem.id);
        
        if (existingItem) {
          // Merge quantities if item exists
          existingItem.quantity += guestItem.quantity;
          existingItem.totalPrice = (existingItem.price * existingItem.quantity).toFixed(2);
        } else {
          // Add new item
          state.items.push(guestItem);
        }
      });
      
      cartSlice.caseReducers.calculateTotals(state);
    },
  },
});

// Export actions
export const {
  addToCart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  updateQuantity,
  clearCart,
  applyCoupon,
  removeCoupon,
  setShipping,
  mergeCarts,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotalQuantity = (state) => state.cart.totalQuantity;
export const selectCartTotalAmount = (state) => state.cart.totalAmount;
export const selectCartSubtotal = (state) => {
  return state.cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
};
export const selectCartDiscount = (state) => state.cart.discount;
export const selectCartTax = (state) => state.cart.tax;
export const selectCartShipping = (state) => state.cart.shipping;
export const selectAppliedCoupon = (state) => state.cart.coupon;
export const selectIsInCart = (id) => (state) => {
  return state.cart.items.some(item => item.id === id);
};
export const selectItemQuantity = (id) => (state) => {
  const item = state.cart.items.find(item => item.id === id);
  return item ? item.quantity : 0;
};

export default cartSlice;