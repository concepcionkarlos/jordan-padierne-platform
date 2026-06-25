// ─── AI lead evaluation (Claude) ─────────────────────────────────────────────
// When a lead completes the qualification form, Claude reads their answers and
// returns a structured evaluation + a sharp, Jordan-facing next-step plan.
// Drop-in replacement for the rule-based evaluateLead(): returns the SAME
// Evaluation shape, or null on any failure so the caller can fall back.
//
// Uses the Anthropic Messages API directly via fetch (no SDK). Forced tool-use
// guarantees structured JSON output. Requires ANTHROPIC_API_KEY in the env;
// without it this returns null and the rule-based engine is used instead.

import type { Evaluation, QualAnswers } from '@/lib/evaluate'

const MODEL = process.env.AI_MODEL || 'claude-opus-4-8'
const ENDPOINT = 'https://api.anthropic.com/v1/messages'

const SYSTEM = `You are an elite real-estate sales coach and analyst for Jordan Padierne, a Realtor in Miami with eXp Realty. A prospective client just completed a qualification form. Read their answers and produce a decisive evaluation plus a concrete next-step plan that makes Jordan more effective and closes more deals. Be specific to the South Florida market (Brickell, Doral, Coral Gables, Downtown, Hialeah, pre-construction). Always call the record_lead_evaluation tool — never reply in plain text.`

// Tool schema = the structured output contract. Mirrors the Evaluation type.
const EVAL_TOOL = {
  name: 'record_lead_evaluation',
  description: 'Record the structured sales evaluation and next-step plan for this real-estate lead.',
  input_schema: {
    type: 'object',
    properties: {
      temperature: {
        type: 'string',
        enum: ['Hot', 'Warm', 'Cool'],
        description: 'Lead temperature from intent, budget, financing readiness, and urgency.',
      },
      hot_score: { type: 'integer', enum: [1, 2, 3], description: '1 = Cool, 2 = Warm, 3 = Hot.' },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description:
          'Choose only from: hot, cash_buyer, pre_approved, urgent, vip, investor, international, referral. Include a tag only when the answers clearly support it.',
      },
      tasks: {
        type: 'array',
        description: '2 to 4 concrete next actions for Jordan, most important first.',
        items: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Specific action, e.g. "Call Maria today — cash buyer, 30-day timeline".',
            },
            priority: { type: 'string', enum: ['low', 'medium', 'high'] },
          },
          required: ['title', 'priority'],
        },
      },
      summary: {
        type: 'string',
        description:
          'A sharp, Jordan-facing briefing of 3–5 sentences. Open with the verdict, then the single most important next step, then specifics: what price range / area / property type of listings to send, the angle to use, and any risk or objection to expect. Concrete and Miami-specific. No fluff, no greeting.',
      },
    },
    required: ['temperature', 'hot_score', 'tags', 'tasks', 'summary'],
  },
}

export async function aiEvaluateLead(a: QualAnswers): Promise<Evaluation | null> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return null

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 22000)
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM,
        tools: [EVAL_TOOL],
        tool_choice: { type: 'tool', name: 'record_lead_evaluation' },
        messages: [
          {
            role: 'user',
            content: `Lead name: ${a.full_name}\n\nForm answers (JSON):\n${JSON.stringify(a, null, 2)}\n\nEvaluate this lead and record the result.`,
          },
        ],
      }),
    })

    if (!res.ok) {
      console.error('[ai-evaluate] HTTP', res.status, await res.text().catch(() => ''))
      return null
    }

    const data = await res.json()
    if (data.stop_reason === 'refusal') return null

    const block = (data.content ?? []).find(
      (b: any) => b?.type === 'tool_use' && b?.name === 'record_lead_evaluation'
    )
    const out = block?.input
    if (!out || typeof out !== 'object') return null

    // Normalize defensively into the Evaluation shape.
    const temperature = (['Hot', 'Warm', 'Cool'].includes(out.temperature)
      ? out.temperature
      : 'Warm') as Evaluation['temperature']
    const hot_score: number = [1, 2, 3].includes(out.hot_score)
      ? out.hot_score
      : temperature === 'Hot' ? 3 : temperature === 'Warm' ? 2 : 1
    const tags: string[] = Array.isArray(out.tags)
      ? out.tags.filter((t: any) => typeof t === 'string').slice(0, 8)
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

    // If the model returned nothing usable, signal fallback to the rule-based engine.
    if (!summary || tasks.length === 0) return null

    return { hot_score, tags, tasks, summary, temperature }
  } catch (err) {
    console.error('[ai-evaluate]', err)
    return null
  } finally {
    clearTimeout(timer)
  }
}
