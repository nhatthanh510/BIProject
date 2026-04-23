import { api } from "./client";
import type { LoginResponse, User } from "@/types";

export async function login(email: string, password: string): Promise<LoginResponse> {
  const resp = await api.post<LoginResponse>("/api/auth/login/", { email, password });
  return resp.data;
}

export async function logout(): Promise<void> {
  await api.post("/api/auth/logout/");
}

export async function fetchMe(): Promise<User> {
  const resp = await api.get<User>("/api/auth/me/");
  return resp.data;
}
