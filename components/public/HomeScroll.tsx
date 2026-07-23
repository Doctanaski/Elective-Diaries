'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import HospitalCarousel from './HospitalCarousel'
import type { Hospital } from '@/types/database'

interface Props {
  hospitals: Hospital[]
}

const MEDICAL_ICONS = [
  { icon: 'stethoscope',         top:  8, left:  6, size: 28, delay: 0.2, dur: 6.0, up: true  },
  { icon: 'ecg_heart',           top: 15, left: 88, size: 24, delay: 0.5, dur: 7.2, up: false },
  { icon: 'medication',          top: 72, left:  4, size: 22, delay: 0.8, dur: 5.5, up: true  },
  { icon: 'biotech',             top: 80, left: 91, size: 26, delay: 0.3, dur: 6.8, up: false },
  { icon: 'emergency',           top: 40, left:  2, size: 20, delay: 1.0, dur: 7.5, up: true  },
  { icon: 'local_hospital',      top: 35, left: 94, size: 22, delay: 0.6, dur: 6.2, up: false },
  { icon: 'vaccines',            top: 60, left: 10, size: 20, delay: 1.2, dur: 8.0, up: true  },
  { icon: 'monitor_heart',       top: 20, left: 78, size: 24, delay: 0.4, dur: 6.5, up: false },
  { icon: 'science',             top: 85, left: 45, size: 20, delay: 0.9, dur: 7.0, up: true  },
  { icon: 'psychology',          top:  5, left: 55, size: 22, delay: 1.4, dur: 5.8, up: false },
  { icon: 'pill',                top: 90, left: 20, size: 18, delay: 1.1, dur: 7.8, up: false },
  { icon: 'medical_information', top: 25, left: 15, size: 20, delay: 1.3, dur: 6.6, up: true  },
  { icon: 'clinical_notes',      top: 48, left: 92, size: 20, delay: 0.6, dur: 5.9, up: false },
  { icon: 'favorite',            top: 65, left: 55, size: 18, delay: 1.5, dur: 7.3, up: true  },
  { icon: 'health_and_safety',   top: 10, left: 35, size: 22, delay: 0.8, dur: 6.1, up: false },
  { icon: 'surgical',            top: 55, left: 82, size: 18, delay: 0.7, dur: 6.3, up: true  },
]

export default function HomeScroll({ hospitals }: Props) {
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
        @keyframes float-up   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes float-down { 0%,100%{transform:translateY(0)} 50%{transform:translateY(12px)} }

        html { scroll-snap-type: y mandatory; scroll-behavior: smooth }
        .snap-section { scroll-snap-align: start; scroll-snap-stop: always }
      `}</style>

      <div className="bg-surface overflow-x-hidden">

        {/* Section 1 - Hero */}
        <section ref={heroRef} className="snap-section relative min-h-screen flex items-center justify-center px-6 overflow-hidden">

          <div className="absolute inset-0 -z-10 bg-primary/5 rounded-full blur-3xl opacity-60 scale-150 pointer-events-none" />

          {/* Scattered medical icons */}
          {MEDICAL_ICONS.map((item, i) => (
            <span
              key={i}
              className="material-symbols-outlined absolute pointer-events-none select-none"
              style={{
                top: `${item.top}%`,
                left: `${item.left}%`,
                fontSize: item.size,
                color: 'rgba(230,60,73,0.13)',
                animation: `icon-pop 0.7s cubic-bezier(0.34,1.56,0.64,1) ${item.delay}s both, ${item.up ? 'float-up' : 'float-down'} ${item.dur}s ease-in-out ${item.delay + 0.7}s infinite`,
                zIndex: 0,
              }}
            >
              {item.icon}
            </span>
          ))}

          {/* Hero content */}
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

        {/* Section 2 - Carousel */}
        <section className="snap-section flex flex-col items-center justify-center px-4 md:px-12 lg:px-24 py-12 md:py-20 max-w-7xl mx-auto w-full">
          {hospitals.length > 0 ? (
            <div className="w-full">
              <HospitalCarousel hospitals={hospitals} />
            </div>
          ) : (
            <div className="text-center py-24 text-on-surface-variant">
              <span className="material-symbols-outlined text-6xl mb-4 block opacity-30">local_hospital</span>
              <p className="text-lg font-medium">No hospitals listed yet.</p>
              <p className="text-sm mt-1">Check back soon or contact your admin.</p>
            </div>
          )}
        </section>

      </div>
    </>
  )
}
