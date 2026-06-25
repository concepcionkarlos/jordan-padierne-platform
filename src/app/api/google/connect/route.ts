import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { requireUser } from '@/lib/auth'
import { googleOAuthConfigured, buildConsentUrl } from '@/lib/google-meet'

// Admin-only: kick off the Google Calendar OAuth consent flow.
export async function GET(req: NextRequest) {
  const denied = await requireUser(); if (denied) return denied
  if (!googleOAuthConfigured()) {
    return NextResponse.redirect(new URL('/admin/settings?google=missing_config', req.url))
  }
  const state = crypto.randomBytes(16).toString('hex')
  const res = NextResponse.redirect(buildConsentUrl(state))
  res.cookies.set('g_oauth_state', state, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600, path: '/' })
  return res
}
