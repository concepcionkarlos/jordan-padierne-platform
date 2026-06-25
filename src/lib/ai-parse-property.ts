// ─── AI property parser ──────────────────────────────────────────────────────
// Jordan pastes any listing text (MLS sheet, an email, a flyer, a WhatsApp blurb)
// and an LLM turns it into the structured fields of the Add Property form. He just
// reviews and saves — no manual typing. Built for speed, not perfection: every
// field is editable afterward.
//
// Provider order (first one configured wins), identical to lib/ai-evaluate:
//   1. Gemini  — GEMINI_API_KEY (free tier from Google AI Studio)
//   2. Claude  — ANTHROPIC_API_KEY
//   3. neither → null → the UI just keeps the manual form.
//
// Both providers are called over plain fetch (no SDK).

import { AREAS } from '@/lib/utils'

export interface ParsedProperty {
  title: string
  description: string
  price: number | ''
  listing_type: 'sale' | 'rent' | 'investment'
  bedrooms: number | ''
  bathrooms: number | ''
  sqft: number | ''
  address: string
  city: string
  type: 'condo' | 'house' | 'townhouse' | 'pre-construction' | 'land'
  is_pre_construction: boolean
  is_luxury: boolean
}

const LISTING_TYPES = ['sale', 'rent', 'investment']
const PROP_TYPES = ['condo', 'house', 'townhouse', 'pre-construction', 'land']

const SYSTEM = `You extract structured real-estate listing data for Jordan Padierne, a Realtor in South Florida (eXp Realty). The user pastes raw, messy listing text — an MLS sheet, an email, a flyer, an agent's note, anything. Extract the facts into clean fields. Never invent numbers you don't see; leave a field empty if it isn't in the text. Write a short, polished, buyer-facing "description" (2–3 sentences, warm and professional, English) from the highlights — even if the source is terse or in Spanish.`

const SHAPE = `Return a JSON object with EXACTLY these keys:
- "title": a concise listing title (e.g. "Modern Brickell Waterfront Condo"). If none is obvious, build one from type + area.
- "description": 2–3 polished buyer-facing sentences in English.
- "price": number only, no symbols or commas (monthly amount if it's a rental). Empty string if unknown.
- "listing_type": one of "sale", "rent", "investment".
- "bedrooms": number, or empty string if unknown.
- "bathrooms": number (may be like 2.5), or empty string if unknown.
- "sqft": interior square feet as a number, or empty string if unknown.
- "address": street address if present, else empty string.
- "city": the best match from EXACTLY this list: ${AREAS.join(', ')}. Use "Other" if none fit.
- "type": one of "condo", "house", "townhouse", "pre-construction", "land".
- "is_pre_construction": boolean — true if it's a new/pre-construction development.
- "is_luxury": boolean — true if luxury/high-end (waterfront, penthouse, premium finishes, $1M+).`

function buildUserPrompt(text: string): string {
  return `Listing text to parse:\n"""\n${text.slice(0, 6000)}\n"""\n\nExtract the structured listing.`
}

function num(v: any): number | '' {
  if (typeof v === 'number' && isFinite(v)) return v
  if (typeof v === 'string') {
    const n = parseFloat(v.replace(/[^0-9.]/g, ''))
    return isFinite(n) && n > 0 ? n : ''
  }
  return ''
}

function pick<T extends string>(v: any, allowed: T[], fallback: T): T {
  const s = String(v ?? '').toLowerCase().trim()
  return (allowed.find((a) => a.toLowerCase() === s) ?? fallback) as T
}

function matchArea(v: any): string {
  const s = String(v ?? '').toLowerCase().trim()
  if (!s) return 'Other'
  const exact = AREAS.find((a) => a.toLowerCase() === s)
  if (exact) return exact
  const partial = AREAS.find((a) => a.toLowerCase() !== 'other' && (a.toLowerCase().includes(s) || s.includes(a.toLowerCase())))
  return partial ?? 'Other'
}

