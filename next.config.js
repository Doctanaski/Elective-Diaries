/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── Remove X-Powered-By header (minor security + saves bytes) ───────────
  poweredByHeader: false,

  // ── Image Optimisation ──────────────────────────────────────────────────
  images: {
    // Serve modern formats (WebP/AVIF) automatically
    formats: ['image/avif', 'image/webp'],
    // Cache optimised images for 30 days on CDN
    minimumCacheTTL: 2592000,
    // Limit concurrent image optimisation to reduce cold-start time
    deviceSizes: [640, 750, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256, 320],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },

  // ── Compression ─────────────────────────────────────────────────────────
  compress: true,

  // ── Reduce JS bundle size ────────────────────────────────────────────────
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // ── Experimental: faster builds & smaller client bundles ────────────────
  experimental: {
    // Partial Pre-Rendering — static shell with streaming dynamic content
    // ppr: true,  // Uncomment when on Next.js 14.1+
    // Optimise package imports so only used icons/components are bundled
    optimizePackageImports: ['@vercel/analytics'],
  },

  // ── HTTP headers for static assets, images & security ──────────────────
  async headers() {
    return [
      {
        // Aggressively cache static assets (JS/CSS/fonts) — they're hashed
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache optimised images for 30 days with SWR
        source: '/_next/image:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // Cache rendered public pages for 60s, allow SWR for 5 minutes
        // This prevents Vercel from hitting Supabase on every unique visitor
        source: '/(hospitals.*|about|)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
      {
        // Security headers on all pages
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
