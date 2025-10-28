/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  images: {
    domains: ['qtrypzzcjebvfcihiynt.supabase.co'],
  },
  async rewrites() {
    return [
      {
        source: '/api/node/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
      {
        source: '/api/java/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
