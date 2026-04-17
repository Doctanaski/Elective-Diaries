import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = createClient()

  const [{ count: hospitalCount }, { count: diaryCount }, { data: recentDiariesRaw }] =
    await Promise.all([
      supabase.from('hospitals').select('*', { count: 'exact', head: true }),
      supabase.from('diaries').select('*', { count: 'exact', head: true }),
      supabase
        .from('diaries')
        .select('id, title, author_name, created_at, published, hospitals(name, slug)')
        .order('created_at', { ascending: false })
        .limit(5),
    ])
  const recentDiaries = (recentDiariesRaw ?? []) as any[]

  const stats = [
    { label: 'Hospitals', value: hospitalCount ?? 0, icon: 'local_hospital', href: '/admin/hospitals' },
    { label: 'Total Diaries', value: diaryCount ?? 0, icon: 'menu_book', href: '/admin/diaries' },
  ]

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="font-headline font-bold text-3xl text-on-surface">Dashboard</h1>
        <p className="text-on-surface-variant mt-1">Manage your Elective Diaries content.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        {stats.map(({ label, value, icon, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6 hover:border-primary/30 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-on-surface-variant text-sm font-medium">{label}</p>
                <p className="font-headline font-bold text-4xl text-on-surface mt-1">{value}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-primary">{icon}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex items-center space-x-3 mb-8">
        <Link
          href="/admin/diaries/new"
          className="inline-flex items-center space-x-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-container transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
          <span>New Diary</span>
        </Link>
        <Link
          href="/admin/hospitals/new"
          className="inline-flex items-center space-x-2 border border-outline-variant/50 text-on-surface px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
          <span>New Hospital</span>
        </Link>
      </div>

      {/* Recent Diaries */}
      <div>
        <h2 className="font-headline font-bold text-xl text-on-surface mb-4">Recent Diaries</h2>
        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl overflow-hidden">
          {recentDiaries && recentDiaries.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/20 bg-surface-container/50">
                  <th className="text-left px-6 py-3 font-semibold text-on-surface-variant">Title</th>
                  <th className="text-left px-6 py-3 font-semibold text-on-surface-variant">Author</th>
                  <th className="text-left px-6 py-3 font-semibold text-on-surface-variant">Status</th>
                  <th className="text-left px-6 py-3 font-semibold text-on-surface-variant">Date</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody>
                {recentDiaries.map((diary: any) => (
                  <tr key={diary.id} className="border-b border-outline-variant/10 hover:bg-surface-container/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-on-surface">{diary.title}</td>
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
            <div className="text-center py-12 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl block mb-2 opacity-30">description</span>
              <p>No diaries yet. Create your first one!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
