import axios from "axios";
import config from "../config.json";

const api = axios.create({
    baseURL: config.BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// 🔥 Xử lý token hết hạn ở đây
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Xoá token
            localStorage.removeItem("token");

            // Chuyển về login
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default api;