import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isValidName, isValidPhone } from '@/lib/validate'

export { isValidName, isValidPhone } from '@/lib/validate'

// ─── Per-IP + global rate limiting (in-memory, best-effort) ──────────────────
// Serverless instances don't share memory, so this is a cheap first line that
// stops naive curl/bot floods. For hard guarantees, swap in Upstash Redis later.
const HITS = new Map<string, number[]>()
const WINDOW_MS = 10 * 60 * 1000      // 10 min sliding window per IP
const MAX_PER_WINDOW = 6              // max submissions per IP per window
const GLOBAL_WINDOW_MS = 60 * 1000    // 1 min global circuit breaker
const GLOBAL_MAX = 40
const globalHits: number[] = []

export function clientIp(req: NextRequest): string {
  return (
    req.headers.get('x-real-ip') ||
    (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    'unknown'
  )
}

function rateLimited(req: NextRequest): boolean {
  const t = Date.now()
  while (globalHits.length && globalHits[0] < t - GLOBAL_WINDOW_MS) globalHits.shift()
  if (globalHits.length >= GLOBAL_MAX) return true

  const ip = clientIp(req)
  const arr = (HITS.get(ip) || []).filter((ts) => ts > t - WINDOW_MS)
  // Over the limit → reject WITHOUT recording the hit, so a retrying user doesn't
  // keep extending their own lockout.
  if (arr.length >= MAX_PER_WINDOW) { HITS.set(ip, arr); return true }

  arr.push(t)
  HITS.set(ip, arr)
  globalHits.push(t)
  if (HITS.size > 5000) {
    const dead: string[] = []
    HITS.forEach((v, k) => { if (!v.some((ts) => ts > t - WINDOW_MS)) dead.push(k) })
    dead.forEach((k) => HITS.delete(k))
  }
  return false
}

// ─── Email validation + disposable blocklist ─────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i
const DISPOSABLE = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.info', '10minutemail.com', 'tempmail.com',
  'temp-mail.org', 'yopmail.com', 'trashmail.com', 'sharklasers.com', 'getnada.com', 'nada.email',
  'dispostable.com', 'maildrop.cc', 'fakeinbox.com', 'throwawaymail.com', 'mailnesia.com', 'mintemail.com',
  'spamgourmet.com', 'mohmal.com', 'emailondeck.com', 'tmpmail.org', 'moakt.com', 'mailcatch.com',
  'inboxbear.com', 'tempmailo.com', 'discard.email', 'tempr.email', 'fakemail.net', 'mailtemp.org',
])

export function isValidEmail(email: unknown): boolean {
  if (typeof email !== 'string') return false
  const e = email.trim().toLowerCase()
  if (!EMAIL_RE.test(e)) return false
  const domain = e.split('@')[1]
  return !DISPOSABLE.has(domain)
}

export function isPlaceholderEmail(email: unknown): boolean {
  return typeof email === 'string' && /placeholder|example\.com|no-email/i.test(email)
}

// ─── Honeypot + time-trap ────────────────────────────────────────────────────
// Real users never fill the hidden `company_website` field, and don't submit a
// form in under ~2.5s. Bots do both.
function looksLikeBot(body: Record<string, unknown> | null | undefined): boolean {
  if (!body) return false
  const hp = body.company_website
  if (typeof hp === 'string' && hp.trim() !== '') return true
  const ts = Number(body.form_ts)
  if (ts && Date.now() - ts < 2500) return true
  return false
}

// ─── Combined guard for public lead-capture routes ───────────────────────────
// Returns a Response to short-circuit, or null to proceed.
// `requireEmail` also enforces a real, non-disposable email when true.
export function guardPublic(
  req: NextRequest,
  body: Record<string, unknown> | null | undefined,
  opts: { requireEmail?: boolean } = {}
): NextResponse | null {
  // Silently accept-and-drop obvious bots so they don't learn the honeypot.
  if (looksLikeBot(body)) return NextResponse.json({ success: true })

  if (rateLimited(req)) {
    return NextResponse.json({ success: false, error: 'Too many requests. Please try again in a few minutes.' }, { status: 429 })
  }

  if (opts.requireEmail) {
    const email = (body?.email ?? '') as string
    if (!isValidEmail(email)) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 })
    }
  }

  // Reject mismatched field data (e.g. digits in a name, letters in a phone) on
  // EVERY public route — validate whenever the field is present and non-empty.
  const name = body?.full_name
  if (name != null && String(name).trim() !== '' && !isValidName(name)) {
    return NextResponse.json({ success: false, error: 'Please enter a valid name (letters only, no numbers).' }, { status: 400 })
  }
  const phone = body?.phone
  if (phone != null && String(phone).trim() !== '' && !isValidPhone(phone)) {
    return NextResponse.json({ success: false, error: 'Please enter a valid phone number (digits only).' }, { status: 400 })
  }

  return null
}
