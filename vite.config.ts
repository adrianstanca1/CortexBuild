import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
/// <reference types="vitest" />

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const apiUrl = env.VITE_API_URL || 'http://localhost:3001';

    return {
      server: {
        port: 3002,
        host: '0.0.0.0',
        // Optimized cache headers for development
        headers: mode === 'development' ? {
          'Cache-Control': 'no-cache',
        } : {},
        // Enable proxy for API calls
        proxy: {
          '/api': {
            target: apiUrl,
            changeOrigin: true,
            secure: false,
          }
        },
        // Optimized HMR
        hmr: {
          overlay: true,
          port: 24678, // Use a specific port for HMR
        },
        // Optimized file watching
        watch: {
          usePolling: false, // Use native file watching for better performance
          ignored: ['**/node_modules/**', '**/dist/**'],
        }
      },
      preview: {
        port: 4173,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: 'http://localhost:3001',
            changeOrigin: true,
            secure: false,
            configure: (proxy, options) => {
              proxy.on('error', (err, req, res) => {
                console.log('Proxy error:', err);
              });
              proxy.on('proxyReq', (proxyReq, req, res) => {
                console.log('Sending Request to the Target:', req.method, req.url);
              });
              proxy.on('proxyRes', (proxyRes, req, res) => {
                console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
              });
            },
          }
        }
      },
      plugins: [
        react({
          // Include TypeScript React files
          include: "**/*.{jsx,tsx}",
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      build: {
        // Optimize build performance
        target: 'esnext',
        minify: 'esbuild',
        sourcemap: mode === 'development',
        // Increase chunk size warning limit
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
          output: {
            // Optimize chunk naming for better caching
            chunkFileNames: 'assets/[name]-[hash].js',
            entryFileNames: 'assets/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash].[ext]',
            manualChunks(id) {
              // Core React libraries
              if (id.includes('node_modules/react-dom') || id.includes('node_modules/react') || id.includes('node_modules/scheduler')) {
                return 'react-core';
              }
              // Large editor components
              if (id.includes('node_modules/@monaco-editor')) {
                return 'monaco';
              }
              // PDF generation tools
              if (id.includes('node_modules/jspdf') || id.includes('node_modules/jspdf-autotable')) {
                return 'pdf-tools';
              }
              // Icon libraries
              if (id.includes('node_modules/lucide-react')) {
                return 'icon-pack';
              }
              // Database and API
              if (id.includes('node_modules/@supabase')) {
                return 'supabase';
              }
              if (id.includes('node_modules/axios')) {
                return 'axios';
              }
              // AI and workflow tools
              if (id.includes('node_modules/@google')) {
                return 'google-ai';
              }
              if (id.includes('node_modules/@xyflow')) {
                return 'workflow';
              }
              // Application components (keep together for better performance)
              if (id.includes('components/sdk/')) {
                return 'sdk-tools';
              }
              if (id.includes('components/marketplace/')) {
                return 'marketplace';
              }
              if (id.includes('components/screens/modules/')) {
                return 'module-screens';
              }
              // All other vendor libraries
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
        },
        // Ensure proper module resolution
        extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']
      },
      // Optimize dependencies
      optimizeDeps: {
        include: [
          'react',
          'react-dom',
          '@supabase/supabase-js',
          'axios',
          'uuid',
          '@google/genai',
          'react-markdown',
          'lucide-react',
          'react-router-dom'
        ],
        // Only force re-optimization in development when needed
        force: mode === 'development' ? false : true,
        // Exclude large dependencies that should be loaded on demand
        exclude: ['@monaco-editor/react']
      },
      // Optimized cache directory
      cacheDir: 'node_modules/.vite',
      // Test configuration
      test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./tests/setup.ts'],
      }
    };
});
