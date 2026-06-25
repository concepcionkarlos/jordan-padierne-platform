'use client'

import { useRef, useCallback } from 'react'

// Activates the server-side honeypot + time-trap in src/lib/antispam.ts.
// Real users never fill the hidden `company_website` field and never submit in
// under ~2.5s; bots do both. Usage:
//   const { honeypot, stamp } = useAntiSpam()
//   ...render {honeypot} inside the <form>...
//   body: JSON.stringify(stamp({ ...payload }))
export function useAntiSpam() {
  const startedAt = useRef(Date.now())
  const hpRef = useRef<HTMLInputElement>(null)

  const honeypot = (
    <input
      ref={hpRef}
      type="text"
      name="company_website"
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      className="hidden"
    />
  )

  const stamp = useCallback(<T extends Record<string, unknown>>(body: T) => ({
    ...body,
    company_website: hpRef.current?.value ?? '',
    form_ts: startedAt.current,
  }), [])

  return { honeypot, stamp }
}
