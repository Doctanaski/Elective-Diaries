import Link from 'next/link'
import Image from 'next/image'
import type { Hospital } from '@/types/database'

const statusConfig = {
  active: { color: '#34A853', label: 'Active' },
  new_data: { color: '#4285F4', label: 'New Data' },
  inactive: { color: '#857372', label: 'Inactive' },
}

export default function HospitalCard({ hospital }: { hospital: Hospital }) {
  const status = statusConfig[hospital.status] ?? statusConfig.inactive

  return (
    <Link href={`/hospitals/${hospital.slug}`} prefetch={true}>
      <div className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer aspect-[4/5] bg-surface-container border border-outline-variant/20 hover:border-primary/30">
        {hospital.image_url && (
          <Image
            src={hospital.image_url}
            alt={hospital.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            // Responsive sizes: full width on mobile, 1/3 on desktop
            sizes="(max-width: 768px) 100vw, 33vw"
            // Not priority — below the fold on most screens; let LCP image load first
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Status badge */}
        {hospital.status !== 'inactive' && (
          <div className="absolute top-6 right-6 bg-surface/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center space-x-2 border border-outline-variant/20 shadow-sm">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: status.color }}
            />
            <span className="font-label text-[11px] uppercase font-bold text-on-surface tracking-wider">
              {status.label}
            </span>
          </div>
        )}

        {/* Name */}
        <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="font-headline text-2xl font-bold text-white tracking-tight leading-snug">
            {hospital.name}
          </h3>
          {hospital.description && (
            <p className="text-white/70 text-sm mt-2 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {hospital.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
