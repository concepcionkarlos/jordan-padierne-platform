// Pure brand-contact rewriting. The transactional email templates bake in the
// DEFAULT agent contact info; this rewrites those defaults to the live profile's
// values so every email shows current contact details. No-op when the profile
// still matches the defaults. Kept pure (profile passed in) so it's testable and
// free of Next/Supabase imports.

import { DEFAULT_PROFILE } from '@/lib/profile-default'

const DEF_INTL = DEFAULT_PROFILE.telephoneIntl // "+13057996973"
const DEF_DIGITS = DEF_INTL.replace(/^\+/, '') // "13057996973"
const DEF_PHONE = DEFAULT_PROFILE.phone // "305-799-6973"
const DEF_EMAIL = DEFAULT_PROFILE.email // "info@jordanpadierne.com"

export interface BrandContact {
  telephoneIntl: string
  phone: string
  email: string
}

export function rewriteBrandContact(html: string, profile: BrandContact): string {
  const intl = profile.telephoneIntl
  const digits = intl.replace(/^\+/, '')
  let out = html
  // Replace the +country form before the bare digits (the former contains it).
  if (intl !== DEF_INTL) out = out.split(DEF_INTL).join(intl)
  if (digits !== DEF_DIGITS) out = out.split(DEF_DIGITS).join(digits)
  if (profile.phone !== DEF_PHONE) out = out.split(DEF_PHONE).join(profile.phone)
  if (profile.email !== DEF_EMAIL) out = out.split(DEF_EMAIL).join(profile.email)
  return out
}
