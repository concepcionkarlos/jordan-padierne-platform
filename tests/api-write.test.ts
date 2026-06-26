import { describe, it, expect } from 'vitest'
import { pickAllowed, LEAD_FIELDS, PROPERTY_FIELDS, APPOINTMENT_FIELDS, TESTIMONIAL_FIELDS, POST_FIELDS } from '@/lib/api-write'

// Protects: API write validation — no mass-assignment of id/created_at/unknown
// columns into admin write routes.
describe('pickAllowed', () => {
  it('keeps only whitelisted keys, drops everything else', () => {
    const out = pickAllowed({ full_name: 'A', phone: '305', id: 'x', created_at: 'y', is_admin: true }, LEAD_FIELDS)
    expect(out).toEqual({ full_name: 'A', phone: '305' })
    expect('id' in out).toBe(false)
    expect('is_admin' in out).toBe(false)
  })

  it('skips undefined values', () => {
    expect(pickAllowed({ title: 'X', price: undefined }, PROPERTY_FIELDS)).toEqual({ title: 'X' })
  })

  it('returns {} for null/empty body', () => {
    expect(pickAllowed(null, LEAD_FIELDS)).toEqual({})
    expect(pickAllowed({}, LEAD_FIELDS)).toEqual({})
  })

  it('field lists never expose immutable columns', () => {
    for (const list of [LEAD_FIELDS, PROPERTY_FIELDS, APPOINTMENT_FIELDS, TESTIMONIAL_FIELDS, POST_FIELDS]) {
      expect(list.length).toBeGreaterThan(0)
      expect(list).not.toContain('id')
      expect(list).not.toContain('created_at')
      expect(list).not.toContain('updated_at')
    }
  })
})
