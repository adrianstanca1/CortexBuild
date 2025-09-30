import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizePackageImports: ["@radix-ui/react-icons"],
  },
  // Add font loading optimizations
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'preload',
            value: '</fonts/GeistVF.woff>; rel=preload; as=font; type=font/woff; crossorigin=anonymous',
          },
          {
            key: 'preload',  
            value: '</fonts/GeistMonoVF.woff>; rel=preload; as=font; type=font/woff; crossorigin=anonymous',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
