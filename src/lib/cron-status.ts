// Pure helpers for the cron heartbeat the Growth Engine page surfaces.
// A cron writes JSON like {"at": ISO, "sent": N} to a settings key on each run.

export interface Heartbeat {
  at: string
  sent: number
}

export function parseHeartbeat(raw: string | null | undefined): Heartbeat | null {
  if (!raw) return null
  try {
    const o = JSON.parse(raw)
    return o && typeof o.at === 'string' ? { at: o.at, sent: Number(o.sent) || 0 } : null
  } catch {
    return null
  }
}

// A daily cron is "stale" if it hasn't recorded a run within maxAgeHours.
export function isHeartbeatStale(hb: Heartbeat | null, now: number = Date.now(), maxAgeHours = 36): boolean {
  if (!hb) return false
  return now - new Date(hb.at).getTime() > maxAgeHours * 3600 * 1000
}
