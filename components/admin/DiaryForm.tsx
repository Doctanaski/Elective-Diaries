'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'
import type { Hospital, Diary, DiaryInsert } from '@/types/database'

const RichTextEditor = dynamic(() => import('./RichTextEditor'), { ssr: false })

interface DiaryFormProps {
  hospitals: Hospital[]
  diary?: Diary
}

export default function DiaryForm({ hospitals, diary }: DiaryFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const isEditing = !!diary

  const [title, setTitle] = useState(diary?.title ?? '')
  const [content, setContent] = useState(diary?.content ?? '')
  const [excerpt, setExcerpt] = useState(diary?.excerpt ?? '')
  const [hospitalId, setHospitalId] = useState(diary?.hospital_id ?? '')
  const [authorName, setAuthorName] = useState(diary?.author_name ?? '')
  const [authorYear, setAuthorYear] = useState(diary?.author_year ?? '')
  const [specialty, setSpecialty] = useState(diary?.specialty ?? '')
  const [published, setPublished] = useState(diary?.published ?? false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent, publishState?: boolean) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const finalPublished = publishState !== undefined ? publishState : published

    const payload: DiaryInsert = {
      title,
      content,
      excerpt: excerpt || null,
      hospital_id: hospitalId,
      author_name: authorName,
      author_year: authorYear,
      specialty: specialty || null,
      published: finalPublished,
    }

    if (isEditing) {
      const updateData = { ...payload, updated_at: new Date().toISOString() } as any
      const { error } = await supabase
        .from('diaries')
        .update(updateData)
        .eq('id', diary.id)
      if (error) { setError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('diaries').insert(payload as any)
      if (error) { setError(error.message); setSaving(false); return }
    }

    router.push('/admin/diaries')
    router.refresh()
  }

  async function handleDelete() {
    if (!diary || !confirm('Delete this diary? This cannot be undone.')) return
    await supabase.from('diaries').delete().eq('id', diary.id)
    router.push('/admin/diaries')
    router.refresh()
  }

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-outline-variant/50 bg-surface text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm'

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline font-bold text-3xl text-on-surface">
            {isEditing ? 'Edit Diary' : 'New Diary'}
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              className="text-error border border-error/30 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-error-container/20 transition-colors"
            >
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={(e) => handleSubmit(e as any, false)}
            disabled={saving}
            className="border border-outline-variant/50 text-on-surface px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e as any, true)}
            disabled={saving}
            className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-container transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {saving ? (
              <>
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: 16 }}>progress_activity</span>
                <span>Saving…</span>
              </>
            ) : (
              <span>{published ? 'Update' : 'Publish'}</span>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 bg-error-container/30 text-error px-4 py-3 rounded-xl text-sm">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Main fields */}
      <div className="grid grid-cols-1 gap-5 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6">
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2">Title *</label>
          <input
            required
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My Elective at Khyber Teaching Hospital"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2">Excerpt</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="A short summary shown on the hospital page (optional)"
            rows={2}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2">Hospital *</label>
            <select
              required
              value={hospitalId}
              onChange={(e) => setHospitalId(e.target.value)}
              className={inputClass}
            >
              <option value="">Select a hospital…</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2">Specialty</label>
            <input
              type="text"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="e.g. Surgery, Paediatrics"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2">Author Name *</label>
            <input
              required
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Dr. Ahmad Khan"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2">Year / Batch *</label>
            <input
              required
              type="text"
              value={authorYear}
              onChange={(e) => setAuthorYear(e.target.value)}
              placeholder="3rd Year, Batch 2022"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Rich text editor */}
      <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6">
        <label className="block text-sm font-semibold text-on-surface mb-3">Content *</label>
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="Write the full elective diary here…"
        />
      </div>
    </form>
  )
}
