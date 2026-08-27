'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import type { Diary } from '@/types/database'

interface Props {
  hospitalId: string
  initialDiaries: Diary[]
}

export default function HospitalDiaryManager({ hospitalId, initialDiaries }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any
  const [list, setList] = useState<Diary[]>(initialDiaries)
  const [error, setError] = useState('')

  async function move(index: number, dir: -1 | 1) {
    const j = index + dir
    if (j < 0 || j >= list.length) return

    const next = [...list]
    ;[next[index], next[j]] = [next[j], next[index]]
    const renumbered = next.map((d, i) => ({ ...d, sort_order: i + 1 }))
    setList(renumbered)

    const { error: updateError } = await Promise.all(
      [renumbered[index], renumbered[j]].map(row =>
        supabase.from('diaries').update({ sort_order: row.sort_order }).eq('id', row.id)
      )
    ).then(results => {
      const err = results.find(r => r.error)
      return err || { error: null }
    })

    if (updateError) {
      setError(updateError.message)
    } else {
      try { await fetch('/api/revalidate', { method: 'POST' }) } catch {}
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-on-surface-variant">
          {list.length} diary{list.length === 1 ? '' : 'ies'} · reorder here to control display sequence on the hospital page.
        </p>
        <Link
          href={`/admin/diaries/new`}
          className="shrink-0 inline-flex items-center space-x-2 bg-primary text-on-primary px-4 py-2 rounded-xl font-semibold text-sm hover:bg-primary-container transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
          <span>New Diary</span>
        </Link>
      </div>

      {error && (
        <div className="flex items-center space-x-2 bg-error-container/30 text-error px-4 py-3 rounded-xl text-sm">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-2">
        {list.map((diary, i) => (
          <div
            key={diary.id}
            className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-4 flex items-center gap-4 hover:border-primary/30 transition-all"
          >
            {diary.cover_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={diary.cover_image_url}
                alt=""
                className="w-12 h-14 object-cover rounded-lg border border-outline-variant/30 shrink-0"
              />
            ) : (
              <div className="w-12 h-14 rounded-lg bg-surface-container flex items-center justify-center shrink-0 border border-outline-variant/30">
                <span className="material-symbols-outlined text-outline opacity-40" style={{ fontSize: 20 }}>description</span>
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-on-surface truncate">{diary.title}</p>
              <p className="text-xs text-on-surface-variant truncate">
                {diary.author_name} · {diary.specialty ?? 'No specialty'}
              </p>
            </div>

            <span className="text-xs text-on-surface-variant font-mono shrink-0">
              #{i + 1}
            </span>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                title="Move up"
                className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_upward</span>
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === list.length - 1}
                title="Move down"
                className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_downward</span>
              </button>
              <Link
                href={`/admin/diaries/${diary.id}`}
                title="Edit"
                className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>edit</span>
              </Link>
            </div>
          </div>
        ))}

        {list.length === 0 && (
          <div className="text-center py-10 bg-surface-container-lowest border border-dashed border-outline-variant/30 rounded-2xl text-primary">
            <span className="material-symbols-outlined text-4xl block mb-2 opacity-30">menu_book</span>
            <p>No diaries for this hospital yet.</p>
            <Link href="/admin/diaries/new" className="text-primary hover:underline text-sm mt-1 inline-block">
              Create your first diary →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
