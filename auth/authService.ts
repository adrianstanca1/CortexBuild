/**
 * Authentication Service - Clean Rebuild
 * Uses Supabase RPC functions with SHA-256 password hashing
 */

import { User } from '../types';

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
 */
export const login = async (email: string, password: string): Promise<User> => {
    console.log('🔐 [AuthService] Login attempt:', email);

    try {
        // Import supabase client
        const { supabase } = await import('../lib/supabase/client');

        if (!supabase) {
            throw new Error('Database connection not configured');
        }

        // Hash password
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
            error: error?.message,
            data: authResult
        });

        if (error) {
            console.error('❌ [AuthService] Database error:', error);
            throw new Error('Invalid email or password');
        }

        if (!authResult) {
            throw new Error('Invalid email or password');
        }

        // Transform JSONB result to User type
        const user: User = {
            id: authResult.id,
            email: authResult.email,
            name: authResult.name,
            role: authResult.role,
            companyId: authResult.companyId,
            status: authResult.status || 'active',
            createdAt: authResult.createdAt
        };

        console.log('✅ [AuthService] Login successful:', user);

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

        // Hash password
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
            error: error?.message,
            data: regResult
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

        // Transform JSONB result to User type
        const user: User = {
            id: regResult.id,
            email: regResult.email,
            name: regResult.name,
            role: regResult.role,
            companyId: regResult.companyId,
            status: regResult.status || 'active',
            createdAt: regResult.createdAt
        };

        console.log('✅ [AuthService] Registration successful:', user);

        // Auto-login after registration
        localStorage.setItem('constructai_user', JSON.stringify(user));

        return user;
    } catch (error: any) {
        console.error('❌ [AuthService] Registration failed:', error.message);
        throw new Error(error.message || 'Registration failed');
    }
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
    console.log('👋 [AuthService] Logout');
    localStorage.removeItem('constructai_user');
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = (): User | null => {
    try {
        const userStr = localStorage.getItem('constructai_user');
        if (!userStr) return null;
        return JSON.parse(userStr);
    } catch (error) {
        console.error('❌ [AuthService] Failed to get current user:', error);
        return null;
    }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
    return getCurrentUser() !== null;
};

