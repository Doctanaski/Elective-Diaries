'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import type { Hospital, Diary } from '@/types/database'

/* ─── helpers ──────────────────────────────────────────────── */

function splitHtmlIntoParagraphs(html: string): string[] {
  const paras = html.match(/<p[\s\S]*?<\/p>/gi) ?? [html]
  return paras
}

function chunkParagraphs(paras: string[], n: number): string[] {
  if (n === 0) return [paras.join('')]
  const size = Math.ceil(paras.length / (n + 1))
  const chunks: string[] = []
  for (let i = 0; i < n + 1; i++) {
    chunks.push(paras.slice(i * size, (i + 1) * size).join(''))
  }
  return chunks.filter(c => c.trim().length > 0)
}

/* ─── FadeSection ───────────────────────────────────────────── */
function FadeSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el) } },
      { threshold: 0.08 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

/* ─── MetaCard ──────────────────────────────────────────────── */
function MetaCard({ icon, label, value, sub }: {
  icon: string; label: string; value: string; sub?: string
}) {
  return (
    <div className="rounded-xl px-4 py-3.5 border flex items-start gap-3 bg-surface-container-lowest/60 border-white/8 backdrop-blur-sm">
      <span className="material-symbols-outlined mt-0.5 shrink-0 text-on-surface-variant" style={{ fontSize: 18 }}>{icon}</span>
      <div className="min-w-0">
        <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-0.5">{label}</p>
        <p className="font-headline font-semibold text-sm leading-snug truncate text-on-surface">{value}</p>
        {sub && <p className="font-label text-xs text-on-surface-variant mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

/* ─── DiaryReader ───────────────────────────────────────────── */
interface Props {
  diary: Diary
  hospital: Pick<Hospital, 'id' | 'name' | 'slug' | 'image_url'>
  publishedMonthYear: string
  specialtyTags: string[]
  skillTags: string[]
  pros: string[]
  cons: string[]
  hasAnalysis: boolean
}

export default function DiaryReader({
  diary, hospital, publishedMonthYear, specialtyTags, skillTags,
  pros, cons, hasAnalysis,
}: Props) {
  // The scroll sentinel is a tall spacer BEHIND the sticky hero.
  // We track scroll progress through that spacer so the hero knows
  // how far the user has scrolled without the hero itself moving.
  const sentinelRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sentinelRef,
    offset: ['start start', 'end start'],
  })

  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const metaOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0])
  const metaY       = useTransform(scrollYProgress, [0, 0.45], [0, 60])

  const images = diary.gallery_images ?? []
  const paras  = splitHtmlIntoParagraphs(diary.content ?? '')
  const chunks = chunkParagraphs(paras, images.length)

  return (
    <div className="bg-surface">

      {/* ── Fixed navbar ── */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-screen-xl mx-auto px-4 md:px-12 py-3 flex items-center">
          <Link
            href={`/hospitals/${hospital.slug}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl
                       bg-surface-container border border-white/10
                       text-on-surface-variant hover:text-primary font-label text-sm font-semibold
                       transition-all hover:border-primary/40"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
            <span className="hidden sm:inline">Back to {hospital.name}</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>
      </div>

      {/* ── Sentinel + sticky hero wrapper ──────────────────────────────────────
          The sentinel is 200vh tall. The sticky hero pins inside it for exactly
          one viewport height, then scrolls away naturally as the sentinel ends.
          overflow-hidden on the sentinel hard-clips anything that tries to bleed
          past the viewport boundary — meta tiles included.
      ────────────────────────────────────────────────────────────────────────── */}
      <div ref={sentinelRef} className="relative" style={{ height: '130vh', overflow: 'hidden' }}>

        {/* Sticky hero — stays pinned while sentinel scrolls under it */}
        <div className="sticky top-0 h-screen w-full overflow-hidden">

          {/* Background */}
          <motion.div className="absolute inset-0 z-0" style={{ opacity: heroOpacity }}>
            <div className="absolute inset-0 bg-gradient-to-b from-surface-container-low via-surface to-surface" />
          </motion.div>

          {/* Title — dead centre */}
          <motion.div
            className="absolute inset-0 z-10 flex items-center justify-center px-6 text-center"
            style={{ opacity: heroOpacity }}
          >
            <h1 className="font-headline font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl
                           text-white leading-tight tracking-tight max-w-4xl">
              {diary.title}
            </h1>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            className="absolute z-30 left-1/2 -translate-x-1/2"
            style={{ bottom: 'calc(36% + 12px)', opacity: metaOpacity }}
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          >
            <span className="material-symbols-outlined text-on-surface-variant opacity-50" style={{ fontSize: 28 }}>
              keyboard_arrow_down
            </span>
          </motion.div>

          {/* Metadata tiles — animate in, then fully vanish as metaOpacity → 0 */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 z-20 pb-8 px-4 md:px-12"
            style={{ y: metaY, opacity: metaOpacity, pointerEvents: 'none' }}
          >
            <div className="max-w-screen-xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {[
                { icon: 'person',             label: 'Curator',    value: diary.author_name,                    sub: diary.author_year ?? undefined },
                { icon: 'stethoscope',        label: 'Specialty',  value: specialtyTags[0] ?? 'General Medicine', sub: specialtyTags.length > 1 ? `+${specialtyTags.length - 1} more` : undefined },
                { icon: 'calendar_month',     label: 'Published',  value: publishedMonthYear },
                { icon: 'schedule',           label: 'Duration',   value: diary.elective_duration ?? '—' },
                { icon: 'supervisor_account', label: 'Supervisor', value: diary.supervisor ?? '—' },
              ].map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 24, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  <MetaCard {...card} />
                </motion.div>
              ))}

              {skillTags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 24, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-xl px-4 py-3.5 border flex items-start gap-3 bg-surface-container-lowest/60 border-white/8 backdrop-blur-sm"
                >
                  <span className="material-symbols-outlined mt-0.5 shrink-0 text-on-surface-variant" style={{ fontSize: 18 }}>psychology</span>
                  <div className="min-w-0">
                    <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {skillTags.map((tag, i) => (
                        <span key={tag} className={`px-2 py-0.5 rounded-full font-label text-[11px] border cursor-default ${
                          i === 0 ? 'bg-secondary/20 text-secondary border-secondary/30'
                          : i % 3 === 1 ? 'bg-primary/20 text-primary border-primary/30'
                          : 'bg-surface-container-highest text-on-surface border-white/5'
                        }`}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Body — prose interleaved with images ── */}
      <div className="px-4 md:px-12 lg:px-24 max-w-screen-xl mx-auto mt-6 pb-32 space-y-16">

        {chunks.map((chunk, i) => (
          <div key={i}>
            <FadeSection>
              <div className="prose-diary" dangerouslySetInnerHTML={{ __html: chunk }} />
            </FadeSection>

            {images[i] && (
              <FadeSection delay={0.1}>
                <div className="mt-12">
                  <div className="relative w-full overflow-hidden rounded-xl" style={{ height: 'clamp(280px, 45vw, 640px)' }}>
                    <Image
                      src={images[i]}
                      alt={`${diary.title} — photo ${i + 1}`}
                      fill
                      className="object-contain"
                      sizes="100vw"
                    />
                  </div>
                </div>
              </FadeSection>
            )}
          </div>
        ))}

        {hasAnalysis && (
          <FadeSection>
            <div className="pt-8 border-t border-white/5">
              <h2 className="font-headline text-xl md:text-2xl font-bold text-on-surface mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-on-surface p-2 bg-surface-container-high rounded-lg" style={{ fontSize: 20 }}>compare_arrows</span>
                Rotation Analysis
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {pros.length > 0 && (
                  <div className="bg-surface-container-low rounded-2xl p-5 md:p-6 border-t-2 border-secondary/60 border border-white/5">
                    <h3 className="font-headline text-lg font-bold text-secondary mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>thumb_up</span>Pros
                    </h3>
                    <ul className="space-y-3">
                      {pros.map((pro, i) => (
                        <li key={i} className="flex gap-3 font-body text-sm text-on-surface-variant">
                          <span className="material-symbols-outlined text-secondary shrink-0 mt-0.5" style={{ fontSize: 16 }}>check_circle</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {cons.length > 0 && (
                  <div className="bg-surface-container-lowest rounded-2xl p-5 md:p-6 border-t-2 border-primary/60 border border-white/5">
                    <h3 className="font-headline text-lg font-bold text-primary mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>warning</span>Cons
                    </h3>
                    <ul className="space-y-3">
                      {cons.map((con, i) => (
                        <li key={i} className="flex gap-3 font-body text-sm text-on-surface-variant">
                          <span className="material-symbols-outlined text-primary shrink-0 mt-0.5" style={{ fontSize: 16 }}>remove_circle</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </FadeSection>
        )}
      </div>
    </div>
  )
}
