'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Hospital } from '@/types/database'

interface HospitalFormProps {
  hospital?: Hospital
}

export default function HospitalForm({ hospital }: HospitalFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const isEditing = !!hospital

  const [name, setName] = useState(hospital?.name ?? '')
  const [slug, setSlug] = useState(hospital?.slug ?? '')
  const [description, setDescription] = useState(hospital?.description ?? '')
  const [imageUrl, setImageUrl] = useState(hospital?.image_url ?? '')
  const [status, setStatus] = useState<'active' | 'inactive' | 'new_data'>(hospital?.status ?? 'active')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function generateSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
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
            disabled={saving}
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

        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2">Cover Image URL</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            className={inputClass}
          />
          <p className="text-xs text-on-surface-variant mt-1">
            Paste a direct image URL. We'll add file upload support in a future update.
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
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
