import type { NextConfig } from "next";
import { assertNoUnapprovedProductionEditorial } from "./src/lib/content-release/blog-release";
import { assertNoUnapprovedProductionTemplates } from "./src/lib/content-release/template-release";
import { assertEditorialRelease } from "./src/lib/content-release/editorial-release";

assertEditorialRelease();
assertNoUnapprovedProductionEditorial();
assertNoUnapprovedProductionTemplates();

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self)",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
];

const nextConfig: NextConfig = {
  devIndicators: false,
  outputFileTracingIncludes: {
    "/api/directorio/download": ["./private/directorio/**/*"],
    "/api/directorio/confirm": ["./private/directorio/**/*"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/directorio-comercial-argentino",
        destination: "/directorio",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
