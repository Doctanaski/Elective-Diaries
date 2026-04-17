export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      hospitals: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          status: 'active' | 'inactive' | 'new_data'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          status?: 'active' | 'inactive' | 'new_data'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          status?: 'active' | 'inactive' | 'new_data'
          created_at?: string
          updated_at?: string
        }
      }
      diaries: {
        Row: {
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
        Insert: {
          id?: string
          title: string
          content: string
          excerpt?: string | null
          hospital_id: string
          author_name: string
          author_year: string
          specialty?: string | null
          cover_image_url?: string | null
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          excerpt?: string | null
          hospital_id?: string
          author_name?: string
          author_year?: string
          specialty?: string | null
          cover_image_url?: string | null
          published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}

export type Hospital = Database['public']['Tables']['hospitals']['Row']
export type Diary = Database['public']['Tables']['diaries']['Row']
export type HospitalInsert = Database['public']['Tables']['hospitals']['Insert']
export type DiaryInsert = Database['public']['Tables']['diaries']['Insert']
export type DiaryUpdate = Database['public']['Tables']['diaries']['Update']
