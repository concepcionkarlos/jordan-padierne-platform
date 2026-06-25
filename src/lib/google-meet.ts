// Create real Google Calendar events with Google Meet links, on Jordan's
// calendar, using a Google Cloud service account with domain-wide delegation
// (impersonates the Workspace user). No interactive OAuth, works headless.
//
// Activates when these env vars are set (otherwise callers fall back to Jitsi):
//   GOOGLE_SA_EMAIL          – service account client_email
//   GOOGLE_SA_PRIVATE_KEY    – service account private_key (\n-escaped is fine)
//   GOOGLE_CALENDAR_USER     – the Workspace user/calendar to write to
//                              (defaults to SMTP_FROM / info@jordanpadierne.com)

import crypto from 'crypto'

const TOKEN_URL = 'https://oauth2.googleapis.com/token'

export function isGoogleMeetConfigured(): boolean {
  return !!(process.env.GOOGLE_SA_EMAIL && process.env.GOOGLE_SA_PRIVATE_KEY)
}

function calendarUser(): string {
  return process.env.GOOGLE_CALENDAR_USER || process.env.SMTP_FROM || 'info@jordanpadierne.com'
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function getAccessToken(): Promise<string | null> {
  const email = process.env.GOOGLE_SA_EMAIL
  let key = process.env.GOOGLE_SA_PRIVATE_KEY
  if (!email || !key) return null
  key = key.replace(/\\n/g, '\n') // env vars often store the key with literal \n

  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const claim = {
    iss: email,
    sub: calendarUser(), // impersonate the Workspace user (domain-wide delegation)
    scope: 'https://www.googleapis.com/auth/calendar.events',
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  }
  const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claim))}`
  let signature: Buffer
  try {
    signature = crypto.createSign('RSA-SHA256').update(signingInput).sign(key)
  } catch (e) {
    console.error('[google-meet] sign', e)
    return null
  }
  const jwt = `${signingInput}.${b64url(signature)}`

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })
  if (!res.ok) {
    console.error('[google-meet] token', res.status, await res.text().catch(() => ''))
    return null
  }
  const data = await res.json()
  return data.access_token ?? null
}

// Creates the event with a Meet link and (sendUpdates: all) lets Google email
// the native calendar invite to the client. Returns the Meet URL, or null on
// any failure so the caller can fall back.
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

  const end = new Date(o.start.getTime() + o.durationMinutes * 60000)
  const body = {
    summary: o.title,
    description: o.description,
    start: { dateTime: o.start.toISOString() },
    end: { dateTime: end.toISOString() },
    attendees: [{ email: o.attendeeEmail, displayName: o.attendeeName }],
    conferenceData: {
      createRequest: {
        requestId: crypto.randomBytes(8).toString('hex'),
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
    reminders: { useDefault: true },
  }

  const url =
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarUser())}/events` +
    `?conferenceDataVersion=1&sendUpdates=all`

  const res = await fetch(url, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    console.error('[google-meet] create', res.status, await res.text().catch(() => ''))
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
