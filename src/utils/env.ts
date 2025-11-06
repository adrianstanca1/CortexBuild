/**
 * Environment utilities
 * Safe access to Vite environment variables that works in both runtime and test environments
 */

/**
 * Get environment variable value
 * Works safely in both Vite runtime and Jest test environments
 */
export function getEnv(key: string, defaultValue: string = ''): string {
  // In test environment, use process.env or global.import.meta
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  
  // In Vite runtime, use import.meta.env
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return (import.meta.env[key] as string) || defaultValue;
  }
  
  // Fallback to default
  return defaultValue;
}

/**
 * Check if running in development mode
 */
export function isDev(): boolean {
  if (typeof process !== 'undefined' && process.env.NODE_ENV) {
    return process.env.NODE_ENV === 'development';
  }
  
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.DEV === true || import.meta.env.MODE === 'development';
  }
  
  return false;
}

/**
 * Check if running in production mode
 */
export function isProd(): boolean {
  if (typeof process !== 'undefined' && process.env.NODE_ENV) {
    return process.env.NODE_ENV === 'production';
  }
  
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.PROD === true || import.meta.env.MODE === 'production';
  }
  
  return false;
}

