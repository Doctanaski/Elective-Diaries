import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import HospitalForm from '@/components/admin/HospitalForm'

type Props = { params: { id: string } }

export default async function EditHospitalPage({ params }: Props) {
  const supabase = createClient()
  const { data: hospital } = await supabase
    .from('hospitals')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!hospital) notFound()
  return <HospitalForm hospital={hospital} />
}
