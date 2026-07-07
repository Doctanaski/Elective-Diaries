'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import BlurText from '@/components/ui/BlurText'

export default function HomeHero() {
  // Drive all animations from a mounted flag so they always fire
  // after the first client render, regardless of hydration timing.
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // rAF ensures we're past the first paint before starting
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <header className="text-center mb-24 relative max-w-4xl mx-auto">
      <div className="absolute inset-0 -z-10 bg-primary/5 rounded-full blur-3xl opacity-70 w-full h-full transform scale-150 pointer-events-none" />

      {/* Title */}
      <BlurText
        text="The Elective Diaries"
        delay={120}
        animateBy="words"
        direction="top"
        stepDuration={0.5}
        className="font-headline font-extrabold text-5xl md:text-6xl leading-tight text-primary tracking-tight mb-6 justify-center"
      />

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
        animate={mounted
          ? { opacity: 1, y: 0, filter: 'blur(0px)' }
          : { opacity: 0, y: 16, filter: 'blur(8px)' }
        }
        transition={{ duration: 0.6, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center justify-center space-x-2 bg-surface-container-high/50 w-fit mx-auto px-4 py-2 rounded-full border border-outline-variant/20"
      >
        <span className="material-symbols-outlined text-secondary" style={{ fontSize: 20 }}>account_balance</span>
        <p className="font-label text-sm font-semibold tracking-widest text-primary uppercase">
          KMC Local Council · IFMSA Pakistan
        </p>
      </motion.div>

      {/* Description */}
      <BlurText
        text="A precision archive documenting clinical experiences, resource availability, and operational protocols across affiliated medical facilities."
        delay={40}
        animateBy="words"
        direction="bottom"
        stepDuration={0.4}
        className="mt-8 text-primary font-body max-w-2xl mx-auto text-lg md:text-xl leading-relaxed justify-center"
      />
    </header>
  )
}
