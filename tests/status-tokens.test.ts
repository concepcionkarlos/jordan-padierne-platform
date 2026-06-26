import { describe, it, expect } from 'vitest'
import { tone, stageBadge, statusBadge, scoreBand, SEMANTIC } from '@/lib/status-tokens'
import { getPipelineStageColor, getStatusColor } from '@/lib/utils'

// Protects: the unified status map (Phase 7.4). The domain helpers must keep
// returning the EXACT class strings they did before centralisation, so the
// pipeline board / badges never shift visually.
describe('status tokens', () => {
  it('keeps stage colours identical to the legacy mapping', () => {
    expect(stageBadge('NEW')).toBe('bg-sky-100 text-sky-700')
    expect(stageBadge('NEGOTIATION')).toBe('bg-amber-100 text-amber-700')
    expect(stageBadge('CLOSED')).toBe('bg-green-100 text-green-700')
    expect(stageBadge('LOST')).toBe('bg-red-100 text-red-700')
    expect(stageBadge('???')).toBe('bg-gray-100 text-gray-700')
  })

  it('utils helpers delegate to the same map', () => {
    for (const s of ['NEW', 'QUALIFIED', 'CONTACTED', 'SHOWING_SCHEDULED', 'NEGOTIATION', 'CLOSED', 'LOST']) {
      expect(getPipelineStageColor(s)).toBe(stageBadge(s))
    }
    for (const s of ['new', 'closed', 'unread', 'replied', 'archived']) {
      expect(getStatusColor(s)).toBe(statusBadge(s))
    }
  })

  it('exposes semantic tones as bg+text strings', () => {
    expect(tone('success')).toBe('bg-green-50 text-green-700')
    expect(tone('error')).toBe('bg-wine-50 text-wine-700')
    expect(SEMANTIC.warning.dot).toBe('bg-amber-500')
  })

  it('bands the smart score on the same thresholds as scoreLead', () => {
    expect(scoreBand(80).label).toBe('Hot')
    expect(scoreBand(60).label).toBe('Warm')
    expect(scoreBand(40).label).toBe('Cool')
    expect(scoreBand(10).label).toBe('Cold')
  })
})
