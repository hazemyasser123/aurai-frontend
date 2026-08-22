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
