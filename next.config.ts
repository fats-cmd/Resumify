import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Set turbopack.root to resolve workspace root detection warnings
  turbopack: {
    root: process.cwd()
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pbqbujrfmriptnywnkzl.supabase.co',
        port: '',
      },
    ],
  },
};

export default nextConfig;