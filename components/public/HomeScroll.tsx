'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import HospitalCarousel from './HospitalCarousel'
import type { Hospital } from '@/types/database'

interface Props {
  hospitals: Hospital[]
  hospitalCount: number
  diaryCount: number
}

// Reduced to 12 icons — only transform:translateY (GPU composited, no repaints)
// No stethoscope (renders as broken "ROSCOPE" on some mobile fonts)
const MEDICAL_ICONS = [
  { icon: 'surgical',           top:  7, left:  5, size: 32, delay: 0.2, up: true  },
  { icon: 'ecg_heart',          top: 13, left: 86, size: 28, delay: 0.5, up: false },
  { icon: 'medication',         top: 71, left:  4, size: 26, delay: 0.8, up: true  },
  { icon: 'biotech',            top: 80, left: 89, size: 30, delay: 0.3, up: false },
  { icon: 'local_hospital',     top: 34, left: 93, size: 26, delay: 0.6, up: false },
  { icon: 'monitor_heart',      top: 19, left: 76, size: 28, delay: 0.4, up: false },
  { icon: 'science',            top: 86, left: 43, size: 24, delay: 0.9, up: true  },
  { icon: 'psychology',         top:  5, left: 53, size: 26, delay: 1.4, up: false },
  { icon: 'medical_information',top: 25, left: 13, size: 24, delay: 1.3, up: true  },
  { icon: 'cardiology',         top: 50, left: 91, size: 26, delay: 0.6, up: false },
  { icon: 'healing',            top: 39, left: 74, size: 24, delay: 1.3, up: true  },
  { icon: 'health_and_safety',  top: 60, left: 50, size: 22, delay: 1.0, up: true  },
]

function RollingNumber({ target, duration = 1800 }: { target: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) { setStarted(true); obs.unobserve(el) } },
      { threshold: 0.5 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    let startTime: number | null = null
    const step = (ts: number) => {
      if (!startTime) startTime = ts
      const p = Math.min((ts - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.floor(eased * target))
      if (p < 1) requestAnimationFrame(step)
      else setDisplay(target)
    }
    requestAnimationFrame(step)
  }, [started, target, duration])

  return <span ref={ref} className="tabular-nums">{display}</span>
}

