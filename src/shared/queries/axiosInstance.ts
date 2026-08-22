import axios from "axios";

export const systemApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  withCredentials: true,
});

export const anonymousApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

// Automatically attach JWT token to systemApi requests
systemApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Handle FormData headers automatically
  if (config.data instanceof FormData) {
    config.headers["Content-Type"] = "multipart/form-data";
  }

  return config;
});
