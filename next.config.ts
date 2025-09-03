// next.config.ts
import type { NextConfig } from "next";

const securityHeaders: { key: string; value: string }[] = [
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Permissions-Policy", value: "geolocation=(), microphone=()" },
  // TODO: consider adding a Content-Security-Policy later.
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // hides "X-Powered-By: Next.js"
  eslint: {
    // ✅ Don’t fail `next build` on ESLint errors (you can re-enable later)
    ignoreDuringBuilds: true,
  },
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
