'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { DraggableCardContainer, DraggableCardBody } from '@/components/ui/draggable-card'
import Image from 'next/image'

interface DiaryGalleryProps {
  images: string[]
  diaryTitle: string
}

// Distribute cards across the container with scattered positions & rotations
const POSITIONS = [
  'absolute top-[8%]  left-[8%]   rotate-[-6deg]',
  'absolute top-[5%]  left-[28%]  rotate-[4deg]',
  'absolute top-[5%]  left-[50%]  rotate-[-3deg]',
  'absolute top-[5%]  right-[6%]  rotate-[7deg]',
  'absolute top-[42%] left-[4%]   rotate-[5deg]',
  'absolute top-[42%] left-[24%]  rotate-[-8deg]',
  'absolute top-[42%] left-[46%]  rotate-[3deg]',
  'absolute top-[42%] right-[4%]  rotate-[-5deg]',
]

export default function DiaryGallery({ images, diaryTitle }: DiaryGalleryProps) {
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState<number | null>(null)

  const close = useCallback(() => {
    setOpen(false)
    setFocused(null)
  }, [])

  if (images.length === 0) return null

  return (
    <>
      {/* ── Trigger button ── */}
      <section className="px-4 md:px-12 max-w-screen-xl mx-auto mt-8 mb-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-between gap-4
                     bg-surface-container-low rounded-2xl px-6 py-5
                     border border-white/5 hover:border-primary/30
                     transition-all group"
        >
          <div className="flex items-center gap-4">
            {/* Mini preview strip */}
            <div className="flex -space-x-3">
              {images.slice(0, 4).map((src, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-lg overflow-hidden border-2 border-surface-container-low ring-1 ring-white/10"
                  style={{ zIndex: 4 - i }}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="font-headline font-bold text-on-surface text-sm">Photo Gallery</p>
              <p className="font-label text-xs text-on-surface-variant">
                {images.length} image{images.length !== 1 ? 's' : ''} · drag &amp; explore
              </p>
            </div>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors" style={{ fontSize: 22 }}>
            photo_library
          </span>
        </button>
      </section>

      {/* ── Modal ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
              onClick={close}
            />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-0.5">Photo Gallery</p>
                <h2 className="font-headline font-bold text-on-surface text-lg">{diaryTitle}</h2>
              </div>
              <button
                type="button"
                onClick={close}
                className="w-10 h-10 rounded-full flex items-center justify-center
                           bg-surface-container border border-white/10
                           text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
              </button>
            </div>

            {/* Hint */}
            <p className="relative z-10 text-center font-label text-xs text-on-surface-variant mt-4 opacity-60">
              Drag cards to move them · click to focus
            </p>

            {/* Cards container */}
            <DraggableCardContainer className="relative z-10 flex-1 w-full overflow-hidden">
              {images.map((src, i) => {
                const pos = POSITIONS[i % POSITIONS.length]
                const isFocused = focused === i

                return (
                  <DraggableCardBody
                    key={i}
                    className={pos}
                    onFocus={() => setFocused(isFocused ? null : i)}
                    focused={isFocused}
                  >
                    <div className="bg-surface-container rounded-xl overflow-hidden shadow-2xl border border-white/10"
                      style={{ width: 200, willChange: 'transform' }}>
                      <div className="relative w-full" style={{ height: 200 }}>
                        <Image
                          src={src}
                          alt={`Gallery image ${i + 1}`}
                          fill
                          className="object-cover pointer-events-none"
                          sizes="200px"
                        />
                      </div>
                      <div className="px-3 py-2.5">
                        <p className="font-label text-xs text-on-surface-variant text-center">
                          Photo {i + 1}
                        </p>
                      </div>
                    </div>
                  </DraggableCardBody>
                )
              })}
            </DraggableCardContainer>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
