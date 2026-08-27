import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import HospitalForm from '@/components/admin/HospitalForm'
import HospitalDiaryManager from '@/components/admin/HospitalDiaryManager'
import type { Diary } from '@/types/database'

type Props = { params: { id: string } }

export default async function EditHospitalPage({ params }: Props) {
  const supabase = createClient()

  const [{ data: hospital }, { data: diariesRaw }] = await Promise.all([
    supabase.from('hospitals').select('*').eq('id', params.id).single(),
    supabase.from('diaries').select('*').eq('hospital_id', params.id).order('sort_order', { ascending: true }),
  ])

  if (!hospital) notFound()

  const diaries = (diariesRaw ?? []) as Diary[]

  return (
    <div className="space-y-10">
      <HospitalForm hospital={hospital} />

      <div className="max-w-2xl">
        <h2 className="font-headline font-bold text-2xl text-on-surface mb-1">Diary Sequence</h2>
        <p className="text-sm text-on-surface-variant mb-6">
          Control the order diaries appear on the hospital page.
        </p>
        <HospitalDiaryManager hospitalId={params.id} initialDiaries={diaries} />
      </div>
    </div>
  )
}
