/**
 * Supabase Client for Frontend
 *
 * This module provides a Supabase client configured for client-side use
 * with the publishable key for secure frontend access.
 */

import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables (Next.js or Vite)
const nextPublicUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL as string) || '';
const nextPublicAnon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string) || '';
// Fallback to Vite env if running under Vite
 
const viteEnv: any = (typeof import.meta !== 'undefined' && (import.meta as any).env) ? (import.meta as any).env : {};
const viteUrl = (viteEnv.VITE_SUPABASE_URL as string) || '';
const viteAnon = (viteEnv.VITE_SUPABASE_ANON_KEY as string) || (viteEnv.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY as string) || '';

const supabaseUrl = nextPublicUrl || viteUrl;
const supabasePublishableKey = nextPublicAnon || viteAnon;

if (!supabaseUrl) {
  console.error('❌ Missing Supabase URL!');
  console.error('Required environment variables:');
  console.error('  - VITE_SUPABASE_URL');
  throw new Error('Supabase URL not configured');
}

if (!supabasePublishableKey) {
  console.error('❌ Missing Supabase Publishable Key!');
  console.error('Required environment variables:');
  console.error('  - VITE_SUPABASE_ANON_KEY (or REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY)');
  throw new Error('Supabase Publishable Key not configured');
}

// Create Supabase client with publishable key
// This respects Row Level Security (RLS) policies
export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Expose to global scope to prevent multiple instances
if (typeof window !== 'undefined') {
  (window as any).reactSupabaseClient = supabase;
}

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabasePublishableKey);
};

// Helper function to verify connection
export const verifyConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Supabase connection error:', error);
      return false;
    }

    console.log('✅ Supabase connected successfully');
    return true;
  } catch (err) {
    console.error('❌ Supabase connection failed:', err);
    return false;
  }
};

// Helper function to get current user
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    return user;
  } catch (err) {
    console.error('Error getting current user:', err);
    return null;
  }
};

// Helper function to get current session
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting current session:', error);
      return null;
    }
    return session;
  } catch (err) {
    console.error('Error getting current session:', err);
    return null;
  }
};

// Export types
export type { User, Session } from '@supabase/supabase-js';

console.log('✅ Supabase client initialized');
console.log(`📊 Project: ${supabaseUrl}`);

