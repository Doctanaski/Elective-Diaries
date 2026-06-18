'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { DraggableCardContainer, DraggableCardBody } from '@/components/ui/draggable-card'
import Image from 'next/image'

interface DiaryGalleryProps {
  images: string[]
  diaryTitle: string
}

// Scattered initial positions & rotations — cycles if more than 8 images
const POSITIONS = [
  { top: '8%',  left: '6%',   rotate: '-6deg' },
  { top: '6%',  left: '26%',  rotate:  '4deg' },
  { top: '4%',  left: '48%',  rotate: '-3deg' },
  { top: '6%',  right: '5%',  rotate:  '7deg' },
  { top: '46%', left: '4%',   rotate:  '5deg' },
  { top: '44%', left: '26%',  rotate: '-8deg' },
  { top: '46%', left: '50%',  rotate:  '3deg' },
  { top: '44%', right: '4%',  rotate: '-5deg' },
]

export default function DiaryGallery({ images, diaryTitle }: DiaryGalleryProps) {
  const [focused, setFocused] = useState<number | null>(null)

  if (images.length === 0) return null

  return (
    <section className="relative mt-10 mb-8">
      {/* Section header */}
      <div className="px-4 md:px-12 max-w-screen-xl mx-auto mb-4 flex items-center gap-3">
        <span className="material-symbols-outlined text-secondary p-2 bg-secondary/10 rounded-lg" style={{ fontSize: 20 }}>
          photo_library
        </span>
        <div>
          <h2 className="font-headline text-xl font-bold text-on-surface">Photo Gallery</h2>
          <p className="font-label text-xs text-on-surface-variant mt-0.5">
            Drag cards to explore · tap to enlarge
          </p>
        </div>
      </div>

      {/* Canvas — fixed height, cards scattered inside */}
      <div className="relative w-full overflow-hidden rounded-2xl border border-white/5 bg-surface-container-low"
           style={{ height: 480 }}>

        {/* Focused backdrop — clicking it un-focuses */}
        <AnimatePresence>
          {focused !== null && (
            <motion.div
              className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm cursor-zoom-out"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setFocused(null)}
            />
          )}
        </AnimatePresence>

        <DraggableCardContainer className="w-full h-full">
          {images.map((src, i) => {
            const pos = POSITIONS[i % POSITIONS.length]
            const isFocused = focused === i

            return (
              <DraggableCardBody
                key={i}
                className="absolute"
                style={pos as React.CSSProperties}
                focused={isFocused}
                onTap={() => setFocused(isFocused ? null : i)}
              >
                <div
                  className="bg-surface-container rounded-xl overflow-hidden border border-white/10"
                  style={{
                    width: 180,
                    boxShadow: isFocused
                      ? '0 32px 64px rgba(0,0,0,0.8)'
                      : '0 8px 24px rgba(0,0,0,0.5)',
                  }}
                >
                  <div className="relative" style={{ width: 180, height: 180 }}>
                    <Image
                      src={src}
                      alt={`${diaryTitle} — photo ${i + 1}`}
                      fill
                      className="object-cover pointer-events-none"
                      sizes="180px"
                    />
                  </div>
                  <div className="px-3 py-2 bg-surface-container">
                    <p className="font-label text-[11px] text-on-surface-variant text-center tracking-wide">
                      Photo {i + 1}
                    </p>
                  </div>
                </div>
              </DraggableCardBody>
            )
          })}
        </DraggableCardContainer>
      </div>
    </section>
  )
}
