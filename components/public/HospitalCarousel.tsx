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

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
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

  // Responsive values — scale cards to viewport width on mobile
  // cardWidth = ~38vw on mobile (fits 3 cards across ~380px screen), fixed on desktop
  const vw           = isMobile ? (typeof window !== 'undefined' ? window.innerWidth : 390) : 0
  const cardWidth    = isMobile ? Math.round(vw * 0.38) : 320
  const trackHeight  = isMobile ? Math.round(cardWidth * 1.45) : 560
  const perspective  = isMobile ? 800  : 1400
  const xSpacing     = isMobile ? Math.round(cardWidth * 0.62) : 170
  const arrowSize    = isMobile ? 'w-9 h-9' : 'w-14 h-14'
  const arrowIcon    = isMobile ? 'w-4 h-4' : 'w-7 h-7'

  return (
    <div className="flex flex-col items-center gap-4">

      {/* ── Cover flow + side arrows ── */}
      <div
        className="w-full flex justify-center items-center relative"
        style={{ height: trackHeight, perspective }}
      >
        {/* Left arrow */}
        <button
          onClick={toPrev}
          disabled={activeIndex === 0}
          className={`absolute left-0 z-[200] ${arrowSize} rounded-full flex items-center justify-center
                     bg-white/10 backdrop-blur-md border border-white/20
                     text-white hover:bg-white/20 hover:border-white/50 hover:scale-110
                     transition-all shadow-lg disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:scale-100`}
        >
          <ChevronLeft className={arrowIcon} />
        </button>

        {/* Right arrow */}
        <button
          onClick={toNext}
          disabled={activeIndex === hospitals.length - 1}
          className={`absolute right-0 z-[200] ${arrowSize} rounded-full flex items-center justify-center
                     bg-white/10 backdrop-blur-md border border-white/20
                     text-white hover:bg-white/20 hover:border-white/50 hover:scale-110
                     transition-all shadow-lg disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:scale-100`}
        >
          <ChevronRight className={arrowIcon} />
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
              <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10">
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
                      style={{ fontSize: isMobile ? 28 : 48 }}>
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
        <h2 className="font-headline font-extrabold text-xl md:text-3xl text-white mb-2">
          {active.name}
        </h2>
        {active.description && (
          <p className="text-white/50 text-sm leading-relaxed mb-4 line-clamp-2">
            {active.description}
          </p>
        )}
        <Link
          href={`/hospitals/${active.slug}`}
          prefetch
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                     bg-primary text-on-primary font-label text-sm font-bold
                     hover:bg-primary-container active:scale-95 transition-all"
        >
          View Diaries
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
        </Link>
      </motion.div>

      {/* ── Dot strip ── */}
      <div className="flex items-center gap-1.5 mt-1">
        {hospitals.map((_, i) => (
          <div
            key={i}
            onClick={(e) => toSlide(e, i)}
            className={`rounded-full cursor-pointer h-1 transition-all duration-300 ${
              activeIndex === i ? 'w-4 bg-white' : 'w-1 bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>

    </div>
  )
}
