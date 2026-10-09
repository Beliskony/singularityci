import type { NextConfig } from "next";

const ADMIN_ORIGIN = process.env.ADMIN_ORIGIN ? "http://localhost:3000" : 'https://admin.singularityci.com';

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: ADMIN_ORIGIN },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  }
};

export default nextConfig;
