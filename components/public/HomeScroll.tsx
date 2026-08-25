'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import HospitalCarousel from './HospitalCarousel'
import Contributors from './Contributors'
import { setNavVisibility } from '@/lib/nav-visibility'
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
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    container: containerRef,
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  // Only animate opacity — no translateY on mobile to avoid compositing cost
  const heroOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0])

  // Hide the fixed top strip once the hero has scrolled up (i.e. past the hero,
  // into the hospitals section). Reset on unmount so other pages keep it visible.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onScroll = () => {
      setNavVisibility(el.scrollTop > el.clientHeight * 0.4)
    }
    onScroll()
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', onScroll)
      setNavVisibility(false)
    }
  }, [])

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
          color:rgba(46,74,156,0.32); opacity:0; will-change:transform;
        }
        .med-icon.up   { animation: icon-in 0.5s cubic-bezier(0.22,1,0.36,1) var(--d) forwards, float-up   7s ease-in-out calc(var(--d) + 0.5s) infinite }
        .med-icon.down { animation: icon-in 0.5s cubic-bezier(0.22,1,0.36,1) var(--d) forwards, float-down 7s ease-in-out calc(var(--d) + 0.5s) infinite }

        /* ── Background: static radial gradients, no animation ── */
        .hero-bg {
          background:
            radial-gradient(ellipse 60% 50% at 15% 25%, rgba(46,74,156,0.12) 0%, transparent 100%),
            radial-gradient(ellipse 50% 60% at 85% 75%, rgba(27,44,106,0.10) 0%, transparent 100%),
            radial-gradient(ellipse 40% 40% at 50% 5%,  rgba(76,92,146,0.08) 0%, transparent 100%),
            #ffffff;
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
          background: radial-gradient(ellipse at 50% 50%, transparent 25%, rgba(46,74,156,0.18) 100%);
        }

        /* ── Snap scroll ── */
        .snap-section { scroll-snap-align: start; scroll-snap-stop: always }
      `}</style>

      {/* Self-contained snap-scroll container — mirrors the cinematic hospital viewer */}
      <div
        ref={containerRef}
        className="h-screen overflow-y-scroll scrollbar-hide overscroll-contain -mt-20 bg-surface"
        style={{ scrollSnapType: 'y mandatory' }}
      >

        {/* Section 1 — Hero */}
        <section ref={heroRef} className="snap-section relative h-screen flex items-center justify-center px-6 overflow-hidden">

          {/* Static gradient background — no animation, no CPU cost */}
          <div className="hero-bg absolute inset-0 z-0" />

          {/* Vignette */}
          <div className="hero-vignette absolute inset-0 z-0 pointer-events-none" />

          {/* ECG line — only dashoffset animates */}
          <div className="absolute inset-0 z-0 flex items-center pointer-events-none overflow-hidden" style={{ opacity: 0.5 }}>
            <svg viewBox="0 0 800 80" preserveAspectRatio="none" className="w-full" style={{ height: 80 }}>
              <defs>
                <linearGradient id="ecg-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor="rgba(46,74,156,0)" />
                  <stop offset="25%"  stopColor="rgba(46,74,156,0.9)" />
                  <stop offset="75%"  stopColor="rgba(46,74,156,0.9)" />
                  <stop offset="100%" stopColor="rgba(46,74,156,0)" />
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
              <circle className="ecg-dot" cx="590" cy="40" r="3" fill="rgba(46,74,156,1)" />
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
            className="text-center max-w-4xl mx-auto w-full relative z-10 pt-20"
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

        {/* Section 2 — Hospitals carousel */}
        <section className="snap-section relative h-screen flex flex-col items-center justify-center px-4 md:px-12 lg:px-24 py-6 md:py-10 max-w-7xl mx-auto w-full">
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
        <section className="snap-section relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-primary/3 rounded-full blur-3xl opacity-40 scale-150 pointer-events-none" />
          <div className="max-w-4xl mx-auto w-full">
            <p className="font-label text-sm font-bold uppercase tracking-[0.25em] text-on-surface text-center mb-16">
              By the numbers
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
              <div className="relative bg-primary/8 border-2 border-primary/25 rounded-3xl p-10 md:p-12 flex flex-col items-center text-center shadow-lg shadow-primary/10">
                <span className="material-symbols-outlined text-primary mb-6" style={{ fontSize: 44 }}>local_hospital</span>
                <div className="font-headline font-extrabold text-8xl md:text-9xl text-primary leading-none mb-4">
                  <RollingNumber target={hospitalCount} duration={1600} />
                </div>
                <p className="font-label text-base md:text-lg uppercase tracking-widest text-primary/90">Affiliated Hospitals</p>
                <p className="font-body text-sm md:text-base text-primary/60 mt-2">Partner facilities across Pakistan</p>
              </div>
              <div className="relative bg-primary/8 border-2 border-primary/25 rounded-3xl p-10 md:p-12 flex flex-col items-center text-center shadow-lg shadow-primary/10">
                <span className="material-symbols-outlined text-primary mb-6" style={{ fontSize: 44 }}>auto_stories</span>
                <div className="font-headline font-extrabold text-8xl md:text-9xl text-primary leading-none mb-4">
                  <RollingNumber target={diaryCount} duration={2000} />
                </div>
                <p className="font-label text-base md:text-lg uppercase tracking-widest text-primary/90">Published Diaries</p>
                <p className="font-body text-sm md:text-base text-primary/60 mt-2">Clinical elective experiences documented</p>
              </div>
            </div>
            <p className="text-center font-body text-sm text-on-surface-variant/30 italic mt-16 max-w-md mx-auto">
              "Every rotation is a chapter. Every chapter shapes a doctor."
            </p>
          </div>
        </section>

        {/* Section 4 — President's Message */}
        <section className="snap-section relative min-h-screen flex items-center justify-center px-6 md:px-12 lg:px-24 overflow-hidden">
          <div className="hero-bg absolute inset-0 z-0 opacity-60 pointer-events-none" />
          <div className="relative z-10 max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center py-16 md:py-0">
            {/* Message — left side */}
            <div className="order-1">
              <p className="font-label text-xs uppercase tracking-[0.25em] text-on-surface-variant/40 mb-4">
                Leadership
              </p>
              <h2 className="font-headline font-extrabold text-4xl md:text-5xl text-on-surface leading-tight mb-6">
                A Message from the President
              </h2>
              <div className="space-y-4 mb-8">
                <p className="font-body text-primary/80 text-lg leading-relaxed">
                  Welcome to The Elective Diaries — a living archive of the clinical journeys
                  undertaken by our students across affiliated hospitals.
                </p>
                <p className="font-body text-primary/80 text-lg leading-relaxed">
                  Every diary captures real experiences, hard-earned lessons, and the people
                  met along the way. I encourage every KMC student to explore these pages,
                  contribute their own story, and pass on the knowledge to those who follow.
                </p>
              </div>
              <div className="inline-flex items-center gap-3">
                <div className="w-12 h-px bg-primary" />
                <p className="font-headline font-bold text-primary text-lg">President, KMC Local Council</p>
              </div>
            </div>

            {/* Placeholder image — right side */}
            <div className="order-2 flex justify-center md:justify-end">
              <div className="relative">
                <img
                  src="/president-placeholder.svg"
                  alt="President placeholder"
                  className="w-64 md:w-80 rounded-3xl shadow-xl border border-outline-variant/20"
                />
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl -z-10 pointer-events-none" />
                <div className="absolute -top-5 -right-5 w-20 h-20 bg-secondary/10 rounded-full blur-2xl -z-10 pointer-events-none" />
              </div>
            </div>
          </div>
        </section>

        {/* Section 5 — Contributors */}
        <section className="snap-section relative min-h-screen flex items-center justify-center px-6 md:px-12 lg:px-24 py-16 md:py-20 overflow-hidden">
          <div className="hero-bg absolute inset-0 z-0 opacity-40 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-primary/5 to-transparent -z-0 pointer-events-none" />
          <div className="relative z-10 w-full">
            <Contributors />
          </div>
        </section>

      </div>
    </>
  )
}
