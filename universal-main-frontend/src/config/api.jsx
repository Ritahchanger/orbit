import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;
const FRONTEND_URL = import.meta.env.VITE_API_FRONTEND_URL;

// Check if we're in development mode
const isDev = import.meta.env.MODE === "development";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Global request interceptor
api.interceptors.request.use(
  (config) => {
    // Only log in development
    if (isDev) {
      console.log(
        `🚀 Making ${config.method?.toUpperCase()} request to: ${config.url}`,
      );

      if (config.withCredentials) {
        console.log("🔐 Sending credentials (cookies) with request");
      }
    }
    return config;
  },
  (error) => {
    if (isDev) console.error("❌ Request error:", error);
    return Promise.reject(error);
  },
);

// Global response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Only log in development
    if (isDev) {
      console.log(
        `✅ ${response.config.method?.toUpperCase()} ${response.config.url}:`,
        response.status,
      );
    }
    return response;
  },
  (error) => {
    // Global error handling
    if (axios.isCancel(error)) {
      if (isDev) console.warn("⚠️ Request cancelled:", error.message);
      return Promise.reject(new Error("Request was cancelled"));
    }

    if (!error.response) {
      if (isDev) console.error("🌐 Network error:", error.message);
      return Promise.reject(
        new Error("Network error - please check your connection"),
      );
    }

    const { status, data } = error.response;
    const message = data?.message || data?.error || error.message;

    // Only log in development
    if (isDev) {
      console.log(`📊 Error Response Data:`, data);

      // Handle different HTTP status codes with logging
      switch (status) {
        case 400:
          console.error("❌ Bad request:", message);
          break;
        case 401:
          console.error("🔐 Unauthorized:", message);
          break;
        case 403:
          console.error("🚫 Forbidden:", message);
          break;
        case 404:
          console.error("🔍 Not found:", message);
          break;
        case 409:
          console.error("⚡ Conflict:", message);
          break;
        case 422:
          console.error("📝 Validation error:", message);
          break;
        case 429:
          console.error("🐌 Rate limit:", message);
          break;
        case 500:
          console.error("💥 Server error:", message);
          break;
        case 502:
        case 503:
        case 504:
          console.error("🔧 Server unavailable:", message);
          break;
        default:
          console.error(`❌ HTTP ${status} error:`, message);
      }
    }

    // Return appropriate error messages (these will show to users)
    switch (status) {
      case 400:
        return Promise.reject(new Error(message || "Invalid request data"));
      case 401:
        return Promise.reject(
          new Error(message || "Please log in to continue"),
        );
      case 403:
        return Promise.reject(
          new Error(message || "You don't have permission for this action"),
        );
      case 404:
        return Promise.reject(new Error(message || "Resource not found"));
      case 409:
        return Promise.reject(new Error(message || "Conflict occurred"));
      case 422:
        return Promise.reject(new Error(message || "Validation failed"));
      case 429:
        return Promise.reject(
          new Error(message || "Too many requests - please slow down"),
        );
      case 500:
        if (data?.message && data.message.includes("already subscribed")) {
          return Promise.reject(new Error(data.message));
        }
        return Promise.reject(
          new Error(message || "Server error - please try again later"),
        );
      case 502:
      case 503:
      case 504:
        return Promise.reject(
          new Error(message || "Service temporarily unavailable"),
        );
      default:
        return Promise.reject(new Error(message || "Something went wrong"));
    }
  },
);

export { api, baseURL, FRONTEND_URL };
