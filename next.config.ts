import type { NextConfig } from "next";

const securityHeaders: { key: string; value: string }[] = [
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Permissions-Policy", value: "geolocation=(), microphone=()" },
  // You can add more later (e.g., a CSP) — see note below.
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // hides "X-Powered-By: Next.js"
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
