'use client'

import { createContext, useContext } from 'react'
import { DEFAULT_PROFILE, type Profile } from '@/lib/profile-default'

const Ctx = createContext<Profile>(DEFAULT_PROFILE)

// Seeded by the server (PublicLayout reads getProfile() and passes it here), so
// every public component can read the live contact info via useProfile().
export function ProfileProvider({ value, children }: { value: Profile; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useProfile() {
  return useContext(Ctx)
}
