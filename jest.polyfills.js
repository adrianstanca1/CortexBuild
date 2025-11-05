// Polyfills for Jest environment with real Supabase connectivity
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock import.meta with test environment variables
global.import = {
  meta: {
    env: {
      VITE_API_URL: 'http://localhost:3001/api',
      VITE_SUPABASE_URL: 'https://zpbuvuxpfemldsknerew.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwYnV2dXhwZmVtbGRza25lcmV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMTQzMTcsImV4cCI6MjA3MTY5MDMxN30.4wb8_qMaJ0hpkLEv51EWh0pRtVXD3GWWOsuCmZsOx6A',
      VITE_GEMINI_API_KEY: 'AIzaSyC4BTpQS0_ZdZsOl0c3beb344hr3xZEVy8',
      DEV: false,
      PROD: false,
      VITE_ENVIRONMENT: 'test',
      VITE_ENABLE_AI_AGENTS: 'true',
      VITE_ENABLE_REAL_TIME: 'true'
    }
  }
};
