'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import HospitalCarousel from './HospitalCarousel'
import type { Hospital } from '@/types/database'

interface Props {
  hospitals: Hospital[]
}

// Random-ish but deterministic scatter positions for the shuffle-in animation
const SCATTER = [
  { x: -320, y: -180, r: -22 },
  { x:  280, y: -240, r:  18 },
  { x: -200, y:  200, r: -14 },
  { x:  350, y:  160, r:  25 },
  { x: -380, y:   60, r: -30 },
  { x:  240, y: -140, r:  12 },
  { x: -140, y:  280, r: -18 },
  { x:  300, y:  220, r:  20 },
]

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export default function HomeScroll({ hospitals }: Props) {
  const heroRef = useRef<HTMLDivElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  // Hero scrolls away
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroOpacity = useTransform(heroProgress, [0, 0.6], [1, 0])
  const heroY       = useTransform(heroProgress, [0, 0.6], [0, -60])

  // Carousel section — tracks when it enters the viewport
  const { scrollYProgress: carouselProgress } = useScroll({
    target: carouselRef,
    offset: ['start end', 'start 0.3'],
  })

  return (
    <div className="bg-surface overflow-x-hidden">

      {/* ── Hero — sticky until scrolled past ── */}
      <div
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-6"
      >
        <motion.div
          className="text-center max-w-4xl mx-auto w-full"
          style={{ opacity: heroOpacity, y: heroY }}
        >
          {/* Glow */}
          <div className="absolute inset-0 -z-10 bg-primary/5 rounded-full blur-3xl opacity-60 scale-150 pointer-events-none" />

          <style>{`
            @keyframes hero-fade-down {
              from { opacity:0; filter:blur(12px); transform:translateY(-24px); }
              to   { opacity:1; filter:blur(0px);  transform:translateY(0); }
            }
            @keyframes hero-fade-up {
              from { opacity:0; filter:blur(12px); transform:translateY(24px); }
              to   { opacity:1; filter:blur(0px);  transform:translateY(0); }
            }
            @keyframes hero-fade-in {
              from { opacity:0; filter:blur(8px); transform:translateY(12px); }
              to   { opacity:1; filter:blur(0px); transform:translateY(0); }
            }
            .hs-title { animation: hero-fade-down 0.9s cubic-bezier(0.22,1,0.36,1) 0.05s both; }
            .hs-badge { animation: hero-fade-in  0.7s cubic-bezier(0.22,1,0.36,1) 0.55s both; }
            .hs-desc  { animation: hero-fade-up  0.9s cubic-bezier(0.22,1,0.36,1) 0.35s both; }
            .hs-hint  { animation: hero-fade-in  0.6s cubic-bezier(0.22,1,0.36,1) 1.0s  both; }
          `}</style>

          <h1 className="hs-title font-headline font-extrabold text-5xl md:text-6xl lg:text-7xl
                         leading-tight text-primary tracking-tight mb-6">
            The Elective Diaries
          </h1>

          <div className="hs-badge flex items-center justify-center space-x-2
                          bg-surface-container-high/50 w-fit mx-auto px-4 py-2
                          rounded-full border border-outline-variant/20 mb-8">
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: 20 }}>account_balance</span>
            <p className="font-label text-sm font-semibold tracking-widest text-primary uppercase">
              KMC Local Council · IFMSA Pakistan
            </p>
          </div>

          <p className="hs-desc text-primary/70 font-body max-w-2xl mx-auto text-lg md:text-xl leading-relaxed mb-12">
            A precision archive documenting clinical experiences, resource availability,
            and operational protocols across affiliated medical facilities.
          </p>

          {/* Scroll hint */}
          <div className="hs-hint flex flex-col items-center gap-2 text-on-surface-variant/40">
            <span className="font-label text-xs uppercase tracking-widest">Scroll to explore</span>
            <motion.span
              className="material-symbols-outlined"
              style={{ fontSize: 24 }}
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            >
              keyboard_arrow_down
            </motion.span>
          </div>
        </motion.div>
      </div>

      {/* ── Hospital carousel — shuffles in on scroll ── */}
      <div
        ref={carouselRef}
        className="min-h-screen flex flex-col items-center justify-center
                   px-6 md:px-12 lg:px-24 pb-32 max-w-7xl mx-auto"
      >
        {/* Section label */}
        <FadeIn>
          <p className="font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant/50 mb-10 text-center">
            Affiliated Facilities
          </p>
        </FadeIn>

        {/* Cards animate in from scattered positions */}
        {hospitals.length > 0 ? (
          <div className="w-full relative">
            {/* Invisible sentinel cards that animate from scatter → final position */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden>
              {hospitals.slice(0, 8).map((h, i) => {
                const s = SCATTER[i % SCATTER.length]
                return (
                  <motion.div
                    key={h.id}
                    className="absolute top-1/2 left-1/2 w-24 h-32 rounded-xl overflow-hidden
                               border border-white/10 shadow-xl opacity-0"
                    initial={{ x: s.x, y: s.y + '-50%', rotate: s.r, opacity: 0, scale: 0.7 }}
                    whileInView={{ x: 0, y: '-50%', rotate: 0, opacity: 0, scale: 1 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  />
                )
              })}
            </div>

            {/* Actual carousel — fades + rises in after scatter */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <HospitalCarousel hospitals={hospitals} />
            </motion.div>
          </div>
        ) : (
          <FadeIn>
            <div className="text-center py-24 text-on-surface-variant">
              <span className="material-symbols-outlined text-6xl mb-4 block opacity-30">local_hospital</span>
              <p className="text-lg font-medium">No hospitals listed yet.</p>
              <p className="text-sm mt-1">Check back soon or contact your admin.</p>
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  )
}
