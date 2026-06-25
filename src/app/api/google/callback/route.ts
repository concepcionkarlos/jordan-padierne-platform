import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { storeRefreshTokenFromCode } from '@/lib/google-meet'

// Admin-only: Google redirects here with the authorization code. We verify the
// state, exchange the code for a refresh token, store it, and return to Settings.
export async function GET(req: NextRequest) {
  const denied = await requireUser(); if (denied) return denied
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const err = url.searchParams.get('error')
  const cookieState = req.cookies.get('g_oauth_state')?.value
  const back = new URL('/admin/settings', req.url)

  if (err) {
    back.searchParams.set('google', 'denied')
    return NextResponse.redirect(back)
  }
  if (!code || !state || !cookieState || state !== cookieState) {
    back.searchParams.set('google', 'state')
    return NextResponse.redirect(back)
  }

  const ok = await storeRefreshTokenFromCode(code)
  back.searchParams.set('google', ok ? 'connected' : 'failed')
  const res = NextResponse.redirect(back)
  res.cookies.set('g_oauth_state', '', { maxAge: 0, path: '/' })
  return res
}
