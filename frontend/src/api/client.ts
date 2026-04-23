import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

let accessToken: string | null = null;
let onUnauthorized: (() => void) | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function setOnUnauthorized(cb: (() => void) | null) {
  onUnauthorized = cb;
}

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.set?.("Authorization", `Bearer ${accessToken}`);
  }
  return config;
});

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const resp = await axios.post<{ access: string }>(
        `${API_URL}/api/auth/refresh/`,
        {},
        { withCredentials: true },
      );
      const token = resp.data.access;
      setAccessToken(token);
      return token;
    } catch {
      setAccessToken(null);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;

    if (status !== 401 || !original || original._retry) {
      throw error;
    }
    // Don't try to refresh the refresh endpoint itself
    if (original.url?.includes("/api/auth/refresh/") || original.url?.includes("/api/auth/login/")) {
      throw error;
    }

    original._retry = true;
    const newToken = await refreshAccessToken();
    if (!newToken) {
      onUnauthorized?.();
      throw error;
    }
    original.headers.set?.("Authorization", `Bearer ${newToken}`);
    return api.request(original);
  },
);
