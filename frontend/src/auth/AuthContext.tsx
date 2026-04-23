import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { fetchMe, login as apiLogin, logout as apiLogout } from "@/api/auth";
import { setAccessToken, setOnUnauthorized } from "@/api/client";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setOnUnauthorized(() => {
      setUser(null);
      setAccessToken(null);
    });
    (async () => {
      try {
        const me = await fetchMe();
        setUser(me);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
    return () => setOnUnauthorized(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const resp = await apiLogin(email, password);
    setAccessToken(resp.access);
    setUser(resp.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // swallow; we still want to clear local state
    }
    setAccessToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, isAuthenticated: !!user, isLoading, login, logout }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
