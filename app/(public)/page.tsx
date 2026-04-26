import { createClient } from '@/lib/supabase/server'
import HospitalCard from '@/components/public/HospitalCard'
import type { Hospital } from '@/types/database'
import type { Metadata } from 'next'

// ISR: regenerate homepage every 5 minutes after a request
export const revalidate = 300

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
    <div className="flex-grow pt-32 pb-24 px-6 md:px-12 lg:px-24">
      {/* Hero */}
      <header className="text-center mb-24 relative max-w-4xl mx-auto">
        <div className="absolute inset-0 -z-10 bg-primary/5 rounded-full blur-3xl opacity-70 w-full h-full transform scale-150 pointer-events-none" />
        <h1 className="font-headline font-extrabold text-5xl md:text-6xl leading-tight text-primary tracking-tight mb-6">
          The Elective Diaries
        </h1>
        <div className="flex items-center justify-center space-x-2 bg-surface-container-high/50 w-fit mx-auto px-4 py-2 rounded-full border border-outline-variant/20">
          <span className="material-symbols-outlined text-secondary" style={{ fontSize: 20 }}>account_balance</span>
          <p className="font-label text-sm font-semibold tracking-widest text-on-surface-variant uppercase">
            KMC Local Council · IFMSA Pakistan
          </p>
        </div>
        <p className="mt-8 text-primary font-body max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
          A precision archive documenting clinical experiences, resource availability, and
          operational protocols across affiliated medical facilities.
        </p>
      </header>

      {/* Hospital Grid */}
      <section className="max-w-7xl mx-auto">
        {hospitals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {hospitals.map((hospital) => (
              <HospitalCard key={hospital.id} hospital={hospital} />
            ))}
          </div>
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
