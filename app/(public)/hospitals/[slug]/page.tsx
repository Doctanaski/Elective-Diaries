import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { Hospital, Diary } from '@/types/database'

export const revalidate = 300

type Props = { params: { slug: string } }

export async function generateStaticParams() {
  const supabase = createStaticClient()
  const { data } = await supabase.from('hospitals').select('slug')
  return ((data ?? []) as { slug: string }[]).map((h) => ({ slug: h.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()
  const { data } = await supabase
    .from('hospitals')
    .select('name, description')
    .eq('slug', params.slug)
    .single()
  const hospital = data as { name: string; description: string | null } | null
  return {
    title: hospital ? `${hospital.name} — The Elective Diaries` : 'Hospital',
    description: hospital?.description ?? undefined,
  }
}

export default async function HospitalPage({ params }: Props) {
  const supabase = createClient()

  const { data: hospitalRaw } = await supabase
    .from('hospitals')
    .select('*')
    .eq('slug', params.slug)
    .single()

  const hospital = hospitalRaw as Hospital | null
  if (!hospital) notFound()

  const { data: diariesRaw } = await supabase
    .from('diaries')
    .select('*')
    .eq('hospital_id', hospital.id)
    .eq('published', true)
    .order('created_at', { ascending: false })

  const diaries = (diariesRaw ?? []) as Diary[]

  return (
    <>
      {/* Back button — fixed overlay */}
      <Link
        href="/"
        className="fixed top-6 left-6 z-50 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl
                   bg-surface-container-lowest/80 backdrop-blur-md border border-outline-variant/20
                   text-on-surface-variant hover:text-primary text-sm font-label font-semibold
                   transition-all hover:border-primary/40 shadow-lg"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
        All Hospitals
      </Link>

      {diaries.length === 0 ? (
        /* Empty state */
        <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-32 pb-24">
          {hospital.image_url && (
            <div className="absolute inset-0 -z-10">
              <Image src={hospital.image_url} alt={hospital.name} fill className="object-cover opacity-10" sizes="100vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/90 to-surface/60" />
            </div>
          )}
          <h1 className="font-headline font-extrabold text-4xl md:text-5xl text-primary mb-3 text-center">{hospital.name}</h1>
          {hospital.description && (
            <p className="text-on-surface-variant text-lg max-w-xl text-center mb-12">{hospital.description}</p>
          )}
          <div className="bg-surface-container rounded-2xl border border-outline-variant/20 px-12 py-16 text-center">
            <span className="material-symbols-outlined text-5xl mb-4 block text-outline opacity-40">description</span>
            <p className="text-lg font-medium text-on-surface">No diaries published yet.</p>
            <p className="text-sm mt-1 text-on-surface-variant">Check back soon.</p>
          </div>
        </div>
      ) : (
        /* Scroll-snap diary viewer — scrollbar hidden */
        <div
          className="h-screen overflow-y-scroll scrollbar-hide"
          style={{ scrollSnapType: 'y mandatory' }}
        >
          {diaries.map((diary, index) => (
            <DiarySlide
              key={diary.id}
              diary={diary}
              hospitalName={hospital.name}
              hospitalSlug={params.slug}
              index={index}
              total={diaries.length}
            />
          ))}
        </div>
      )}
    </>
  )
}

/* ─────────────────────────────────────────────────────────────
   Specialty → Material Symbol icon mapping
───────────────────────────────────────────────────────────── */
function getSpecialtyIcon(specialty: string): string {
  const s = specialty.toLowerCase()
  if (s.includes('cardio'))                                       return 'monitor_heart'
  if (s.includes('neuro') || s.includes('brain'))                return 'neurology'
  if (s.includes('surg'))                                         return 'surgical'
  if (s.includes('paed') || s.includes('pedi'))                  return 'child_care'
  if (s.includes('ortho') || s.includes('bone'))                 return 'orthopedics'
  if (s.includes('ophthal') || s.includes('eye'))                return 'ophthalmology'
  if (s.includes('derma') || s.includes('skin'))                 return 'dermatology'
  if (s.includes('gyn') || s.includes('obstet'))                 return 'obstetrics'
  if (s.includes('oncol') || s.includes('cancer'))               return 'oncology'
  if (s.includes('psych') || s.includes('mental'))               return 'psychiatry'
  if (s.includes('radio') || s.includes('imaging'))              return 'radiology'
  if (s.includes('ent') || s.includes('ear'))                    return 'hearing'
  if (s.includes('urol'))                                         return 'urology'
  if (s.includes('nephro') || s.includes('renal'))               return 'nephrology'
  if (s.includes('gastro') || s.includes('gi'))                  return 'gastroenterology'
  if (s.includes('pulmo') || s.includes('respir') || s.includes('lung')) return 'pulmonology'
  if (s.includes('endocrin') || s.includes('diabet'))            return 'endocrinology'
  if (s.includes('haem') || s.includes('hema') || s.includes('blood'))   return 'hematology'
  if (s.includes('anae') || s.includes('anest'))                 return 'anesthesiology'
  if (s.includes('emerg') || s.includes('a&e'))                  return 'emergency'
  if (s.includes('icu') || s.includes('critical') || s.includes('intensive')) return 'ecg_heart'
  if (s.includes('path'))                                         return 'biotech'
  if (s.includes('rheum'))                                        return 'rheumatology'
  if (s.includes('infect'))                                       return 'microbiology'
  return 'stethoscope'
}

/* DiarySlide — one full-screen entry in the scroll-snap viewer */
function DiarySlide({
  diary, hospitalName, hospitalSlug, index, total,
}: {
  diary: Diary; hospitalName: string; hospitalSlug: string; index: number; total: number
}) {
  const isEven = index % 2 === 0

  return (
    <section
      className="relative flex items-center justify-center overflow-hidden"
      style={{ scrollSnapAlign: 'start', height: '100vh' }}
    >
      {/* Background — desktop only */}
      <div className="hidden md:block absolute inset-0 z-0">
        {diary.cover_image_url ? (
          <Image src={diary.cover_image_url} alt={diary.title} fill className="object-cover opacity-30" sizes="100vw" priority={index === 0} />
        ) : (
          <div className="absolute inset-0 bg-surface-container-high" />
        )}
        {isEven
          ? <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent" />
          : <div className="absolute inset-0 bg-gradient-to-b from-surface via-surface/90 to-surface" />
        }
      </div>

      {/* ── MOBILE layout (< md) ── */}
      <div className="md:hidden relative z-10 w-full h-full flex flex-col">
        {/* Top half: cover image */}
        <div className="relative w-full flex-shrink-0" style={{ height: '45vh' }}>
          {diary.cover_image_url ? (
            <Image
              src={diary.cover_image_url}
              alt={diary.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority={index === 0}
            />
          ) : (
            <div className="absolute inset-0 bg-surface-container-high flex items-center justify-center">
              <span className="material-symbols-outlined text-outline opacity-20" style={{ fontSize: 64 }}>description</span>
            </div>
          )}
          {/* Fade bottom into content area */}
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
        </div>

        {/* Bottom half: text content */}
        <div className="flex-1 overflow-y-auto px-6 pb-20 pt-4 space-y-4 bg-surface">
          {/* Hospital badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container border border-outline-variant/30 text-on-surface-variant font-label text-xs uppercase tracking-widest">
            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>local_hospital</span>
            {hospitalName}
          </div>

          {/* Author name */}
          <h2 className="font-headline text-4xl font-extrabold text-on-surface leading-tight">
            {diary.author_name.split(' ')[0]}
            <br />
            <span className="text-primary">{diary.author_name.split(' ').slice(1).join(' ')}</span>
          </h2>

          {/* Specialty strip */}
          {diary.specialty && (
            <div className="flex items-center gap-3 py-3 pl-4 pr-3 border-l-4 border-primary bg-surface-container-lowest rounded-r-xl">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: 22 }}>{getSpecialtyIcon(diary.specialty)}</span>
              <div>
                <p className="font-label text-xs text-on-surface-variant uppercase tracking-wider">Department</p>
                <p className="font-headline text-base text-on-surface font-semibold">{diary.specialty}</p>
              </div>
            </div>
          )}

          {/* Year + date */}
          <p className="font-label text-sm text-on-surface-variant">
            {diary.author_year}
            {diary.created_at && (
              <span className="ml-2 opacity-60">· {new Date(diary.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            )}
          </p>

          {/* Excerpt */}
          {diary.excerpt && (
            <p className="font-body text-on-surface-variant text-sm leading-relaxed line-clamp-4">{diary.excerpt}</p>
          )}

          {/* CTA */}
          <Link
            href={`/hospitals/${hospitalSlug}/diaries/${diary.id}`}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-on-primary font-headline font-semibold text-sm hover:opacity-90 transition-all group w-full justify-center"
          >
            <span>Read Diary</span>
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform" style={{ fontSize: 18 }}>arrow_forward</span>
          </Link>
        </div>
      </div>

      {/* ── DESKTOP layout (md+) ── */}
      <div className={`hidden md:flex relative z-10 w-full max-w-5xl px-12 items-center justify-between gap-12 ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Text column */}
        <div className="flex-1 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container border border-outline-variant/30 text-on-surface-variant font-label text-xs uppercase tracking-widest">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>local_hospital</span>
            {hospitalName}
          </div>

          <h2 className="font-headline text-5xl md:text-6xl font-extrabold text-on-surface leading-tight">
            {diary.author_name.split(' ')[0]}
            <br />
            <span className="text-primary">{diary.author_name.split(' ').slice(1).join(' ')}</span>
          </h2>

          {diary.specialty && (
            <div className="flex items-center gap-4 py-4 pl-6 pr-4 border-l-4 border-primary bg-surface-container-lowest/60 backdrop-blur-md rounded-r-xl">
              <span className="material-symbols-outlined text-primary text-2xl">{getSpecialtyIcon(diary.specialty)}</span>
              <div>
                <p className="font-label text-xs text-on-surface-variant uppercase tracking-wider">Department</p>
                <p className="font-headline text-lg text-on-surface font-semibold">{diary.specialty}</p>
              </div>
            </div>
          )}

          <p className="font-label text-sm text-on-surface-variant">
            {diary.author_year}
            {diary.created_at && (
              <span className="ml-3 opacity-60">· {new Date(diary.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            )}
          </p>

          {diary.excerpt && (
            <p className="font-body text-on-surface-variant text-base max-w-md leading-relaxed line-clamp-3">{diary.excerpt}</p>
          )}

          <Link
            href={`/hospitals/${hospitalSlug}/diaries/${diary.id}`}
            className="mt-4 inline-flex items-center gap-3 px-7 py-4 rounded-xl bg-primary text-on-primary font-headline font-semibold text-sm hover:opacity-90 hover:shadow-[0_0_24px_rgba(181,36,52,0.35)] transition-all group"
          >
            <span>Read Diary</span>
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform" style={{ fontSize: 18 }}>arrow_forward</span>
          </Link>
        </div>

        {/* Cover image column */}
        <div className="w-full max-w-xs relative flex-shrink-0">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden relative shadow-[0_0_40px_rgba(0,0,0,0.6)] border border-outline-variant/20">
            {diary.cover_image_url ? (
              <Image src={diary.cover_image_url} alt={diary.title} fill className="object-cover" sizes="320px" />
            ) : (
              <div className="absolute inset-0 bg-surface-container-high flex items-center justify-center">
                <span className="material-symbols-outlined text-outline opacity-30" style={{ fontSize: 48 }}>description</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-surface/70 via-transparent to-transparent" />
          </div>
          <div className={`absolute -bottom-6 ${isEven ? '-right-6' : '-left-6'} w-28 h-28 bg-primary/10 rounded-full blur-2xl`} />
        </div>
      </div>

      {/* Entry counter — desktop only */}
      <div className="hidden md:block absolute top-6 right-6 z-20 font-label text-xs text-on-surface-variant bg-surface-container-lowest/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-outline-variant/20">
        {index + 1} / {total}
      </div>

      {/* Scroll indicator — desktop only */}
      {index < total - 1 && (
        <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex-col items-center gap-1 opacity-50 hover:opacity-100 transition-opacity cursor-pointer select-none">
          <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Next Entry</span>
          <span className="material-symbols-outlined text-primary animate-bounce">keyboard_arrow_down</span>
        </div>
      )}

      {index === total - 1 && (
        <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
          <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">All caught up</span>
          <Link href="/" className="inline-flex items-center gap-1.5 text-primary font-label text-xs font-semibold hover:underline">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_back</span>
            Back to Hospitals
          </Link>
        </div>
      )}
    </section>
  )
}
