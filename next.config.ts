import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Set turbopack.root to resolve workspace root detection warnings
  turbopack: {
    root: process.cwd()
  },
  images: {
    domains: ['pbqbujrfmriptnywnkzl.supabase.co'],
  },
};

export default nextConfig;