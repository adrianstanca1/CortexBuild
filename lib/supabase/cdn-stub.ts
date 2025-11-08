// Supabase CDN Stub - loads from CDN instead of node_modules
// This prevents Vite from bundling the CJS version

// @ts-ignore - loaded from CDN via importmap in index.html
export * from '@supabase/supabase-js';
// @ts-ignore
export { createClient } from '@supabase/supabase-js';
