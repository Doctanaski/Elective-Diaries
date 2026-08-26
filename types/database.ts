export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// ── Explicit row types ──────────────────────────────────────────────────────

export interface Hospital {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  status: 'active' | 'inactive' | 'new_data'
  created_at: string
  updated_at: string
}

export interface Diary {
  id: string
  title: string
  content: string
  excerpt: string | null
  hospital_id: string
  author_name: string
  author_year: string
  specialty: string | null
  cover_image_url: string | null
  pros: string[] | null
  cons: string[] | null
  skills: string[] | null
  gallery_images: string[] | null
  elective_duration: string | null
  supervisor: string | null
  published: boolean
  created_at: string
  updated_at: string
}

export type HospitalInsert = Partial<Hospital> & {
  name: string
  slug: string
}

export type DiaryInsert = Partial<Diary> & {
  title: string
  content: string
  hospital_id: string
  author_name: string
  author_year: string
}

export type DiaryUpdate = Partial<Diary>

export interface SiteContent {
  id: string
  key: string
  value: string
  updated_at: string
}

export interface ContributorDetail {
  icon: string
  label: string
  value: string
}

export interface Contributor {
  id: string
  name: string
  role: string
  tagline: string | null
  bio: string | null
  photo_url: string | null
  details: ContributorDetail[] | null
  sort_order: number | null
  created_at: string
  updated_at: string
}

// ── Database schema type (used by Supabase client) ──────────────────────────

export interface Database {
  public: {
    Tables: {
      hospitals: {
        Row: Hospital
        Insert: HospitalInsert
        Update: Partial<Hospital>
      }
      diaries: {
        Row: Diary
        Insert: DiaryInsert
        Update: DiaryUpdate
      }
      site_content: {
        Row: SiteContent
        Insert: Partial<SiteContent> & { key: string }
        Update: Partial<SiteContent>
      }
      contributors: {
        Row: Contributor
        Insert: Partial<Contributor> & { name: string }
        Update: Partial<Contributor>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
