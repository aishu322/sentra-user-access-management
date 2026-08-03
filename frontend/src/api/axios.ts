import axios from "axios";
import { API_URL } from "../config/env";
import { getStoredAccessToken, clearTokens } from "../providers/authSession";

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // CRITICAL for cookies
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = getStoredAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auto refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      await api.post("/auth/token/refresh/");
      return api(originalRequest);
    }
    if (err.response?.status === 401) clearTokens();
    return Promise.reject(err);
  }
);

export default api;