import axios from 'axios';
import { User } from '../types';
import { getEnv } from '../src/utils/env';

// Use empty string to make requests relative to current origin
// This allows Vite's proxy to handle the request properly
const API_BASE_URL = getEnv('VITE_API_URL', '');

class AuthService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    // Add request interceptor to include auth token
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async login(email: string, password: string): Promise<User> {
    console.log("🔐 [AuthService] Login attempt:", email);
    try {
      const response = await this.api.post('/auth/login', {
        email,
        password,
      });

      if (response.data.success) {
        localStorage.setItem('authToken', response.data.token);
        console.log("✅ [AuthService] Login successful:", response.data.user.name);
        return response.data.user;
      }
      throw new Error(response.data.error || "Login failed");
    } catch (error: any) {
      console.error("❌ [AuthService] Login failed:", error.response?.data?.error || error.message);
      throw new Error(error.response?.data?.error || "Login failed");
    }
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem('authToken');
    }
  }

  async verifyToken(token: string): Promise<User> {
    try {
      const response = await this.api.post('/auth/verify', { token });
      return response.data.user;
    } catch (error) {
      throw new Error("Token verification failed");
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('authToken');
    if (!token) return null;

    try {
      return await this.verifyToken(token);
    } catch (error) {
      localStorage.removeItem('authToken');
      return null;
    }
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
    role?: string;
  }): Promise<User> {
    try {
      const response = await this.api.post('/auth/register', userData);
      if (response.data.success) {
        localStorage.setItem('authToken', response.data.token);
        return response.data.user;
      }
      throw new Error(response.data.error || "Registration failed");
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Registration failed");
    }
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await this.api.put('/auth/profile', userData);
      return response.data.user;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Profile update failed");
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await this.api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Password change failed");
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}

export const authService = new AuthService();

// Export individual methods for easier imports
export const login = authService.login.bind(authService);
export const logout = authService.logout.bind(authService);
export const register = authService.register.bind(authService);
export const getCurrentUser = authService.getCurrentUser.bind(authService);
export const verifyToken = authService.verifyToken.bind(authService);
export const updateProfile = authService.updateProfile.bind(authService);
export const changePassword = authService.changePassword.bind(authService);
export const isAuthenticated = authService.isAuthenticated.bind(authService);
export const getToken = authService.getToken.bind(authService);
