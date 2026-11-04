import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server routes perform live chain and memory reads; no static caching.
  cacheComponents: false,
  turbopack: { root: process.cwd() },
};

export default nextConfig;
