// Pure, framework-free field validators — safe to import in BOTH client
// components and server routes (no next/server dependency here).

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i

// Email: basic shape check (the real guarantee is the double opt-in verification
// email — an address that can't receive mail never confirms, so it never becomes
// a CRM lead).
export function isValidEmailFormat(email: unknown): boolean {
  return typeof email === 'string' && EMAIL_RE.test(email.trim())
}

// Name: at least 2 chars, NO digits.
export function isValidName(name: unknown): boolean {
  if (typeof name !== 'string') return false
  const n = name.trim()
  return n.length >= 2 && !/\d/.test(n)
}

// Phone: at least 7 digits and NO letters (allows + ( ) - . spaces).
export function isValidPhone(phone: unknown): boolean {
  if (typeof phone !== 'string') return false
  if (/[a-zA-Z]/.test(phone)) return false
  return phone.replace(/\D/g, '').length >= 7
}

// Live input filters — strip disallowed characters as the user types.
export function stripDigits(s: string): string {
  return s.replace(/[0-9]/g, '')
}
export function stripNonPhone(s: string): string {
  return s.replace(/[^\d\s()+\-.]/g, '')
}
