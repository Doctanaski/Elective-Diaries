import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { Hospital, Diary } from '@/types/database'

export const revalidate = 3600
type Props = { params: { slug: string; id: string } }

export async function generateStaticParams() {
  const supabase = createStaticClient()
  const { data: hospitals } = await supabase.from('hospitals').select('id, slug')
  const { data: diaries } = await supabase.from('diaries').select('id, hospital_id').eq('published', true)
  const hospitalMap = new Map(((hospitals ?? []) as { id: string; slug: string }[]).map(h => [h.id, h.slug]))
  return ((diaries ?? []) as { id: string; hospital_id: string }[])
    .filter(d => hospitalMap.has(d.hospital_id))
    .map(d => ({ slug: hospitalMap.get(d.hospital_id)!, id: d.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()
  const { data } = await supabase.from('diaries').select('title, excerpt').eq('id', params.id).single()
  const diary = data as { title: string; excerpt: string | null } | null
  return {
    title: diary ? `${diary.title} — The Elective Diaries` : 'Diary',
    description: diary?.excerpt ?? undefined,
  }
}

export default async function DiaryPage({ params }: Props) {
  const supabase = createClient()
  const { data: hospitalRaw } = await supabase.from('hospitals').select('id, name, slug, image_url').eq('slug', params.slug).single()
  const hospital = hospitalRaw as Pick<Hospital, 'id' | 'name' | 'slug' | 'image_url'> | null
  if (!hospital) notFound()

  const { data: diaryRaw } = await supabase.from('diaries').select('*')
    .eq('id', params.id).eq('hospital_id', hospital.id).eq('published', true).single()
  const diary = diaryRaw as Diary | null
  if (!diary) notFound()

  const publishedMonthYear = new Date(diary.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  const specialtyTags = diary.specialty ? diary.specialty.split(',').map(s => s.trim()).filter(Boolean) : []
  const pros = diary.pros ?? []
  const cons = diary.cons ?? []
  const hasAnalysis = pros.length > 0 || cons.length > 0

  return (
    <div className="min-h-screen bg-surface pb-32">

      {/* ── Fixed top navbar with back button ── */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-screen-xl mx-auto px-4 md:px-12 py-3 flex items-center justify-between gap-4">
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

          {/* Centre — diary title (truncated) */}
          <p className="font-headline font-semibold text-sm text-on-surface-variant truncate max-w-xs md:max-w-md text-center hidden sm:block">
            {diary.title}
          </p>

          {/* Right — rotation badge */}
          <span className="px-2.5 py-1 bg-primary/15 text-primary rounded-full font-label text-xs uppercase tracking-widest border border-primary/30 shrink-0">
            Elective Rotation
          </span>
        </div>
      </div>

      {/* ── Hero Banner — expanded to fit metadata grid ── */}
      <div
        className="relative w-full overflow-hidden bg-surface-container-low border-b border-white/5"
        style={{ paddingTop: '56px' /* navbar height */ }}
      >
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          {diary.cover_image_url
            ? <Image src={diary.cover_image_url} alt={diary.title} fill className="object-cover opacity-40 mix-blend-overlay" sizes="100vw" priority />
            : hospital.image_url
            ? <Image src={hospital.image_url} alt={hospital.name} fill className="object-cover opacity-30 mix-blend-overlay" sizes="100vw" priority />
            : null}
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#080808]/60 via-[#0d0d0d]/80 to-[#080808] z-10" />

        {/* Content */}
        <div className="relative z-20 max-w-screen-xl mx-auto px-4 md:px-12 pt-8 pb-10">

          {/* Diary title */}
          <div className="mb-6">
            <h1 className="font-headline text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-on-surface tracking-tight leading-tight mb-2">
              {diary.title}
            </h1>
            <p className="font-body text-sm md:text-base text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: 14 }}>location_on</span>
              {hospital.name}
            </p>
          </div>

          {/* ── Metadata grid — 2 cols on mobile, 4 on desktop ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">

            {/* Curator */}
            <MetaCard
              icon="person"
              label="Curator"
              value={diary.author_name}
              sub={diary.author_year}
            />

            {/* Specialty */}
            <MetaCard
              icon="stethoscope"
              label="Specialty"
              value={specialtyTags.length > 0 ? specialtyTags[0] : 'General Medicine'}
              sub={specialtyTags.length > 1 ? `+${specialtyTags.length - 1} more` : undefined}
            />

            {/* Elective Duration */}
            <MetaCard
              icon="schedule"
              label="Duration"
              value={diary.elective_duration ?? '—'}
            />

            {/* Supervisor */}
            <MetaCard
              icon="supervisor_account"
              label="Supervisor"
              value={diary.supervisor ?? '—'}
            />

            {/* Published */}
            <MetaCard
              icon="calendar_month"
              label="Published"
              value={publishedMonthYear}
            />

            {/* Hospital (always shown) */}
            <MetaCard
              icon="local_hospital"
              label="Hospital"
              value={hospital.name}
            />

            {/* Rotation type */}
            <MetaCard
              icon="flight_takeoff"
              label="Rotation Type"
              value="Clinical Elective"
            />

            {/* Diaries badge */}
            <MetaCard
              icon="auto_stories"
              label="Series"
              value="The Elective Diaries"
              accent
            />
          </div>
        </div>
      </div>

      {/* ── Bento grid ── */}
      <div className="px-4 md:px-12 mt-5 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 max-w-screen-xl mx-auto">

        {/* LEFT — 8 cols */}
        <div className="lg:col-span-8 space-y-6">

          {/* Clinical Narrative */}
          <section className="relative bg-surface-container-low rounded-2xl p-5 md:p-7 overflow-hidden border border-white/5">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary via-primary/60 to-transparent rounded-l-2xl" />
            <h2 className="font-headline text-xl font-bold text-on-surface flex items-center gap-3 mb-5">
              <span className="material-symbols-outlined text-secondary p-2 bg-secondary/10 rounded-lg" style={{ fontSize: 20 }}>history_edu</span>
              Clinical Narrative
            </h2>
            <div className="prose-diary pl-1" dangerouslySetInnerHTML={{ __html: diary.content }} />
          </section>

          {/* Pivotal Observations */}
          {diary.excerpt && (
          <section className="bg-surface-container-lowest rounded-2xl p-5 md:p-7 border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <h2 className="font-headline text-xl font-bold text-on-surface mb-5 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-lg" style={{ fontSize: 20 }}>visibility</span>
              Pivotal Observations
            </h2>
            <div className="space-y-4">
              <div className="p-5 bg-surface-container-low rounded-xl flex gap-4 hover:bg-surface-container-high transition-colors border border-white/5">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: 20 }}>lightbulb</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-on-surface mb-1">Key Takeaway</h3>
                  <p className="font-body text-sm text-on-surface-variant leading-relaxed">{diary.excerpt}</p>
                </div>
              </div>
              <div className="p-5 bg-surface-container-low rounded-xl flex gap-4 hover:bg-surface-container-high transition-colors border border-white/5">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>clinical_notes</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-on-surface mb-1">Clinical Setting</h3>
                  <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                    {specialtyTags.length > 0 ? specialtyTags.join(' · ') : 'General Medicine'} elective at {hospital.name} — {publishedMonthYear}
                  </p>
                </div>
              </div>
            </div>
          </section>
          )}
        </div>

        {/* RIGHT sidebar — Skills Matrix only */}
        <div className="lg:col-span-4 space-y-6">
          {specialtyTags.length > 0 && (
            <section className="bg-surface-container-low rounded-2xl p-5 md:p-6 border border-white/5">
              <h2 className="font-headline text-base font-bold text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary" style={{ fontSize: 18 }}>psychology</span>
                Skills Matrix
              </h2>
              <div className="flex flex-wrap gap-2">
                {specialtyTags.map((tag, i) => (
                  <span key={tag}
                    className={`px-3 py-1.5 rounded-full font-label text-xs border cursor-default transition-colors ${
                      i === 0 ? 'bg-secondary/20 text-secondary border-secondary/30'
                      : i % 3 === 1 ? 'bg-primary/20 text-primary border-primary/30'
                      : 'bg-surface-container-highest text-on-surface border-white/5 hover:border-secondary/50'
                    }`}>
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Quick-reference card for duration + supervisor */}
          {(diary.elective_duration || diary.supervisor) && (
            <section className="bg-surface-container-low rounded-2xl p-5 md:p-6 border border-white/5">
              <h2 className="font-headline text-base font-bold text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: 18 }}>info</span>
                Rotation Details
              </h2>
              <div className="space-y-3">
                {diary.elective_duration && (
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 16 }}>schedule</span>
                    <div>
                      <p className="font-label text-xs text-on-surface-variant uppercase tracking-wider">Duration</p>
                      <p className="font-body text-sm text-on-surface">{diary.elective_duration}</p>
                    </div>
                  </div>
                )}
                {diary.supervisor && (
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 16 }}>supervisor_account</span>
                    <div>
                      <p className="font-label text-xs text-on-surface-variant uppercase tracking-wider">Supervisor</p>
                      <p className="font-body text-sm text-on-surface">{diary.supervisor}</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* ── Rotation Analysis — full width, shown only if pros/cons exist ── */}
      {hasAnalysis && (
      <div className="px-4 md:px-12 mt-6 md:mt-8 max-w-screen-xl mx-auto">
        <h2 className="font-headline text-xl md:text-2xl font-bold text-on-surface mb-4 md:mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-on-surface p-2 bg-surface-container-high rounded-lg" style={{ fontSize: 20 }}>
            compare_arrows
          </span>
          Rotation Analysis
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">

          {/* Pros */}
          {pros.length > 0 && (
            <div className="bg-surface-container-low rounded-2xl p-5 md:p-6 border-t-2 border-secondary/60 border border-white/5">
              <h3 className="font-headline text-lg font-bold text-secondary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>thumb_up</span>
                Pros
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

          {/* Cons */}
          {cons.length > 0 && (
            <div className="bg-surface-container-lowest rounded-2xl p-5 md:p-6 border-t-2 border-primary/60 border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <h3 className="font-headline text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>warning</span>
                Cons
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
      )}
    </div>
  )
}

/* ── MetaCard — reusable metadata tile ── */
function MetaCard({
  icon, label, value, sub, accent = false,
}: {
  icon: string
  label: string
  value: string
  sub?: string
  accent?: boolean
}) {
  return (
    <div className={`rounded-xl px-4 py-3.5 border flex items-start gap-3
      ${accent
        ? 'bg-primary/10 border-primary/25'
        : 'bg-surface-container-lowest/60 border-white/8 backdrop-blur-sm'
      }`}
    >
      <span
        className={`material-symbols-outlined mt-0.5 shrink-0 ${accent ? 'text-primary' : 'text-on-surface-variant'}`}
        style={{ fontSize: 18 }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-0.5">{label}</p>
        <p className={`font-headline font-semibold text-sm leading-snug truncate ${accent ? 'text-primary' : 'text-on-surface'}`}>
          {value}
        </p>
        {sub && <p className="font-label text-xs text-on-surface-variant mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}
