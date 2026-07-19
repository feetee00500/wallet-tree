import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@wallet-tree/shared'],
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
