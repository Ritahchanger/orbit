// The platform dashboard's own HTTP client. Kept apart from the business
// app's client (api/axios-conf.jsx) on purpose: platform sessions use their
// own cookie, and a 401 here must never trigger the business refresh/logout
// flow.
import axios from "axios";

const apiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

const platformClient = axios.create({
  baseURL: `${apiBase}/platform`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Normalise every failure to an Error with the server's message and status
platformClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalised = new Error(
      error.response?.data?.message ||
        (error.response ? error.message : "Network error - please check your connection"),
    );
    normalised.status = error.response?.status;
    return Promise.reject(normalised);
  },
);

export default platformClient;
