import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDiariesPage() {
  const supabase = createClient()
  const { data } = await supabase
    .from('diaries')
    .select('*, hospitals(name, slug)')
    .order('created_at', { ascending: false })
  const diaries = (data ?? []) as any[]

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headline font-bold text-3xl text-on-surface">Diaries</h1>
          <p className="text-on-surface-variant mt-1">{diaries?.length ?? 0} total entries</p>
        </div>
        <Link
          href="/admin/diaries/new"
          className="inline-flex items-center space-x-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-container transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
          <span>New Diary</span>
        </Link>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl overflow-hidden">
        {diaries && diaries.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container/50">
                <th className="text-left px-6 py-3 font-semibold text-on-surface-variant">Title</th>
                <th className="text-left px-6 py-3 font-semibold text-on-surface-variant">Hospital</th>
                <th className="text-left px-6 py-3 font-semibold text-on-surface-variant">Author</th>
                <th className="text-left px-6 py-3 font-semibold text-on-surface-variant">Status</th>
                <th className="text-left px-6 py-3 font-semibold text-on-surface-variant">Date</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {diaries.map((diary: any) => (
                <tr key={diary.id} className="border-b border-outline-variant/10 hover:bg-surface-container/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-on-surface max-w-xs truncate">{diary.title}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{diary.hospitals?.name ?? '—'}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{diary.author_name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      diary.published
                        ? 'bg-[#34A853]/10 text-[#34A853]'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}>
                      {diary.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">
                    {new Date(diary.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/diaries/${diary.id}`}
                      className="text-primary hover:underline font-medium"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl block mb-3 opacity-30">menu_book</span>
            <p className="font-medium">No diaries yet.</p>
            <Link href="/admin/diaries/new" className="text-primary hover:underline text-sm mt-1 inline-block">
              Create your first diary →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
