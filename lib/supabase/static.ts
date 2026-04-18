import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Use this client ONLY inside generateStaticParams().
 * It bypasses cookie/request context entirely, which is required
 * because generateStaticParams runs outside the request lifecycle.
 */
export function createStaticClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
