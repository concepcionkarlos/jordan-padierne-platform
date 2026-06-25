// ─── AI lead evaluation ──────────────────────────────────────────────────────
// When a lead completes the qualification form, an LLM reads their answers and
// returns a structured evaluation + a sharp, Jordan-facing next-step plan.
// Drop-in for the rule-based evaluateLead(): returns the SAME Evaluation shape,
// or null on any failure so the caller falls back to the free rule-based engine.
//
// Provider order (first one configured wins):
//   1. Gemini  — set GEMINI_API_KEY (free tier from Google AI Studio)
//   2. Claude  — set ANTHROPIC_API_KEY
//   3. neither → null → caller uses the rule-based engine (free, no external call)
//
// Both providers are called over plain fetch (no SDK).

import type { Evaluation, QualAnswers } from '@/lib/evaluate'

const ALLOWED_TAGS = ['hot', 'cash_buyer', 'pre_approved', 'urgent', 'vip', 'investor', 'international', 'referral']

const SYSTEM = `You are an elite real-estate sales coach and analyst for Jordan Padierne, a Realtor in Miami with eXp Realty. A prospective client just completed a qualification form. Read their answers and produce a decisive evaluation plus a concrete next-step plan that makes Jordan more effective and closes more deals. Be specific to the South Florida market (Brickell, Doral, Coral Gables, Downtown, Hialeah, pre-construction).`

// The exact JSON contract both providers must return.
const SHAPE = `Return a JSON object with EXACTLY these keys:
- "temperature": one of "Hot", "Warm", "Cool" (overall lead temperature from intent, budget, financing readiness, urgency).
- "hot_score": 1, 2 or 3 (1=Cool, 2=Warm, 3=Hot).
- "tags": array of strings, only from this set and only when clearly supported: ${ALLOWED_TAGS.join(', ')}.
- "tasks": array of 2 to 4 objects { "title": string, "priority": "low"|"medium"|"high" }, most important first, each a specific action (e.g. "Call Maria today — cash buyer, 30-day timeline").
- "summary": a sharp 3–5 sentence Jordan-facing briefing. Open with the verdict, then the single most important next step, then specifics (what price range / area / property type of listings to send, the angle to use, the objection to expect). Concrete and Miami-specific. No greeting, no fluff.`

function buildUserPrompt(a: QualAnswers): string {
  return `Lead name: ${a.full_name}\n\nForm answers (JSON):\n${JSON.stringify(a, null, 2)}\n\nEvaluate this lead.`
}

// Coerce a parsed model object into a valid Evaluation, or null if unusable.
function normalize(out: any): Evaluation | null {
  if (!out || typeof out !== 'object') return null
  const temperature = (['Hot', 'Warm', 'Cool'].includes(out.temperature)
    ? out.temperature
    : 'Warm') as Evaluation['temperature']
  const hot_score: number = [1, 2, 3].includes(out.hot_score)
    ? out.hot_score
    : temperature === 'Hot' ? 3 : temperature === 'Warm' ? 2 : 1
  const tags: string[] = Array.isArray(out.tags)
    ? Array.from(
        new Set<string>(
          (out.tags as any[])
            .filter((t: any) => typeof t === 'string')
            .map((t: string) => t.toLowerCase().trim().replace(/\s+/g, '_'))
            .filter((t: string) => ALLOWED_TAGS.includes(t))
        )
      ).slice(0, 8)
    : []
  const tasks = Array.isArray(out.tasks)
    ? out.tasks
        .filter((t: any) => t && typeof t.title === 'string')
        .slice(0, 5)
        .map((t: any) => ({
          title: String(t.title),
          priority: (['low', 'medium', 'high'].includes(t.priority) ? t.priority : 'medium') as
            | 'low'
            | 'medium'
            | 'high',
        }))
    : []
  const summary = typeof out.summary === 'string' ? out.summary.trim() : ''
  if (!summary || tasks.length === 0) return null
  return { hot_score, tags, tasks, summary, temperature }
}

function withTimeout(ms: number) {
  const c = new AbortController()
  const t = setTimeout(() => c.abort(), ms)
  return { signal: c.signal, clear: () => clearTimeout(t) }
}

// ─── Gemini (Google AI Studio — free tier) ───────────────────────────────────
async function evaluateWithGemini(a: QualAnswers): Promise<Evaluation | null> {
  const key = process.env.GEMINI_API_KEY
  if (!key) return null
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`
  const payload = JSON.stringify({
    system_instruction: { parts: [{ text: `${SYSTEM}\n\n${SHAPE}` }] },
    contents: [{ role: 'user', parts: [{ text: buildUserPrompt(a) }] }],
    generationConfig: { responseMimeType: 'application/json', temperature: 0.4, maxOutputTokens: 1024 },
  })
  // Up to 2 attempts — the free tier occasionally returns a transient 503.
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
        console.error('[ai-evaluate] gemini HTTP', res.status, await res.text().catch(() => ''))
        return null
      }
      const data = await res.json()
      const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join('') ?? ''
      return text ? normalize(JSON.parse(text)) : null
    } catch (err) {
      console.error('[ai-evaluate] gemini', err)
      return null
    } finally {
      clearTimeout(t)
    }
  }
  return null
}

// ─── Claude (Anthropic Messages API) ─────────────────────────────────────────
const CLAUDE_TOOL = {
  name: 'record_lead_evaluation',
  description: 'Record the structured sales evaluation and next-step plan for this real-estate lead.',
  input_schema: {
    type: 'object',
    properties: {
      temperature: { type: 'string', enum: ['Hot', 'Warm', 'Cool'] },
      hot_score: { type: 'integer', enum: [1, 2, 3] },
      tags: { type: 'array', items: { type: 'string' } },
      tasks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            priority: { type: 'string', enum: ['low', 'medium', 'high'] },
          },
          required: ['title', 'priority'],
        },
      },
      summary: { type: 'string' },
    },
    required: ['temperature', 'hot_score', 'tags', 'tasks', 'summary'],
  },
}

async function evaluateWithClaude(a: QualAnswers): Promise<Evaluation | null> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return null
  const model = process.env.AI_MODEL || 'claude-opus-4-8'
  const { signal, clear } = withTimeout(22000)
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal,
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system: `${SYSTEM}\n\n${SHAPE}`,
        tools: [CLAUDE_TOOL],
        tool_choice: { type: 'tool', name: 'record_lead_evaluation' },
        messages: [{ role: 'user', content: buildUserPrompt(a) }],
      }),
    })
    if (!res.ok) { console.error('[ai-evaluate] claude HTTP', res.status, await res.text().catch(() => '')); return null }
    const data = await res.json()
    if (data.stop_reason === 'refusal') return null
    const block = (data.content ?? []).find((b: any) => b?.type === 'tool_use' && b?.name === 'record_lead_evaluation')
    return normalize(block?.input)
  } catch (err) {
    console.error('[ai-evaluate] claude', err)
    return null
  } finally {
    clear()
  }
}

// ─── Orchestrator ────────────────────────────────────────────────────────────
export async function aiEvaluateLead(a: QualAnswers): Promise<Evaluation | null> {
  return (await evaluateWithGemini(a)) ?? (await evaluateWithClaude(a))
}
