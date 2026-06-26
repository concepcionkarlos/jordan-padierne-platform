import { describe, it, expect } from 'vitest'
import { buildMorningBrief } from '@/lib/morning-brief'

// Protects: the Morning AI Brief composition (deterministic, always-on).
describe('buildMorningBrief', () => {
  it('leads with the next move, then closest, risk, and today', () => {
    const s = buildMorningBrief({
      topMove: { title: 'Call about the offer', name: 'María' },
      closest: { name: 'María', prob: 0.7, commission: 26700 },
      risk: [{ name: 'David', days: 6 }, { name: 'Ana', days: 5 }],
      todayAppts: 1, followups: 2, overdue: 1,
    })
    expect(s[0]).toContain('Start here')
    expect(s.join(' ')).toContain('closest to closing')
    expect(s.join(' ')).toContain('70%')
    expect(s.join(' ')).toContain('2 deals at risk')
    expect(s.join(' ')).toContain('David has gone quiet for 6 days')
    expect(s.join(' ')).toContain('1 appointment')
    expect(s.join(' ')).toContain('2 follow-ups')
    expect(s.join(' ')).toContain('1 overdue item')
  })

  it('falls back to the hottest lead when there is no coach move', () => {
    const s = buildMorningBrief({ hottest: { name: 'Carlos' }, risk: [], todayAppts: 0, followups: 0, overdue: 0 })
    expect(s[0]).toContain('Start with Carlos')
  })

  it('gives an encouraging nudge when the pipeline is empty', () => {
    const s = buildMorningBrief({ risk: [], todayAppts: 0, followups: 0, overdue: 0 })
    expect(s).toHaveLength(1)
    expect(s[0].toLowerCase()).toContain('prospect')
  })

  it('uses singular wording for single items', () => {
    const s = buildMorningBrief({ risk: [{ name: 'Bob', days: 1 }], todayAppts: 1, followups: 0, overdue: 0 })
    const txt = s.join(' ')
    expect(txt).toContain('1 deal at risk')
    expect(txt).toContain('quiet for 1 day')
    expect(txt).toContain('1 appointment')
  })
})
