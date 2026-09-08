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
  turbopack: { root: process.cwd() },
  outputFileTracingRoot: process.cwd(),
  outputFileTracingIncludes: {
    "/api/directorio/download": ["./private/directorio/**/*"],
    "/api/directorio/confirm": ["./private/directorio/**/*"],
  },
  outputFileTracingExcludes: {
    '/*': ['./.boda-studio-private/**/*', './.codex-tmp/**/*', './artifacts/**/*'],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      ...['/boda/:path+', '/invitacion/:path*', '/api/boda-studio/:path*'].map((source) => ({
        source,
        headers: [
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
          { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
        ],
      })),
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
