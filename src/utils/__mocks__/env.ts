/**
 * Mock for environment utilities
 * Used in Jest tests to avoid import.meta parsing errors
 */

export function getEnv(key: string, defaultValue: string = ''): string {
  // In test environment, use process.env
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  
  // Check global.import.meta (set in jest.setup.cjs)
  if (typeof global !== 'undefined' && (global as any).import?.meta?.env?.[key]) {
    return (global as any).import.meta.env[key];
  }
  
  return defaultValue;
}

export function isDev(): boolean {
  if (typeof process !== 'undefined' && process.env.NODE_ENV) {
    return process.env.NODE_ENV === 'development';
  }
  
  if (typeof global !== 'undefined' && (global as any).import?.meta?.env) {
    return (global as any).import.meta.env.DEV === true || (global as any).import.meta.env.MODE === 'development';
  }
  
  return false;
}

export function isProd(): boolean {
  if (typeof process !== 'undefined' && process.env.NODE_ENV) {
    return process.env.NODE_ENV === 'production';
  }
  
  if (typeof global !== 'undefined' && (global as any).import?.meta?.env) {
    return (global as any).import.meta.env.PROD === true || (global as any).import.meta.env.MODE === 'production';
  }
  
  return false;
}

