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
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