export default function HomeScroll({ hospitals, hospitalCount, diaryCount }: Props) {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0])
  const heroY       = useTransform(scrollYProgress, [0, 0.65], [0, -60])

  return (
    <>
      <style>{`
        @keyframes hs-fade-down { from{opacity:0;filter:blur(12px);transform:translateY(-24px)} to{opacity:1;filter:blur(0);transform:translateY(0)} }
        @keyframes hs-fade-up   { from{opacity:0;filter:blur(12px);transform:translateY(24px)}  to{opacity:1;filter:blur(0);transform:translateY(0)} }
        @keyframes hs-fade-in   { from{opacity:0;filter:blur(8px);transform:translateY(12px)}   to{opacity:1;filter:blur(0);transform:translateY(0)} }
        .hs-title { animation: hs-fade-down 0.9s cubic-bezier(0.22,1,0.36,1) 0.05s both }
        .hs-badge { animation: hs-fade-in  0.7s cubic-bezier(0.22,1,0.36,1) 0.55s both }
        .hs-desc  { animation: hs-fade-up  0.9s cubic-bezier(0.22,1,0.36,1) 0.35s both }

        /* Single shared float keyframes — GPU only (transform), no filter/opacity changes */
        @keyframes float-up   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes float-down { 0%,100%{transform:translateY(0)} 50%{transform:translateY(12px)}  }

        /* Pop in once, then float — will-change limits to compositor layer */
        .med-icon {
          position: absolute;
          pointer-events: none;
          user-select: none;
          color: rgba(230,60,73,0.13);
          opacity: 0;
          will-change: transform;
          animation: hs-fade-in 0.6s cubic-bezier(0.34,1.56,0.64,1) var(--d) forwards;
        }
        .med-icon.up   { animation: hs-fade-in 0.6s cubic-bezier(0.34,1.56,0.64,1) var(--d) forwards, float-up   6s ease-in-out calc(var(--d) + 0.6s) infinite }
        .med-icon.down { animation: hs-fade-in 0.6s cubic-bezier(0.34,1.56,0.64,1) var(--d) forwards, float-down 6s ease-in-out calc(var(--d) + 0.6s) infinite }

        html { scroll-snap-type: y mandatory; scroll-behavior: smooth }
        .snap-section { scroll-snap-align: start; scroll-snap-stop: always }
      `}</style>

      <div className="bg-surface overflow-x-hidden">

        {/* Section 1 — Hero */}
        <section ref={heroRef} className="snap-section relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-primary/5 rounded-full blur-3xl opacity-60 scale-150 pointer-events-none" />

          {MEDICAL_ICONS.map((item, i) => (
            <span
              key={i}
              className={`med-icon material-symbols-outlined ${item.up ? 'up' : 'down'}`}
              style={{
                top: `${item.top}%`,
                left: `${item.left}%`,
                fontSize: item.size,
                ['--d' as string]: `${item.delay}s`,
                zIndex: 1,
              }}
            >
              {item.icon}
            </span>
          ))}

          <motion.div
            className="text-center max-w-4xl mx-auto w-full relative z-10"
            style={{ opacity: heroOpacity, y: heroY }}
          >
            <h1 className="hs-title font-headline font-extrabold text-5xl md:text-6xl lg:text-7xl leading-tight text-primary tracking-tight mb-6">
              The Elective Diaries
            </h1>
            <div className="hs-badge flex items-center justify-center space-x-2 bg-surface-container-high/50 w-fit mx-auto px-4 py-2 rounded-full border border-outline-variant/20 mb-8">
              <span className="material-symbols-outlined text-secondary" style={{ fontSize: 20 }}>account_balance</span>
              <p className="font-label text-sm font-semibold tracking-widest text-primary uppercase">
                KMC Local Council · IFMSA Pakistan
              </p>
            </div>
            <p className="hs-desc text-primary/70 font-body max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
              A precision archive documenting clinical experiences, resource availability,
              and operational protocols across affiliated medical facilities.
            </p>
          </motion.div>

          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-on-surface-variant/30 z-10"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 28 }}>keyboard_arrow_down</span>
          </motion.div>
        </section>

        {/* Section 2 — Carousel */}
        <section className="snap-section flex flex-col items-center justify-center px-4 md:px-12 lg:px-24 py-12 md:py-20 max-w-7xl mx-auto w-full">
          {hospitals.length > 0 ? (
            <div className="w-full"><HospitalCarousel hospitals={hospitals} /></div>
          ) : (
            <div className="text-center py-24 text-on-surface-variant">
              <span className="material-symbols-outlined text-6xl mb-4 block opacity-30">local_hospital</span>
              <p className="text-lg font-medium">No hospitals listed yet.</p>
            </div>
          )}
        </section>

        {/* Section 3 — Stats */}
        <section className="snap-section min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-primary/3 rounded-full blur-3xl opacity-40 scale-150 pointer-events-none" />
          <div className="max-w-4xl mx-auto w-full">
            <p className="font-label text-xs uppercase tracking-[0.25em] text-on-surface-variant/40 text-center mb-16">
              By the numbers
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
              <div className="relative bg-surface-container-low rounded-3xl p-10 border border-white/5 overflow-hidden flex flex-col items-center text-center group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <span className="material-symbols-outlined text-primary mb-6" style={{ fontSize: 40 }}>local_hospital</span>
                <div className="font-headline font-extrabold text-7xl md:text-8xl text-primary leading-none mb-4">
                  <RollingNumber target={hospitalCount} duration={1600} />
                </div>
                <p className="font-label text-sm uppercase tracking-widest text-on-surface-variant">Affiliated Hospitals</p>
                <p className="font-body text-xs text-on-surface-variant/50 mt-2">Partner facilities across Pakistan</p>
              </div>
              <div className="relative bg-surface-container-low rounded-3xl p-10 border border-white/5 overflow-hidden flex flex-col items-center text-center group">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <span className="material-symbols-outlined text-secondary mb-6" style={{ fontSize: 40 }}>auto_stories</span>
                <div className="font-headline font-extrabold text-7xl md:text-8xl text-secondary leading-none mb-4">
                  <RollingNumber target={diaryCount} duration={2000} />
                </div>
                <p className="font-label text-sm uppercase tracking-widest text-on-surface-variant">Published Diaries</p>
                <p className="font-body text-xs text-on-surface-variant/50 mt-2">Clinical elective experiences documented</p>
              </div>
            </div>
            <p className="text-center font-body text-sm text-on-surface-variant/30 italic mt-16 max-w-md mx-auto">
              "Every rotation is a chapter. Every chapter shapes a doctor."
            </p>
          </div>
        </section>

      </div>
    </>
  )
}
