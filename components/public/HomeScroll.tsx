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

const MEDICAL_ICONS = [
  { icon: 'stethoscope',         top:  6, left:  4, size: 36, delay: 0.2, dur: 6.0, up: true  },
  { icon: 'ecg_heart',           top: 12, left: 87, size: 32, delay: 0.5, dur: 7.2, up: false },
  { icon: 'medication',          top: 70, left:  3, size: 30, delay: 0.8, dur: 5.5, up: true  },
  { icon: 'biotech',             top: 80, left: 90, size: 34, delay: 0.3, dur: 6.8, up: false },
  { icon: 'emergency',           top: 42, left:  1, size: 28, delay: 1.0, dur: 7.5, up: true  },
  { icon: 'local_hospital',      top: 33, left: 94, size: 30, delay: 0.6, dur: 6.2, up: false },
  { icon: 'vaccines',            top: 60, left:  8, size: 28, delay: 1.2, dur: 8.0, up: true  },
  { icon: 'monitor_heart',       top: 18, left: 77, size: 32, delay: 0.4, dur: 6.5, up: false },
  { icon: 'science',             top: 87, left: 44, size: 28, delay: 0.9, dur: 7.0, up: true  },
  { icon: 'psychology',          top:  4, left: 54, size: 30, delay: 1.4, dur: 5.8, up: false },
  { icon: 'pill',                top: 91, left: 18, size: 26, delay: 1.1, dur: 7.8, up: false },
  { icon: 'medical_information', top: 24, left: 14, size: 28, delay: 1.3, dur: 6.6, up: true  },
  { icon: 'clinical_notes',      top: 50, left: 93, size: 28, delay: 0.6, dur: 5.9, up: false },
  { icon: 'favorite',            top: 67, left: 54, size: 26, delay: 1.5, dur: 7.3, up: true  },
  { icon: 'health_and_safety',   top:  9, left: 34, size: 30, delay: 0.8, dur: 6.1, up: false },
  { icon: 'cardiology',          top: 30, left: 50, size: 34, delay: 1.6, dur: 7.1, up: false },
  { icon: 'ecg',                 top: 78, left: 68, size: 28, delay: 0.4, dur: 6.4, up: true  },
  { icon: 'orthopedics',         top: 15, left: 62, size: 26, delay: 1.7, dur: 7.6, up: false },
  { icon: 'radiology',           top: 48, left: 22, size: 28, delay: 1.0, dur: 5.7, up: true  },
  { icon: 'genetics',            top: 84, left: 32, size: 26, delay: 0.9, dur: 6.9, up: false },
  { icon: 'microscope',          top: 22, left:  3, size: 30, delay: 1.8, dur: 7.4, up: true  },
  { icon: 'thermometer',         top: 62, left: 44, size: 26, delay: 0.5, dur: 6.7, up: false },
  { icon: 'healing',             top: 38, left: 75, size: 28, delay: 1.3, dur: 5.6, up: true  },
]

// Rolling counter — counts up from 0 to target when visible
function RollingNumber({ target, duration = 1800, suffix = '' }: { target: number; duration?: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
          obs.unobserve(el)
        }
      },
      { threshold: 0.5 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    let startTime: number | null = null
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
      else setDisplay(target)
    }
    requestAnimationFrame(step)
  }, [started, target, duration])

  return (
    <span ref={ref} className="tabular-nums">
      {display}{suffix}
    </span>
  )
}

