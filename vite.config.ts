import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: 'http://localhost:3001',
            changeOrigin: true,
          }
        }
      },
      plugins: [
        react(),
        mode === 'analyze' && (await import('vite-bundle-visualizer')).default({
          fileName: 'dist/report.html',
          openBrowser: false,
        }),
      ].filter(Boolean),
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      build: {
        target: 'esnext',
        minify: 'esbuild',
        sourcemap: false,
        rollupOptions: {
          output: {
            manualChunks: {
              // React ecosystem - core runtime
              'react-vendor': ['react', 'react-dom', 'react-router-dom'],
              'react-utils': ['react-markdown', 'react-hot-toast'],

              // Large UI libraries - loaded on demand
              'ui-vendor': ['lucide-react'],
              'flow-vendor': ['@xyflow/react'],

              // AI and external services
              'ai-vendor': ['@google/generative-ai', '@google/genai', 'openai'],
              'supabase-vendor': ['@supabase/supabase-js'],

              // Heavy development tools - lazy loaded
              'monaco-vendor': ['@monaco-editor/react'],
              'pdf-vendor': ['jspdf', 'jspdf-autotable'],

              // HTTP and utilities
              'http-vendor': ['axios'],
              'utils-vendor': ['uuid', 'date-fns'],

              // Admin and developer tools (loaded on demand)
              'admin-vendor': [
                'components/screens/admin/',
                'components/admin/',
                'components/screens/developer/',
                'components/sdk/'
              ],

              // Module screens (loaded on demand)
              'modules-vendor': [
                'components/screens/modules/',
                'components/marketplace/'
              ],

              // Base44 and heavy components (loaded on demand)
              'base44-vendor': [
                'components/base44/',
                'components/applications/'
              ]
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
        }
      }
    };
});
