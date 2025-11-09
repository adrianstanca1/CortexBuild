import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient, setAuthToken } from '../lib/api';
import type { User } from '@newera/types';

type AuthContextValue = {
  user?: User;
  token?: string;
  loading: boolean;
  login: (input: { email: string; password: string }) => Promise<void>;
  register: (input: {
    tenantName: string;
    tenantSlug: string;
    fullName: string;
    email: string;
    password: string;
    plan: 'starter' | 'growth' | 'enterprise';
  }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>();
  const [token, setToken] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem('newera_token');
    if (stored) {
      setAuthToken(stored);
      setToken(stored);
      apiClient
        .get('/auth/session')
        .then((res) => setUser(res.data.user))
        .catch(() => {
          window.localStorage.removeItem('newera_token');
          setAuthToken(undefined);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (input: { email: string; password: string }) => {
    const res = await apiClient.post('/auth/login', input);
    setToken(res.data.token);
    setUser(res.data.user);
    setAuthToken(res.data.token);
    window.localStorage.setItem('newera_token', res.data.token);
  };

  const register = async (input: {
    tenantName: string;
    tenantSlug: string;
    fullName: string;
    email: string;
    password: string;
    plan: 'starter' | 'growth' | 'enterprise';
  }) => {
    const res = await apiClient.post('/auth/register', input);
    setToken(res.data.token);
    setUser(res.data.user);
    setAuthToken(res.data.token);
    window.localStorage.setItem('newera_token', res.data.token);
  };

  const logout = () => {
    setUser(undefined);
    setToken(undefined);
    setAuthToken(undefined);
    window.localStorage.removeItem('newera_token');
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
