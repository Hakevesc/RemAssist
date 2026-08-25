import type { NextConfig } from 'next';

/**
 * Rem Assist — Next.js app config.
 * Phase 00: standalone output for the VPS target, Nginx-owned compression,
 * and security headers. The 301 redirect map (§11.3) lands in Phase 05.
 */
const config: NextConfig = {
  output: 'standalone',
  // A stray package-lock.json in the parent directory confuses Next's
  // workspace-root inference; pin the trace root to this repo explicitly.
  outputFileTracingRoot: process.cwd(),
  poweredByHeader: false,
  compress: false,          // Nginx handles compression in production
  experimental: {
    // Force static generation through a single worker. Next 15's parallel
    // worker pool crashes the V8 heap / child-process spawn on Windows + Node
    // ≥20 (`spawn UNKNOWN`, 0xC0000409). One worker keeps builds reliable here;
    // the deployment VPS runs Node 22 and can raise this back when needed.
    staticGenerationMaxConcurrency: 1,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ];
  },
};

export default config;