import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { cdnSupabasePlugin } from './vite-plugin-cdn-supabase';

export default defineConfig(async ({ mode }) => {
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
      plugins: [
        react(),
        ...(mode === 'analyze' ? [await (await import('vite-bundle-visualizer')).default({
          fileName: 'dist/report.html',
          openBrowser: false,
        })] : []),
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      build: {
        target: 'esnext',
        minify: 'esbuild',
        sourcemap: false,
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
              // React ecosystem - core runtime
              if (id.includes('node_modules/react') ||
                  id.includes('node_modules/react-dom') ||
                  id.includes('node_modules/react-router-dom') ||
                  id.includes('node_modules/scheduler')) {
                return 'react-vendor';
              }

              // React utilities
              if (id.includes('node_modules/react-markdown') ||
                  id.includes('node_modules/react-hot-toast')) {
                return 'react-utils';
              }

              // Large UI libraries - loaded on demand
              if (id.includes('node_modules/lucide-react')) {
                return 'ui-vendor';
              }

              if (id.includes('node_modules/@xyflow')) {
                return 'flow-vendor';
              }

              // AI and external services
              if (id.includes('node_modules/@google/generative-ai') ||
                  id.includes('node_modules/@google/genai') ||
                  id.includes('node_modules/openai')) {
                return 'ai-vendor';
              }

              if (id.includes('node_modules/@supabase')) {
                return 'supabase-vendor';
              }

              // Heavy development tools - lazy loaded
              if (id.includes('node_modules/@monaco-editor') ||
                  id.includes('node_modules/monaco-editor')) {
                return 'monaco-vendor';
              }

              if (id.includes('node_modules/jspdf')) {
                return 'pdf-vendor';
              }

              // HTTP and utilities
              if (id.includes('node_modules/axios')) {
                return 'http-vendor';
              }

              if (id.includes('node_modules/uuid') ||
                  id.includes('node_modules/date-fns')) {
                return 'utils-vendor';
              }

              // Admin and developer tools (loaded on demand)
              if (id.includes('components/screens/admin/') ||
                  id.includes('components/admin/') ||
                  id.includes('components/screens/developer/') ||
                  id.includes('components/sdk/')) {
                return 'admin-vendor';
              }

              // Module screens (loaded on demand)
              if (id.includes('components/screens/modules/') ||
                  id.includes('components/marketplace/')) {
                return 'modules-vendor';
              }

              // Base44 and heavy components (loaded on demand)
              if (id.includes('components/base44/') ||
                  id.includes('components/applications/')) {
                return 'base44-vendor';
              }

              // Other node_modules
              if (id.includes('node_modules')) {
                return 'vendor';
              }
            },
            // Optimize chunk file names for better caching
            chunkFileNames: (chunkInfo) => {
              const facadeModuleId = chunkInfo.facadeModuleId ?
                chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '') :
                'chunk';
              return `assets/[name]-[hash].js`;
            },
            assetFileNames: (assetInfo) => {
              const info = assetInfo.name!.split('.');
              const ext = info[info.length - 1];
              if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
                return `assets/images/[name]-[hash].${ext}`;
              }
              if (/css/i.test(ext)) {
                return `assets/styles/[name]-[hash].${ext}`;
              }
              return `assets/[name]-[hash].${ext}`;
            }
          }
        },
        // Enable tree shaking optimizations
        modulePreload: {
          polyfill: false
        },
        // Reduce CSS size
        cssMinify: 'esbuild',
        // Set reasonable chunk size warnings
        chunkSizeWarningLimit: 1000
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
