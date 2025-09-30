/**
 * Environment Configuration
 * Centralized environment variable access
 */

export const environment = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  
  // Authentication
  auth0Domain: import.meta.env.VITE_AUTH0_DOMAIN || '',
  auth0ClientId: import.meta.env.VITE_AUTH0_CLIENT_ID || '',
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  githubClientId: import.meta.env.VITE_GITHUB_CLIENT_ID || '',
  
  // Database
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  
  // AI Services
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  
  // Feature Flags
  enableAI: import.meta.env.VITE_ENABLE_AI === 'true',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableNotifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
  
  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
  
  // App Info
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  appName: 'ASAgents Ultimate',
};

export default environment;
