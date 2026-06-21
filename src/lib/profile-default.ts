// Pure, dependency-free agent-profile shape + defaults.
// Safe to import in BOTH client and server (no next/server, no Supabase here).

export type Profile = {
  name: string
  phone: string        // display form, e.g. "305-799-6973"
  phoneHref: string    // "tel:+13057996973"
  email: string
  emailHref: string    // "mailto:info@jordanpadierne.com"
  whatsapp: string     // "https://wa.me/13057996973"
  telephoneIntl: string // "+13057996973" (for schema.org)
  license: string
  broker: string
  areas: string
  languages: string
}

// Normalize a typed phone into the E.164-ish digit string used for tel:/wa.me.
export function digitsWithCountry(phone: string): string {
  const d = (phone || '').replace(/\D/g, '')
  if (d.length === 10) return `1${d}`          // US number without country code
  return d                                      // already has country code (or unusual)
}

// Derive the link/href fields from a display phone + email.
export function deriveContact(phone: string, email: string) {
  const d = digitsWithCountry(phone)
  return {
    phoneHref: `tel:+${d}`,
    whatsapp: `https://wa.me/${d}`,
    telephoneIntl: `+${d}`,
    emailHref: `mailto:${email}`,
  }
}

const BASE = {
  name: 'Jordan Padierne',
  phone: '305-799-6973',
  email: 'info@jordanpadierne.com',
  license: 'SL3641062',
  broker: 'eXp Realty',
  areas: 'Miami-Dade, Brickell, Hialeah, Downtown, Doral, Coral Gables',
  languages: 'English / Español',
}

export const DEFAULT_PROFILE: Profile = {
  ...BASE,
  ...deriveContact(BASE.phone, BASE.email),
}
