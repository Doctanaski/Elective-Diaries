import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Hospital } from '@/types/database'

export default async function AdminHospitalsPage() {
  const supabase = createClient()
  const { data } = await supabase.from('hospitals').select('*').order('name')
  const hospitals = (data ?? []) as Hospital[]

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headline font-bold text-3xl text-on-surface">Hospitals</h1>
          <p className="text-on-surface-variant mt-1">{hospitals?.length ?? 0} total</p>
        </div>
        <Link
          href="/admin/hospitals/new"
          className="inline-flex items-center space-x-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-container transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
          <span>New Hospital</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {hospitals && hospitals.length > 0 ? (
          hospitals.map((hospital) => (
            <div
              key={hospital.id}
              className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-5 flex items-center justify-between hover:border-primary/30 transition-all"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary">local_hospital</span>
                </div>
                <div>
                  <p className="font-semibold text-on-surface">{hospital.name}</p>
                  <p className="text-sm text-on-surface-variant">/hospitals/{hospital.slug}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  hospital.status === 'active'
                    ? 'bg-[#34A853]/10 text-[#34A853]'
                    : hospital.status === 'new_data'
                    ? 'bg-[#4285F4]/10 text-[#4285F4]'
                    : 'bg-surface-container text-on-surface-variant'
                }`}>
                  {hospital.status === 'new_data' ? 'New Data' : hospital.status.charAt(0).toUpperCase() + hospital.status.slice(1)}
                </span>
                <Link
                  href={`/admin/hospitals/${hospital.id}`}
                  className="text-primary hover:underline font-medium text-sm"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 text-on-surface-variant bg-surface-container-lowest border border-outline-variant/20 rounded-2xl">
            <span className="material-symbols-outlined text-5xl block mb-3 opacity-30">local_hospital</span>
            <p className="font-medium">No hospitals yet.</p>
            <Link href="/admin/hospitals/new" className="text-primary hover:underline text-sm mt-1 inline-block">
              Add your first hospital →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
