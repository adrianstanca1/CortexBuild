import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(async ({ mode }) => {
    const env = loadEnv(mode, '../..', '');
    return {
      root: '.',
      publicDir: 'public',
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
        outDir: 'dist',
        rollupOptions: {
          output: {
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
          '@': path.resolve(__dirname, 'src'),
          '@shared-types': path.resolve(__dirname, '../../packages/shared-types'),
          '@shared-utils': path.resolve(__dirname, '../../packages/shared-utils'),
        }
      }
    };
});
