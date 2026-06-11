import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Reversible "kill switch" controlled by the SITE_LOCK_MODE env var (set in Vercel):
//   unset / 'off'  → site works normally
//   'admin'        → public site + lead capture keep working; the CRM (/admin) is locked
//   'all'          → the whole site shows the maintenance screen
// Flip it from Vercel env vars — no code changes, instant on/off.
export function middleware(req: NextRequest) {
  const mode = (process.env.SITE_LOCK_MODE || 'off').toLowerCase()
  if (mode !== 'admin' && mode !== 'all') return NextResponse.next()

  const { pathname } = req.nextUrl

  // Never block the lock screen itself, framework internals, or static assets.
  if (
    pathname === '/locked' ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt'
  ) {
    return NextResponse.next()
  }

  const isAdminArea = pathname.startsWith('/admin')
  const shouldLock = mode === 'all' || (mode === 'admin' && isAdminArea)

  if (shouldLock) {
    const url = req.nextUrl.clone()
    url.pathname = '/locked'
    return NextResponse.rewrite(url, { headers: { 'Retry-After': '86400' } })
  }

  return NextResponse.next()
}

export const config = {
  // Run on everything except static files (assets stay reachable for the lock screen).
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
