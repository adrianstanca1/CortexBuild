/**
 * Supabase Server Client for API Routes
 * Use this in Vercel serverless functions
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️ Supabase credentials not configured for server-side');
}

// Create Supabase client with service role key for server-side operations
export const supabaseServer = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

/**
 * Verify if Supabase is properly configured
 */
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseServiceKey && supabaseServer);
};

/**
 * Get Supabase client (throws if not configured)
 */
export const getSupabaseClient = () => {
  if (!supabaseServer) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY');
  }
  return supabaseServer;
};

/**
 * Helper function to handle Supabase errors
 */
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);

  if (error.code === 'PGRST116') {
    return { status: 404, message: 'Resource not found' };
  }

  if (error.code === '23505') {
    return { status: 409, message: 'Resource already exists' };
  }

  if (error.code === '23503') {
    return { status: 400, message: 'Invalid reference' };
  }

  return { status: 500, message: 'Internal server error' };
};

export default supabaseServer;