export default function HomeScroll({ hospitals, hospitalCount, diaryCount }: Props) {
  const heroRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroOpacity = useTransform(heroProgress, [0, 0.65], [1, 0])
  const heroY       = useTransform(heroProgress, [0, 0.65], [0, -60])

  return (
    <>
      <style>{`
        @keyframes hs-fade-down { from{opacity:0;filter:blur(12px);transform:translateY(-24px)} to{opacity:1;filter:blur(0);transform:translateY(0)} }
        @keyframes hs-fade-up   { from{opacity:0;filter:blur(12px);transform:translateY(24px)}  to{opacity:1;filter:blur(0);transform:translateY(0)} }
        @keyframes hs-fade-in   { from{opacity:0;filter:blur(8px);transform:translateY(12px)}   to{opacity:1;filter:blur(0);transform:translateY(0)} }
        .hs-title { animation: hs-fade-down 0.9s cubic-bezier(0.22,1,0.36,1) 0.05s both }
        .hs-badge { animation: hs-fade-in  0.7s cubic-bezier(0.22,1,0.36,1) 0.55s both }
        .hs-desc  { animation: hs-fade-up  0.9s cubic-bezier(0.22,1,0.36,1) 0.35s both }

        @keyframes icon-pop {
          0%  { opacity:0; transform:scale(0.3) rotate(-20deg); filter:blur(6px) }
          65% { opacity:1; transform:scale(1.12) rotate(4deg);  filter:blur(0) }
          100%{ opacity:1; transform:scale(1) rotate(0deg);     filter:blur(0) }
        }
        @keyframes float-up   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes float-down { 0%,100%{transform:translateY(0)} 50%{transform:translateY(14px)} }

        html { scroll-snap-type: y mandatory; scroll-behavior: smooth }
        .snap-section { scroll-snap-align: start; scroll-snap-stop: always }
      `}</style>

      <div className="bg-surface overflow-x-hidden">

        {/* ── Section 1 — Hero ── */}
        <section ref={heroRef} className="snap-section relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-primary/5 rounded-full blur-3xl opacity-60 scale-150 pointer-events-none" />

          {MEDICAL_ICONS.map((item, i) => (
            <span
              key={i}
              className="material-symbols-outlined absolute pointer-events-none select-none"
              style={{
                top: `${item.top}%`, left: `${item.left}%`,
                fontSize: item.size,
                color: 'rgba(230,60,73,0.14)',
                animation: `icon-pop 0.7s cubic-bezier(0.34,1.56,0.64,1) ${item.delay}s both, ${item.up ? 'float-up' : 'float-down'} ${item.dur}s ease-in-out ${item.delay + 0.7}s infinite`,
                zIndex: 1,
              }}
            >{item.icon}</span>
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

        {/* ── Section 2 — Hospital carousel ── */}
        <section className="snap-section flex flex-col items-center justify-center px-4 md:px-12 lg:px-24 py-12 md:py-20 max-w-7xl mx-auto w-full">
          {hospitals.length > 0 ? (
            <div className="w-full">
              <HospitalCarousel hospitals={hospitals} />
            </div>
          ) : (
            <div className="text-center py-24 text-on-surface-variant">
              <span className="material-symbols-outlined text-6xl mb-4 block opacity-30">local_hospital</span>
              <p className="text-lg font-medium">No hospitals listed yet.</p>
            </div>
          )}
        </section>

        {/* ── Section 3 — Stats ── */}
        <section className="snap-section min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute inset-0 -z-10 bg-primary/3 rounded-full blur-3xl opacity-40 scale-150 pointer-events-none" />

          <div className="max-w-4xl mx-auto w-full">
            {/* Section label */}
            <p className="font-label text-xs uppercase tracking-[0.25em] text-on-surface-variant/40 text-center mb-16">
              By the numbers
            </p>

            {/* Stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">

              {/* Hospitals */}
              <div className="relative bg-surface-container-low rounded-3xl p-10 border border-white/5 overflow-hidden flex flex-col items-center text-center group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <span className="material-symbols-outlined text-primary mb-6" style={{ fontSize: 40 }}>local_hospital</span>
                <div className="font-headline font-extrabold text-7xl md:text-8xl text-primary leading-none mb-4">
                  <RollingNumber target={hospitalCount} duration={1600} />
                </div>
                <p className="font-label text-sm uppercase tracking-widest text-on-surface-variant">
                  Affiliated Hospitals
                </p>
                <p className="font-body text-xs text-on-surface-variant/50 mt-2">
                  Partner facilities across Pakistan
                </p>
              </div>

              {/* Diaries */}
              <div className="relative bg-surface-container-low rounded-3xl p-10 border border-white/5 overflow-hidden flex flex-col items-center text-center group">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <span className="material-symbols-outlined text-secondary mb-6" style={{ fontSize: 40 }}>auto_stories</span>
                <div className="font-headline font-extrabold text-7xl md:text-8xl text-secondary leading-none mb-4">
                  <RollingNumber target={diaryCount} duration={2000} />
                </div>
                <p className="font-label text-sm uppercase tracking-widest text-on-surface-variant">
                  Published Diaries
                </p>
                <p className="font-body text-xs text-on-surface-variant/50 mt-2">
                  Clinical elective experiences documented
                </p>
              </div>

            </div>

            {/* Divider quote */}
            <p className="text-center font-body text-sm text-on-surface-variant/30 italic mt-16 max-w-md mx-auto">
              "Every rotation is a chapter. Every chapter shapes a doctor."
            </p>
          </div>
        </section>

      </div>
    </>
  )
}
