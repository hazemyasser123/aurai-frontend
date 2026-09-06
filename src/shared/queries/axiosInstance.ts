import axios from "axios";
import toast from "react-hot-toast";
import { store } from "@/shared/redux/store/store";
import { logout } from "@/shared/redux/slices/authSlice";

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

// Global 401 handler: any authenticated request rejected with 401 means the
// token is missing/invalid/expired → log out once, toast, and let
// ProtectedRoute redirect to /login (no reload, so the toast survives).
// anonymousApi (login) is intentionally excluded — failed logins keep local handling.
let isHandling401 = false;

systemApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status as number | undefined;
    const url = (error?.config?.url as string) || '';
    const isLoginCall = url.includes('/auth/login');

    if (status === 401 && !isLoginCall && !isHandling401) {
      const { isAuthenticated } = store.getState().auth;
      if (isAuthenticated) {
        isHandling401 = true;
        store.dispatch(logout());
        toast.error('Your session has expired. Please log in again.');
        // Reset the guard so a future expiry (after re-login) triggers again
        setTimeout(() => {
          isHandling401 = false;
        }, 3000);
      }
    }

    return Promise.reject(error);
  },
);
