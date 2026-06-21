import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Reads the Supabase session from the request cookies (set by the SSR browser
// client at login) and returns the authenticated user, or null.
export async function getSessionUser() {
  try {
    const store = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
      {
        cookies: {
          get: (name: string) => store.get(name)?.value,
          set() {},
          remove() {},
        },
      }
    )
    const { data } = await supabase.auth.getUser()
    return data.user ?? null
  } catch {
    return null
  }
}

// Guard for admin API route handlers. Returns a 401 NextResponse when the
// caller isn't authenticated, or null when they are (proceed).
export async function requireUser(): Promise<NextResponse | null> {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  return null
}
