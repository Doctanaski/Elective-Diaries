'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import type { Hospital, Diary } from '@/types/database'

// ── Specialty hero image map ─────────────────────────────────────────────────
// Dark, cinematic Unsplash images matched to medical specialties.
// Falls back to a generic clinical image if no match found.
const SPECIALTY_IMAGES: Record<string, string> = {
  // Cardiology / Heart
  cardiology:        'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=1600&q=80&auto=format&fit=crop',
  heart:             'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=1600&q=80&auto=format&fit=crop',
  // Neurology / Brain
  neurology:         'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=1600&q=80&auto=format&fit=crop',
  neuroscience:      'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=1600&q=80&auto=format&fit=crop',
  brain:             'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=1600&q=80&auto=format&fit=crop',
  // Surgery
  surgery:           'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=1600&q=80&auto=format&fit=crop',
  surgical:          'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=1600&q=80&auto=format&fit=crop',
  // Psychiatry / Mental health
  psychiatry:        'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1600&q=80&auto=format&fit=crop',
  psychology:        'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1600&q=80&auto=format&fit=crop',
  mental:            'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1600&q=80&auto=format&fit=crop',
  // Paediatrics / Pediatrics
  paediatrics:       'https://images.unsplash.com/photo-1581579438747-104c53d7c985?w=1600&q=80&auto=format&fit=crop',
  pediatrics:        'https://images.unsplash.com/photo-1581579438747-104c53d7c985?w=1600&q=80&auto=format&fit=crop',
  // Oncology / Cancer
  oncology:          'https://images.unsplash.com/photo-1579165466741-7f35e4755660?w=1600&q=80&auto=format&fit=crop',
  cancer:            'https://images.unsplash.com/photo-1579165466741-7f35e4755660?w=1600&q=80&auto=format&fit=crop',
  // Radiology / Imaging
  radiology:         'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1600&q=80&auto=format&fit=crop',
  imaging:           'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1600&q=80&auto=format&fit=crop',
  // Orthopaedics / Bone
  orthopaedics:      'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=1600&q=80&auto=format&fit=crop',
  orthopedics:       'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=1600&q=80&auto=format&fit=crop',
  // Dermatology
  dermatology:       'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=1600&q=80&auto=format&fit=crop',
  skin:              'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=1600&q=80&auto=format&fit=crop',
  // Emergency / A&E
  emergency:         'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=1600&q=80&auto=format&fit=crop',
  // Gynaecology / Obstetrics
  gynaecology:       'https://images.unsplash.com/photo-1576671081837-49000212a370?w=1600&q=80&auto=format&fit=crop',
  obstetrics:        'https://images.unsplash.com/photo-1576671081837-49000212a370?w=1600&q=80&auto=format&fit=crop',
  // Pathology / Lab / Research
  pathology:         'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1600&q=80&auto=format&fit=crop',
  laboratory:        'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1600&q=80&auto=format&fit=crop',
  research:          'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1600&q=80&auto=format&fit=crop',
  genetics:          'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1600&q=80&auto=format&fit=crop',
  // General medicine / Internal medicine
  medicine:          'https://images.unsplash.com/photo-1576671081837-49000212a370?w=1600&q=80&auto=format&fit=crop',
  internal:          'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1600&q=80&auto=format&fit=crop',
  general:           'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1600&q=80&auto=format&fit=crop',
  // Anaesthesia
  anaesthesia:       'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=1600&q=80&auto=format&fit=crop',
  anesthesia:        'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=1600&q=80&auto=format&fit=crop',
  // Ophthalmology
  ophthalmology:     'https://images.unsplash.com/photo-1509822929464-92b567f8c4bd?w=1600&q=80&auto=format&fit=crop',
  eye:               'https://images.unsplash.com/photo-1509822929464-92b567f8c4bd?w=1600&q=80&auto=format&fit=crop',
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1600&q=80&auto=format&fit=crop'

function getSpecialtyImage(specialtyTags: string[]): string {
  for (const tag of specialtyTags) {
    const key = tag.toLowerCase()
    // Try exact match first
    if (SPECIALTY_IMAGES[key]) return SPECIALTY_IMAGES[key]
    // Try partial match
    const match = Object.keys(SPECIALTY_IMAGES).find(k => key.includes(k) || k.includes(key))
    if (match) return SPECIALTY_IMAGES[match]
  }
  return FALLBACK_IMAGE
}

function splitHtmlIntoParagraphs(html: string): string[] {
  // Match ALL block-level elements so blockquotes, headings, lists etc. are preserved
  const paras = html.match(/<(p|h[1-6]|blockquote|ul|ol|pre|hr|figure)[\s\S]*?<\/\1>|<hr\s*\/?>/gi) ?? [html]
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
  const sentinelRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: sentinelRef, offset: ['start start', 'end start'] })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const metaOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0])
  const metaY       = useTransform(scrollYProgress, [0, 0.45], [0, 60])

  const images = diary.gallery_images ?? []
  const paras  = splitHtmlIntoParagraphs(diary.content ?? '')
  const chunks = chunkParagraphs(paras, images.length)
  const heroImageUrl = getSpecialtyImage(specialtyTags)

  return (
    <div className="bg-surface">

      {/* Fixed navbar */}
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

      {/* Sentinel + sticky hero */}
      <div ref={sentinelRef} className="relative" style={{ height: '130vh', overflow: 'hidden' }}>
        <div className="sticky top-0 h-screen w-full overflow-hidden">

          {/* Specialty background image with dark overlay */}
          <motion.div className="absolute inset-0 z-0" style={{ opacity: heroOpacity }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImageUrl}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: 'brightness(0.18) saturate(0.6)' }}
            />
            {/* Gradient overlay — dark vignette matching site palette */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[#0d0d0d]/70 to-[#0d0d0d]" />
            {/* Subtle red tint at top to tie into primary colour */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-transparent" />
          </motion.div>

          {/* Title */}
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

          {/* Metadata tiles */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 z-20 pb-8 px-4 md:px-12"
            style={{ y: metaY, opacity: metaOpacity, pointerEvents: 'none' }}
          >
            <div className="max-w-screen-xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {[
                { icon: 'person',             label: 'Curator',    value: diary.author_name,                      sub: diary.author_year ?? undefined },
                { icon: 'stethoscope',        label: 'Specialty',  value: specialtyTags[0] ?? 'General Medicine',  sub: specialtyTags.length > 1 ? `+${specialtyTags.length - 1} more` : undefined },
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

      {/* Body */}
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
                    <Image src={images[i]} alt={`${diary.title} — photo ${i + 1}`}
                      fill className="object-contain" sizes="100vw" />
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
