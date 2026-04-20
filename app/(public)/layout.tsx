'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  // Hospital detail pages (/hospitals/[slug]) get full-screen treatment — no chrome
  const isHospitalPage = /^\/hospitals\/[^/]+(\/)?$/.test(pathname)

  if (isHospitalPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20">
        {children}
      </main>
      <Footer />
    </div>
  )
}
