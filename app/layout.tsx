import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import ThemeProvider from '@/components/ui/ThemeProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'The Elective Diaries — KMC Local Council',
  description: 'Documenting clinical elective experiences for Khyber Medical College students.',
  openGraph: {
    title: 'The Elective Diaries — KMC Local Council',
    description: 'A precision archive of clinical elective experiences at affiliated medical facilities.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* ── Preconnect to Google Fonts for faster DNS + TLS ── */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* ── Body fonts (swap is fine — text, not icons) ── */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&family=Work+Sans:wght@400;500;600&display=swap"
        />

        {/*
          ── Material Symbols — CRITICAL: display=block ──
          'block' renders an invisible rectangle while the font loads
          instead of the raw icon name as text (FOUT).
          This is the correct strategy for icon fonts.
        */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />

        {/*
          ── Anti-FOUT: hide icon text until Material Symbols is ready ──
          font-display:block already handles this at the font level,
          but this CSS ensures zero-width invisible placeholder during load.
        */}
        <style>{`
          .material-symbols-outlined {
            font-family: 'Material Symbols Outlined';
            font-weight: normal;
            font-style: normal;
            font-size: 24px;
            line-height: 1;
            letter-spacing: normal;
            text-transform: none;
            display: inline-block;
            white-space: nowrap;
            word-wrap: normal;
            direction: ltr;
            -webkit-font-feature-settings: 'liga';
            font-feature-settings: 'liga';
            -webkit-font-smoothing: antialiased;
          }
        `}</style>
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
