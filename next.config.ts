import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /* Gallery images come from two places: files in /public, which need no
       entry here, and uploads in the Vercel Blob store, which do. The
       store's subdomain is per-account, so the wildcard covers it. */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
