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

const ECG_PATH = `M0,40 L60,40 L80,10 L90,70 L100,20 L110,50 L120,40 L180,40 L200,10 L210,70 L220,20 L230,50 L240,40 L300,40 L320,10 L330,70 L340,20 L350,50 L360,40 L420,40 L440,10 L450,70 L460,20 L470,50 L480,40 L540,40 L560,10 L570,70 L580,20 L590,50 L600,40 L660,40 L680,10 L690,70 L700,20 L710,50 L720,40 L800,40`

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
    let t: number | null = null
    const step = (ts: number) => {
      if (!t) t = ts
      const p = Math.min((ts - t) / duration, 1)
      setDisplay(Math.floor((1 - Math.pow(1 - p, 3)) * target))
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
  // Only animate opacity — no translateY on mobile to avoid compositing cost
  const heroOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0])

  return (
    <>
      <style>{`
        /* ── Hero text: opacity + transform only (no filter = no CPU repaint) ── */
        @keyframes hs-down { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes hs-up   { from{opacity:0;transform:translateY(20px)}  to{opacity:1;transform:translateY(0)} }
        @keyframes hs-in   { from{opacity:0;transform:translateY(10px)}  to{opacity:1;transform:translateY(0)} }
        .hs-title { animation: hs-down 0.8s cubic-bezier(0.22,1,0.36,1) 0.05s both }
        .hs-badge { animation: hs-in   0.7s cubic-bezier(0.22,1,0.36,1) 0.5s  both }
        .hs-desc  { animation: hs-up   0.8s cubic-bezier(0.22,1,0.36,1) 0.3s  both }

        /* ── Icons: opacity + transform only, no filter ── */
        @keyframes icon-in    { from{opacity:0;transform:scale(0.5)} to{opacity:1;transform:scale(1)} }
        @keyframes float-up   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes float-down { 0%,100%{transform:translateY(0)} 50%{transform:translateY(10px)}  }
        .med-icon {
          position:absolute; pointer-events:none; user-select:none;
          color:rgba(230,60,73,0.13); opacity:0; will-change:transform;
        }
        .med-icon.up   { animation: icon-in 0.5s cubic-bezier(0.22,1,0.36,1) var(--d) forwards, float-up   7s ease-in-out calc(var(--d) + 0.5s) infinite }
        .med-icon.down { animation: icon-in 0.5s cubic-bezier(0.22,1,0.36,1) var(--d) forwards, float-down 7s ease-in-out calc(var(--d) + 0.5s) infinite }

        /* ── Background: static radial gradients, no animation ── */
        .hero-bg {
          background:
            radial-gradient(ellipse 60% 50% at 15% 25%, rgba(160,15,25,0.22) 0%, transparent 100%),
            radial-gradient(ellipse 50% 60% at 85% 75%, rgba(100,8,16,0.18) 0%, transparent 100%),
            radial-gradient(ellipse 40% 40% at 50% 5%,  rgba(180,20,30,0.12) 0%, transparent 100%),
            #0d0d0d;
        }

        /* ── ECG: only stroke-dashoffset animates (GPU composited in modern browsers) ── */
        @keyframes ecg-scroll { to { stroke-dashoffset: -800 } }
        @keyframes ecg-dot-x  { to { transform: translateX(-800px) } }
        .ecg-line {
          stroke-dasharray: 800;
          stroke-dashoffset: 0;
          will-change: stroke-dashoffset;
          animation: ecg-scroll 3s linear infinite;
        }
        .ecg-dot {
          will-change: transform;
          animation: ecg-dot-x 3s linear infinite;
        }

        /* ── Vignette ── */
        .hero-vignette {
          background: radial-gradient(ellipse at 50% 50%, transparent 25%, rgba(13,13,13,0.8) 100%);
        }

        html { scroll-snap-type: y mandatory; scroll-behavior: smooth }
        .snap-section { scroll-snap-align: start; scroll-snap-stop: always }
      `}</style>

      <div className="bg-surface overflow-x-hidden">

        {/* Section 1 — Hero */}
        <section ref={heroRef} className="snap-section relative min-h-screen flex items-center justify-center px-6 overflow-hidden">

          {/* Static gradient background — no animation, no CPU cost */}
          <div className="hero-bg absolute inset-0 z-0" />

          {/* Vignette */}
          <div className="hero-vignette absolute inset-0 z-0 pointer-events-none" />

          {/* ECG line — only dashoffset animates */}
          <div className="absolute inset-0 z-0 flex items-center pointer-events-none overflow-hidden" style={{ opacity: 0.2 }}>
            <svg viewBox="0 0 800 80" preserveAspectRatio="none" className="w-full" style={{ height: 80 }}>
              <defs>
                <linearGradient id="ecg-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor="rgba(230,60,73,0)" />
                  <stop offset="25%"  stopColor="rgba(230,60,73,0.85)" />
                  <stop offset="75%"  stopColor="rgba(230,60,73,0.85)" />
                  <stop offset="100%" stopColor="rgba(230,60,73,0)" />
                </linearGradient>
              </defs>
              <path
                className="ecg-line"
                d={ECG_PATH}
                fill="none"
                stroke="url(#ecg-grad)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Dot — no drop-shadow filter */}
              <circle className="ecg-dot" cx="590" cy="40" r="3" fill="rgba(230,60,73,1)" />
            </svg>
          </div>

          {/* Medical icons */}
          {MEDICAL_ICONS.map((item, i) => (
            <span
              key={i}
              className={`med-icon material-symbols-outlined ${item.up ? 'up' : 'down'}`}
              style={{
                top: `${item.top}%`, left: `${item.left}%`,
                fontSize: item.size,
                ['--d' as string]: `${item.delay}s`,
                zIndex: 1,
              }}
            >{item.icon}</span>
          ))}

          {/* Hero text — only opacity fades on scroll, no y transform */}
          <motion.div
            className="text-center max-w-4xl mx-auto w-full relative z-10"
            style={{ opacity: heroOpacity }}
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
              <div className="relative bg-surface-container-low rounded-3xl p-10 border border-white/5 flex flex-col items-center text-center">
                <span className="material-symbols-outlined text-primary mb-6" style={{ fontSize: 40 }}>local_hospital</span>
                <div className="font-headline font-extrabold text-7xl md:text-8xl text-primary leading-none mb-4">
                  <RollingNumber target={hospitalCount} duration={1600} />
                </div>
                <p className="font-label text-sm uppercase tracking-widest text-on-surface-variant">Affiliated Hospitals</p>
                <p className="font-body text-xs text-on-surface-variant/50 mt-2">Partner facilities across Pakistan</p>
              </div>
              <div className="relative bg-surface-container-low rounded-3xl p-10 border border-white/5 flex flex-col items-center text-center">
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
