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
 * Hash password using SHA-256
 */
const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Login with email and password
 * Uses Supabase RPC function that bypasses RLS
 */
export const login = async (email: string, password: string): Promise<User> => {
    console.log('🔐 [AuthService] Login attempt:', email);

    try {
        // Import supabase client
        const { supabase } = await import('../lib/supabase/client');

        if (!supabase) {
            console.error('❌ [AuthService] Supabase client not configured');
            throw new Error('Database connection not configured');
        }

        // Hash password with SHA-256
        const hashedPassword = await hashPassword(password);
        console.log('🔐 [AuthService] Password hashed');

        // Call authentication function
        const { data: authResult, error } = await supabase
            .rpc('authenticate_user', {
                p_email: email.toLowerCase(),
                p_password_hash: hashedPassword
            });

        console.log('📊 [AuthService] Auth result:', {
            success: !!authResult,
            error: error?.message
        });

        if (error) {
            console.error('❌ [AuthService] Database error:', error);
            throw new Error('Invalid email or password');
        }

        if (!authResult) {
            throw new Error('Invalid email or password');
        }

        // authResult is a JSONB object
        const user: User = {
            id: authResult.id,
            email: authResult.email,
            name: authResult.name,
            role: authResult.role,
            companyId: authResult.companyId,
            status: authResult.status || 'active',
            createdAt: authResult.createdAt
        };

        console.log('✅ [AuthService] Login successful:', user.name);

        // Store user in localStorage
        localStorage.setItem('constructai_user', JSON.stringify(user));

        return user;
    } catch (error: any) {
        console.error('❌ [AuthService] Login failed:', error.message);
        throw new Error(error.message || 'Login failed');
    }
};

/**
 * Register new user
 * Uses Supabase RPC function that bypasses RLS
 */
export const register = async (
    email: string,
    password: string,
    name: string,
    companyId: string,
    role: string = 'operative'
): Promise<User> => {
    console.log('📝 [AuthService] Register attempt:', email);

    try {
        // Import supabase client
        const { supabase } = await import('../lib/supabase/client');

        if (!supabase) {
            throw new Error('Database connection not configured');
        }

        // Hash password with SHA-256
        const hashedPassword = await hashPassword(password);
        console.log('🔐 [AuthService] Password hashed for registration');

        // Call registration function
        const { data: regResult, error } = await supabase
            .rpc('register_user', {
                p_email: email.toLowerCase(),
                p_password_hash: hashedPassword,
                p_name: name,
                p_company_id: companyId,
                p_role: role
            });

        console.log('📊 [AuthService] Registration result:', {
            success: !!regResult,
            error: error?.message
        });

        if (error) {
            console.error('❌ [AuthService] Registration failed:', error);
            if (error.message.includes('already exists')) {
                throw new Error('Email already exists');
            }
            throw new Error(error.message);
        }

        if (!regResult) {
            throw new Error('Registration failed');
        }

        // regResult is a JSONB object
        const user: User = {
            id: regResult.id,
            email: regResult.email,
            name: regResult.name,
            role: regResult.role,
            companyId: regResult.companyId,
            status: regResult.status || 'active',
            createdAt: regResult.createdAt
        };

        console.log('✅ [AuthService] Registration successful:', user.name);

        // Auto-login after registration
        localStorage.setItem('constructai_user', JSON.stringify(user));

        return user;
    } catch (error: any) {
        console.error('❌ [AuthService] Registration failed:', error.message);
        throw new Error(error.message || 'Registration failed');
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
 * Get current user profile from localStorage
 */
export const getCurrentUser = async (): Promise<User | null> => {
    console.log('🔍 [AuthService] getCurrentUser - Checking stored user');

    const storedUser = localStorage.getItem('constructai_user');

    if (!storedUser) {
        console.log('ℹ️ [AuthService] No user found - user not logged in');
        return null;
    }

    try {
        const user: User = JSON.parse(storedUser);
        console.log('✅ [AuthService] User found:', user.name);
        return user;
    } catch (error: any) {
        console.error('❌ [AuthService] Error parsing stored user:', error.message);
        localStorage.removeItem('constructai_user');
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

/**
 * Get health status
 */
export const getHealthStatus = async (): Promise<any> => {
    console.log('🏥 [AuthService] Fetching health status');

    try {
        const response = await api.get('/health');
        console.log('✅ [AuthService] Health status fetched successfully');
        return response.data;
    } catch (error: any) {
        console.error('❌ [AuthService] Failed to fetch health status:', error.message);
        return {
            status: 'error',
            message: error.message,
            timestamp: new Date().toISOString()
        };
    }
};

