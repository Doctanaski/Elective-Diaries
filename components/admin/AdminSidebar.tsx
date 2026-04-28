'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { href: '/admin/diaries', label: 'Diaries', icon: 'menu_book' },
  { href: '/admin/hospitals', label: 'Hospitals', icon: 'local_hospital' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface border-r border-outline-variant/30 flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-outline-variant/20">
        <p className="font-headline font-bold text-primary text-base">The Elective Diaries</p>
        <p className="text-xs text-primary mt-0.5">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon }) => {
          const isActive =
            href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-primary/70 hover:bg-surface-container hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{icon}</span>
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-outline-variant/20 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium text-primary/70 hover:bg-surface-container hover:text-primary transition-all"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>open_in_new</span>
          <span>View Site</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium text-error hover:bg-error-container/30 transition-all"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>logout</span>
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  )
}
