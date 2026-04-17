import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import DiaryForm from '@/components/admin/DiaryForm'
import type { Hospital, Diary } from '@/types/database'

type Props = { params: { id: string } }

export default async function EditDiaryPage({ params }: Props) {
  const supabase = createClient()

  const [{ data: diaryRaw }, { data: hospitalsRaw }] = await Promise.all([
    supabase.from('diaries').select('*').eq('id', params.id).single(),
    supabase.from('hospitals').select('*').order('name'),
  ])

  const diary = diaryRaw as Diary | null
  const hospitals = (hospitalsRaw ?? []) as Hospital[]

  if (!diary) notFound()

  return <DiaryForm diary={diary} hospitals={hospitals} />
}
