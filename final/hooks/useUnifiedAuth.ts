// 🔐 Unified Authentication Hook
// Handles both Supabase auth and demo mode with robust error handling

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface DemoUser {
  id: string;
  email: string;
  name: string;
  role: string;
  company_id: string;
}

interface AuthState {
  user: User | DemoUser | null;
  loading: boolean;
  session: any;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  error: string | null;
}

export function useUnifiedAuth(): AuthState & {
  signOut: () => Promise<{ error: any }>;
  refreshAuth: () => Promise<void>;
} {
  const [user, setUser] = useState<User | DemoUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔐 Initializing unified auth hook...');
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check for demo session first
      const demoSession = localStorage.getItem('demo_session');
      const demoUser = localStorage.getItem('demo_user');
      
      if (demoSession === 'true' && demoUser) {
        console.log('📱 Demo session found');
        try {
          const parsedDemoUser = JSON.parse(demoUser);
          setUser(parsedDemoUser);
          setIsDemoMode(true);
          setLoading(false);
          return;
        } catch (error) {
          console.error('❌ Error parsing demo user:', error);
          localStorage.removeItem('demo_session');
          localStorage.removeItem('demo_user');
        }
      }
      
      // Get initial Supabase session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Error getting session:', sessionError);
        setError(sessionError.message);
        setLoading(false);
        return;
      }

      console.log('📱 Initial session:', session?.user?.email || 'No user');
      setSession(session);
      setUser(session?.user ?? null);
      setIsDemoMode(false);
      setLoading(false);

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('🔄 Auth state change:', event, session?.user?.email || 'No user');
          
          // Clear demo mode if real auth happens
          if (session) {
            localStorage.removeItem('demo_session');
            localStorage.removeItem('demo_user');
            setIsDemoMode(false);
            setError(null);
          }
          
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      );

      // Cleanup function
      return () => {
        console.log('🔌 Cleaning up auth subscription');
        subscription.unsubscribe();
      };
    } catch (error: any) {
      console.error('❌ Auth initialization failed:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const refreshAuth = async () => {
    console.log('🔄 Refreshing authentication...');
    await initializeAuth();
  };

  const signOut = async () => {
    try {
      if (isDemoMode) {
        // Clear demo session
        localStorage.removeItem('demo_session');
        localStorage.removeItem('demo_user');
        setUser(null);
        setIsDemoMode(false);
        setSession(null);
        setError(null);
        console.log('✅ Demo logout successful');
        return { error: null };
      } else {
        // Real Supabase sign out
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('❌ Sign out error:', error);
          setError(error.message);
        } else {
          console.log('✅ Sign out successful');
          setError(null);
        }
        return { error };
      }
    } catch (error: any) {
      console.error('❌ Sign out exception:', error);
      setError(error.message);
      return { error };
    }
  };

  const isAuthenticated = !!user;

  return {
    user,
    loading,
    session,
    isAuthenticated,
    isDemoMode,
    error,
    signOut,
    refreshAuth
  };
}
