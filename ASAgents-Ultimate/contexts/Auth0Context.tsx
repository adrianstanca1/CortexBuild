import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@auth0/auth0-spa-js';
import { auth0Service } from '../services/auth0Service';

interface Auth0User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  emailVerified: boolean;
  sub: string;
  roles?: string[];
  permissions?: string[];
}

interface Auth0ContextType {
  user: Auth0User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (options?: { screen_hint?: 'signup' | 'login' }) => Promise<void>;
  signup: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | undefined>;
  hasPermission: (permission: string) => Promise<boolean>;
  getUserRoles: () => Promise<string[]>;
}

const Auth0Context = createContext<Auth0ContextType | undefined>(undefined);

interface Auth0ProviderProps {
  children: ReactNode;
}

export const Auth0Provider: React.FC<Auth0ProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Auth0User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Initialize Auth0
        await auth0Service.initialize();

        // Check authentication status
        const authenticated = await auth0Service.isAuthenticated();
        setIsAuthenticated(authenticated);

        if (authenticated) {
          // Get user profile
          const userProfile = await auth0Service.getUserProfile();
          if (userProfile) {
            // Get additional user data
            const roles = await auth0Service.getUserRoles();
            
            setUser({
              ...userProfile,
              roles
            });
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Authentication initialization failed';
        setError(errorMessage);
        console.error('Auth0 initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (options?: { screen_hint?: 'signup' | 'login' }) => {
    try {
      setError(null);
      await auth0Service.login(options);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    }
  };

  const signup = async () => {
    try {
      setError(null);
      await auth0Service.signup();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      setError(errorMessage);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await auth0Service.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
      throw err;
    }
  };

  const getAccessToken = async (): Promise<string | undefined> => {
    try {
      return await auth0Service.getAccessToken();
    } catch (err) {
      console.error('Get access token failed:', err);
      return undefined;
    }
  };

  const hasPermission = async (permission: string): Promise<boolean> => {
    try {
      return await auth0Service.hasPermission(permission);
    } catch (err) {
      console.error('Permission check failed:', err);
      return false;
    }
  };

  const getUserRoles = async (): Promise<string[]> => {
    try {
      return await auth0Service.getUserRoles();
    } catch (err) {
      console.error('Get user roles failed:', err);
      return [];
    }
  };

  const value: Auth0ContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    getAccessToken,
    hasPermission,
    getUserRoles
  };

  return (
    <Auth0Context.Provider value={value}>
      {children}
    </Auth0Context.Provider>
  );
};

export const useAuth0 = (): Auth0ContextType => {
  const context = useContext(Auth0Context);
  if (context === undefined) {
    throw new Error('useAuth0 must be used within an Auth0Provider');
  }
  return context;
};

export default Auth0Context;
