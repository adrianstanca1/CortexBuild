import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const isProduction = mode === 'production';
  
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 365 days
                },
              },
            },
            {
              urlPattern: /\/api\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60, // 1 hour
                },
              },
            },
          ],
        },
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'ASAgents Construction Management',
          short_name: 'ASAgents',
          description: 'Enterprise Construction Management Platform',
          theme_color: '#1e40af',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: 'android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'android-chrome-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
      }),
      ...(process.env.ANALYZE_BUNDLE ? [visualizer({ open: true, filename: 'dist/stats.html' })] : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@/components': path.resolve(__dirname, './components'),
        '@/services': path.resolve(__dirname, './services'),
        '@/contexts': path.resolve(__dirname, './contexts'),
        '@/hooks': path.resolve(__dirname, './hooks'),
        '@/utils': path.resolve(__dirname, './utils'),
        '@/types': path.resolve(__dirname, './types'),
      },
    },
    server: {
      port: parseInt(env.VITE_PORT) || 5173,
      host: true,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:4000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      port: parseInt(env.VITE_PREVIEW_PORT) || 4173,
      host: true,
    },
    build: {
      target: 'esnext',
      minify: isProduction ? 'terser' : false,
      sourcemap: !isProduction,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['lucide-react'],
            maps: ['leaflet', 'react-leaflet', 'use-supercluster'],
            charts: ['recharts'],
          },
        },
      },
      terserOptions: isProduction ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      } : {},
    },
    define: {
      'process.env': {
        NODE_ENV: JSON.stringify(mode),
        VITE_API_BASE_URL: JSON.stringify(env.VITE_API_BASE_URL || 'http://localhost:4000'),
        VITE_SUPABASE_URL: JSON.stringify(env.VITE_SUPABASE_URL || ''),
        VITE_SUPABASE_ANON_KEY: JSON.stringify(env.VITE_SUPABASE_ANON_KEY || ''),
        VITE_GEMINI_API_KEY: JSON.stringify(env.VITE_GEMINI_API_KEY || ''),
        VITE_AUTH0_DOMAIN: JSON.stringify(env.VITE_AUTH0_DOMAIN || ''),
        VITE_AUTH0_CLIENT_ID: JSON.stringify(env.VITE_AUTH0_CLIENT_ID || ''),
        VITE_GITHUB_CLIENT_ID: JSON.stringify(env.VITE_GITHUB_CLIENT_ID || ''),
        VITE_GOOGLE_CLIENT_ID: JSON.stringify(env.VITE_GOOGLE_CLIENT_ID || ''),
      },
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-leaflet',
        'leaflet',
        'lucide-react',
        'recharts',
        'date-fns',
        '@supabase/supabase-js',
        'use-supercluster',
      ],
    },
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './vitest.setup.ts',
      css: true,
    },
  };
});