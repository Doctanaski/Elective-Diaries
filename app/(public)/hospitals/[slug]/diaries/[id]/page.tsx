import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { Hospital, Diary } from '@/types/database'

export const revalidate = 300
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

      {/* ── Hero Banner ── */}
      <div className="relative w-full rounded-b-2xl overflow-hidden bg-surface-container-low border-b border-white/5" style={{ height: 300 }}>
        <div className="absolute inset-0 z-0">
          {diary.cover_image_url
            ? <Image src={diary.cover_image_url} alt={diary.title} fill className="object-cover opacity-50 mix-blend-overlay" sizes="100vw" priority />
            : hospital.image_url
            ? <Image src={hospital.image_url} alt={hospital.name} fill className="object-cover opacity-35 mix-blend-overlay" sizes="100vw" priority />
            : null}
        </div>
        {/* Deep dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#0d0d0d]/90 to-transparent z-10" />

        {/* Hero text */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-6 md:px-12 pb-8 flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="px-3 py-1 bg-primary/20 text-primary rounded-full font-label text-xs uppercase tracking-widest border border-primary/40">
                Elective Rotation
              </span>
              <span className="font-label text-sm text-on-surface-variant flex items-center gap-1.5">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>calendar_month</span>
                {publishedMonthYear}
              </span>
            </div>
            <h1 className="font-headline text-4xl md:text-5xl font-bold text-on-surface tracking-tight mb-2 leading-tight">
              {diary.title}
            </h1>
            <p className="font-body text-base text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: 16 }}>location_on</span>
              {hospital.name}
            </p>
          </div>
          <div className="text-left md:text-right shrink-0">
            <p className="font-label text-xs text-on-surface-variant uppercase tracking-wider mb-0.5">Curator</p>
            <p className="font-headline text-xl font-bold text-on-surface">{diary.author_name}</p>
            <p className="font-label text-xs text-on-surface-variant mt-0.5">{diary.author_year}</p>
          </div>
        </div>
      </div>

      {/* ── Bento grid ── */}
      <div className="px-6 md:px-12 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-screen-xl mx-auto">

        {/* LEFT — 8 cols */}
        <div className="lg:col-span-8 space-y-6">

          {/* Clinical Narrative */}
          <section className="relative bg-surface-container-low rounded-2xl p-7 overflow-hidden border border-white/5">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary via-primary/60 to-transparent rounded-l-2xl" />
            <h2 className="font-headline text-xl font-bold text-on-surface flex items-center gap-3 mb-5">
              <span className="material-symbols-outlined text-secondary p-2 bg-secondary/10 rounded-lg" style={{ fontSize: 20 }}>history_edu</span>
              Clinical Narrative
            </h2>
            <div className="prose-diary pl-1" dangerouslySetInnerHTML={{ __html: diary.content }} />
          </section>

          {/* Pivotal Observations */}
          {diary.excerpt && (
            <section className="bg-surface-container-lowest rounded-2xl p-7 border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
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
            <section className="bg-surface-container-low rounded-2xl p-6 border border-white/5">
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

          {/* Back link */}
          <Link href={`/hospitals/${hospital.slug}`}
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl border border-outline-variant/30
                       hover:border-primary/50 text-on-surface-variant hover:text-primary
                       font-label text-sm font-semibold transition-all w-full justify-center
                       bg-surface-container-low hover:bg-surface-container">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
            Back to {hospital.name}
          </Link>
        </div>
      </div>

      {/* ── Rotation Analysis — full width, shown only if pros/cons exist ── */}
      {hasAnalysis && (
        <div className="px-6 md:px-12 mt-8 max-w-screen-xl mx-auto">
          <h2 className="font-headline text-2xl font-bold text-on-surface mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-on-surface p-2 bg-surface-container-high rounded-lg" style={{ fontSize: 20 }}>
              compare_arrows
            </span>
            Rotation Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Pros */}
            {pros.length > 0 && (
              <div className="bg-surface-container-low rounded-2xl p-6 border-t-2 border-secondary/60 border border-white/5">
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
              <div className="bg-surface-container-lowest rounded-2xl p-6 border-t-2 border-primary/60 border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
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
