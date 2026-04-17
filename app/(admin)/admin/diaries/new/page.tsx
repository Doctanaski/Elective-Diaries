import { createClient } from '@/lib/supabase/server'
import DiaryForm from '@/components/admin/DiaryForm'

export default async function NewDiaryPage() {
  const supabase = createClient()
  const { data: hospitals } = await supabase.from('hospitals').select('*').order('name')

  return <DiaryForm hospitals={hospitals ?? []} />
}
