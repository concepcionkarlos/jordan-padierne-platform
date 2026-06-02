/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServiceClient, isSupabaseConfigured } from './supabase'

/**
 * Safe Supabase query wrapper.
 * Returns `fallback` instantly when Supabase credentials are not configured,
 * avoiding 7-second network timeouts during local development.
 *
 * Uses `any` internally because we run without Supabase codegen — type safety
 * lives in the component consuming the data, not in the query wrapper.
 */
export async function safeQuery(
  fn: (client: ReturnType<typeof createServiceClient>) => PromiseLike<{ data: any; error: any }>,
  fallback: any
): Promise<any> {
  if (!isSupabaseConfigured()) return fallback
  try {
    const client = createServiceClient()
    const { data, error } = await fn(client)
    if (error) {
      console.error('[db]', error)
      return fallback
    }
    return data ?? fallback
  } catch (err) {
    console.error('[db]', err)
    return fallback
  }
}
