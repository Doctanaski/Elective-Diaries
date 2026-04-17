import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 60

type Props = { params: { slug: string; id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()
  const { data } = await supabase
    .from('diaries')
    .select('title, excerpt')
    .eq('id', params.id)
    .single()
  return {
    title: data ? `${data.title} — The Elective Diaries` : 'Diary',
    description: data?.excerpt ?? undefined,
  }
}

export default async function DiaryPage({ params }: Props) {
  const supabase = createClient()

  const { data: hospital } = await supabase
    .from('hospitals')
    .select('id, name, slug')
    .eq('slug', params.slug)
    .single()

  if (!hospital) notFound()

  const { data: diary } = await supabase
    .from('diaries')
    .select('*')
    .eq('id', params.id)
    .eq('hospital_id', hospital.id)
    .eq('published', true)
    .single()

  if (!diary) notFound()

  return (
    <div className="pb-24">
      {/* Cover image */}
      {diary.cover_image_url && (
        <div className="relative h-64 md:h-80 w-full overflow-hidden">
          <Image
            src={diary.cover_image_url}
            alt={diary.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
        </div>
      )}

      <div className="px-6 md:px-12 lg:px-0 max-w-2xl mx-auto mt-10">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-on-surface-variant mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Hospitals</Link>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>chevron_right</span>
          <Link href={`/hospitals/${hospital.slug}`} className="hover:text-primary transition-colors">
            {hospital.name}
          </Link>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>chevron_right</span>
          <span className="text-on-surface truncate max-w-[200px]">{diary.title}</span>
        </div>

        {/* Specialty tag */}
        {diary.specialty && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-4">
            {diary.specialty}
          </span>
        )}

        {/* Title */}
        <h1 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface leading-tight mb-6">
          {diary.title}
        </h1>

        {/* Author card */}
        <div className="flex items-center space-x-4 p-4 bg-surface-container rounded-xl border border-outline-variant/20 mb-10">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-primary text-lg font-bold">
              {diary.author_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-on-surface">{diary.author_name}</p>
            <p className="text-sm text-on-surface-variant">{diary.author_year} · {hospital.name}</p>
          </div>
          <span className="ml-auto text-xs text-on-surface-variant">
            {new Date(diary.created_at).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>

        {/* Content */}
        <div
          className="prose-diary"
          dangerouslySetInnerHTML={{ __html: diary.content }}
        />

        {/* Back link */}
        <div className="mt-16 pt-8 border-t border-outline-variant/30">
          <Link
            href={`/hospitals/${hospital.slug}`}
            className="inline-flex items-center space-x-2 text-primary font-semibold hover:underline"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
            <span>Back to {hospital.name}</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
