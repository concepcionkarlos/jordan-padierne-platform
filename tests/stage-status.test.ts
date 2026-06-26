import { describe, it, expect } from 'vitest'
import { STAGE_TO_STATUS, statusFieldsForStage } from '@/lib/goals'

// Protects: stage/status synchronization + pipeline transitions.
// The #1 correctness guarantee — earnings/active/coach all key off `status`.
describe('stage → status synchronization', () => {
  const cases: [string, string][] = [
    ['NEW', 'new'],
    ['QUALIFIED', 'qualified'],
    ['CONTACTED', 'active'],
    ['SHOWING_SCHEDULED', 'active'],
    ['NEGOTIATION', 'active'],
    ['CLOSED', 'closed'],
    ['LOST', 'lost'],
  ]

  it.each(cases)('%s maps to status "%s"', (stage, status) => {
    expect(STAGE_TO_STATUS[stage]).toBe(status)
    expect(statusFieldsForStage(stage).status).toBe(status)
  })

  it('CLOSED stamps an ISO closed_at', () => {
    const { closed_at } = statusFieldsForStage('CLOSED')
    expect(typeof closed_at).toBe('string')
    expect(Number.isNaN(Date.parse(closed_at as string))).toBe(false)
  })

  it('every non-CLOSED stage clears closed_at (reopen safety)', () => {
    for (const [stage] of cases.filter(([s]) => s !== 'CLOSED')) {
      expect(statusFieldsForStage(stage).closed_at).toBeNull()
    }
  })

  it('unknown stage falls back to active, no closed_at', () => {
    const r = statusFieldsForStage('UNDER_CONTRACT')
    expect(r.status).toBe('active')
    expect(r.closed_at).toBeNull()
  })
})
