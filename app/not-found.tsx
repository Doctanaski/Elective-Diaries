import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-headline font-black text-8xl text-primary/20 mb-4">404</p>
        <h1 className="font-headline font-bold text-2xl text-on-surface mb-2">Page Not Found</h1>
        <p className="text-on-surface-variant mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center space-x-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-semibold hover:bg-primary-container transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  )
}
