import crypto from 'crypto'

// Signed unsubscribe tokens — so a link can identify the email without exposing
// lead IDs or letting anyone unsubscribe someone else (the signature gates it).
const SECRET = process.env.UNSUB_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'jp-unsub-fallback'
const SITE = 'https://jordanpadierne.com'

function sign(email: string): string {
  return crypto.createHmac('sha256', SECRET).update(email).digest('base64url').slice(0, 20)
}

export function unsubToken(email: string): string {
  const e = (email || '').trim().toLowerCase()
  return `${Buffer.from(e).toString('base64url')}.${sign(e)}`
}

export function verifyUnsubToken(token: string): string | null {
  if (typeof token !== 'string' || !token.includes('.')) return null
  const [payload, sig] = token.split('.')
  try {
    const email = Buffer.from(payload, 'base64url').toString('utf8')
    return sig === sign(email) ? email : null
  } catch {
    return null
  }
}

export function unsubUrl(email: string): string {
  return `${SITE}/unsubscribe?token=${encodeURIComponent(unsubToken(email))}`
}
