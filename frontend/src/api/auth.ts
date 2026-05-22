import api from "./axios";
import type { ApiResponse, AuthResult, LoginFormData, RegisterFormData } from "../types/index";

// All API functions are thin wrappers around axios calls.
// They return typed data so components never deal with raw HTTP.
// Errors bubble up to the caller — components decide how to display them.

export async function register(data: RegisterFormData): Promise<AuthResult> {
  const response = await api.post<ApiResponse<AuthResult>>("/auth/register", data);
  return response.data.data!;
}

export async function login(data: LoginFormData): Promise<AuthResult> {
  const response = await api.post<ApiResponse<AuthResult>>("/auth/login", data);
  return response.data.data!;
}
