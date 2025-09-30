/**
 * Deployment configuration for the Construction Management App
 */

export const deployConfig = {
  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          leaflet: ['leaflet', 'react-leaflet'],
          genai: ['@google/genai'],
          dateFns: ['date-fns'],
        },
      },
    },
    chunkSizeWarningLimit: 1100,
  },

  // Environment variables for different deployment targets
  environments: {
    development: {
      API_BASE_URL: 'http://localhost:3000/api',
      WEBSOCKET_URL: 'ws://localhost:3000/ws',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
      VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY || '',
      ANALYTICS_ENABLED: false,
      DEBUG_MODE: true,
    },
    
    staging: {
      API_BASE_URL: 'https://staging-api.constructapp.com/api',
      WEBSOCKET_URL: 'wss://staging-api.constructapp.com/ws',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
      VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY || '',
      ANALYTICS_ENABLED: true,
      DEBUG_MODE: false,
    },
    
    production: {
      API_BASE_URL: 'https://api.constructapp.com/api',
      WEBSOCKET_URL: 'wss://api.constructapp.com/ws',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
      VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY || '',
      ANALYTICS_ENABLED: true,
      DEBUG_MODE: false,
    },
  },

  // CDN and static asset configuration
  assets: {
    publicPath: '/',
    cdnUrl: process.env.CDN_URL || '',
    compression: {
      gzip: true,
      brotli: true,
    },
    caching: {
      staticAssets: '1y', // 1 year for static assets
      htmlFiles: '1h',    // 1 hour for HTML files
      apiResponses: '5m', // 5 minutes for API responses
    },
  },

  // Security headers
  security: {
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://esm.sh https://aistudiocdn.com",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self' wss: https:",
        "worker-src 'self'",
        "manifest-src 'self'",
      ].join('; '),
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
    },
  },

  // Performance optimization
  performance: {
    preload: [
      '/index.css',
      '/favicon.ico',
    ],
    prefetch: [
      '/manifest.json',
    ],
    lazyLoad: {
      images: true,
      components: true,
      routes: true,
    },
    bundleAnalysis: {
      enabled: process.env.ANALYZE_BUNDLE === 'true',
      outputDir: 'bundle-analysis',
    },
  },

  // PWA configuration
  pwa: {
    enabled: true,
    workbox: {
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/esm\.sh\//,
          handler: 'CacheFirst',
          options: {
            cacheName: 'esm-modules',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
            },
          },
        },
        {
          urlPattern: /^https:\/\/aistudiocdn\.com\//,
          handler: 'CacheFirst',
          options: {
            cacheName: 'ai-studio-modules',
            expiration: {
              maxEntries: 20,
              maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
            },
          },
        },
        {
          urlPattern: /\/api\//,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 5 * 60, // 5 minutes
            },
          },
        },
      ],
    },
  },

  // Monitoring and analytics
  monitoring: {
    errorTracking: {
      enabled: true,
      sampleRate: 1.0,
    },
    performance: {
      enabled: true,
      sampleRate: 0.1, // 10% sampling
    },
    analytics: {
      enabled: true,
      trackingId: process.env.ANALYTICS_TRACKING_ID || '',
    },
  },

  // Deployment targets
  targets: {
    vercel: {
      framework: 'vite',
      buildCommand: 'npm run build',
      outputDirectory: 'dist',
      installCommand: 'npm ci',
      devCommand: 'npm run dev',
      functions: {
        'api/**/*.js': {
          runtime: 'nodejs18.x',
        },
      },
      headers: [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Frame-Options',
              value: 'DENY',
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
          ],
        },
      ],
      rewrites: [
        {
          source: '/api/(.*)',
          destination: '/api/$1',
        },
      ],
    },

    netlify: {
      build: {
        command: 'npm run build',
        publish: 'dist',
      },
      redirects: [
        {
          from: '/api/*',
          to: '/.netlify/functions/:splat',
          status: 200,
        },
        {
          from: '/*',
          to: '/index.html',
          status: 200,
        },
      ],
      headers: [
        {
          for: '/*',
          values: {
            'X-Frame-Options': 'DENY',
            'X-Content-Type-Options': 'nosniff',
          },
        },
      ],
    },

    docker: {
      baseImage: 'node:18-alpine',
      workdir: '/app',
      port: 3000,
      healthcheck: {
        test: ['CMD', 'curl', '-f', 'http://localhost:3000/health'],
        interval: '30s',
        timeout: '10s',
        retries: 3,
      },
      environment: {
        NODE_ENV: 'production',
        PORT: '3000',
      },
    },
  },

  // CI/CD configuration
  cicd: {
    github: {
      workflows: {
        test: {
          on: ['push', 'pull_request'],
          jobs: {
            test: {
              'runs-on': 'ubuntu-latest',
              steps: [
                'checkout',
                'setup-node',
                'install-dependencies',
                'run-tests',
                'run-build',
              ],
            },
          },
        },
        deploy: {
          on: {
            push: {
              branches: ['main'],
            },
          },
          jobs: {
            deploy: {
              'runs-on': 'ubuntu-latest',
              steps: [
                'checkout',
                'setup-node',
                'install-dependencies',
                'run-tests',
                'run-build',
                'deploy-to-production',
              ],
            },
          },
        },
      },
    },
  },
};

export default deployConfig;
