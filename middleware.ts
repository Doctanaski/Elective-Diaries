import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Only run middleware on routes that actually need auth checking.
     * Explicitly skip:
     *   - _next/static  (static assets)
     *   - _next/image   (image optimisation)
     *   - favicon.ico
     *   - public files (svg, png, jpg, etc.)
     *
     * Only run on:
     *   - /admin/* routes (auth-protected)
     *   - / and /hospitals/* (need cookie refresh for Supabase session)
     */
    '/admin/:path*',
    '/',
    '/hospitals/:path*',
    '/about',
  ],
}
