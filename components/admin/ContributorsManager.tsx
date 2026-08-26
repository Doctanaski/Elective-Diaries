'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Contributor, ContributorDetail } from '@/types/database'

interface Draft {
  id?: string
  name: string
  role: string
  tagline: string
  bio: string
  photo_url: string
  details: ContributorDetail[]
}

const EMPTY_DETAILS: ContributorDetail[] = [{ icon: 'school', label: 'Batch', value: '' }]

const EMPTY_DRAFT: Draft = { name: '', role: '', tagline: '', bio: '', photo_url: '', details: EMPTY_DETAILS }

const ICON_SUGGESTIONS = ['school', 'local_hospital', 'interests', 'mail', 'science', 'work', 'favorite', 'location_on', 'badge', 'public']

async function revalidateHome() {
  try { await fetch('/api/revalidate', { method: 'POST' }) } catch {}
}

export default function ContributorsManager({ initialContributors }: { initialContributors: Contributor[] }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any
  const [list, setList] = useState<Contributor[]>(initialContributors)
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [savedFlash, setSavedFlash] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function openNew() {
    setDraft(EMPTY_DRAFT)
    setEditingId('new')
    setError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function openEdit(c: Contributor) {
    setDraft({
      id: c.id,
      name: c.name,
      role: c.role ?? '',
      tagline: c.tagline ?? '',
      bio: c.bio ?? '',
      photo_url: c.photo_url ?? '',
      details: c.details?.length ? c.details : EMPTY_DETAILS,
    })
    setEditingId(c.id)
    setError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function closeForm() {
    setEditingId(null)
    setError('')
  }

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
    const filename = `contributors/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { data, error: storageError } = await supabase.storage
      .from('site-images')
      .upload(filename, file, { cacheControl: '3600', upsert: false })

    if (storageError) {
      setError(storageError.message)
      setUploading(false)
      return
    }

    const { data: publicData } = supabase.storage.from('site-images').getPublicUrl(data.path)
    setDraft(d => ({ ...d, photo_url: publicData.publicUrl }))
    setUploading(false)
  }

  function clearPhoto() {
    setDraft(d => ({ ...d, photo_url: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSave() {
    if (!draft.name.trim()) {
      setError('Name is required.')
      return
    }

    setSaving(true)
    setError('')

    const payload = {
      name: draft.name.trim(),
      role: draft.role.trim(),
      tagline: draft.tagline.trim() || null,
      bio: draft.bio.trim() || null,
      photo_url: draft.photo_url || null,
      details: draft.details.filter(d => d.label.trim() || d.value.trim()),
    }

    let savedRow: Contributor | null = null

    if (editingId === 'new') {
      const { data, error: insertError } = await supabase
        .from('contributors')
        .insert({ ...payload, sort_order: list.length + 1 })
        .select('*')
        .single()
      if (insertError) { setError(insertError.message); setSaving(false); return }
      savedRow = data as Contributor
      setList(prev => [...prev, savedRow!])
    } else if (draft.id) {
      const { data, error: updateError } = await supabase
        .from('contributors')
        .update(payload)
        .eq('id', draft.id)
        .select('*')
        .single()
      if (updateError) { setError(updateError.message); setSaving(false); return }
      savedRow = data as Contributor
      setList(prev => prev.map(c => (c.id === draft.id ? savedRow! : c)))
    }

    await revalidateHome()
    setSavedFlash(savedRow!.name)
    setTimeout(() => setSavedFlash(''), 2500)
    setSaving(false)
    closeForm()
  }

  async function handleDelete(c: Contributor) {
    if (!confirm(`Remove ${c.name} from contributors?`)) return
    const { error: deleteError } = await supabase.from('contributors').delete().eq('id', c.id)
    if (deleteError) { setError(deleteError.message); return }
    setList(prev => prev.filter(x => x.id !== c.id))
    if (editingId === c.id) closeForm()
    await revalidateHome()
  }

  async function move(index: number, dir: -1 | 1) {
    const j = index + dir
    if (j < 0 || j >= list.length) return

    const next = [...list]
    ;[next[index], next[j]] = [next[j], next[index]]
    const renumbered = next.map((c, i) => ({ ...c, sort_order: i + 1 }))
    setList(renumbered)

    await Promise.all(
      [renumbered[index], renumbered[j]].map(row =>
        supabase.from('contributors').update({ sort_order: row.sort_order }).eq('id', row.id)
      )
    )
    await revalidateHome()
  }

  function updateDetail(i: number, patch: Partial<ContributorDetail>) {
    setDraft(d => ({
      ...d,
      details: d.details.map((detail, idx) => (idx === i ? { ...detail, ...patch } : detail)),
    }))
  }

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-outline-variant/50 bg-surface text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-on-surface-variant">{list.length} contributor{list.length === 1 ? '' : 's'} · order here matches the homepage tabs.</p>
        {editingId === null && (
          <button
            onClick={openNew}
            className="shrink-0 inline-flex items-center space-x-2 bg-primary text-on-primary px-4 py-2 rounded-xl font-semibold text-sm hover:bg-primary-container transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
            <span>Add Contributor</span>
          </button>
        )}
      </div>

      {savedFlash && (
        <div className="flex items-center space-x-2 bg-[#34A853]/10 text-[#34A853] px-4 py-3 rounded-xl text-sm">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span>
          <span>{savedFlash} saved — homepage updated.</span>
        </div>
      )}

      {error && editingId === null && (
        <div className="flex items-center space-x-2 bg-error-container/30 text-error px-4 py-3 rounded-xl text-sm">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
          <span>{error}</span>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {list.map((c, i) => (
          <div key={c.id} className={`bg-surface-container-lowest border rounded-2xl p-4 flex items-center gap-4 transition-colors ${
            editingId === c.id ? 'border-primary/40' : 'border-outline-variant/20'
          }`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={c.photo_url || '/contributor-placeholder-1.svg'}
              alt=""
              className="w-12 h-14 object-cover rounded-lg border border-outline-variant/30 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-on-surface truncate">{c.name}</p>
              <p className="text-xs text-on-surface-variant truncate">{c.role}</p>
            </div>
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
              <button
                onClick={() => openEdit(c)}
                title="Edit"
                className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>edit</span>
              </button>
              <button
                onClick={() => handleDelete(c)}
                title="Delete"
                className="p-2 rounded-lg text-error hover:bg-error-container/30 transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>delete</span>
              </button>
            </div>
          </div>
        ))}

        {list.length === 0 && (
          <div className="text-center py-10 bg-surface-container-lowest border border-dashed border-outline-variant/30 rounded-2xl text-primary">
            <span className="material-symbols-outlined text-4xl block mb-2 opacity-30">group_add</span>
            <p>No contributors yet. Add your first one!</p>
          </div>
        )}
      </div>

      {/* Editor */}
      {editingId !== null && (
        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-headline font-bold text-lg text-on-surface">
              {editingId === 'new' ? 'New Contributor' : `Edit ${draft.name}`}
            </h3>
            <div className="flex items-center space-x-3">
              <button
                onClick={closeForm}
                className="border border-outline-variant/30 text-on-surface px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || uploading}
                className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-container transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving…' : editingId === 'new' ? 'Add Contributor' : 'Save Changes'}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 bg-error-container/30 text-error px-4 py-3 rounded-xl text-sm">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Name *</label>
              <input type="text" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Full name" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Role / Title</label>
              <input type="text" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} placeholder="e.g. Content Editor" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2">Tagline</label>
            <input type="text" value={draft.tagline} onChange={(e) => setDraft({ ...draft, tagline: e.target.value })} placeholder="One-line description shown under the name" className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2">Bio</label>
            <textarea value={draft.bio} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} rows={4} placeholder="Full biography paragraph" className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2">Bio-data fields</label>
            <div className="space-y-2">
              {draft.details.map((d, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    list="contrib-icon-options"
                    value={d.icon}
                    onChange={(e) => updateDetail(i, { icon: e.target.value })}
                    placeholder="icon"
                    title="Material Symbols icon name"
                    className="w-32 px-3 py-2.5 rounded-xl border border-outline-variant/50 bg-surface text-on-surface text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                  <input
                    value={d.label}
                    onChange={(e) => updateDetail(i, { label: e.target.value })}
                    placeholder="Label (e.g. Batch)"
                    className="w-40 px-3 py-2.5 rounded-xl border border-outline-variant/50 bg-surface text-on-surface text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                  <input
                    value={d.value}
                    onChange={(e) => updateDetail(i, { value: e.target.value })}
                    placeholder="Value (e.g. KMC Batch 2023)"
                    className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-outline-variant/50 bg-surface text-on-surface text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setDraft({ ...draft, details: draft.details.filter((_, idx) => idx !== i) })}
                    className="p-2 rounded-lg text-error hover:bg-error-container/30 transition-colors shrink-0"
                    title="Remove field"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                  </button>
                </div>
              ))}
              <datalist id="contrib-icon-options">
                {ICON_SUGGESTIONS.map(icon => <option key={icon} value={icon} />)}
              </datalist>
              <button
                type="button"
                onClick={() => setDraft({ ...draft, details: [...draft.details, { icon: 'star', label: '', value: '' }] })}
                className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                Add field
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2">Photo</label>

            {draft.photo_url && (
              <div className="relative mb-3 rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container w-40 aspect-[400/480]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={draft.photo_url} alt="Contributor preview" className="absolute inset-0 w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={clearPhoto}
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
                  <span>{draft.photo_url ? 'Replace photo' : 'Upload photo'}</span>
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
                value={draft.photo_url}
                onChange={(e) => setDraft({ ...draft, photo_url: e.target.value })}
                placeholder="https://..."
                className={`${inputClass} mt-2`}
              />
            </details>
          </div>
        </div>
      )}
    </div>
  )
}
