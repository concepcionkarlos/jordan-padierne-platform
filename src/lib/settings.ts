import { createServiceClient } from '@/lib/supabase'

// Lightweight key/value settings backed by the `settings` table.
// Values are stored as jsonb; we keep them as plain strings here.

export async function getSetting(key: string): Promise<string | null> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase.from('settings').select('value').eq('key', key).single()
    if (error || !data) return null
    const v = data.value
    return typeof v === 'string' ? v : (v == null ? null : String(v))
  } catch {
    return null
  }
}

export async function setSetting(key: string, value: string): Promise<boolean> {
  try {
    const supabase = createServiceClient()
    const { error } = await supabase
      .from('settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    return !error
  } catch {
    return false
  }
}
