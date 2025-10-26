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
 * Clear all cookies
 */
const clearAllCookies = (): void => {
    const cookies = document.cookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

        // Clear cookie for all paths and domains
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=' + window.location.hostname;
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.' + window.location.hostname;
    }

    console.log('🍪 [AuthService] All cookies cleared');
};

/**
 * Logout current user
 */
export const logout = async (): Promise<void> => {
    console.log('👋 [AuthService] Logout - Clearing all session data');

    const tokenBefore = localStorage.getItem(TOKEN_KEY);
    console.log('🔍 [AuthService] Token before logout:', tokenBefore ? 'EXISTS' : 'NULL');

    try {
        // Call server logout endpoint
        await api.post('/auth/logout');
        console.log('✅ [AuthService] Server logout successful');
    } catch (error) {
        console.error('❌ [AuthService] Server logout error:', error);
    } finally {
        // Clear ALL localStorage data
        console.log('🗑️ [AuthService] Clearing localStorage...');
        localStorage.clear();

        const tokenAfterClear = localStorage.getItem(TOKEN_KEY);
        console.log('🔍 [AuthService] Token after clear:', tokenAfterClear ? 'STILL EXISTS!' : 'NULL ✅');

        // Clear ALL sessionStorage data
        console.log('🗑️ [AuthService] Clearing sessionStorage...');
        sessionStorage.clear();

        // Clear ALL cookies
        console.log('🗑️ [AuthService] Clearing cookies...');
        clearAllCookies();

        // Dispatch logout event for landing page
        window.dispatchEvent(new CustomEvent('userLoggedOut'));

        console.log('✅ [AuthService] All session data cleared (localStorage, sessionStorage, cookies)');
    }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<User | null> => {
    const token = localStorage.getItem(TOKEN_KEY);

    console.log('🔍 [AuthService] getCurrentUser - Token in localStorage:', token ? 'EXISTS' : 'NULL');

    if (!token) {
        console.log('❌ [AuthService] No token found - returning null');
        return null;
    }

    try {
        console.log('📡 [AuthService] Calling /auth/me with token');
        const response = await api.get('/auth/me');

        if (response.data.success) {
            console.log('✅ [AuthService] User found:', response.data.user.name);
            return response.data.user;
        }

        console.log('❌ [AuthService] No user in response');
        return null;
    } catch (error) {
        console.error('❌ [AuthService] Get current user error:', error);
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
 * Get developer modules
 */
export const getDeveloperModules = async (): Promise<any> => {
    console.log('📦 [AuthService] Fetching developer modules');

    try {
        const response = await api.get('/developer/modules');
        console.log('✅ [AuthService] Developer modules fetched successfully');
        return response.data;
    } catch (error: any) {
        console.error('❌ [AuthService] Failed to fetch developer modules:', error.message);
        throw error;
    }
};

/**
 * Get API keys
 */
export const getApiKeys = async (): Promise<any> => {
    console.log('🔑 [AuthService] Fetching API keys');

    try {
        const response = await api.get('/developer/api-keys');
        console.log('✅ [AuthService] API keys fetched successfully');
        return response.data;
    } catch (error: any) {
        console.error('❌ [AuthService] Failed to fetch API keys:', error.message);
        throw error;
    }
};

/**
 * Get webhooks
 */
export const getWebhooks = async (): Promise<any> => {
    console.log('훅 [AuthService] Fetching webhooks');

    try {
        const response = await api.get('/developer/webhooks');
        console.log('✅ [AuthService] Webhooks fetched successfully');
        return response.data;
    } catch (error: any) {
        console.error('❌ [AuthService] Failed to fetch webhooks:', error.message);
        throw error;
    }
};

