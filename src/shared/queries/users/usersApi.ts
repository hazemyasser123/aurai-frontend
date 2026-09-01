import { systemApi } from "../axiosInstance";
import type {
  User,
  CreateUserPayload,
  UpdateUserPayload,
  UserResponse,
} from "@/features/auth/types/authTypes";

export const usersApi = {
  listUsers: async (): Promise<User[]> => {
    const response = await systemApi.get<User[]>("/users");
    return response.data;
  },

  createUser: async (payload: CreateUserPayload): Promise<UserResponse> => {
    const response = await systemApi.post<UserResponse>("/users", payload);
    return response.data;
  },

  getUser: async (userId: string): Promise<User> => {
    const response = await systemApi.get<User>(`/users/${userId}`);
    return response.data;
  },

  updateUser: async (userId: string, payload: UpdateUserPayload): Promise<UserResponse> => {
    const response = await systemApi.patch<UserResponse>(`/users/${userId}`, payload);
    return response.data;
  },

  deleteUser: async (userId: string): Promise<UserResponse> => {
    const response = await systemApi.delete<UserResponse>(`/users/${userId}`);
    return response.data;
  },
};