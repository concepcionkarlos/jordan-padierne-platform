import { unstable_cache } from 'next/cache'
import { getSetting } from '@/lib/settings'
import { DEFAULT_PROFILE, deriveContact, type Profile } from '@/lib/profile-default'

export const PROFILE_TAG = 'agent-profile'

// Server-side: resolve the agent profile from the `settings` table, falling back
// to the code defaults. Cached + tagged so public pages stay fast (ISR); the
// settings PATCH route busts this tag when Jordan edits his profile.
export const getProfile = unstable_cache(
  async (): Promise<Profile> => {
    const [name, phone, email, license, broker, languages] = await Promise.all([
      getSetting('profile_name'),
      getSetting('profile_phone'),
      getSetting('profile_email'),
      getSetting('profile_license'),
      getSetting('profile_broker'),
      getSetting('profile_languages'),
    ])
    const base = {
      name: name || DEFAULT_PROFILE.name,
      phone: phone || DEFAULT_PROFILE.phone,
      email: email || DEFAULT_PROFILE.email,
      license: license || DEFAULT_PROFILE.license,
      broker: broker || DEFAULT_PROFILE.broker,
      languages: languages || DEFAULT_PROFILE.languages,
      areas: DEFAULT_PROFILE.areas,
    }
    return { ...base, ...deriveContact(base.phone, base.email) }
  },
  ['agent-profile-v1'],
  { tags: [PROFILE_TAG], revalidate: 3600 }
)
