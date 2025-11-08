// Stub Supabase client - NO actual Supabase loaded in frontend
// All auth goes through backend API

// Export a fake supabase client that does nothing
export const supabase = null;

export const isSupabaseConfigured = () => false;

// Mock types
export type User = any;
export type Session = any;
