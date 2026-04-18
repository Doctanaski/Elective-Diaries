'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Hospital } from '@/types/database'
import Image from 'next/image'

interface HospitalFormProps {
  hospital?: Hospital
}

export default function HospitalForm({ hospital }: HospitalFormProps) {
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any
  const isEditing = !!hospital

  const [name, setName] = useState(hospital?.name ?? '')
  const [slug, setSlug] = useState(hospital?.slug ?? '')
  const [description, setDescription] = useState(hospital?.description ?? '')
  const [imageUrl, setImageUrl] = useState(hospital?.image_url ?? '')
  const [status, setStatus] = useState<'active' | 'inactive' | 'new_data'>(hospital?.status ?? 'active')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Image upload state
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [previewUrl, setPreviewUrl] = useState(hospital?.image_url ?? '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function generateSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file (JPG, PNG, WebP, etc.)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be under 5MB')
      return
    }

    setUploading(true)
    setUploadError('')

    const localPreview = URL.createObjectURL(file)
    setPreviewUrl(localPreview)

    const ext = file.name.split('.').pop()
    const filename = `hospitals/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { data, error: storageError } = await supabase.storage
      .from('hospital-images')
      .upload(filename, file, { cacheControl: '3600', upsert: false })

    if (storageError) {
      setUploadError(storageError.message)
      setPreviewUrl(imageUrl)
      setUploading(false)
      return
    }

    const { data: publicData } = supabase.storage
      .from('hospital-images')
      .getPublicUrl(data.path)

    setImageUrl(publicData.publicUrl)
    setPreviewUrl(publicData.publicUrl)
    setUploading(false)
  }

  function clearImage() {
    setImageUrl('')
    setPreviewUrl('')
    setUploadError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = { name, slug, description: description || null, image_url: imageUrl || null, status }

    if (isEditing) {
      const { error } = await supabase.from('hospitals').update(payload).eq('id', hospital.id)
      if (error) { setError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('hospitals').insert(payload)
      if (error) { setError(error.message); setSaving(false); return }
    }

    router.push('/admin/hospitals')
    router.refresh()
  }

  async function handleDelete() {
    if (!hospital || !confirm('Delete this hospital? All its diaries will also be removed.')) return
    await supabase.from('hospitals').delete().eq('id', hospital.id)
    router.push('/admin/hospitals')
    router.refresh()
  }

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-outline-variant/50 bg-surface text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm'

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline font-bold text-3xl text-on-surface">
          {isEditing ? 'Edit Hospital' : 'New Hospital'}
        </h1>
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
            type="submit"
            disabled={saving || uploading}
            className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-container transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : isEditing ? 'Update' : 'Create Hospital'}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 bg-error-container/30 text-error px-4 py-3 rounded-xl text-sm">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
          <span>{error}</span>
        </div>
      )}

      <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2">Hospital Name *</label>
          <input
            required
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (!isEditing) setSlug(generateSlug(e.target.value))
            }}
            placeholder="Khyber Teaching Hospital"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2">
            URL Slug *
            <span className="text-on-surface-variant font-normal ml-2 text-xs">
              (used in URL: /hospitals/<strong>{slug || 'slug'}</strong>)
            </span>
          </label>
          <input
            required
            type="text"
            value={slug}
            onChange={(e) => setSlug(generateSlug(e.target.value))}
            placeholder="khyber-teaching-hospital"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description shown on the hospital card"
            rows={3}
            className={inputClass}
          />
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2">Cover Image</label>

          {previewUrl && (
            <div className="relative mb-3 rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container aspect-video w-full">
              <Image
                src={previewUrl}
                alt="Hospital cover preview"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 672px"
                unoptimized={previewUrl.startsWith('blob:')}
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-2 right-2 bg-surface/90 backdrop-blur-sm text-error p-1.5 rounded-lg hover:bg-error-container/30 transition-colors border border-outline-variant/30"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
              </button>
            </div>
          )}

          <div
            onClick={() => fileInputRef.current?.click()}
            className={`flex items-center justify-center gap-3 w-full px-4 py-4 rounded-xl border-2 border-dashed cursor-pointer transition-all text-sm ${
              uploading
                ? 'border-primary/30 bg-primary/5 text-primary cursor-wait'
                : 'border-outline-variant/50 hover:border-primary/50 hover:bg-primary/5 text-on-surface-variant hover:text-primary'
            }`}
          >
            {uploading ? (
              <>
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: 20 }}>progress_activity</span>
                <span>Uploading…</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>upload</span>
                <span>{previewUrl ? 'Replace image' : 'Upload image'}</span>
                <span className="text-xs text-on-surface-variant">(JPG, PNG, WebP · max 5 MB)</span>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {uploadError && (
            <p className="text-xs text-error mt-1.5 flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>error</span>
              {uploadError}
            </p>
          )}

          <details className="mt-3">
            <summary className="text-xs text-on-surface-variant cursor-pointer hover:text-primary select-none">
              Or paste an image URL instead
            </summary>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value)
                setPreviewUrl(e.target.value)
              }}
              placeholder="https://..."
              className={`${inputClass} mt-2`}
            />
          </details>
        </div>

        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'active' | 'inactive' | 'new_data')}
            className={inputClass}
          >
            <option value="active">Active</option>
            <option value="new_data">New Data</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    </form>
  )
}
