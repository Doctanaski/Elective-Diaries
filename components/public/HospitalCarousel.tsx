'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'
import type { Hospital } from '@/types/database'

const statusConfig: Record<string, { color: string; label: string }> = {
  active:   { color: '#34A853', label: 'Active' },
  new_data: { color: '#4285F4', label: 'New Data' },
  inactive: { color: '#857372', label: 'Inactive' },
}

export default function HospitalCarousel({ hospitals }: { hospitals: Hospital[] }) {
  const [active, setActive] = useState(0)
  const [dir, setDir] = useState(1) // 1 = forward, -1 = backward
  const touchStartX = useRef<number | null>(null)
  const count = hospitals.length

  const goTo = useCallback((index: number) => {
    const next = ((index % count) + count) % count
    setDir(next > active ? 1 : -1)
    setActive(next)
  }, [count, active])

  const goPrev = useCallback(() => goTo(active - 1), [active, goTo])
  const goNext = useCallback(() => goTo(active + 1), [active, goTo])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goPrev, goNext])

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (delta > 48) goPrev()
    else if (delta < -48) goNext()
    touchStartX.current = null
  }

  const h = hospitals[active]
  const status = statusConfig[h.status] ?? statusConfig.inactive

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{ height: 'clamp(480px, 60vh, 680px)' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Full-bleed background — crossfades on hospital change ── */}
      <AnimatePresence initial={false}>
        <motion.div
          key={active}
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
        >
          {h.image_url && (
            <Image
              src={h.image_url}
              alt={h.name}
              fill
              className="object-cover scale-105"
              sizes="100vw"
              priority
            />
          )}
          {/* Dark vignette — heavier on left for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
        </motion.div>
      </AnimatePresence>

      {/* ── Layout: left info + right tab strip ── */}
      <div className="relative z-10 h-full flex items-end md:items-center justify-between px-8 md:px-12 py-10 gap-8">

        {/* LEFT — animated hospital info */}
        <div className="flex-1 max-w-lg">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              initial={{ opacity: 0, y: dir * 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{   opacity: 0, y: dir * -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Status */}
              {h.status !== 'inactive' && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: status.color }} />
                  <span className="font-label text-[11px] uppercase tracking-[0.18em] text-white/60">
                    {status.label}
                  </span>
                </div>
              )}

              {/* Hospital name */}
              <h2 className="font-headline font-extrabold text-3xl md:text-4xl lg:text-5xl text-white
                             leading-tight tracking-tight mb-4">
                {h.name}
              </h2>

              {/* Description */}
              <p className="text-white/60 text-sm md:text-base leading-relaxed mb-8 line-clamp-3">
                {h.description ?? 'No description added yet.'}
              </p>

              {/* CTA */}
              <Link
                href={`/hospitals/${h.slug}`}
                prefetch
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                           bg-white text-black font-label text-sm font-bold
                           hover:bg-white/90 active:scale-95 transition-all"
              >
                View Diaries
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* RIGHT — vertical hospital name list (desktop only) */}
        {count > 1 && (
          <div className="hidden md:flex flex-col gap-1 items-end shrink-0 max-w-[200px]">
            {hospitals.map((hospital, i) => (
              <button
                key={hospital.id}
                type="button"
                onClick={() => goTo(i)}
                className={`text-right font-label text-sm transition-all duration-300 px-3 py-1.5 rounded-lg
                            ${i === active
                              ? 'text-white font-bold bg-white/10'
                              : 'text-white/35 hover:text-white/70 font-medium'
                            }`}
              >
                {hospital.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Bottom bar: counter + progress dots + arrows ── */}
      {count > 1 && (
        <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between
                        px-8 md:px-12 py-5">

          {/* Counter */}
          <span className="font-label text-xs text-white/40 tabular-nums">
            {String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
          </span>

          {/* Progress bar */}
          <div className="flex items-center gap-1.5 flex-1 mx-6">
            {hospitals.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className="relative h-[2px] flex-1 rounded-full overflow-hidden bg-white/20"
              >
                {i === active && (
                  <motion.div
                    className="absolute inset-0 bg-white rounded-full"
                    layoutId="progress"
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
                {i < active && (
                  <div className="absolute inset-0 bg-white/60 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Prev / Next */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous"
              className="w-9 h-9 rounded-full flex items-center justify-center
                         border border-white/20 text-white/60 hover:text-white
                         hover:border-white/50 transition-all"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next"
              className="w-9 h-9 rounded-full flex items-center justify-center
                         border border-white/20 text-white/60 hover:text-white
                         hover:border-white/50 transition-all"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Mobile dots ── */}
      {count > 1 && (
        <div className="md:hidden absolute top-4 right-4 z-20 flex gap-1.5">
          {hospitals.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === active ? 'w-5 bg-white' : 'w-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
