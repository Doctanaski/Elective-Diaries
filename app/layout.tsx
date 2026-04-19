import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import ThemeProvider from '@/components/ui/ThemeProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'The Elective Diaries — KMC Local Council',
  description: "Documenting clinical elective experiences for Khyber Medical College students. A resource by IFMSA Pakistan's KMC Local Council.",
  openGraph: {
    title: 'The Elective Diaries — KMC Local Council',
    description: 'A precision archive of clinical elective experiences at affiliated medical facilities.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
