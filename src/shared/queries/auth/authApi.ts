import { anonymousApi, systemApi } from "../axiosInstance";
import type {
  LoginResponse,
  UserProfile,
} from "@/features/auth/types/authTypes";

export const authApi = {
  login: async (data: { username: string; password: string }) => {
    const formData = new URLSearchParams();
    formData.append("username", data.username);
    formData.append("password", data.password);

    const response = await anonymousApi.post<LoginResponse>(
      "/auth/login",
      formData,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      },
    );
    return response.data;
  },

  getMe: async (token: string) => {
    const response = await systemApi.get<UserProfile>("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
