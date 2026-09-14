import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, setAuthToken } from '../api';

type Role = 'USER' | 'ADMIN';

type AuthState = {
  token: string | null;
  email: string | null;
  role: Role | null;
};

type AuthContextValue = {
  auth: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const LS_KEY = 'restaurant.auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ token: null, email: null, role: null });

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as AuthState;
      setAuth(parsed);
      setAuthToken(parsed.token);
    } catch {
      localStorage.removeItem(LS_KEY);
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    async function login(email: string, password: string) {
      const res = await api.post('/api/auth/login', { email, password });
      const next: AuthState = {
        token: res.data.accessToken,
        email: res.data.email,
        role: res.data.role,
      };
      setAuth(next);
      localStorage.setItem(LS_KEY, JSON.stringify(next));
      setAuthToken(next.token);
    }

    async function register(email: string, password: string) {
      const res = await api.post('/api/auth/register', { email, password });
      const next: AuthState = {
        token: res.data.accessToken,
        email: res.data.email,
        role: res.data.role,
      };
      setAuth(next);
      localStorage.setItem(LS_KEY, JSON.stringify(next));
      setAuthToken(next.token);
    }

    function logout() {
      setAuth({ token: null, email: null, role: null });
      localStorage.removeItem(LS_KEY);
      setAuthToken(null);
    }

    return { auth, login, register, logout };
  }, [auth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
