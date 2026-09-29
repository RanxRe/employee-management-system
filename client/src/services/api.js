import axios from "axios";

import { store } from "@/store";
import { logout } from "@/store/slices/authSlice";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/*
 * Request interceptor
 *
 * Adds the JWT to every authenticated API request.
 */
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/*
 * Response interceptor
 *
 * Handles authentication failures globally.
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());

      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default api;
