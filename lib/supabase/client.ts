/**
 * Supabase Client Configuration
 * Frontend client for Supabase database operations
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase environment variables not configured');
}

export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
        },
    })
    : null;

export const isSupabaseConfigured = () => !!supabase;

// Export types
export type { User, Session } from '@supabase/supabase-js';

