import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // The admin console moved to new paths; keep old bookmarks and older
  // notification links working.
  async redirects() {
    return [
      { source: "/admin/trust", destination: "/admin/verifications", permanent: true },
      { source: "/admin/users", destination: "/admin/people", permanent: true },
      { source: "/admin/users/:id", destination: "/admin/people/:id", permanent: true },
      { source: "/admin/marketplace", destination: "/admin/listings", permanent: true },
      { source: "/admin/payments", destination: "/admin/finance", permanent: true },
      { source: "/admin/notifications", destination: "/admin/inbox", permanent: true },
      { source: "/admin/config", destination: "/admin/catalog", permanent: true },
      { source: "/admin/analytics", destination: "/admin", permanent: true },
      { source: "/admin/monitoring", destination: "/admin", permanent: true },
      { source: "/temp-dash/:path*", destination: "/admin", permanent: false },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "kickair-api-production.up.railway.app",
        port: "",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "pub-7862fdfe18e9471a867c2facd844ba89.r2.dev",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
