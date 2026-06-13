'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Hospital } from '@/types/database'

const statusConfig = {
  active: { color: '#34A853', label: 'Active' },
  new_data: { color: '#4285F4', label: 'New Data' },
  inactive: { color: '#857372', label: 'Inactive' },
}

export default function HospitalCarousel({ hospitals }: { hospitals: Hospital[] }) {
  const [active, setActive] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const count = hospitals.length

  const goTo = useCallback((index: number) => {
    setActive(((index % count) + count) % count)
  }, [count])

  const goPrev = useCallback(() => goTo(active - 1), [active, goTo])
  const goNext = useCallback(() => goTo(active + 1), [active, goTo])

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (delta > 50) goPrev()
    else if (delta < -50) goNext()
    touchStartX.current = null
  }

  // Compute each card's position relative to the active one,
  // wrapping around so the carousel feels continuous.
  function relativeOffset(index: number) {
    let diff = index - active
    if (diff > count / 2) diff -= count
    if (diff < -count / 2) diff += count
    return diff
  }

  const activeHospital = hospitals[active]
  const status = statusConfig[activeHospital.status] ?? statusConfig.inactive

  return (
    <div className="relative">
      {/* ── Track ── */}
      <div
        className="relative flex items-center justify-center overflow-hidden py-6"
        style={{ minHeight: '460px' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {hospitals.map((hospital, index) => {
          const offset = relativeOffset(index)
          const isActive = offset === 0
          const isVisible = Math.abs(offset) <= 1

          if (!isVisible) return null

          if (isActive) {
            // ── Focused card: expanded, with info panel on the right ──
            return (
              <div
                key={hospital.id}
                className="relative z-20 w-full max-w-5xl transition-all duration-500 ease-out px-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden border border-outline-variant/20 bg-surface-container shadow-xl">
                  {/* Image side */}
                  <Link href={`/hospitals/${hospital.slug}`} prefetch={true}>
                    <div className="group relative aspect-[4/5] md:aspect-auto md:h-full cursor-pointer">
                      {hospital.image_url && (
                        <Image
                          src={hospital.image_url}
                          alt={hospital.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                      {/* Status badge */}
                      {hospital.status !== 'inactive' && (
                        <div className="absolute top-6 right-6 bg-surface/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center space-x-2 border border-outline-variant/20 shadow-sm">
                          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: status.color }} />
                          <span className="font-label text-[11px] uppercase font-bold text-on-surface tracking-wider">
                            {status.label}
                          </span>
                        </div>
                      )}

                      {/* Name */}
                      <div className="absolute bottom-0 left-0 right-0 p-8">
                        <h3 className="font-headline text-2xl font-bold text-white tracking-tight leading-snug">
                          {hospital.name}
                        </h3>
                      </div>
                    </div>
                  </Link>

                  {/* Info side */}
                  <div className="flex flex-col p-8 bg-surface-container-low">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>local_hospital</span>
                      <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
                        Affiliated Facility
                      </span>
                    </div>

                    <h3 className="font-headline text-2xl md:text-3xl font-bold text-on-surface tracking-tight leading-snug mb-3">
                      {hospital.name}
                    </h3>

                    {hospital.description ? (
                      <p className="text-on-surface-variant text-sm md:text-base leading-relaxed mb-6">
                        {hospital.description}
                      </p>
                    ) : (
                      <p className="text-on-surface-variant text-sm md:text-base leading-relaxed mb-6 italic opacity-70">
                        No description added yet.
                      </p>
                    )}

                    <div className="mt-auto">
                      <Link
                        href={`/hospitals/${hospital.slug}`}
                        prefetch={true}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-on-primary
                                   font-label text-sm font-semibold hover:bg-primary-container transition-colors"
                      >
                        View Diaries
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          }

          // ── Neighboring cards: peek at the extreme edges ──
          const side = offset < 0 ? 'left' : 'right'
          return (
            <Link
              key={hospital.id}
              href={`/hospitals/${hospital.slug}`}
              prefetch={true}
              className={`absolute top-1/2 -translate-y-1/2 z-0 w-64 md:w-80 aspect-[4/5]
                          transition-all duration-500 ease-out opacity-40 hover:opacity-60
                          ${side === 'left' ? 'left-0 -translate-x-1/3' : 'right-0 translate-x-1/3'}`}
              aria-hidden="true"
              tabIndex={-1}
            >
              <div className="group relative w-full h-full rounded-2xl overflow-hidden border border-outline-variant/20 bg-surface-container">
                {hospital.image_url && (
                  <Image
                    src={hospital.image_url}
                    alt={hospital.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="font-headline text-lg font-bold text-white tracking-tight leading-snug">
                    {hospital.name}
                  </h3>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* ── Prev / Next controls ── */}
      {count > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous hospital"
            className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 z-30
                       w-11 h-11 rounded-full flex items-center justify-center
                       bg-surface-container/90 backdrop-blur-md border border-outline-variant/30
                       text-on-surface hover:text-primary hover:border-primary/40
                       shadow-sm transition-all"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>chevron_left</span>
          </button>

          <button
            type="button"
            onClick={goNext}
            aria-label="Next hospital"
            className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 z-30
                       w-11 h-11 rounded-full flex items-center justify-center
                       bg-surface-container/90 backdrop-blur-md border border-outline-variant/30
                       text-on-surface hover:text-primary hover:border-primary/40
                       shadow-sm transition-all"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>chevron_right</span>
          </button>
        </>
      )}

      {/* ── Dots ── */}
      {count > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {hospitals.map((hospital, index) => (
            <button
              key={hospital.id}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Go to ${hospital.name}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === active ? 'w-6 bg-primary' : 'w-2 bg-outline-variant/40 hover:bg-outline-variant/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
