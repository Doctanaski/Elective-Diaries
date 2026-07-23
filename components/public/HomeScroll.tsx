'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import HospitalCarousel from './HospitalCarousel'
import type { Hospital } from '@/types/database'

interface Props {
  hospitals: Hospital[]
}

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
        @keyframes hs-fade-down {
          from { opacity:0; filter:blur(12px); transform:translateY(-24px); }
          to   { opacity:1; filter:blur(0);    transform:translateY(0); }
        }
        @keyframes hs-fade-up {
          from { opacity:0; filter:blur(12px); transform:translateY(24px); }
          to   { opacity:1; filter:blur(0);    transform:translateY(0); }
        }
        @keyframes hs-fade-in {
          from { opacity:0; filter:blur(8px); transform:translateY(12px); }
          to   { opacity:1; filter:blur(0);   transform:translateY(0); }
        }
        .hs-title { animation: hs-fade-down 0.9s cubic-bezier(0.22,1,0.36,1) 0.05s both; }
        .hs-badge { animation: hs-fade-in  0.7s cubic-bezier(0.22,1,0.36,1) 0.55s both; }
        .hs-desc  { animation: hs-fade-up  0.9s cubic-bezier(0.22,1,0.36,1) 0.35s both; }

        html { scroll-snap-type: y mandatory; scroll-behavior: smooth; }
        .snap-section { scroll-snap-align: start; scroll-snap-stop: always; }
      `}</style>

      <div className="bg-surface overflow-x-hidden">

        {/* ── Section 1 — Hero ── */}
        <section
          ref={heroRef}
          className="snap-section relative min-h-screen flex items-center justify-center px-6"
        >
          <div className="absolute inset-0 -z-10 bg-primary/5 rounded-full blur-3xl opacity-60 scale-150 pointer-events-none" />

          <motion.div
            className="text-center max-w-4xl mx-auto w-full"
            style={{ opacity: heroOpacity, y: heroY }}
          >
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

            <p className="hs-desc text-primary/70 font-body max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
              A precision archive documenting clinical experiences, resource availability,
              and operational protocols across affiliated medical facilities.
            </p>
          </motion.div>

          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-on-surface-variant/30"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 28 }}>keyboard_arrow_down</span>
          </motion.div>
        </section>

        {/* ── Section 2 — Hospital carousel — always visible, no animation gate ── */}
        <section
          className="snap-section flex flex-col items-center justify-center
                     px-4 md:px-12 lg:px-24 py-12 md:py-20 max-w-7xl mx-auto w-full"
        >
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

interface Props {
  hospitals: Hospital[]
}

export default function HomeScroll({ hospitals }: Props) {
  const heroRef = useRef<HTMLDivElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const [carouselVisible, setCarouselVisible] = useState(false)

  // Hero fades + drifts up as you scroll past it
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroOpacity = useTransform(heroProgress, [0, 0.65], [1, 0])
  const heroY       = useTransform(heroProgress, [0, 0.65], [0, -60])

  // Native IntersectionObserver — fires on scroll, no click needed on mobile
  useEffect(() => {
    const el = carouselRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCarouselVisible(true)
          obs.unobserve(el)
        }
      },
      { threshold: 0.12 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <>
      <style>{`
        /* Hero CSS animations — fire immediately on paint */
        @keyframes hs-fade-down {
          from { opacity:0; filter:blur(12px); transform:translateY(-24px); }
          to   { opacity:1; filter:blur(0);    transform:translateY(0); }
        }
        @keyframes hs-fade-up {
          from { opacity:0; filter:blur(12px); transform:translateY(24px); }
          to   { opacity:1; filter:blur(0);    transform:translateY(0); }
        }
        @keyframes hs-fade-in {
          from { opacity:0; filter:blur(8px); transform:translateY(12px); }
          to   { opacity:1; filter:blur(0);   transform:translateY(0); }
        }
        .hs-title { animation: hs-fade-down 0.9s cubic-bezier(0.22,1,0.36,1) 0.05s both; }
        .hs-badge { animation: hs-fade-in  0.7s cubic-bezier(0.22,1,0.36,1) 0.55s both; }
        .hs-desc  { animation: hs-fade-up  0.9s cubic-bezier(0.22,1,0.36,1) 0.35s both; }

        /* Carousel CSS animations — triggered by JS class toggle */
        @keyframes cs-rise {
          from { opacity:0; transform:translateY(60px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .cs-animate {
          animation: cs-rise 0.8s cubic-bezier(0.22,1,0.36,1) 0.1s both;
        }

        /* Full-page snap scroll */
        html { scroll-snap-type: y mandatory; scroll-behavior: smooth; }
        .snap-section { scroll-snap-align: start; scroll-snap-stop: always; }
      `}</style>

      <div className="bg-surface overflow-x-hidden">

        {/* ── Section 1 — Hero ── */}
        <section
          ref={heroRef}
          className="snap-section relative min-h-screen flex items-center justify-center px-6"
        >
          <div className="absolute inset-0 -z-10 bg-primary/5 rounded-full blur-3xl opacity-60 scale-150 pointer-events-none" />

          <motion.div
            className="text-center max-w-4xl mx-auto w-full"
            style={{ opacity: heroOpacity, y: heroY }}
          >
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

            <p className="hs-desc text-primary/70 font-body max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
              A precision archive documenting clinical experiences, resource availability,
              and operational protocols across affiliated medical facilities.
            </p>
          </motion.div>

          {/* Bouncing scroll arrow */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-on-surface-variant/30"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 28 }}>keyboard_arrow_down</span>
          </motion.div>
        </section>

        {/* ── Section 2 — Hospital carousel ── */}
        <section
          ref={carouselRef}
          className="snap-section flex flex-col items-center justify-center
                     px-4 md:px-12 lg:px-24 py-12 md:py-20 max-w-7xl mx-auto w-full"
        >
          {hospitals.length > 0 ? (
            <div className={`w-full ${carouselVisible ? 'cs-animate' : 'opacity-0'}`}>
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
