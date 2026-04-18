import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import DiaryCard from '@/components/public/DiaryCard'
import type { Metadata } from 'next'
import type { Hospital, Diary } from '@/types/database'

// ISR: revalidate this page at most every 5 minutes
export const revalidate = 300

type Props = { params: { slug: string } }

// Pre-build all hospital pages at deploy time → no cold starts, no DB hit on first load
export async function generateStaticParams() {
  const supabase = createClient()
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
    <div className="pb-24">
      {/* Hero banner */}
      <div className="relative h-72 md:h-96 w-full overflow-hidden">
        {hospital.image_url ? (
          <Image
            src={hospital.image_url}
            alt={hospital.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-surface-container-high" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-8 md:px-16 pb-10">
          <Link
            href="/"
            className="inline-flex items-center space-x-1 text-white/70 hover:text-white text-sm mb-4 transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
            <span>All Hospitals</span>
          </Link>
          <h1 className="font-headline font-extrabold text-4xl md:text-5xl text-white tracking-tight">
            {hospital.name}
          </h1>
          {hospital.description && (
            <p className="text-white/80 mt-2 max-w-xl text-base">{hospital.description}</p>
          )}
        </div>
      </div>

      {/* Diaries */}
      <div className="px-6 md:px-12 lg:px-24 mt-12 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-headline font-bold text-2xl text-on-surface">
            Elective Diaries
            <span className="ml-3 text-sm font-normal text-on-surface-variant">
              ({diaries.length} {diaries.length === 1 ? 'entry' : 'entries'})
            </span>
          </h2>
        </div>

        {diaries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {diaries.map((diary) => (
              <DiaryCard key={diary.id} diary={diary} hospitalSlug={params.slug} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-on-surface-variant bg-surface-container rounded-2xl border border-outline-variant/20">
            <span className="material-symbols-outlined text-5xl mb-3 block opacity-30">description</span>
            <p className="text-lg font-medium">No diaries published yet.</p>
            <p className="text-sm mt-1">Check back soon — experiences will appear here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
