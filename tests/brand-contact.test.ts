import { describe, it, expect } from 'vitest'
import { rewriteBrandContact } from '@/lib/brand-contact'
import { DEFAULT_PROFILE, deriveContact } from '@/lib/profile-default'

// Protects: email contact replacement — outbound emails must show Jordan's live
// profile number/email, never a stale hardcode, and never corrupt the markup.
const sample = `<a href="tel:+13057996973">305-799-6973</a> | <a href="https://wa.me/13057996973">WA</a> | <a href="mailto:info@jordanpadierne.com">info@jordanpadierne.com</a>`

describe('rewriteBrandContact', () => {
  it('is a no-op when the profile matches the defaults', () => {
    expect(rewriteBrandContact(sample, DEFAULT_PROFILE)).toBe(sample)
  })

  it('rewrites phone (tel + wa.me + display) and email to the live profile', () => {
    const phone = '786-555-0199'
    const email = 'jordan@padierne.com'
    const profile = { ...DEFAULT_PROFILE, phone, email, ...deriveContact(phone, email) }
    const out = rewriteBrandContact(sample, profile)
    expect(out).toContain('tel:+17865550199')
    expect(out).toContain('wa.me/17865550199')
    expect(out).toContain('>786-555-0199<')
    expect(out).toContain('jordan@padierne.com')
  })

  it('leaves no trace of the old defaults and no double-substitution', () => {
    const phone = '786-555-0199'
    const profile = { ...DEFAULT_PROFILE, phone, ...deriveContact(phone, DEFAULT_PROFILE.email) }
    const out = rewriteBrandContact(sample, profile)
    expect(out).not.toContain('+13057996973')
    expect(out).not.toContain('13057996973')
    expect(out).not.toContain('305-799-6973')
    expect((out.match(/\+1786/g) || []).length).toBe(1)
  })

  it('never touches a non-default (lead-owned) phone number', () => {
    const leadHtml = `Lead: <a href="tel:7865551234">786-555-1234</a>`
    const phone = '305-222-3333'
    const profile = { ...DEFAULT_PROFILE, phone, ...deriveContact(phone, DEFAULT_PROFILE.email) }
    expect(rewriteBrandContact(leadHtml, profile)).toBe(leadHtml)
  })
})
