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

const CAROUSEL_HEIGHT = 460

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
        style={{ minHeight: CAROUSEL_HEIGHT + 48 }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {hospitals.map((hospital, index) => {
          const offset = relativeOffset(index)
          const isActive = offset === 0
          const isVisible = Math.abs(offset) <= 1
          if (!isVisible) return null

          // Every card shares the same DOM structure — a single image card —
          // so transforms animate smoothly between left / center / right slots.
          let translateX = '-50%'
          let opacity = 1
          let zIndex = 20
          let width = '36rem'

          if (offset < 0) {
            translateX = '-145%'
            opacity = 0.35
            zIndex = 0
            width = '20rem'
          } else if (offset > 0) {
            translateX = '45%'
            opacity = 0.35
            zIndex = 0
            width = '20rem'
          }

          return (
            <Link
              key={hospital.id}
              href={`/hospitals/${hospital.slug}`}
              prefetch={true}
              className="absolute left-1/2 top-1/2
                         transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
                         hover:opacity-60"
              style={{
                height: CAROUSEL_HEIGHT,
                width,
                transform: `translateX(${translateX}) translateY(-50%)`,
                opacity: isActive ? 1 : opacity,
                zIndex,
                pointerEvents: isActive ? 'none' : 'auto',
              }}
              tabIndex={isActive ? -1 : 0}
            >
              <div className="group relative w-full h-full rounded-2xl overflow-hidden border border-outline-variant/20 bg-surface-container shadow-xl">
                {hospital.image_url && (
                  <Image
                    src={hospital.image_url}
                    alt={hospital.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={isActive}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* Status badge — active card only */}
                {isActive && hospital.status !== 'inactive' && (
                  <div className="absolute top-6 right-6 bg-surface/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center space-x-2 border border-outline-variant/20 shadow-sm">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: status.color }} />
                    <span className="font-label text-[11px] uppercase font-bold text-on-surface tracking-wider">
                      {status.label}
                    </span>
                  </div>
                )}

                {/* Name */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <h3 className="font-headline text-lg md:text-2xl font-bold text-white tracking-tight leading-snug">
                    {hospital.name}
                  </h3>
                </div>
              </div>
            </Link>
          )
        })}

        {/* ── Info panel for the focused hospital — sits flush against the active card ── */}
        <div
          key={activeHospital.id + '-info'}
          className="hidden md:flex absolute left-1/2 top-1/2 flex-col
                     transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
                     bg-surface-container-low rounded-2xl border border-outline-variant/20 shadow-xl
                     p-8 overflow-y-auto"
          style={{
            height: CAROUSEL_HEIGHT,
            width: '22rem',
            transform: 'translateX(11%) translateY(-50%)',
            zIndex: 25,
          }}
        >
          <h3 className="font-headline text-2xl md:text-3xl font-bold text-on-surface tracking-tight leading-snug mb-3">
            {activeHospital.name}
          </h3>

          {activeHospital.description ? (
            <p className="text-on-surface-variant text-sm md:text-base leading-relaxed mb-6">
              {activeHospital.description}
            </p>
          ) : (
            <p className="text-on-surface-variant text-sm md:text-base leading-relaxed mb-6 italic opacity-70">
              No description added yet.
            </p>
          )}

          <div className="mt-auto">
            <Link
              href={`/hospitals/${activeHospital.slug}`}
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
