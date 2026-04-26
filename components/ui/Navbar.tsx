'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30">
      <div className="flex justify-between items-center px-8 md:px-12 py-4 w-full">
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/"
            className={`font-label text-sm font-semibold tracking-wide transition-all duration-200 ${
              pathname === '/' ? 'text-primary border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'
            }`}>
            Hospitals
          </Link>
          <Link href="/about"
            className={`font-label text-sm font-medium tracking-wide transition-all duration-200 ${
              pathname === '/about' ? 'text-primary border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'
            }`}>
            About
          </Link>
        </div>
        <Link href="/admin/login"
          className="text-on-surface-variant hover:text-primary px-4 py-2 rounded-lg font-label text-sm font-semibold hover:bg-surface-variant/50 transition-all duration-200 flex items-center gap-2 border border-outline-variant/50">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>login</span>
          <span>Admin Login</span>
        </Link>
      </div>
    </nav>
  )
}
