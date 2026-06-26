import { cookies, headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Reads the authenticated user from the request. The web admin authenticates via
// the SSR session cookie; native iOS clients send a Supabase access token in the
// Authorization header. The Bearer branch is additive — when no Authorization
// header is present (every browser request), the cookie path is unchanged.
export async function getSessionUser() {
  try {
    const authz = headers().get('authorization')
    const bearer = authz && authz.toLowerCase().startsWith('bearer ') ? authz.slice(7).trim() : null
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
    const { data } = bearer
      ? await supabase.auth.getUser(bearer)
      : await supabase.auth.getUser()
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
