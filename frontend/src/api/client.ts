import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Access token lives in a module-level variable so the axios interceptor can
// read it without a React re-render. AuthContext syncs it.
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

let onUnauthorized: (() => void) | null = null;
export function setOnUnauthorized(fn: (() => void) | null) {
  onUnauthorized = fn;
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }
  return config;
});

interface RetryConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post<{ access: string }>(`${baseURL}/api/auth/refresh/`, {}, { withCredentials: true })
      .then((res) => {
        accessToken = res.data.access;
        return accessToken;
      })
      .catch(() => {
        accessToken = null;
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined;
    if (!config || error.response?.status !== 401 || config._retried) {
      return Promise.reject(error);
    }
    // Avoid infinite loop on the refresh endpoint itself
    if (config.url?.includes("/api/auth/refresh")) {
      return Promise.reject(error);
    }

    config._retried = true;
    const newToken = await refreshAccessToken();
    if (newToken) {
      config.headers.set("Authorization", `Bearer ${newToken}`);
      return api(config);
    }

    if (onUnauthorized) onUnauthorized();
    return Promise.reject(error);
  },
);
