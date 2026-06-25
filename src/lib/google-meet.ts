// Real Google Calendar events with Google Meet links, via OAuth 2.0 user
// consent (no service-account key — blocked by org policy). The admin connects
// once: we store a refresh token and the server uses it to create events on
// their calendar. Activates when GOOGLE_OAUTH_CLIENT_ID/SECRET are set AND the
// admin has connected (a refresh token is stored); otherwise callers fall back.

import { getSetting, setSetting } from '@/lib/settings'

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const SCOPE = 'https://www.googleapis.com/auth/calendar.events'
const REFRESH_KEY = 'google_refresh_token'

export function googleOAuthConfigured(): boolean {
  return !!(process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET)
}

export function googleRedirectUri(): string {
  return process.env.GOOGLE_OAUTH_REDIRECT_URI || 'https://jordanpadierne.com/api/google/callback'
}

export function buildConsentUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
    redirect_uri: googleRedirectUri(),
    response_type: 'code',
    scope: SCOPE,
    access_type: 'offline',
    prompt: 'consent', // always return a refresh token
    state,
  })
  return `${AUTH_URL}?${params.toString()}`
}

// Exchange the authorization code for a refresh token and store it.
export async function storeRefreshTokenFromCode(code: string): Promise<boolean> {
  if (!googleOAuthConfigured()) return false
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
      redirect_uri: googleRedirectUri(),
      grant_type: 'authorization_code',
    }),
  })
  if (!res.ok) {
    console.error('[google] code exchange', res.status, await res.text().catch(() => ''))
    return false
  }
  const data = await res.json()
  if (!data.refresh_token) return false
  return setSetting(REFRESH_KEY, data.refresh_token)
}

async function getAccessToken(): Promise<string | null> {
  if (!googleOAuthConfigured()) return null
  const refresh = await getSetting(REFRESH_KEY)
  if (!refresh) return null
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refresh,
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) {
    console.error('[google] refresh', res.status, await res.text().catch(() => ''))
    return null
  }
  const data = await res.json()
  return data.access_token ?? null
}

// True only when OAuth is configured AND the admin has connected their calendar.
export async function isGoogleMeetConfigured(): Promise<boolean> {
  if (!googleOAuthConfigured()) return false
  return !!(await getSetting(REFRESH_KEY))
}

export async function createGoogleMeetEvent(o: {
  title: string
  description?: string
  start: Date
  durationMinutes: number
  attendeeEmail: string
  attendeeName?: string
}): Promise<{ meetUrl: string; htmlLink?: string } | null> {
  const token = await getAccessToken()
  if (!token) return null

  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary'
  const end = new Date(o.start.getTime() + o.durationMinutes * 60000)
  const body = {
    summary: o.title,
    description: o.description,
    start: { dateTime: o.start.toISOString() },
    end: { dateTime: end.toISOString() },
    attendees: [{ email: o.attendeeEmail, displayName: o.attendeeName }],
    conferenceData: {
      createRequest: {
        requestId: Math.random().toString(36).slice(2) + Date.now().toString(36),
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
    reminders: { useDefault: true },
  }

  const url =
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events` +
    `?conferenceDataVersion=1&sendUpdates=all`

  const res = await fetch(url, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    console.error('[google] create event', res.status, await res.text().catch(() => ''))
    return null
  }
  const data = await res.json()
  const meetUrl =
    data.hangoutLink ||
    data.conferenceData?.entryPoints?.find((e: any) => e.entryPointType === 'video')?.uri ||
    ''
  if (!meetUrl) return null
  return { meetUrl, htmlLink: data.htmlLink }
}
