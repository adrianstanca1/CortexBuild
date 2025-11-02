import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Ultra-simple Vite config for testing
export default defineConfig({
  plugins: [react()],
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
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  optimizeDeps: {
    exclude: [
      'react-markdown', 
      'react-hot-toast', 
      '@monaco-editor/react', 
      'jspdf', 
      'jspdf-autotable', 
      'web-vitals'
    ]
  }
})
