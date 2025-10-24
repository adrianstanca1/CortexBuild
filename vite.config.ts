import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { cdnSupabasePlugin } from './vite-plugin-cdn-supabase';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const apiUrl = env.VITE_API_URL || 'http://localhost:3001';

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        // Aggressive cache busting for development
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
        proxy: {
          '/api/': {
            target: apiUrl,
            changeOrigin: true,
            rewrite: (path) => path
          }
        },
        // Force HMR to always reload
        hmr: {
          overlay: true,
        },
        // Watch for changes aggressively
        watch: {
          usePolling: true,
          interval: 100,
        }
      },
      plugins: [react(), cdnSupabasePlugin()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      build: {
        // Increase chunk size warning limit to reduce noise
        chunkSizeWarningLimit: 600,
        // Optimize minification
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
          mangle: true,
        },
        rollupOptions: {
          external: [
            '@supabase/supabase-js',
            '@supabase/postgrest-js',
            '@supabase/realtime-js',
            '@supabase/storage-js'
          ],
          output: {
            // Optimize chunk naming for better caching
            chunkFileNames: 'assets/[name]-[hash].js',
            entryFileNames: 'assets/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash][extname]',
            manualChunks(id) {
              // ===== VENDOR CHUNKS =====
              // React core - critical path
              if (id.includes('node_modules/react-dom') || id.includes('node_modules/react') || id.includes('node_modules/scheduler')) {
                return 'react-core';
              }

              // ===== HEAVY LIBRARIES =====
              // PDF tools - large, rarely used
              if (id.includes('node_modules/jspdf') || id.includes('node_modules/jspdf-autotable')) {
                return 'pdf-tools';
              }

              // Monaco editor - large, lazy loaded
              if (id.includes('node_modules/@monaco-editor')) {
                return 'monaco';
              }

              // ===== FEATURE CHUNKS =====
              // Developer tools - separate for lazy loading
              if (id.includes('components/sdk/') || id.includes('components/screens/developer/')) {
                return 'developer-tools';
              }

              // Marketplace - separate for lazy loading
              if (id.includes('components/marketplace/')) {
                return 'marketplace';
              }

              // Module screens - separate for lazy loading
              if (id.includes('components/screens/modules/')) {
                return 'module-screens';
              }

              // Admin components - separate for lazy loading
              if (id.includes('components/admin/') && !id.includes('components/screens/admin/')) {
                return 'admin-tools';
              }

              // Base44 - large legacy component
              if (id.includes('components/base44/')) {
                return 'base44';
              }

              // ===== UI & UTILITIES =====
              // Icon pack - can be lazy loaded
              if (id.includes('node_modules/lucide-react')) {
                return 'icon-pack';
              }

              // Supabase - can be lazy loaded
              if (id.includes('node_modules/@supabase')) {
                return 'supabase';
              }

              // Workflow tools
              if (id.includes('node_modules/@xyflow')) {
                return 'workflow';
              }

              // HTTP client
              if (id.includes('node_modules/axios')) {
                return 'axios';
              }

              // Google AI
              if (id.includes('node_modules/@google')) {
                return 'google-ai';
              }

              // All other node_modules
              if (id.includes('node_modules')) {
                return 'vendor';
              }
            }
          }
        }
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          // Force Supabase to use CDN from importmap
          '@supabase/supabase-js': '@supabase/supabase-js',
        },
        // Ensure proper module resolution
        extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
        // Don't add extensions to imports
        preserveSymlinks: false
      },
      esbuild: {
        // Keep import paths as-is without adding extensions
        keepNames: true
      },
      // Optimize dependencies
      optimizeDeps: {
        include: [
          'react',
          'react-dom',
          'axios',
          'uuid',
          '@google/genai',
          'react-markdown',
          'react-hot-toast',
          '@monaco-editor/react',
          'lucide-react',
          'react-router-dom'
        ],
        // Exclude ALL Supabase packages - use CDN version from importmap instead
        exclude: [
          '@supabase/supabase-js',
          '@supabase/postgrest-js',
          '@supabase/realtime-js',
          '@supabase/storage-js',
          '@supabase/functions-js',
          '@supabase/gotrue-js'
        ]
      },
      // Clear cache on startup
      cacheDir: 'node_modules/.vite'
    };
});
