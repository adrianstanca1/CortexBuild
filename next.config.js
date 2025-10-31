/** @type {import('next').NextConfig} */
const nextConfig = {
  // App directory is now stable in Next.js 15+
  // No experimental features needed
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  headers: async () => {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'private, max-age=30' },
        ],
      },
    ];
  },
};

export default nextConfig;
