'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSyncExternalStore } from 'react'
import { subscribeNavVisibility, getNavVisibility } from '@/lib/nav-visibility'

export default function Navbar() {
  const pathname = usePathname()
  const hidden = useSyncExternalStore(subscribeNavVisibility, getNavVisibility)

  return (
    <nav
      className={`fixed top-0 w-full z-50 bg-primary text-on-primary shadow-md transition-transform duration-300 ${
        hidden ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="flex justify-between items-center px-8 md:px-12 py-4 w-full">
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/"
            className={`font-label text-sm font-semibold tracking-wide transition-all duration-200 ${
              pathname === '/' ? 'text-on-primary border-b-2 border-on-primary pb-1' : 'text-on-primary/70 hover:text-on-primary'
            }`}>
            Hospitals
          </Link>
          <Link href="/about"
            className={`font-label text-sm font-medium tracking-wide transition-all duration-200 ${
              pathname === '/about' ? 'text-on-primary border-b-2 border-on-primary pb-1' : 'text-on-primary/70 hover:text-on-primary'
            }`}>
            About
          </Link>
        </div>
        <Link href="/admin/login"
          className="text-on-primary/90 hover:text-on-primary px-4 py-2 rounded-lg font-label text-sm font-semibold hover:bg-on-primary/10 transition-all duration-200 flex items-center gap-2 border border-on-primary/40">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>login</span>
          <span>Admin Login</span>
        </Link>
      </div>
    </nav>
  )
}
