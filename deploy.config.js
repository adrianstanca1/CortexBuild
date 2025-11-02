// CortexBuild 2.0 Deployment Configuration
export const deploymentConfig = {
  // Application Information
  app: {
    name: 'CortexBuild 2.0',
    version: '2.0.0',
    description: 'Ultimate Enterprise Construction Management Platform',
    homepage: 'https://cortexbuild.com',
    repository: 'https://github.com/adrianstanca1/cortexbuild-2.0.g'
  },

  // Build Configuration
  build: {
    outputDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: true,
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@headlessui/react', '@heroicons/react'],
          'chart-vendor': ['recharts', 'chart.js'],
          'utils-vendor': ['axios', 'date-fns', 'lodash']
        }
      }
    }
  },

  // Environment Configurations
  environments: {
    development: {
      name: 'Development',
      url: 'http://localhost:3002',
      apiUrl: 'http://localhost:3002/api',
      database: 'development',
      debug: true,
      analytics: false
    },
    staging: {
      name: 'Staging',
      url: 'https://staging.cortexbuild.com',
      apiUrl: 'https://staging-api.cortexbuild.com',
      database: 'staging',
      debug: true,
      analytics: true
    },
    production: {
      name: 'Production',
      url: 'https://app.cortexbuild.com',
      apiUrl: 'https://api.cortexbuild.com',
      database: 'production',
      debug: false,
      analytics: true
    }
  },

  // Deployment Targets
  targets: {
    // Vercel Deployment
    vercel: {
      name: 'Vercel',
      type: 'static',
      buildCommand: 'npm run build',
      outputDirectory: 'dist',
      installCommand: 'npm ci',
      framework: 'vite',
      nodeVersion: '18.x',
      regions: ['lhr1', 'iad1', 'sfo1'], // London, Virginia, San Francisco
      environmentVariables: {
        NODE_ENV: 'production',
        VITE_APP_VERSION: '2.0.0',
        VITE_API_URL: 'https://api.cortexbuild.com'
      }
    },

    // Netlify Deployment
    netlify: {
      name: 'Netlify',
      type: 'static',
      buildCommand: 'npm run build',
      publishDirectory: 'dist',
      nodeVersion: '18',
      redirects: [
        { from: '/*', to: '/index.html', status: 200 }
      ],
      headers: [
        {
          for: '/assets/*',
          values: {
            'Cache-Control': 'public, max-age=31536000, immutable'
          }
        }
      ]
    },

    // AWS S3 + CloudFront
    aws: {
      name: 'AWS S3 + CloudFront',
      type: 'static',
      s3Bucket: 'cortexbuild-production',
      cloudFrontDistribution: 'E1234567890ABC',
      region: 'us-east-1',
      buildCommand: 'npm run build',
      syncCommand: 'aws s3 sync dist/ s3://cortexbuild-production --delete',
      invalidateCommand: 'aws cloudfront create-invalidation --distribution-id E1234567890ABC --paths "/*"'
    },

    // Docker Container
    docker: {
      name: 'Docker Container',
      type: 'container',
      image: 'cortexbuild/app',
      tag: '2.0.0',
      port: 3000,
      dockerfile: 'Dockerfile.production',
      buildArgs: {
        NODE_ENV: 'production',
        APP_VERSION: '2.0.0'
      }
    },

    // Kubernetes
    kubernetes: {
      name: 'Kubernetes Cluster',
      type: 'container',
      namespace: 'cortexbuild',
      deployment: 'cortexbuild-app',
      service: 'cortexbuild-service',
      ingress: 'cortexbuild-ingress',
      replicas: 3,
      resources: {
        requests: { cpu: '100m', memory: '128Mi' },
        limits: { cpu: '500m', memory: '512Mi' }
      }
    },

    // GitHub Pages
    githubPages: {
      name: 'GitHub Pages',
      type: 'static',
      repository: 'adrianstanca1/cortexbuild-2.0.g',
      branch: 'gh-pages',
      buildCommand: 'npm run build',
      deployCommand: 'npm run deploy:gh-pages'
    }
  },

  // Performance Optimization
  optimization: {
    compression: {
      gzip: true,
      brotli: true,
      threshold: 1024
    },
    caching: {
      staticAssets: '1y',
      htmlFiles: '1h',
      apiResponses: '5m'
    },
    cdn: {
      enabled: true,
      provider: 'cloudflare',
      zones: ['global', 'eu', 'us', 'asia']
    }
  },

  // Security Configuration
  security: {
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.cortexbuild.com wss://api.cortexbuild.com",
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    },
    ssl: {
      enabled: true,
      redirect: true,
      hsts: true
    }
  },

  // Monitoring & Analytics
  monitoring: {
    errorTracking: {
      provider: 'sentry',
      dsn: 'https://your-sentry-dsn@sentry.io/project-id'
    },
    analytics: {
      provider: 'google-analytics',
      trackingId: 'GA-XXXXXXXXX'
    },
    performance: {
      provider: 'web-vitals',
      enabled: true
    }
  },

  // Backup & Recovery
  backup: {
    enabled: true,
    frequency: 'daily',
    retention: '30d',
    storage: 's3://cortexbuild-backups'
  },

  // Health Checks
  healthChecks: {
    enabled: true,
    endpoints: [
      '/health',
      '/api/health',
      '/api/status'
    ],
    interval: '30s',
    timeout: '10s',
    retries: 3
  }
};

export default deploymentConfig;
