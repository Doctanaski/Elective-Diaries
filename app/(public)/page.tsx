import { createClient } from '@/lib/supabase/server'
import HospitalCarousel from '@/components/public/HospitalCarousel'
import HomeHero from '@/components/public/HomeHero'
import type { Hospital } from '@/types/database'
import type { Metadata } from 'next'

// ISR: regenerate homepage every hour (content changes infrequently)
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'The Elective Diaries — KMC Local Council',
  description:
    'A precision archive documenting clinical elective experiences at hospitals affiliated with Khyber Medical College, Peshawar.',
}

export default async function HomePage() {
  const supabase = createClient()
  const { data } = await supabase
    .from('hospitals')
    .select('id, name, slug, description, image_url, status')
    .order('name')
  const hospitals = (data ?? []) as Hospital[]

  return (
    <div className="flex-grow pt-32 pb-24 px-6 md:px-12 lg:px-24 overflow-x-hidden">
      {/* Hero */}
      <HomeHero />

      {/* Hospital Carousel */}
      <section className="max-w-7xl mx-auto">
        {hospitals.length > 0 ? (
          <HospitalCarousel hospitals={hospitals} />
        ) : (
          <div className="text-center py-24 text-on-surface-variant">
            <span className="material-symbols-outlined text-6xl mb-4 block opacity-30">local_hospital</span>
            <p className="text-lg font-medium">No hospitals listed yet.</p>
            <p className="text-sm mt-1">Check back soon or contact your admin.</p>
          </div>
        )}
      </section>
    </div>
  )
}
