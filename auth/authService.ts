/**
 * Real Authentication Service
 * Connects to Express backend with JWT authentication
 */

import axios from 'axios';
import { User } from '../types';

// Use Vercel API in production, localhost in development
const API_URL = import.meta.env.PROD
    ? '/api'  // Vercel will handle this
    : 'http://localhost:3001/api';  // Local development

const TOKEN_KEY = 'constructai_token';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/**
 * Login with email and password
 */
export const login = async (email: string, password: string): Promise<User> => {
    console.log('🔐 [AuthService] Login attempt:', email);

    try {
        const response = await api.post('/auth/login', { email, password });

        if (response.data.success) {
            // Save token
            localStorage.setItem(TOKEN_KEY, response.data.token);

            console.log('✅ [AuthService] Login successful:', response.data.user.name);

            return response.data.user;
        } else {
            throw new Error(response.data.error || 'Login failed');
        }
    } catch (error: any) {
        console.error('❌ [AuthService] Login failed:', error.response?.data?.error || error.message);
        throw new Error(error.response?.data?.error || 'Login failed');
    }
};

/**
 * Register new user
 */
export const register = async (
    email: string,
    password: string,
    name: string,
    companyName: string
): Promise<User> => {
    console.log('📝 [AuthService] Register attempt:', email);

    try {
        const response = await api.post('/auth/register', {
            email,
            password,
            name,
            companyName
        });

        if (response.data.success) {
            // Save token
            localStorage.setItem(TOKEN_KEY, response.data.token);

            console.log('✅ [AuthService] Registration successful:', response.data.user.name);

            return response.data.user;
        } else {
            throw new Error(response.data.error || 'Registration failed');
        }
    } catch (error: any) {
        console.error('❌ [AuthService] Registration failed:', error.response?.data?.error || error.message);
        throw new Error(error.response?.data?.error || 'Registration failed');
    }
};

/**
 * Logout current user
 */
export const logout = async (): Promise<void> => {
    console.log('👋 [AuthService] Logout');

    try {
        await api.post('/auth/logout');
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.removeItem(TOKEN_KEY);
    }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<User | null> => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
        return null;
    }

    try {
        const response = await api.get('/auth/me');

        if (response.data.success) {
            return response.data.user;
        }

        return null;
    } catch (error) {
        console.error('Get current user error:', error);
        localStorage.removeItem(TOKEN_KEY);
        return null;
    }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
    return localStorage.getItem(TOKEN_KEY) !== null;
};

/**
 * Refresh session token
 */
export const refreshSession = async (): Promise<void> => {
    try {
        const response = await api.post('/auth/refresh');

        if (response.data.success) {
            localStorage.setItem(TOKEN_KEY, response.data.token);
            console.log('🔄 [AuthService] Session refreshed');
        }
    } catch (error) {
        console.error('Refresh session error:', error);
        localStorage.removeItem(TOKEN_KEY);
    }
};

/**
 * OAuth login (for future implementation)
 */
export const loginWithOAuth = async (provider: 'google' | 'github'): Promise<User> => {
    console.log(`🔐 [AuthService] OAuth login with ${provider}`);

    // For now, redirect to demo login
    throw new Error('OAuth not implemented yet. Please use email/password login.');
};

/**
 * Refresh authentication token
 */
export const refreshToken = async (): Promise<string> => {
    console.log('🔄 [AuthService] Refreshing token');

    try {
        const response = await api.post('/auth/refresh');

        if (response.data.success) {
            const newToken = response.data.token;
            localStorage.setItem(TOKEN_KEY, newToken);
            console.log('✅ [AuthService] Token refreshed successfully');
            return newToken;
        } else {
            throw new Error(response.data.error || 'Token refresh failed');
        }
    } catch (error: any) {
        console.error('❌ [AuthService] Token refresh failed:', error.message);
        localStorage.removeItem(TOKEN_KEY);
        throw error;
    }
};

/**
 * Get system health status
 */
export const getHealthStatus = async (): Promise<any> => {
    console.log('🏥 [AuthService] Checking system health');

    try {
        const response = await api.get('/health');
        console.log('✅ [AuthService] Health check successful');
        return response.data;
    } catch (error: any) {
        console.error('❌ [AuthService] Health check failed:', error.message);
        throw error;
    }
};

