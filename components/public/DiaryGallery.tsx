'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { DraggableCardContainer, DraggableCardBody } from '@/components/ui/draggable-card'
import Image from 'next/image'

interface DiaryGalleryProps {
  images: string[]
  diaryTitle: string
}

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
  // Index of the image open in the lightbox, null = closed
  const [lightbox, setLightbox] = useState<number | null>(null)

  if (images.length === 0) return null

  const prev = () => setLightbox(i => (i === null ? null : (i - 1 + images.length) % images.length))
  const next = () => setLightbox(i => (i === null ? null : (i + 1) % images.length))

  return (
    <>
      {/* ── Draggable card canvas ── */}
      <div className="mt-8 -mx-5 md:-mx-7">
        <div className="flex items-center gap-2 mb-3 px-1">
          <span className="material-symbols-outlined text-secondary" style={{ fontSize: 16 }}>photo_library</span>
          <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest">
            Photo Gallery · drag to explore · tap to view
          </p>
        </div>

        <div
          className="relative w-full overflow-hidden rounded-xl border border-white/5 bg-surface-container-lowest"
          style={{ height: 420 }}
        >
          <DraggableCardContainer className="w-full h-full">
            {images.map((src, i) => (
              <DraggableCardBody
                key={i}
                className="absolute"
                style={POSITIONS[i % POSITIONS.length] as React.CSSProperties}
                onOpen={() => setLightbox(i)}
              >
                <div
                  className="rounded-xl overflow-hidden border border-white/10"
                  style={{ width: 160, boxShadow: '0 8px 24px rgba(0,0,0,0.55)' }}
                >
                  <div className="relative bg-surface-container" style={{ width: 160, height: 160 }}>
                    <Image
                      src={src}
                      alt={`${diaryTitle} — photo ${i + 1}`}
                      fill
                      className="object-cover pointer-events-none"
                      sizes="160px"
                    />
                  </div>
                  <div className="px-2 py-1.5 bg-surface-container">
                    <p className="font-label text-[10px] text-on-surface-variant text-center tracking-wide">
                      Photo {i + 1}
                    </p>
                  </div>
                </div>
              </DraggableCardBody>
            ))}
          </DraggableCardContainer>
        </div>
      </div>

      {/* ── Lightbox image viewer ── */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/92 backdrop-blur-md"
              onClick={() => setLightbox(null)}
            />

            {/* Image */}
            <motion.div
              key={lightbox}
              className="relative z-10 flex items-center justify-center w-full h-full px-16 py-16"
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1,    opacity: 1 }}
              exit={{    scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative max-w-4xl w-full max-h-[80vh] aspect-auto rounded-2xl overflow-hidden shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={images[lightbox]}
                  alt={`${diaryTitle} — photo ${lightbox + 1}`}
                  className="w-full h-full object-contain max-h-[80vh]"
                />
              </div>
            </motion.div>

            {/* Counter */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10
                            px-4 py-1.5 rounded-full bg-surface/70 backdrop-blur-md border border-white/10">
              <p className="font-label text-xs text-on-surface-variant tracking-widest">
                {lightbox + 1} / {images.length}
              </p>
            </div>

            {/* Close */}
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full flex items-center justify-center
                         bg-surface/80 backdrop-blur-md border border-white/10
                         text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
            </button>

            {/* Prev */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); prev() }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full flex items-center justify-center
                           bg-surface/80 backdrop-blur-md border border-white/10
                           text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 24 }}>chevron_left</span>
              </button>
            )}

            {/* Next */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); next() }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full flex items-center justify-center
                           bg-surface/80 backdrop-blur-md border border-white/10
                           text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 24 }}>chevron_right</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
