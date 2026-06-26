import { describe, it, expect } from 'vitest'
import { parseHeartbeat, isHeartbeatStale } from '@/lib/cron-status'

// Protects: cron observability — a silent cron failure must surface as "overdue".
describe('cron heartbeat', () => {
  it('parses a valid heartbeat', () => {
    const hb = parseHeartbeat(JSON.stringify({ at: '2026-06-25T16:00:00Z', sent: 4 }))
    expect(hb).toEqual({ at: '2026-06-25T16:00:00Z', sent: 4 })
  })

  it('returns null for null / garbage / missing "at"', () => {
    expect(parseHeartbeat(null)).toBeNull()
    expect(parseHeartbeat('not json')).toBeNull()
    expect(parseHeartbeat(JSON.stringify({ sent: 1 }))).toBeNull()
  })

  it('defaults a missing/invalid sent to 0', () => {
    expect(parseHeartbeat(JSON.stringify({ at: '2026-06-25T16:00:00Z' }))?.sent).toBe(0)
  })

  it('flags a run older than 36h as stale, fresh runs as not', () => {
    const now = Date.parse('2026-06-25T18:00:00Z')
    const fresh = { at: '2026-06-25T16:00:00Z', sent: 2 } // 2h ago
    const old = { at: '2026-06-23T16:00:00Z', sent: 2 }   // ~50h ago
    expect(isHeartbeatStale(fresh, now)).toBe(false)
    expect(isHeartbeatStale(old, now)).toBe(true)
    expect(isHeartbeatStale(null, now)).toBe(false)
  })
})