// Coerce a parsed model object into a safe ParsedProperty, or null if unusable.
function normalize(out: any): ParsedProperty | null {
  if (!out || typeof out !== 'object') return null
  const title = typeof out.title === 'string' ? out.title.trim().slice(0, 120) : ''
  const description = typeof out.description === 'string' ? out.description.trim().slice(0, 1200) : ''
  const price = num(out.price)
  // Need at least a title or a price to be worth pre-filling.
  if (!title && !price) return null
  return {
    title,
    description,
    price,
    listing_type: pick(out.listing_type, LISTING_TYPES as any, 'sale'),
    bedrooms: num(out.bedrooms),
    bathrooms: num(out.bathrooms),
    sqft: num(out.sqft),
    address: typeof out.address === 'string' ? out.address.trim().slice(0, 200) : '',
    city: matchArea(out.city),
    type: pick(out.type, PROP_TYPES as any, 'condo'),
    is_pre_construction: out.is_pre_construction === true,
    is_luxury: out.is_luxury === true,
  }
}

// ─── Gemini (Google AI Studio — free tier) ───────────────────────────────────
async function parseWithGemini(text: string): Promise<ParsedProperty | null> {
  const key = process.env.GEMINI_API_KEY
  if (!key) return null
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`
  const payload = JSON.stringify({
    system_instruction: { parts: [{ text: `${SYSTEM}\n\n${SHAPE}` }] },
    contents: [{ role: 'user', parts: [{ text: buildUserPrompt(text) }] }],
    generationConfig: { responseMimeType: 'application/json', temperature: 0.3, maxOutputTokens: 1024 },
  })
  for (let attempt = 1; attempt <= 2; attempt++) {
    const c = new AbortController()
    const t = setTimeout(() => c.abort(), 22000)
    try {
      const res = await fetch(url, {
        method: 'POST',
        signal: c.signal,
        headers: { 'content-type': 'application/json' },
        body: payload,
      })
      if (!res.ok) {
        if (res.status === 503 && attempt === 1) { await new Promise((r) => setTimeout(r, 1500)); continue }
        console.error('[ai-parse-property] gemini HTTP', res.status, await res.text().catch(() => ''))
        return null
      }
      const data = await res.json()
      const out = data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join('') ?? ''
      return out ? normalize(JSON.parse(out)) : null
    } catch (err) {
      console.error('[ai-parse-property] gemini', err)
      return null
    } finally {
      clearTimeout(t)
    }
  }
  return null
}

// ─── Claude (Anthropic Messages API) ─────────────────────────────────────────
const CLAUDE_TOOL = {
  name: 'record_listing',
  description: 'Record the structured real-estate listing extracted from the pasted text.',
  input_schema: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      price: { type: ['number', 'string'] },
      listing_type: { type: 'string', enum: LISTING_TYPES },
      bedrooms: { type: ['number', 'string'] },
      bathrooms: { type: ['number', 'string'] },
      sqft: { type: ['number', 'string'] },
      address: { type: 'string' },
      city: { type: 'string' },
      type: { type: 'string', enum: PROP_TYPES },
      is_pre_construction: { type: 'boolean' },
      is_luxury: { type: 'boolean' },
    },
    required: ['title', 'description', 'listing_type', 'type'],
  },
}

async function parseWithClaude(text: string): Promise<ParsedProperty | null> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return null
  const model = process.env.AI_MODEL || 'claude-opus-4-8'
  const c = new AbortController()
  const t = setTimeout(() => c.abort(), 22000)
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: c.signal,
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system: `${SYSTEM}\n\n${SHAPE}`,
        tools: [CLAUDE_TOOL],
        tool_choice: { type: 'tool', name: 'record_listing' },
        messages: [{ role: 'user', content: buildUserPrompt(text) }],
      }),
    })
    if (!res.ok) { console.error('[ai-parse-property] claude HTTP', res.status, await res.text().catch(() => '')); return null }
    const data = await res.json()
    if (data.stop_reason === 'refusal') return null
    const block = (data.content ?? []).find((b: any) => b?.type === 'tool_use' && b?.name === 'record_listing')
    return normalize(block?.input)
  } catch (err) {
    console.error('[ai-parse-property] claude', err)
    return null
  } finally {
    clearTimeout(t)
  }
}

// ─── Orchestrator ────────────────────────────────────────────────────────────
export async function aiParseProperty(text: string): Promise<ParsedProperty | null> {
  if (!text || text.trim().length < 8) return null
  return (await parseWithGemini(text)) ?? (await parseWithClaude(text))
}
