'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import type { Hospital, Diary } from '@/types/database'

const RichTextEditor = dynamic(() => import('./RichTextEditor'), { ssr: false })

interface DiaryFormProps {
  hospitals: Hospital[]
  diary?: Diary
}

export default function DiaryForm({ hospitals, diary }: DiaryFormProps) {
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any
  const isEditing = !!diary

  const [title, setTitle] = useState(diary?.title ?? '')
  const [content, setContent] = useState(diary?.content ?? '')
  const [excerpt, setExcerpt] = useState(diary?.excerpt ?? '')
  const [hospitalId, setHospitalId] = useState(diary?.hospital_id ?? '')
  const [authorName, setAuthorName] = useState(diary?.author_name ?? '')
  const [authorYear, setAuthorYear] = useState(diary?.author_year ?? '')
  const [specialty, setSpecialty] = useState(diary?.specialty ?? '')
  const [coverImageUrl, setCoverImageUrl] = useState(diary?.cover_image_url ?? '')
  const [published, setPublished] = useState(diary?.published ?? false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Cover image upload state
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [previewUrl, setPreviewUrl] = useState(diary?.cover_image_url ?? '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setUploadError('Please select an image file.'); return }
    if (file.size > 5 * 1024 * 1024) { setUploadError('Image must be under 5MB.'); return }

    setUploading(true)
    setUploadError('')
    setPreviewUrl(URL.createObjectURL(file))

    const ext = file.name.split('.').pop()
    const filename = `covers/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { data, error: storageError } = await supabase.storage
      .from('diary-images')
      .upload(filename, file, { cacheControl: '3600', upsert: false })

    if (storageError) {
      setUploadError(storageError.message)
      setPreviewUrl(coverImageUrl)
      setUploading(false)
      return
    }

    const { data: publicData } = supabase.storage.from('diary-images').getPublicUrl(data.path)
    setCoverImageUrl(publicData.publicUrl)
    setPreviewUrl(publicData.publicUrl)
    setUploading(false)
  }

  function clearImage() {
    setCoverImageUrl('')
    setPreviewUrl('')
    setUploadError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      title,
      content,
      excerpt: excerpt || null,
      hospital_id: hospitalId,
      author_name: authorName,
      author_year: authorYear,
      specialty: specialty || null,
      cover_image_url: coverImageUrl || null,
      published,
    }

    if (isEditing) {
      const { error } = await supabase.from('diaries').update(payload).eq('id', diary.id)
      if (error) { setError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('diaries').insert(payload)
      if (error) { setError(error.message); setSaving(false); return }
    }

    router.push('/admin/diaries')
    router.refresh()
  }

  async function handleDelete() {
    if (!diary || !confirm('Delete this diary entry? This cannot be undone.')) return
    await supabase.from('diaries').delete().eq('id', diary.id)
    router.push('/admin/diaries')
    router.refresh()
  }

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-outline-variant/50 bg-surface text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm'

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-headline font-bold text-3xl text-on-surface">
          {isEditing ? 'Edit Diary' : 'New Diary'}
        </h1>
        <div className="flex items-center space-x-3">
          {isEditing && (
            <button type="button" onClick={handleDelete}
              className="text-error border border-error/30 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-error-container/20 transition-colors">
              Delete
            </button>
          )}
          <button type="submit" disabled={saving || uploading}
            className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-container transition-colors disabled:opacity-50">
            {saving ? 'Saving…' : isEditing ? 'Update' : 'Publish'}
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
      <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2">Title *</label>
          <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="My Elective at…" className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2">Hospital *</label>
          <select required value={hospitalId} onChange={(e) => setHospitalId(e.target.value)} className={inputClass}>
            <option value="">Select a hospital</option>
            {hospitals.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2">Author Name *</label>
            <input required type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)}
              placeholder="e.g. Aisha Ahmed" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2">Author Year *</label>
            <input required type="text" value={authorYear} onChange={(e) => setAuthorYear(e.target.value)}
              placeholder="e.g. 3rd Year, Batch 2022" className={inputClass} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2">Specialty</label>
          <input type="text" value={specialty} onChange={(e) => setSpecialty(e.target.value)}
            placeholder="e.g. Cardiology, Surgery" className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2">Excerpt</label>
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)}
            placeholder="A short summary shown on the diary card…" rows={3} className={inputClass} />
        </div>
      </div>

      {/* Cover image upload */}
      <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6 space-y-4">
        <label className="block text-sm font-semibold text-on-surface">Cover Image</label>

        {previewUrl && (
          <div className="relative rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container aspect-video w-full">
            <Image src={previewUrl} alt="Cover preview" fill className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px" unoptimized={previewUrl.startsWith('blob:')} />
            <button type="button" onClick={clearImage}
              className="absolute top-2 right-2 bg-surface/90 backdrop-blur-sm text-error p-1.5 rounded-lg hover:bg-error-container/30 transition-colors border border-outline-variant/30">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
            </button>
          </div>
        )}

        <div onClick={() => fileInputRef.current?.click()}
          className={`flex items-center justify-center gap-3 w-full px-4 py-4 rounded-xl border-2 border-dashed cursor-pointer transition-all text-sm ${
            uploading
              ? 'border-primary/30 bg-primary/5 text-primary cursor-wait'
              : 'border-outline-variant/50 hover:border-primary/50 hover:bg-primary/5 text-on-surface-variant hover:text-primary'
          }`}>
          {uploading ? (
            <>
              <span className="material-symbols-outlined animate-spin" style={{ fontSize: 20 }}>progress_activity</span>
              <span>Uploading…</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>upload</span>
              <span>{previewUrl ? 'Replace image' : 'Upload cover image'}</span>
              <span className="text-xs text-on-surface-variant">(JPG, PNG, WebP · max 5 MB)</span>
            </>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

        {uploadError && (
          <p className="text-xs text-error flex items-center gap-1">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>error</span>
            {uploadError}
          </p>
        )}

        <details>
          <summary className="text-xs text-on-surface-variant cursor-pointer hover:text-primary select-none">
            Or paste an image URL instead
          </summary>
          <input type="url" value={coverImageUrl}
            onChange={(e) => { setCoverImageUrl(e.target.value); setPreviewUrl(e.target.value) }}
            placeholder="https://…" className={`${inputClass} mt-2`} />
        </details>
      </div>

      {/* Rich text content */}
      <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6 space-y-3">
        <label className="block text-sm font-semibold text-on-surface">Content *</label>
        <RichTextEditor content={content} onChange={setContent} />
      </div>

      {/* Publish toggle */}
      <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6">
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <p className="text-sm font-semibold text-on-surface">Published</p>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {published ? 'Visible to the public' : 'Saved as draft — not visible yet'}
            </p>
          </div>
          <div
            onClick={() => setPublished((p) => !p)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
              published ? 'bg-primary' : 'bg-outline-variant/50'
            }`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
              published ? 'translate-x-7' : 'translate-x-1'
            }`} />
          </div>
        </label>
      </div>
    </form>
  )
}
