import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Optimized Vite config for production-ready builds
export default defineConfig({
  plugins: [react()],
  
  // Path resolution for cleaner imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@components': path.resolve(__dirname, './components'),
      '@hooks': path.resolve(__dirname, './hooks'),
      '@utils': path.resolve(__dirname, './utils'),
      '@types': path.resolve(__dirname, './types.ts'),
    }
  },
  
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  
  // Optimized build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 600, // Increase warning limit slightly
    
    // Exclude Node.js-only modules from browser bundle
    rollupOptions: {
      external: [
        'better-sqlite3',
        'sqlite3',
        'fs',
        'path',
        'util',
      ],
      
      output: {
        // Manual chunk splitting for optimal loading
        manualChunks: (id) => {
          // Vendor chunks for npm packages
          if (id.includes('node_modules')) {
            // Core React
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            
            // Router
            if (id.includes('react-router-dom')) {
              return 'router-vendor';
            }
            
            // UI libraries
            if (id.includes('lucide-react') || id.includes('framer-motion') || id.includes('react-hot-toast')) {
              return 'ui-vendor';
            }
            
            // Supabase
            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }
            
            // Visualization libraries
            if (id.includes('html2canvas') || id.includes('jspdf')) {
              return 'chart-vendor';
            }
            
            // Monaco editor
            if (id.includes('monaco-editor')) {
              return 'monaco-vendor';
            }
            
            // Query library
            if (id.includes('@tanstack/react-query')) {
              return 'query-vendor';
            }
            
            // Flow library
            if (id.includes('@xyflow')) {
              return 'flow-vendor';
            }
            
            // Other large vendors
            return 'vendor';
          }
          
          // Application chunks by feature
          if (id.includes('/components/admin/')) {
            return 'admin-features';
          }
          
          if (id.includes('/components/screens/developer/')) {
            return 'developer-features';
          }
          
          if (id.includes('/components/base44/')) {
            return 'base44-app';
          }
          
          if (id.includes('/components/sdk/')) {
            return 'sdk-features';
          }
          
          if (id.includes('/components/screens/company/')) {
            return 'company-features';
          }
          
          if (id.includes('/components/marketplace/')) {
            return 'marketplace-features';
          }
        },
        
        // Optimize chunk file names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      }
    },
    
    // Minification settings (using esbuild - faster than terser)
    minify: 'esbuild',
    target: 'esnext',
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'lucide-react',
      'framer-motion',
    ],
    exclude: [
      'better-sqlite3',
      'sqlite3',
    ]
  },
})
