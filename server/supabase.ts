/**
 * Supabase Client for Backend
 * 
 * This module provides a Supabase client configured for server-side use
 * with the service role key for full database access.
 */

import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://zpbuvuxpfemldsknerew.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'sb_publishable_LJlZdJB0JylgynMF8MCtQw_m0sKjIK3';

if (!supabaseUrl) {
  console.error('❌ Missing Supabase URL!');
  console.error('Required environment variables:');
  console.error('  - REACT_APP_SUPABASE_URL or VITE_SUPABASE_URL');
  throw new Error('Supabase URL not configured');
}

// Create Supabase client with service role key
// This bypasses Row Level Security (RLS) and has full database access
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  db: {
    schema: 'public',
  },
});

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseServiceKey);
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

// Export types
export type { User, Session } from '@supabase/supabase-js';

console.log('✅ Supabase client initialized');
console.log(`📊 Project: ${supabaseUrl}`);

