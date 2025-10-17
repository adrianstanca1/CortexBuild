// API Module Exports
// Central export point for all API modules

// Export mock API for development
export * from './mockApi';

// Export chat API
export * from './chat';

// Export platform admin API
export * from './platformAdmin';

// Re-export specific functions for convenience
export { mockApi } from './mockApi';
