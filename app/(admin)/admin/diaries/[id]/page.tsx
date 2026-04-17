import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import DiaryForm from '@/components/admin/DiaryForm'

type Props = { params: { id: string } }

export default async function EditDiaryPage({ params }: Props) {
  const supabase = createClient()

  const [{ data: diary }, { data: hospitals }] = await Promise.all([
    supabase.from('diaries').select('*').eq('id', params.id).single(),
    supabase.from('hospitals').select('*').order('name'),
  ])

  if (!diary) notFound()

  return <DiaryForm diary={diary} hospitals={hospitals ?? []} />
}
