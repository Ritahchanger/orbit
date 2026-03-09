// src/redux/pos-slice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Current single session (backward compatibility)
  cart: [],
  isPosModalOpen: false,
  customerName: "",
  customerPhone: "",
  paymentMethod: "cash",
  discount: 0,
  notes: "",
  subtotal: 0,
  total: 0,

  // NEW: Multiple session support
  activeSessions: [],
  currentSessionId: null,
  sessions: {},
  maxSessions: 3, // Maximum tabs allowed
  sessionCounter: 0,
};

const posSlice = createSlice({
  name: "pos",
  initialState,
  reducers: {
    // ============ BACKWARD COMPATIBLE METHODS ============
    openPosModal: (state) => {
      state.isPosModalOpen = true;
      // Reset to single session mode when opening modal fresh
      if (state.activeSessions.length === 0) {
        state.currentSessionId = null;
      }
    },

    closePosModal: (state) => {
      // Only reset single session if no active sessions
      if (state.activeSessions.length === 0) {
        state.cart = [];
        state.customerName = "";
        state.customerPhone = "";
        state.paymentMethod = "cash";
        state.discount = 0;
        state.notes = "";
        state.subtotal = 0;
        state.total = 0;
      }
      state.isPosModalOpen = false;
    },

    // Cart Management (single session)
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const existingItemIndex = state.cart.findIndex(
        (item) => item.product._id === product._id,
      );

      if (existingItemIndex >= 0) {
        state.cart[existingItemIndex].quantity += quantity;
        state.cart[existingItemIndex].total =
          state.cart[existingItemIndex].unitPrice *
          state.cart[existingItemIndex].quantity;
      } else {
        state.cart.push({
          product,
          quantity,
          unitPrice: product.price,
          total: product.price * quantity,
        });
      }
      posSlice.caseReducers.calculateSingleSessionTotals(state);
    },

    updateCartItemQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const itemIndex = state.cart.findIndex(
        (item) => item.product._id === productId,
      );

      if (itemIndex >= 0) {
        if (quantity <= 0) {
          state.cart.splice(itemIndex, 1);
        } else {
          state.cart[itemIndex].quantity = quantity;
          state.cart[itemIndex].total =
            state.cart[itemIndex].unitPrice * quantity;
        }
        posSlice.caseReducers.calculateSingleSessionTotals(state);
      }
    },

    removeFromCart: (state, action) => {
      const productId = action.payload;
      state.cart = state.cart.filter((item) => item.product._id !== productId);
      posSlice.caseReducers.calculateSingleSessionTotals(state);
    },

    clearCart: (state) => {
      state.cart = [];
      posSlice.caseReducers.calculateSingleSessionTotals(state);
    },

    setCustomerName: (state, action) => {
      state.customerName = action.payload;
      // If we have a current session, sync it too
      if (state.currentSessionId && state.sessions[state.currentSessionId]) {
        state.sessions[state.currentSessionId].customerName = action.payload;
      }
    },

    setCustomerPhone: (state, action) => {
      state.customerPhone = action.payload;
      // If we have a current session, sync it too
      if (state.currentSessionId && state.sessions[state.currentSessionId]) {
        state.sessions[state.currentSessionId].customerPhone = action.payload;
      }
    },

    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      // If we have a current session, sync it too
      if (state.currentSessionId && state.sessions[state.currentSessionId]) {
        state.sessions[state.currentSessionId].paymentMethod = action.payload;
      }
    },

    setDiscount: (state, action) => {
      const discount = Number(action.payload) || 0;
      state.discount = Math.max(0, discount);
      // If we have a current session, sync it too
      if (state.currentSessionId && state.sessions[state.currentSessionId]) {
        state.sessions[state.currentSessionId].discount = discount;
        posSlice.caseReducers.calculateSessionTotals(
          state,
          state.currentSessionId,
        );
      }
      posSlice.caseReducers.calculateSingleSessionTotals(state);
    },

    setNotes: (state, action) => {
      state.notes = action.payload;
      // If we have a current session, sync it too
      if (state.currentSessionId && state.sessions[state.currentSessionId]) {
        state.sessions[state.currentSessionId].notes = action.payload;
      }
    },

    resetPos: () => initialState,

    // ============ NEW: MULTI-SESSION METHODS ============

    // Create a new POS session/tab
    createNewSession: (state, action) => {
      const { storeId, userId, customerName = "" } = action.payload;
      const sessionId = `pos-${Date.now()}-${++state.sessionCounter}`;

      // ✅ NEW: Save current single-session data if it exists
      if (state.cart.length > 0 && !state.currentSessionId) {
        // We have items in cart but no session - convert to a session first
        const legacySessionId = `pos-legacy-${Date.now()}-${state.sessionCounter}`;

        const legacySession = {
          id: legacySessionId,
          cart: [...state.cart],
          customerName:
            state.customerName || `Customer ${state.sessionCounter}`,
          customerPhone: state.customerPhone,
          paymentMethod: state.paymentMethod,
          discount: state.discount,
          notes: state.notes,
          subtotal: state.subtotal,
          total: state.total,
          status: "active",
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          storeId,
          userId,
          wsClientId: `ws-${legacySessionId}`,
          sessionNumber: 1,
          isMinimized: false,
        };

        // Save the legacy session
        state.sessions[legacySessionId] = legacySession;
        state.activeSessions.push(legacySessionId);
        state.currentSessionId = legacySessionId;
      }

      // Calculate next session number
      let nextSessionNumber = 1;
      const existingNumbers = Object.values(state.sessions).map(
        (s) => s.sessionNumber,
      );
      if (existingNumbers.length > 0) {
        nextSessionNumber = Math.max(...existingNumbers) + 1;
      }

      const newSession = {
        id: sessionId,
        cart: [],
        customerName: customerName,
        customerPhone: "",
        paymentMethod: "cash",
        discount: 0,
        notes: "",
        subtotal: 0,
        total: 0,
        status: "active",
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        storeId,
        userId,
        wsClientId: `ws-${sessionId}`,
        sessionNumber: nextSessionNumber,
        isMinimized: false,
      };

      // Store the new session
      state.sessions[sessionId] = newSession;

      // Check if we can add another session
      if (state.activeSessions.length < state.maxSessions) {
        state.activeSessions.push(sessionId);
        state.currentSessionId = sessionId;

        // Clear old single session state when creating new session
        state.cart = [];
        state.customerName = "";
        state.customerPhone = "";
        state.paymentMethod = "cash";
        state.discount = 0;
        state.notes = "";
        state.subtotal = 0;
        state.total = 0;
      } else {
        // Find a session to pause/replace
        const pausedSession = state.activeSessions.find(
          (id) => state.sessions[id].status === "paused",
        );

        if (pausedSession) {
          // Replace paused session
          const index = state.activeSessions.indexOf(pausedSession);
          state.activeSessions[index] = sessionId;
          state.currentSessionId = sessionId;

          // Clear old single session state
          state.cart = [];
          state.customerName = "";
          state.customerPhone = "";
          state.paymentMethod = "cash";
          state.discount = 0;
          state.notes = "";
          state.subtotal = 0;
          state.total = 0;
        } else {
          // No room, don't create
          delete state.sessions[sessionId];
          state.sessionCounter--;
          return;
        }
      }
    },

    // Switch between sessions
    switchSession: (state, action) => {
      const sessionId = action.payload;
      if (state.sessions[sessionId]) {
        const session = state.sessions[sessionId];

        // Update current session ID
        state.currentSessionId = sessionId;
        session.lastActive = new Date().toISOString();
        session.isMinimized = false;

        // Sync session data to old state for backward compatibility
        // This ensures UI components using old state see correct data
        state.cart = [...session.cart];
        state.customerName = session.customerName;
        state.customerPhone = session.customerPhone;
        state.paymentMethod = session.paymentMethod;
        state.discount = session.discount;
        state.notes = session.notes;
        state.subtotal = session.subtotal;
        state.total = session.total;
      }
    },

    // Close a session
    closeSession: (state, action) => {
      const sessionId = action.payload;

      // Remove from active sessions
      state.activeSessions = state.activeSessions.filter(
        (id) => id !== sessionId,
      );

      // Delete session data
      delete state.sessions[sessionId];

      // Switch to another session if available
      if (state.currentSessionId === sessionId) {
        if (state.activeSessions.length > 0) {
          const nextSessionId = state.activeSessions[0];
          const nextSession = state.sessions[nextSessionId];

          // Switch to next session
          state.currentSessionId = nextSessionId;

          // Sync next session data to old state
          if (nextSession) {
            state.cart = [...nextSession.cart];
            state.customerName = nextSession.customerName;
            state.customerPhone = nextSession.customerPhone;
            state.paymentMethod = nextSession.paymentMethod;
            state.discount = nextSession.discount;
            state.notes = nextSession.notes;
            state.subtotal = nextSession.subtotal;
            state.total = nextSession.total;
          }
        } else {
          // No sessions left, reset to single session mode
          state.currentSessionId = null;
          state.cart = [];
          state.customerName = "";
          state.customerPhone = "";
          state.paymentMethod = "cash";
          state.discount = 0;
          state.notes = "";
          state.subtotal = 0;
          state.total = 0;
        }
      }
    },

    // Update session status
    updateSessionStatus: (state, action) => {
      const { sessionId, status } = action.payload;
      if (state.sessions[sessionId]) {
        state.sessions[sessionId].status = status;
        if (status === "paused") {
          state.sessions[sessionId].pausedAt = new Date().toISOString();
        }
      }
    },

    // Toggle minimize state
    toggleMinimizeSession: (state, action) => {
      const sessionId = action.payload;
      if (state.sessions[sessionId]) {
        state.sessions[sessionId].isMinimized =
          !state.sessions[sessionId].isMinimized;
      }
    },

    // Session cart operations
    addToSessionCart: (state, action) => {
      const { sessionId, product, quantity = 1 } = action.payload;
      const session = state.sessions[sessionId];

      if (!session) return;

      const existingItemIndex = session.cart.findIndex(
        (item) => item.product._id === product._id,
      );

      if (existingItemIndex >= 0) {
        session.cart[existingItemIndex].quantity += quantity;
        session.cart[existingItemIndex].total =
          session.cart[existingItemIndex].unitPrice *
          session.cart[existingItemIndex].quantity;
      } else {
        session.cart.push({
          product,
          quantity,
          unitPrice: product.price,
          total: product.price * quantity,
        });
      }

      posSlice.caseReducers.calculateSessionTotals(state, sessionId);

      // Sync to old state if this is the current session
      if (state.currentSessionId === sessionId) {
        state.cart = [...session.cart];
        state.subtotal = session.subtotal;
        state.total = session.total;
      }
    },

    updateSessionCartItemQuantity: (state, action) => {
      const { sessionId, productId, quantity } = action.payload;
      const session = state.sessions[sessionId];

      if (!session) return;

      const itemIndex = session.cart.findIndex(
        (item) => item.product._id === productId,
      );

      if (itemIndex >= 0) {
        if (quantity <= 0) {
          session.cart.splice(itemIndex, 1);
        } else {
          session.cart[itemIndex].quantity = quantity;
          session.cart[itemIndex].total =
            session.cart[itemIndex].unitPrice * quantity;
        }
        posSlice.caseReducers.calculateSessionTotals(state, sessionId);

        // Sync to old state if this is the current session
        if (state.currentSessionId === sessionId) {
          state.cart = [...session.cart];
          state.subtotal = session.subtotal;
          state.total = session.total;
        }
      }
    },

    removeFromSessionCart: (state, action) => {
      const { sessionId, productId } = action.payload;
      const session = state.sessions[sessionId];

      if (!session) return;

      session.cart = session.cart.filter(
        (item) => item.product._id !== productId,
      );
      posSlice.caseReducers.calculateSessionTotals(state, sessionId);

      // Sync to old state if this is the current session
      if (state.currentSessionId === sessionId) {
        state.cart = [...session.cart];
        state.subtotal = session.subtotal;
        state.total = session.total;
      }
    },

    clearSessionCart: (state, action) => {
      const sessionId = action.payload;
      const session = state.sessions[sessionId];

      if (!session) return;

      session.cart = [];
      posSlice.caseReducers.calculateSessionTotals(state, sessionId);

      // Sync to old state if this is the current session
      if (state.currentSessionId === sessionId) {
        state.cart = [];
        state.subtotal = 0;
        state.total = 0;
      }
    },

    // Session customer info
    setSessionCustomerName: (state, action) => {
      const { sessionId, customerName } = action.payload;
      if (state.sessions[sessionId]) {
        state.sessions[sessionId].customerName = customerName;
        // Sync to old state if this is the current session
        if (state.currentSessionId === sessionId) {
          state.customerName = customerName;
        }
      }
    },

    setSessionCustomerPhone: (state, action) => {
      const { sessionId, customerPhone } = action.payload;
      if (state.sessions[sessionId]) {
        state.sessions[sessionId].customerPhone = customerPhone;
        // Sync to old state if this is the current session
        if (state.currentSessionId === sessionId) {
          state.customerPhone = customerPhone;
        }
      }
    },

    setSessionPaymentMethod: (state, action) => {
      const { sessionId, paymentMethod } = action.payload;
      if (state.sessions[sessionId]) {
        state.sessions[sessionId].paymentMethod = paymentMethod;
        // Sync to old state if this is the current session
        if (state.currentSessionId === sessionId) {
          state.paymentMethod = paymentMethod;
        }
      }
    },

    setSessionDiscount: (state, action) => {
      const { sessionId, discount } = action.payload;
      const session = state.sessions[sessionId];

      if (!session) return;

      const discountValue = Number(discount) || 0;
      session.discount = Math.max(0, discountValue);
      posSlice.caseReducers.calculateSessionTotals(state, sessionId);

      // Sync to old state if this is the current session
      if (state.currentSessionId === sessionId) {
        state.discount = discountValue;
        state.subtotal = session.subtotal;
        state.total = session.total;
      }
    },

    setSessionNotes: (state, action) => {
      const { sessionId, notes } = action.payload;
      if (state.sessions[sessionId]) {
        state.sessions[sessionId].notes = notes;
        // Sync to old state if this is the current session
        if (state.currentSessionId === sessionId) {
          state.notes = notes;
        }
      }
    },

    // Complete a session (mark as completed but keep for reference)
    completeSession: (state, action) => {
      const sessionId = action.payload;
      if (state.sessions[sessionId]) {
        state.sessions[sessionId].status = "completed";
        state.sessions[sessionId].completedAt = new Date().toISOString();

        // Remove from active but keep in sessions
        state.activeSessions = state.activeSessions.filter(
          (id) => id !== sessionId,
        );

        if (state.currentSessionId === sessionId) {
          if (state.activeSessions.length > 0) {
            const nextSessionId = state.activeSessions[0];
            const nextSession = state.sessions[nextSessionId];

            state.currentSessionId = nextSessionId;

            // Sync next session data to old state
            if (nextSession) {
              state.cart = [...nextSession.cart];
              state.customerName = nextSession.customerName;
              state.customerPhone = nextSession.customerPhone;
              state.paymentMethod = nextSession.paymentMethod;
              state.discount = nextSession.discount;
              state.notes = nextSession.notes;
              state.subtotal = nextSession.subtotal;
              state.total = nextSession.total;
            }
          } else {
            state.currentSessionId = null;
            state.cart = [];
            state.customerName = "";
            state.customerPhone = "";
            state.paymentMethod = "cash";
            state.discount = 0;
            state.notes = "";
            state.subtotal = 0;
            state.total = 0;
          }
        }
      }
    },

    // Pause a session (customer is waiting)
    pauseSession: (state, action) => {
      const sessionId = action.payload;
      if (state.sessions[sessionId]) {
        state.sessions[sessionId].status = "paused";
        state.sessions[sessionId].pausedAt = new Date().toISOString();
      }
    },

    // Resume a paused session
    resumeSession: (state, action) => {
      const sessionId = action.payload;
      if (state.sessions[sessionId]) {
        state.sessions[sessionId].status = "active";
        state.sessions[sessionId].lastActive = new Date().toISOString();
        state.currentSessionId = sessionId;

        // Sync session data to old state
        const session = state.sessions[sessionId];
        state.cart = [...session.cart];
        state.customerName = session.customerName;
        state.customerPhone = session.customerPhone;
        state.paymentMethod = session.paymentMethod;
        state.discount = session.discount;
        state.notes = session.notes;
        state.subtotal = session.subtotal;
        state.total = session.total;
      }
    },

    // ============ INTERNAL CALCULATION METHODS ============
    calculateSingleSessionTotals: (state) => {
      state.subtotal = state.cart.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0,
      );
      state.total = Math.max(0, state.subtotal - state.discount);

      // Sync to current session if exists
      if (state.currentSessionId && state.sessions[state.currentSessionId]) {
        const session = state.sessions[state.currentSessionId];
        session.subtotal = state.subtotal;
        session.total = state.total;
        session.discount = state.discount;
      }
    },

    calculateSessionTotals: (state, sessionId) => {
      const session = state.sessions[sessionId];
      if (!session) return;

      session.subtotal = session.cart.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0,
      );
      session.total = Math.max(0, session.subtotal - session.discount);
    },
  },
});

export const {
  // Original exports
  openPosModal,
  closePosModal,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  setCustomerName,
  setCustomerPhone,
  setPaymentMethod,
  setDiscount,
  setNotes,
  resetPos,

  // New multi-session exports
  createNewSession,
  switchSession,
  closeSession,
  updateSessionStatus,
  toggleMinimizeSession,
  addToSessionCart,
  updateSessionCartItemQuantity,
  removeFromSessionCart,
  clearSessionCart,
  setSessionCustomerName,
  setSessionCustomerPhone,
  setSessionPaymentMethod,
  setSessionDiscount,
  setSessionNotes,
  completeSession,
  pauseSession,
  resumeSession,
} = posSlice.actions;

export default posSlice;
