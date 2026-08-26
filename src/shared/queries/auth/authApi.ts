import { anonymousApi, systemApi } from "../axiosInstance";
import type {
  LoginResponse,
  UserProfile,
} from "@/features/auth/types/authTypes";

export const authApi = {
  login: async (data: { username: string; password: string }) => {
    const response = await anonymousApi.post<LoginResponse>("/auth/login", {
      username: data.username,
      password: data.password,
    });
    return response.data;
  },

  getMe: async (token: string) => {
    const response = await systemApi.get<UserProfile>("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
