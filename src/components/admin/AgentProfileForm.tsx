'use client'

import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'

type Profile = {
  name: string
  license: string
  phone: string
  email: string
  broker: string
  languages: string
}

// key in the `settings` table → label/field
const FIELDS: { key: keyof Profile; settingKey: string; label: string }[] = [
  { key: 'name', settingKey: 'profile_name', label: 'Full Name' },
  { key: 'license', settingKey: 'profile_license', label: 'License Number' },
  { key: 'phone', settingKey: 'profile_phone', label: 'Phone' },
  { key: 'email', settingKey: 'profile_email', label: 'Email' },
  { key: 'broker', settingKey: 'profile_broker', label: 'Broker' },
  { key: 'languages', settingKey: 'profile_languages', label: 'Languages' },
]

export default function AgentProfileForm({ initial }: { initial: Profile }) {
  const [baseline, setBaseline] = useState<Profile>(initial)
  const [profile, setProfile] = useState<Profile>(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const dirty = FIELDS.some((f) => profile[f.key] !== baseline[f.key])

  async function save() {
    setSaving(true); setError(''); setSaved(false)
    try {
      const changed = FIELDS.filter((f) => profile[f.key] !== baseline[f.key])
      const results = await Promise.all(
        changed.map((f) =>
          fetch('/api/settings', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: f.settingKey, value: profile[f.key] }),
          })
            .then((r) => r.json())
            .then((d) => d.success)
            .catch(() => false)
        )
      )
      if (results.every(Boolean)) {
        setSaved(true)
        setBaseline({ ...profile }) // new baseline = just-saved values
        setTimeout(() => setSaved(false), 2500)
      } else {
        setError('Some changes could not be saved. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label htmlFor={`s-${f.key}`} className="label">{f.label}</label>
            <input
              id={`s-${f.key}`}
              className="input-field"
              value={profile[f.key]}
              onChange={(e) => setProfile((p) => ({ ...p, [f.key]: e.target.value }))}
              title={f.label}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={save}
          disabled={!dirty || saving}
          className="btn-primary text-sm px-5 py-2.5 disabled:opacity-50"
        >
          {saving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : 'Save changes'}
        </button>
        {saved && <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600"><Check size={14} /> Saved</span>}
        {error && <span className="text-xs text-wine">{error}</span>}
      </div>
      <p className="text-gray-400 text-xs">
        Saved to your CRM. Public website contact details (footer, contact page) are set in the site configuration —
        ask your developer to point those at these values if you want edits here to show on the live site.
      </p>
    </div>
  )
}
