import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Public API endpoints the marketing site legitimately calls without login.
// Everything else under /api/* requires an authenticated admin session.
const PUBLIC_API = ['/api/forms', '/api/subscribe', '/api/book', '/api/qualify', '/api/unsubscribe', '/api/verify', '/api/cron']

function isPublicApi(pathname: string): boolean {
  return PUBLIC_API.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── 1) Reversible site lock (kill switch) ──────────────────────────────
  const mode = (process.env.SITE_LOCK_MODE || 'off').toLowerCase()
  if (mode === 'admin' || mode === 'all') {
    const allowThrough =
      pathname === '/locked' || pathname.startsWith('/_next') || pathname === '/favicon.ico' || pathname === '/robots.txt'
    if (!allowThrough) {
      const lockAll = mode === 'all'
      const lockAdmin = mode === 'admin' && pathname.startsWith('/admin')
      if (lockAll || lockAdmin) {
        const url = req.nextUrl.clone()
        url.pathname = '/locked'
        return NextResponse.rewrite(url, { headers: { 'Retry-After': '86400' } })
      }
    }
  }

  // ── 2) Auth gate ───────────────────────────────────────────────────────
  const isAdminPage = pathname.startsWith('/admin') && pathname !== '/admin/login'
  const isProtectedApi = pathname.startsWith('/api/') && !isPublicApi(pathname)
  if (!isAdminPage && !isProtectedApi) return NextResponse.next()

  const res = NextResponse.next({ request: { headers: req.headers } })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options: Record<string, unknown>) => {
          res.cookies.set({ name, value, ...options })
        },
        remove: (name: string, options: Record<string, unknown>) => {
          res.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Native iOS clients send a Supabase access token in the Authorization header
  // instead of the SSR cookie. Browsers never send this header, so the existing
  // cookie-based web flow is byte-for-byte unchanged — this is additive only.
  const authz = req.headers.get('authorization')
  const bearer = authz && authz.toLowerCase().startsWith('bearer ') ? authz.slice(7).trim() : null
  const { data: { user } } = bearer
    ? await supabase.auth.getUser(bearer)
    : await supabase.auth.getUser()

  if (!user) {
    if (isProtectedApi) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const url = req.nextUrl.clone()
    url.pathname = '/admin/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  return res
}

export const config = {
  // Run on everything except static files.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
