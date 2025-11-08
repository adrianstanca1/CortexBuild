'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  company_id?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            localStorage.removeItem('authToken');
          }
        } catch (error) {
          // API not available, use mock user for development
          console.warn('Auth API not available, using development mode');
          const mockUser = {
            id: 'dev-user-1',
            email: 'admin@constructai.com',
            name: 'Development User',
            role: 'admin',
            avatar: '',
            company_id: 'company-1'
          };
          setUser(mockUser);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('authToken', data.token);
        setUser(data.user);
        return;
      }
    } catch (error) {
      // API not available, use development login
      console.warn('Auth API not available, using development login');
    }

    // Development fallback
    if (email === 'admin@constructai.com' && password === 'admin123') {
      const mockUser = {
        id: 'dev-user-1',
        email: email,
        name: 'Development Admin',
        role: 'admin',
        avatar: '',
        company_id: 'company-1'
      };
      localStorage.setItem('authToken', 'dev-token-123');
      setUser(mockUser);
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      localStorage.removeItem('authToken');
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      loading,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}