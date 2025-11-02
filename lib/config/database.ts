/**
 * Database Configuration
 * Centralized configuration for database selection and settings
 */

export type DatabaseMode = 'sqlite' | 'supabase';

export interface DatabaseEnvironmentConfig {
  mode: DatabaseMode;
  supabase: {
    url: string;
    anonKey: string;
    serviceKey?: string;
  };
  sqlite: {
    path: string;
  };
}

/**
 * Get database mode from environment variables
 */
export function getDatabaseMode(): DatabaseMode {
  const mode = import.meta.env.VITE_DATABASE_MODE;

  // Default to Supabase for browser environment
  if (mode === 'sqlite' || mode === 'supabase') {
    return mode;
  }

  // Check localStorage for user preference
  const storedMode = localStorage.getItem('cortexbuild_db_mode');
  if (storedMode === 'sqlite' || storedMode === 'supabase') {
    return storedMode;
  }

  return 'supabase'; // Default
}

/**
 * Get database configuration from environment
 */
export function getDatabaseConfig(): DatabaseEnvironmentConfig {
  return {
    mode: getDatabaseMode(),
    supabase: {
      url: import.meta.env.VITE_SUPABASE_URL || '',
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '',
      serviceKey: import.meta.env.SUPABASE_SERVICE_KEY,
    },
    sqlite: {
      path: './cortexbuild.db',
    },
  };
}

/**
 * Check if feature flags are enabled
 */
export const featureFlags = {
  desktopMode: import.meta.env.VITE_ENABLE_DESKTOP_MODE !== 'false',
  aiFeatures: import.meta.env.VITE_ENABLE_AI_FEATURES !== 'false',
  workflows: import.meta.env.VITE_ENABLE_WORKFLOWS !== 'false',
  marketplace: import.meta.env.VITE_ENABLE_MARKETPLACE !== 'false',
  realtime: import.meta.env.VITE_ENABLE_REALTIME !== 'false',
};


