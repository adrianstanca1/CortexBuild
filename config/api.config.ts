/**
 * API Configuration
 * Centralized API URL configuration for frontend
 */

export const API_CONFIG = {
  // Get API base URL from environment or use default
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  
  // API endpoints prefix
  apiPrefix: '/api',
  
  // Full API URL
  get apiURL() {
    return `${this.baseURL}${this.apiPrefix}`;
  },
  
  // WebSocket URL
  get wsURL() {
    const wsProtocol = this.baseURL.startsWith('https') ? 'wss' : 'ws';
    const wsHost = this.baseURL.replace(/^https?:\/\//, '');
    return `${wsProtocol}://${wsHost}/ws`;
  },
  
  // Check if running in production
  isProduction: import.meta.env.PROD,
  
  // Check if running in development
  isDevelopment: import.meta.env.DEV,
};

// Export convenience functions
export const getAPIUrl = (endpoint: string = '') => {
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_CONFIG.apiURL}${path}`;
};

export const getWSUrl = (path: string = '') => {
  const wsPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_CONFIG.wsURL}${wsPath}`;
};

export default API_CONFIG;

