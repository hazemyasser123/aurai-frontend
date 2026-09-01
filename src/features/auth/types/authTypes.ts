import type { z } from "zod";
import type { loginSchema } from "../schemas/authSchemas";

// Derived from Zod schema
export type LoginFormData = z.infer<typeof loginSchema>;

// Response shapes
export interface LoginResponse {
  access_token: string;
  token_type: string;
}

// Enums
export type UserRole = "USER" | "ADMIN";

export interface UserProfile {
  id: string;
  username: string;
  role: UserRole;
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserPayload {
  username: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserPayload {
  role?: UserRole;
  is_active?: boolean;
  password?: string;
}

export interface UserResponse {
  id: string;
  username: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
