'use client'

import { useState, useRef, useCallback } from 'react'
import HospitalCard from './HospitalCard'
import type { Hospital } from '@/types/database'

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

  return (
    <div className="relative">
      {/* ── Track ── */}
      <div
        className="relative flex items-center justify-center overflow-hidden py-6"
        style={{ minHeight: '420px' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {hospitals.map((hospital, index) => {
          const offset = relativeOffset(index)
          const isActive = offset === 0
          const isAdjacent = Math.abs(offset) === 1
          const isVisible = Math.abs(offset) <= 2

          if (!isVisible) return null

          // Layout: active card centered & full-size, neighbors pushed
          // out to the sides, scaled down and faded.
          const translateX = `${offset * 78}%`
          const scale = isActive ? 1 : isAdjacent ? 0.78 : 0.6
          const opacity = isActive ? 1 : isAdjacent ? 0.55 : 0.2
          const zIndex = 10 - Math.abs(offset)

          return (
            <div
              key={hospital.id}
              className="absolute w-full max-w-sm transition-all duration-500 ease-out px-4"
              style={{
                transform: `translateX(${translateX}) scale(${scale})`,
                opacity,
                zIndex,
                pointerEvents: isActive ? 'auto' : 'none',
              }}
              aria-hidden={!isActive}
            >
              <HospitalCard hospital={hospital} priority={isActive} />
            </div>
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
            className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 z-20
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
            className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 z-20
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
