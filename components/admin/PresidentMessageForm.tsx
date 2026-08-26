'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  heading: string
  message1: string
  message2: string
  signoff: string
  imageUrl: string
}

const PRESIDENT_KEYS = ['president_heading', 'president_message_1', 'president_message_2', 'president_signoff', 'president_image'] as const

export default function PresidentMessageForm({ heading, message1, message2, signoff, imageUrl }: Props) {
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any

  const [headingText, setHeadingText] = useState(heading)
  const [msg1, setMsg1] = useState(message1)
  const [msg2, setMsg2] = useState(message2)
  const [signoffText, setSignoffText] = useState(signoff)
  const [photoUrl, setPhotoUrl] = useState(imageUrl)

  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, WebP, etc.)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB')
      return
    }

    setUploading(true)
    setError('')

    const ext = file.name.split('.').pop()
    const filename = `president/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { data, error: storageError } = await supabase.storage
      .from('site-images')
      .upload(filename, file, { cacheControl: '3600', upsert: false })

    if (storageError) {
      setError(storageError.message)
      setUploading(false)
      return
    }

    const { data: publicData } = supabase.storage.from('site-images').getPublicUrl(data.path)
    setPhotoUrl(publicData.publicUrl)
    setUploading(false)
  }

  function clearImage() {
    setPhotoUrl('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setSaved(false)

    const values: Record<(typeof PRESIDENT_KEYS)[number], string> = {
      president_heading: headingText,
      president_message_1: msg1,
      president_message_2: msg2,
      president_signoff: signoffText,
      president_image: photoUrl,
    }

    const rows = PRESIDENT_KEYS.map(key => ({ key, value: values[key] }))
    const { error: upsertError } = await supabase
      .from('site_content')
      .upsert(rows, { onConflict: 'key' })

    if (upsertError) {
      setError(upsertError.message)
      setSaving(false)
      return
    }

    await fetch('/api/revalidate', { method: 'POST' })
    setSaved(true)
    setSaving(false)
    router.refresh()
  }

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-outline-variant/50 bg-surface text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm'

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-on-surface-variant">Shown on the homepage &ldquo;A Message from the LEO&rdquo; section.</p>
        <button
          onClick={handleSave}
          disabled={saving || uploading}
          className="shrink-0 bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-container transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {(error || saved) && (
        <div className={`mb-5 flex items-center space-x-2 px-4 py-3 rounded-xl text-sm ${
          error ? 'bg-error-container/30 text-error' : 'bg-[#34A853]/10 text-[#34A853]'
        }`}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{error ? 'error' : 'check_circle'}</span>
          <span>{error ?? 'Saved — homepage updated.'}</span>
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2">Heading</label>
          <input
            type="text"
            value={headingText}
            onChange={(e) => setHeadingText(e.target.value)}
            placeholder="A Message from the LEO"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2">Message — Paragraph 1</label>
          <textarea value={msg1} onChange={(e) => setMsg1(e.target.value)} rows={3} className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2">Message — Paragraph 2</label>
          <textarea value={msg2} onChange={(e) => setMsg2(e.target.value)} rows={3} className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2">Sign-off line</label>
          <input
            type="text"
            value={signoffText}
            onChange={(e) => setSignoffText(e.target.value)}
            placeholder="President, KMC Local Council"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2">LEO&apos;s Photo</label>

          {photoUrl && (
            <div className="relative mb-3 rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container w-40 aspect-[400/480]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoUrl} alt="LEO photo preview" className="absolute inset-0 w-full h-full object-cover" />
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
                <span>{photoUrl ? 'Replace photo' : 'Upload photo'}</span>
                <span className="text-xs text-on-surface-variant">(JPG, PNG, WebP · max 5 MB)</span>
              </>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

          <details className="mt-3">
            <summary className="text-xs text-on-surface-variant cursor-pointer hover:text-primary select-none">
              Or paste an image URL instead
            </summary>
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://..."
              className={`${inputClass} mt-2`}
            />
          </details>
        </div>
      </div>
    </div>
  )
}
