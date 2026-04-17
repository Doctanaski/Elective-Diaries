import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full py-12 px-12 mt-12 bg-surface-container border-t border-outline-variant/30">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <p className="font-headline font-bold text-lg text-primary">The Elective Diaries</p>
          <p className="text-sm text-on-surface-variant mt-1">
            KMC Local Council · IFMSA Pakistan
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 md:justify-end text-sm text-on-surface-variant">
          <Link href="/" className="hover:text-primary transition-colors">Hospitals</Link>
          <Link href="/about" className="hover:text-primary transition-colors">About</Link>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  )
}
