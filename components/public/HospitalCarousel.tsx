'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type { Hospital } from '@/types/database'

interface Props {
  hospitals: Hospital[]
}

export default function HospitalCarousel({ hospitals }: Props) {
  const mid = Math.floor(hospitals.length / 2)
  const [activeIndex, setActiveIndex] = useState(mid)
  const [isMobile, setIsMobile] = useState(false)
  const [vh, setVh] = useState(900)

  useEffect(() => {
    const update = () => {
      setIsMobile(window.innerWidth < 768)
      setVh(window.innerHeight)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  if (hospitals.length === 0) return null

  const toPrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveIndex(prev => Math.max(0, prev - 1))
  }

  const toNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveIndex(prev => Math.min(hospitals.length - 1, prev + 1))
  }

  const toSlide = (e: React.MouseEvent, index: number) => {
    e.stopPropagation()
    setActiveIndex(index)
  }

  const active = hospitals[activeIndex]

  // Responsive values — scale cards so the whole carousel (cards, name, button)
  // fits inside the slide without the user needing to scroll, and scale the
  // arrows / name / CTA with the card size so proportions stay balanced
  const vw           = isMobile ? (typeof window !== 'undefined' ? window.innerWidth : 390) : 0
  const cardWidth    = isMobile ? Math.round(vw * 0.40) : Math.min(340, Math.round(vh * 0.38))
  const trackHeight  = isMobile ? Math.round(cardWidth * 1.45) : Math.min(580, Math.round(vh * 0.52))
  const perspective  = isMobile ? 800  : 1400
  const xSpacing     = isMobile ? Math.round(cardWidth * 0.62) : Math.round(cardWidth * 0.53)

  const baseW        = isMobile ? 160 : 340
  const cardScale    = isMobile ? Math.max(0.72, cardWidth / baseW) : Math.min(1, Math.max(0.8, cardWidth / baseW))
  const arrowPx      = isMobile ? Math.max(26, Math.round(32 * cardScale)) : Math.round(48 * cardScale)
  const arrowIconPx  = isMobile ? Math.max(13, Math.round(16 * cardScale)) : Math.round(22 * cardScale)
  const arrowGap     = isMobile ? 6 : 8
  const namePx       = isMobile ? Math.max(15, Math.round(18 * cardScale)) : Math.round(27 * cardScale)
  const descPx       = isMobile ? 14 : Math.round(15 * cardScale)
  const ctaFontPx    = isMobile ? 14 : Math.round(15 * cardScale)
  const ctaPadX      = isMobile ? Math.max(16, Math.round(22 * cardScale)) : Math.round(26 * cardScale)
  const ctaPadY      = isMobile ? Math.max(9, Math.round(12 * cardScale)) : Math.round(14 * cardScale)
  const ctaIconPx    = isMobile ? 16 : Math.round(17 * cardScale)

  return (
    <div className="flex flex-col items-center gap-4">

      {/* ── Cover flow + side arrows ── */}
      <div
        className="w-full flex justify-center items-center relative"
        style={{ height: trackHeight, perspective }}
      >
        {/* Left arrow — hugs the active tab */}
        <button
          onClick={toPrev}
          disabled={activeIndex === 0}
          className="absolute z-[200] rounded-full flex items-center justify-center
                     bg-primary text-on-primary border border-primary
                     hover:bg-primary-container hover:scale-110
                     transition-all shadow-lg disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{
            width: arrowPx,
            height: arrowPx,
            left: `calc(50% - ${Math.round(cardWidth / 2 + arrowPx / 2 + arrowGap)}px)`,
            transform: 'translateX(-50%)',
          }}
        >
          <ChevronLeft size={arrowIconPx} />
        </button>

        {/* Right arrow — hugs the active tab */}
        <button
          onClick={toNext}
          disabled={activeIndex === hospitals.length - 1}
          className="absolute z-[200] rounded-full flex items-center justify-center
                     bg-primary text-on-primary border border-primary
                     hover:bg-primary-container hover:scale-110
                     transition-all shadow-lg disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{
            width: arrowPx,
            height: arrowPx,
            left: `calc(50% + ${Math.round(cardWidth / 2 + arrowPx / 2 + arrowGap)}px)`,
            transform: 'translateX(-50%)',
          }}
        >
          <ChevronRight size={arrowIconPx} />
        </button>

        {/* Cards */}
        {hospitals.map((hospital, i) => {
          const isActive = activeIndex === i
          const offset = i - activeIndex
          const absOffset = Math.abs(offset)
          const isPast = i < activeIndex

          return (
            <motion.div
              key={hospital.id}
              className="absolute cursor-pointer"
              style={{
                width: cardWidth,
                aspectRatio: '3/4',
                zIndex: 100 - absOffset,
                transformStyle: 'preserve-3d',
              }}
              initial={false}
              animate={{
                x: offset * xSpacing,
                rotateY: isActive ? 0 : isPast ? 38 : -38,
                z: isActive ? 80 : -absOffset * 60,
                scale: isActive ? 1.08 : 1 - absOffset * 0.07,
                opacity: absOffset > 3 ? 0 : 1 - absOffset * 0.2,
              }}
              transition={{ type: 'spring', stiffness: 220, damping: 26 }}
              onClick={(e) => toSlide(e, i)}
            >
              <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/20">
                {hospital.image_url ? (
                  <img
                    src={hospital.image_url}
                    alt={hospital.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-surface-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant opacity-30"
                      style={{ fontSize: isMobile ? 32 : 56 }}>
                      local_hospital
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ── Active hospital info ── */}
      <motion.div
        key={activeIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-md px-4"
      >
        <h2 className="font-headline font-extrabold text-on-surface mb-2" style={{ fontSize: namePx }}>
          {active.name}
        </h2>
        {active.description && (
          <p className="text-on-surface-variant leading-relaxed mb-3 line-clamp-2" style={{ fontSize: descPx }}>
            {active.description}
          </p>
        )}
        <Link
          href={`/hospitals/${active.slug}`}
          prefetch
          className="inline-flex items-center rounded-xl
                     bg-primary text-on-primary font-label font-bold
                     hover:bg-primary-container active:scale-95 transition-all"
          style={{ padding: `${ctaPadY}px ${ctaPadX}px`, gap: 6, fontSize: ctaFontPx }}
        >
          View Diaries
          <span className="material-symbols-outlined" style={{ fontSize: ctaIconPx }}>arrow_forward</span>
        </Link>
      </motion.div>

      {/* ── Dot strip ── */}
      <div className="flex items-center gap-1.5 mt-1">
        {hospitals.map((_, i) => (
          <div
            key={i}
            onClick={(e) => toSlide(e, i)}
            className={`rounded-full cursor-pointer h-1 transition-all duration-300 ${
              activeIndex === i ? 'w-4 bg-primary' : 'w-1 bg-on-surface/20 hover:bg-primary/40'
            }`}
          />
        ))}
      </div>

    </div>
  )
}
