'use client'

import { useState } from 'react'
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

  return (
    <div className="flex flex-col items-center gap-10">

      {/* Cover flow */}
      <div
        className="w-full flex justify-center items-center relative"
        style={{ height: 260, perspective: '1000px' }}
      >
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
                width: 130,
                aspectRatio: '3/4',
                zIndex: 100 - absOffset,
                transformStyle: 'preserve-3d',
              }}
              initial={false}
              animate={{
                x: offset * 68,
                rotateY: isActive ? 0 : isPast ? 38 : -38,
                z: isActive ? 80 : -absOffset * 50,
                scale: isActive ? 1.15 : 1 - absOffset * 0.08,
                opacity: absOffset > 3 ? 0 : 1 - absOffset * 0.2,
              }}
              transition={{ type: 'spring', stiffness: 220, damping: 26 }}
              onClick={(e) => toSlide(e, i)}
            >
              {/* Card image */}
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
                    <span className="material-symbols-outlined text-on-surface-variant opacity-30" style={{ fontSize: 36 }}>
                      local_hospital
                    </span>
                  </div>
                )}
              </div>

              {/* Name label under active card */}
              <motion.div
                className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-center text-xs font-semibold text-white/80 whitespace-nowrap"
                animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : -4 }}
                transition={{ duration: 0.2 }}
              >
                {hospital.name}
              </motion.div>
            </motion.div>
          )
        })}
      </div>

      {/* Controls */}
      <div className="mt-2 w-fit px-2 py-1 flex items-center gap-2 justify-center text-zinc-300 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-sm">
        <button
          onClick={toPrev}
          disabled={activeIndex === 0}
          className="p-1 cursor-pointer hover:bg-white/10 rounded-full transition-colors disabled:opacity-30"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1">
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

        <button
          onClick={toNext}
          disabled={activeIndex === hospitals.length - 1}
          className="p-1 cursor-pointer hover:bg-white/10 rounded-full transition-colors disabled:opacity-30"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Active hospital info + CTA */}
      <motion.div
        key={activeIndex}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-md"
      >
        <h2 className="font-headline font-extrabold text-2xl md:text-3xl text-white mb-2">
          {active.name}
        </h2>
        {active.description && (
          <p className="text-white/50 text-sm leading-relaxed mb-5 line-clamp-2">
            {active.description}
          </p>
        )}
        <Link
          href={`/hospitals/${active.slug}`}
          prefetch
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                     bg-primary text-on-primary font-label text-sm font-bold
                     hover:bg-primary-container active:scale-95 transition-all"
        >
          View Diaries
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
        </Link>
      </motion.div>
    </div>
  )
}
