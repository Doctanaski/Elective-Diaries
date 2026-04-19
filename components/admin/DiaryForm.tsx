'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import type { Hospital, Diary, DiaryInsert } from '@/types/database'

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
