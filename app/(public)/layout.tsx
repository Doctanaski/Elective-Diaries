'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  // Hospital detail pages AND diary reader pages get full-screen — no chrome
  const isHospitalPage = /^\/hospitals\/[^/]+(\/diaries\/[^/]+)?\/?$/.test(pathname)

  // Home page scrolls inside its own full-height snap container — hide the page scrollbar
  useEffect(() => {
    if (pathname === '/') {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [pathname])

  if (isHospitalPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20">
        {children}
      </main>
    </div>
  )
}
