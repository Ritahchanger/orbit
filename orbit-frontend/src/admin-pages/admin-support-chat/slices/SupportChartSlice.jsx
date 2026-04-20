import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isOpen: false,
  messages: [
    {
      id: "init",
      role: "assistant",
      content:
        "Hi! I'm the Orbit support assistant. I can help with billing, subscriptions, account settings, and more. What can I help you with today?",
      timestamp: new Date().toISOString(),
    },
  ],
  isLoading: false,
  error: null,
};

const supportChatSlice = createSlice({
  name: "supportChat",
  initialState,
  reducers: {
    openChat: (state) => {
      state.isOpen = true;
    },
    closeChat: (state) => {
      state.isOpen = false;
    },
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearMessages: (state) => {
      state.messages = [
        {
          id: "init",
          role: "assistant",
          content: "Chat cleared. Hi again! How can I help you today?",
          timestamp: new Date().toISOString(),
        },
      ];
    },
  },
});

export const {
  openChat,
  closeChat,
  toggleChat,
  addMessage,
  setLoading,
  setError,
  clearError,
  clearMessages,
} = supportChatSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectChatIsOpen = (state) => state.supportChat.isOpen;
export const selectChatMessages = (state) => state.supportChat.messages;
export const selectChatIsLoading = (state) => state.supportChat.isLoading;
export const selectChatError = (state) => state.supportChat.error;

// ── Thunk: send message + call AI ──────────────────────────────────────────────
export const sendSupportMessage = (userText) => async (dispatch, getState) => {
  const content = userText.trim();
  if (!content) return;

  const userMsg = {
    id: Date.now().toString(),
    role: "user",
    content,
    timestamp: new Date().toISOString(),
  };

  dispatch(addMessage(userMsg));
  dispatch(setLoading(true));
  dispatch(clearError());

  const history = [...selectChatMessages(getState()), userMsg];

  const SYSTEM = `You are a helpful customer support assistant for Orbit Business — a SaaS subscription platform.
You help businesses with billing questions, subscription management, account settings, adding users, payment methods, plan upgrades/downgrades, and cancellations.
Be concise, friendly, and professional. Keep responses under 120 words. Use bullet points only when listing steps.
Never make up specific account data — if asked for account-specific info, ask the user to verify via their dashboard or email support@orbitbusiness.com.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: SYSTEM,
        messages: history.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const data = await res.json();
    const aiText =
      data.content?.[0]?.text ??
      "Sorry, I couldn't process that. Please try again.";

    dispatch(
      addMessage({
        id: Date.now().toString() + "_ai",
        role: "assistant",
        content: aiText,
        timestamp: new Date().toISOString(),
      }),
    );
  } catch (err) {
    dispatch(setError(err.message));
    dispatch(
      addMessage({
        id: Date.now().toString() + "_err",
        role: "assistant",
        content:
          "Something went wrong on our end. Please try again or email support@orbitbusiness.com.",
        timestamp: new Date().toISOString(),
      }),
    );
  } finally {
    dispatch(setLoading(false));
  }
};

export default supportChatSlice;
