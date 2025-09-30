// React hook for authentication
import { useState, useEffect } from 'react';
import authService, { AuthState, LoginCredentials, RegisterData } from '../services/authenticationService';

export function useAuth() {
  const [state, setState] = useState<AuthState>(authService.getState());

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.subscribe(setState);
    return unsubscribe;
  }, []);

  const login = async (credentials: LoginCredentials) => {
    return authService.login(credentials);
  };

  const register = async (data: RegisterData) => {
    return authService.register(data);
  };

  const loginWithProvider = async (provider: 'google' | 'github' | 'microsoft') => {
    return authService.loginWithProvider(provider);
  };

  const logout = async () => {
    return authService.logout();
  };

  const resetPassword = async (email: string) => {
    return authService.resetPassword(email);
  };

  const updatePassword = async (newPassword: string) => {
    return authService.updatePassword(newPassword);
  };

  const getAccessToken = async () => {
    return authService.getAccessToken();
  };

  const hasPermission = (permission: string) => {
    return authService.hasPermission(permission);
  };

  const hasRole = (role: string) => {
    return authService.hasRole(role);
  };

  return {
    ...state,
    login,
    register,
    loginWithProvider,
    logout,
    resetPassword,
    updatePassword,
    getAccessToken,
    hasPermission,
    hasRole,
  };
}
