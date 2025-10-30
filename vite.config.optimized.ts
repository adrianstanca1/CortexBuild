/**
 * Optimized Vite Configuration
 * Production-ready build configuration with code splitting and optimization
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { splitVendorChunkPlugin } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(),
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }) as any,
  ],

  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: true,

    // Optimization settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
    },

    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // UI libraries
          'ui-vendor': ['lucide-react', 'react-hot-toast'],

          // Editor components
          'editor-vendor': ['@monaco-editor/react'],

          // Flow diagrams
          'flow-vendor': ['@xyflow/react'],

          // Supabase
          'supabase-vendor': ['@supabase/supabase-js'],

          // AI services
          'ai-vendor': ['@google/generative-ai', 'openai'],

          // Database
          'db-vendor': ['better-sqlite3'],

          // Charts and analytics
          'charts-vendor': ['jspdf', 'jspdf-autotable'],

          // Core app components
          'app-core': [
            './components/layout/AppLayout',
            './components/layout/Sidebar',
            './components/ErrorBoundary',
          ],

          // Admin components
          'admin-modules': [
            './components/admin/UnifiedAdminDashboard',
            './components/admin/AdminControlPanel',
            './components/admin/EnhancedSuperAdminDashboard',
          ],

          // Base44 desktop
          'base44-desktop': [
            './components/base44/Base44Clone',
          ],

          // SDK and developer tools
          'sdk-modules': [
            './components/sdk/SDKDeveloperView',
            './components/sdk/ZapierStyleWorkflowBuilder',
            './components/sdk/WorkflowBuilder',
          ],

          // Marketplace
          'marketplace-modules': [
            './components/marketplace/GlobalMarketplace',
            './components/marketplace/MarketplaceManagement',
            './components/apps/Marketplace',
          ],
        },

        // Dynamic chunk naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').slice(-2).join('/') : 'chunk';
          return `assets/[name]-[hash].js`;
        },

        // Asset naming
        assetFileNames: 'assets/[name]-[hash].[ext]',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },

    // Chunk size warnings
    chunkSizeWarningLimit: 1000, // 1MB warning threshold
  },

  // Optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'lucide-react',
    ],
    exclude: ['@xyflow/react'],
  },

  // Server configuration
  server: {
    port: 3000,
    host: true,
    open: true,
  },

  // Preview configuration
  preview: {
    port: 3000,
    host: true,
  },

  // Define environment variables
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
});

