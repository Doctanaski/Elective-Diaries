import { createClient } from '@/lib/supabase/server'
import HomeScroll from '@/components/public/HomeScroll'
import type { Hospital, Contributor, SiteContent } from '@/types/database'
import type { Metadata } from 'next'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'The Elective Diaries — KMC Local Council',
  description: 'A precision archive documenting clinical elective experiences at affiliated medical facilities.',
  openGraph: {
    title: 'The Elective Diaries — KMC Local Council',
    description: 'A precision archive documenting clinical elective experiences at affiliated medical facilities.',
    type: 'website',
  },
}

export default async function HomePage() {
  const supabase = createClient()

  const [
    { data: hospitalsData },
    { count: diaryCount },
    { data: contentRows },
    { data: contributorsRaw },
  ] = await Promise.all([
    supabase.from('hospitals').select('*').order('name'),
    supabase.from('diaries').select('*', { count: 'exact', head: true }).eq('published', true),
    supabase.from('site_content').select('*'),
    supabase.from('contributors').select('*').order('sort_order', { ascending: true }),
  ])

  const hospitals = (hospitalsData ?? []) as Hospital[]
  const contributors = (contributorsRaw ?? []) as Contributor[]

  const presidentContent: Record<string, string> = {}
  for (const row of (contentRows ?? []) as SiteContent[]) presidentContent[row.key] = row.value

  return (
    <HomeScroll
      hospitals={hospitals}
      hospitalCount={hospitals.length}
      diaryCount={diaryCount ?? 0}
      presidentContent={presidentContent}
      contributors={contributors}
    />
  )
}
