import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow Next/Image to optimize product/store images served from Supabase
    // storage — automatic resizing + modern formats keep the storefront fast
    // on cheap phones and slow connections.
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
};

export default nextConfig;
