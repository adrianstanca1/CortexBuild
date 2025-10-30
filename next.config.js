/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 16+ with Turbopack
  images: {
    unoptimized: true,
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
