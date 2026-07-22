import axios from "axios";
import { API_URL } from "../config/env";
import { getStoredAccessToken } from "../providers/authSession";

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
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

export default api;