/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── Image Optimisation ──────────────────────────────────────────────────
  images: {
    // Serve modern formats (WebP/AVIF) automatically
    formats: ['image/avif', 'image/webp'],
    // Cache optimised images for 7 days on CDN
    minimumCacheTTL: 604800,
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
  // Remove console.* calls in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // ── HTTP headers for static assets & security ───────────────────────────
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
        // Cache public images for 7 days
        source: '/_next/image:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400',
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
