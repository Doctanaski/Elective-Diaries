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
  const { data: diaries } = await supabase
    .from('diaries').select('id, hospital_id').eq('published', true)
  const hospitalMap = new Map(
    ((hospitals ?? []) as { id: string; slug: string }[]).map((h) => [h.id, h.slug])
  )
  return ((diaries ?? []) as { id: string; hospital_id: string }[])
    .filter((d) => hospitalMap.has(d.hospital_id))
    .map((d) => ({ slug: hospitalMap.get(d.hospital_id)!, id: d.id }))
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

  const { data: hospitalRaw } = await supabase
    .from('hospitals').select('id, name, slug, image_url').eq('slug', params.slug).single()
  const hospital = hospitalRaw as Pick<Hospital, 'id' | 'name' | 'slug' | 'image_url'> | null
  if (!hospital) notFound()

  const { data: diaryRaw } = await supabase
    .from('diaries').select('*')
    .eq('id', params.id).eq('hospital_id', hospital.id).eq('published', true).single()
  const diary = diaryRaw as Diary | null
  if (!diary) notFound()

  const publishedDate = new Date(diary.created_at).toLocaleDateString('en-US', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  const publishedMonthYear = new Date(diary.created_at).toLocaleDateString('en-US', {
    month: 'short', year: 'numeric',
  })

  // Parse specialty tags from comma-separated string if multiple
  const specialtyTags = diary.specialty
    ? diary.specialty.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* ── Hero banner ── */}
      <div className="relative w-full overflow-hidden" style={{ height: '280px' }}>
        {diary.cover_image_url ? (
          <Image src={diary.cover_image_url} alt={diary.title} fill
            className="object-cover opacity-50" priority sizes="100vw" />
        ) : hospital.image_url ? (
          <Image src={hospital.image_url} alt={hospital.name} fill
            className="object-cover opacity-30" priority sizes="100vw" />
        ) : (
          <div className="absolute inset-0 bg-surface-container-high" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/70 to-transparent" />

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 lg:px-16 pb-8 flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="px-3 py-1 bg-primary/15 text-primary rounded-full font-label text-xs uppercase tracking-widest border border-primary/25">
                Elective Rotation
              </span>
              <span className="font-label text-sm text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>calendar_month</span>
                {publishedMonthYear}
              </span>
            </div>
            <h1 className="font-headline text-3xl md:text-5xl font-bold text-on-surface tracking-tight mb-1">
              {diary.title}
            </h1>
            <p className="font-body text-base text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: 16 }}>location_on</span>
              {hospital.name}
            </p>
          </div>
          <div className="text-left md:text-right shrink-0">
            <p className="font-label text-xs text-on-surface-variant mb-0.5 uppercase tracking-wider">Author</p>
            <p className="font-headline text-lg font-bold text-on-surface">{diary.author_name}</p>
            <p className="font-label text-xs text-on-surface-variant">{diary.author_year}</p>
          </div>
        </div>
      </div>

      {/* ── Breadcrumb ── */}
      <div className="px-6 md:px-12 lg:px-16 pt-5 pb-2">
        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-label flex-wrap">
          <Link href="/" className="hover:text-primary transition-colors">Hospitals</Link>
          <span className="material-symbols-outlined opacity-40" style={{ fontSize: 12 }}>chevron_right</span>
          <Link href={`/hospitals/${hospital.slug}`} className="hover:text-primary transition-colors">{hospital.name}</Link>
          <span className="material-symbols-outlined opacity-40" style={{ fontSize: 12 }}>chevron_right</span>
          <span className="text-on-surface truncate max-w-xs">{diary.title}</span>
        </div>
      </div>

      {/* ── Bento grid ── */}
      <div className="px-6 md:px-12 lg:px-16 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-screen-xl mx-auto">

        {/* LEFT — Main narrative (8 cols) */}
        <div className="lg:col-span-8 space-y-6">

          {/* Clinical Narrative card */}
          <section className="relative bg-surface-container-lowest rounded-2xl p-7 border border-outline-variant/20 overflow-hidden">
            {/* Red left-border accent */}
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-primary/20 rounded-l-2xl" />
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-headline text-xl font-bold text-on-surface flex items-center gap-2.5">
                <span className="material-symbols-outlined text-secondary p-1.5 bg-secondary/10 rounded-lg" style={{ fontSize: 20 }}>
                  history_edu
                </span>
                Clinical Narrative
              </h2>
            </div>
            <div
              className="prose-diary text-on-surface-variant"
              dangerouslySetInnerHTML={{ __html: diary.content }}
            />
          </section>

          {/* Excerpt / key insight card — only if excerpt exists */}
          {diary.excerpt && (
            <section className="bg-surface-container rounded-2xl p-7 border border-outline-variant/20">
              <h2 className="font-headline text-xl font-bold text-on-surface mb-5 flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary p-1.5 bg-primary/10 rounded-lg" style={{ fontSize: 20 }}>
                  visibility
                </span>
                Key Takeaway
              </h2>
              <div className="flex gap-4 p-5 bg-surface-container-lowest rounded-xl border border-outline-variant/10 hover:border-primary/20 transition-colors">
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>lightbulb</span>
                </div>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed">{diary.excerpt}</p>
              </div>
            </section>
          )}
        </div>

        {/* RIGHT — Meta sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Author card */}
          <section className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-headline font-bold text-lg">
                {diary.author_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-headline font-bold text-sm text-on-surface">{diary.author_name}</p>
                <p className="font-label text-xs text-on-surface-variant">{diary.author_year}</p>
              </div>
            </div>
            <div className="space-y-2 text-xs font-label text-on-surface-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: 14 }}>location_on</span>
                {hospital.name}
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: 14 }}>calendar_month</span>
                {publishedDate}
              </div>
            </div>
          </section>

          {/* Specialty tags */}
          {specialtyTags.length > 0 && (
            <section className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/20">
              <h2 className="font-headline text-base font-bold text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary" style={{ fontSize: 18 }}>psychology</span>
                Specialties
              </h2>
              <div className="flex flex-wrap gap-2">
                {specialtyTags.map((tag) => (
                  <span key={tag}
                    className="px-3 py-1.5 bg-surface-container rounded-full font-label text-xs text-on-surface border border-outline-variant/30 hover:border-primary/40 transition-colors">
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Hospital info card */}
          <section className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/20">
            <h2 className="font-headline text-base font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: 18 }}>local_hospital</span>
              Hospital
            </h2>
            <Link href={`/hospitals/${hospital.slug}`}
              className="flex items-center justify-between group hover:text-primary transition-colors">
              <span className="font-body text-sm text-on-surface-variant group-hover:text-primary transition-colors">
                {hospital.name}
              </span>
              <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors" style={{ fontSize: 16 }}>
                arrow_forward
              </span>
            </Link>
          </section>

          {/* Back link */}
          <Link href={`/hospitals/${hospital.slug}`}
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl border border-outline-variant/30 hover:border-primary/40 text-on-surface-variant hover:text-primary font-label text-sm font-semibold transition-all w-full justify-center">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
            Back to {hospital.name}
          </Link>
        </div>
      </div>
    </div>
  )
}
