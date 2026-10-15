import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the "N" dev-tools badge in local development (never shown in production).
  // Compile and runtime errors still appear.
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'the-cx-assembly.firebasestorage.app',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  async redirects() {
    return [
      // The admin page was renamed from Leaders to CMO Speakers.
      { source: '/admin/leaders', destination: '/admin/speakers', permanent: true },
    ];
  },
};

export default nextConfig;
