import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import { notFound } from 'next/navigation'
import DiaryReader from '@/components/public/DiaryReader'
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

  const { data: hospitalRaw } = await supabase
    .from('hospitals').select('id, name, slug, image_url')
    .eq('slug', params.slug).single()
  const hospital = hospitalRaw as Pick<Hospital, 'id' | 'name' | 'slug' | 'image_url'> | null
  if (!hospital) notFound()

  const { data: diaryRaw } = await supabase
    .from('diaries').select('*')
    .eq('id', params.id).eq('hospital_id', hospital.id).eq('published', true).single()
  const diary = diaryRaw as Diary | null
  if (!diary) notFound()

  const publishedMonthYear = new Date(diary.created_at).toLocaleDateString('en-US', {
    month: 'short', year: 'numeric',
  })
  const specialtyTags = diary.specialty
    ? diary.specialty.split(',').map(s => s.trim()).filter(Boolean)
    : []
  const skillTags =
    diary.skills && diary.skills.length > 0 ? diary.skills : specialtyTags
  const pros = diary.pros ?? []
  const cons = diary.cons ?? []

  return (
    <DiaryReader
      diary={diary}
      hospital={hospital}
      publishedMonthYear={publishedMonthYear}
      specialtyTags={specialtyTags}
      skillTags={skillTags}
      pros={pros}
      cons={cons}
      hasAnalysis={pros.length > 0 || cons.length > 0}
    />
  )
}
