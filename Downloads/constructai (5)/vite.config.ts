import path from 'path';
import { defineConfig, loadEnv, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import type { UserConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const isDev = mode === 'development';
  const isProd = mode === 'production';

  const config: UserConfig = {
    // Server Configuration
    server: {
      port: 3000,
      host: '0.0.0.0',
      strictPort: false,
      open: false,
      cors: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
          ws: true, // WebSocket support
          rewrite: (path) => path,
        },
      },
      // HMR Configuration
      hmr: {
        overlay: true,
      },
      watch: {
        usePolling: false,
        interval: 100,
      },
    },

    // Preview Server (for production builds)
    preview: {
      port: 4173,
      host: '0.0.0.0',
      strictPort: false,
      open: false,
    },

    // Plugins
    plugins: [
      react({
        // Fast Refresh
        fastRefresh: true,
        // Babel configuration
        babel: {
          plugins: [
            // Add any Babel plugins here if needed
          ],
        },
        // JSX runtime
        jsxRuntime: 'automatic',
        // JSX import source
        jsxImportSource: undefined,
      }),
    ] as PluginOption[],

    // Define global constants
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.NODE_ENV': JSON.stringify(mode),
      __DEV__: isDev,
      __PROD__: isProd,
    },

    // Path Resolution
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        '@components': path.resolve(__dirname, './components'),
        '@lib': path.resolve(__dirname, './lib'),
        '@utils': path.resolve(__dirname, './utils'),
        '@hooks': path.resolve(__dirname, './hooks'),
        '@types': path.resolve(__dirname, './types'),
        '@styles': path.resolve(__dirname, './styles'),
        '@assets': path.resolve(__dirname, './assets'),
        '@server': path.resolve(__dirname, './server'),
        '@config': path.resolve(__dirname, './config'),
      },
      extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
    },

    // CSS Configuration
    css: {
      modules: {
        localsConvention: 'camelCaseOnly',
        scopeBehaviour: 'local',
        generateScopedName: isDev
          ? '[name]__[local]___[hash:base64:5]'
          : '[hash:base64:5]',
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`,
          api: 'modern-compiler',
        },
      },
      devSourcemap: isDev,
    },

    // Build Configuration
    build: {
      target: 'es2020',
      outDir: 'dist',
      assetsDir: 'assets',
      assetsInlineLimit: 4096,
      cssCodeSplit: true,
      cssMinify: true,
      sourcemap: false,
      minify: isProd ? 'esbuild' : false,

      // Rollup Options
      rollupOptions: {
        output: {
          // Simplified chunking
          manualChunks: isProd ? {
            'react-vendor': ['react', 'react-dom'],
          } : undefined,
          // Asset file names
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
        },
        // Increase chunkSizeWarningLimit to avoid warnings
        onwarn(warning, warn) {
          // Suppress certain warnings
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
          if (warning.code === 'SOURCEMAP_ERROR') return;
          warn(warning);
        },
      },

      // Chunk size warning
      chunkSizeWarningLimit: 2000,

      // Enable/disable compression
      reportCompressedSize: false,

      // Emit manifest
      manifest: false,

      // SSR Options
      ssr: false,
    },

    // Optimization
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'axios',
        '@supabase/supabase-js',
        'lucide-react',
      ],
      exclude: ['@google/genai'],
      esbuildOptions: {
        target: 'es2020',
      },
    },

    // Base public path
    base: '/',

    // Public directory
    publicDir: 'public',

    // Environment variables prefix
    envPrefix: ['VITE_', 'REACT_APP_'],

    // Log level
    logLevel: isDev ? 'info' : 'warn',

    // Clear screen
    clearScreen: true,

    // Worker options
    worker: {
      format: 'es',
      plugins: () => [],
    },

    // JSON options
    json: {
      namedExports: true,
      stringify: false,
    },

    // Esbuild options
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
      jsxInject: undefined,
      jsxFactory: undefined,
      jsxFragment: undefined,
    },
  };

  return config;
});
