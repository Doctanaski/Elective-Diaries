import { createClient } from '@/lib/supabase/server'
import HomeScroll from '@/components/public/HomeScroll'
import type { Hospital } from '@/types/database'
import type { Metadata } from 'next'

// ISR: regenerate homepage every hour
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'The Elective Diaries — KMC Local Council',
  description:
    'A precision archive documenting clinical elective experiences at affiliated medical facilities.',
  openGraph: {
    title: 'The Elective Diaries — KMC Local Council',
    description:
      'A precision archive documenting clinical elective experiences at affiliated medical facilities.',
    type: 'website',
  },
}

export default async function HomePage() {
  const supabase = createClient()
  const { data } = await supabase
    .from('hospitals')
    .select('*')
    .order('name')
  const hospitals = (data ?? []) as Hospital[]

  return <HomeScroll hospitals={hospitals} />
}
