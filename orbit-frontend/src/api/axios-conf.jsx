import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;
const FRONTEND_URL = import.meta.env.VITE_API_FRONTEND_URL;
const isDev = import.meta.env.MODE === "development";

// ─── Refresh token state ───────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(),
  );
  failedQueue = [];
};
// ──────────────────────────────────────────────────────────────────────────

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // sends cookies on every request automatically
});

// ─── Request interceptor ───────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    if (isDev) {
      console.log(`🚀 ${config.method?.toUpperCase()} → ${config.url}`);
      if (config.withCredentials)
        console.log("🔐 Sending credentials (cookies)");
    }
    return config;
  },
  (error) => {
    if (isDev) console.error("❌ Request error:", error);
    return Promise.reject(error);
  },
);

// ─── Response interceptor ─────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    if (isDev) {
      console.log(
        `✅ ${response.config.method?.toUpperCase()} ${response.config.url}:`,
        response.status,
      );
    }
    return response;
  },

  async (error) => {
    // ── Cancelled requests ───────────────────────────────────────────────
    if (axios.isCancel(error)) {
      if (isDev) console.warn("⚠️ Request cancelled:", error.message);
      return Promise.reject(new Error("Request was cancelled"));
    }

    // ── No response = network error ──────────────────────────────────────
    if (!error.response) {
      if (isDev) console.error("🌐 Network error:", error.message);
      return Promise.reject(
        new Error("Network error - please check your connection"),
      );
    }

    const { status, data } = error.response;
    const originalRequest = error.config;
    const message = data?.message || data?.error || error.message;

    if (isDev) {
      console.log("📊 Error Response Data:", data);
      logErrorByStatus(status, message); // see helper below
    }

    // ── Refresh token flow (only on 401) ────────────────────────────────
    const isRefreshEndpoint = originalRequest.url?.includes(
      "/auth/refresh-token",
    );
    const alreadyRetried = originalRequest._retry;

    if (status === 401 && !isRefreshEndpoint && !alreadyRetried) {
      // Queue concurrent 401s while a refresh is already in-flight
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        if (isDev)
          console.log("🔄 Access token expired — attempting refresh...");

        await api.post("/auth/refresh-token"); // new cookies set by server automatically

        if (isDev)
          console.log("✅ Token refreshed — retrying original request");

        processQueue(null); // unblock queued requests
        return api(originalRequest); // retry the original request
      } catch (refreshError) {
        if (isDev) console.error("🔐 Refresh failed — forcing logout");

        processQueue(refreshError); // reject all queued requests

        // Let the rest of the app know the session is dead
        window.dispatchEvent(new CustomEvent("auth:logout"));

        return Promise.reject(
          new Error("Session expired - please log in again"),
        );
      } finally {
        isRefreshing = false;
      }
    }

    // ── All other errors — return user-facing messages ───────────────────
    return Promise.reject(
      new Error(resolveErrorMessage(status, message, data)),
    );
  },
);

// ─── Helpers ──────────────────────────────────────────────────────────────

// Dev-only console logging by status
function logErrorByStatus(status, message) {
  const map = {
    400: `❌ Bad request: ${message}`,
    401: `🔐 Unauthorized: ${message}`,
    403: `🚫 Forbidden: ${message}`,
    404: `🔍 Not found: ${message}`,
    409: `⚡ Conflict: ${message}`,
    422: `📝 Validation error: ${message}`,
    429: `🐌 Rate limit: ${message}`,
    500: `💥 Server error: ${message}`,
    502: `🔧 Server unavailable: ${message}`,
    503: `🔧 Server unavailable: ${message}`,
    504: `🔧 Server unavailable: ${message}`,
  };
  console.error(map[status] ?? `❌ HTTP ${status}: ${message}`);
}

// User-facing error messages by status
function resolveErrorMessage(status, message, data) {
  if (status === 500 && data?.message?.includes("already subscribed")) {
    return data.message;
  }

  const map = {
    400: message || "Invalid request data",
    401: message || "Please log in to continue",
    403: message || "You don't have permission for this action",
    404: message || "Resource not found",
    409: message || "Conflict occurred",
    422: message || "Validation failed",
    429: message || "Too many requests - please slow down",
    500: message || "Server error - please try again later",
    502: message || "Service temporarily unavailable",
    503: message || "Service temporarily unavailable",
    504: message || "Service temporarily unavailable",
  };

  return map[status] ?? message ?? "Something went wrong";
}

export { api, baseURL, FRONTEND_URL };
