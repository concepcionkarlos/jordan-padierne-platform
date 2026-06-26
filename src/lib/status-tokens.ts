// ─── Status token map ──────────────────────────────────────────────────────
// One source of truth for every status colour in the admin. Pages and shared
// components render through these tokens instead of hand-writing Tailwind class
// strings, so a "Closed" badge, a "success" pill, and a green dot all stay in
// lockstep. The domain maps (stage / temperature / smart score / risk) keep the
// exact palette they had before this was centralised, so nothing shifts visually
// — they're just sourced from here now.

export interface StatusToken {
  /** Light fill for badges/pills. */
  bg: string
  /** Text colour on the light fill. */
  text: string
  /** Border that pairs with the light fill. */
  border: string
  /** Solid indicator dot. */
  dot: string
  /** Strong solid fill + white text, for high-emphasis chips. */
  solid: string
}

/** The six semantic tones every surface shares. */
export const SEMANTIC = {
  success: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500', solid: 'bg-green-500 text-white' },
  warning: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', solid: 'bg-amber-500 text-white' },
  error:   { bg: 'bg-wine-50',  text: 'text-wine-700',  border: 'border-wine-100',  dot: 'bg-wine',      solid: 'bg-wine text-white' },
  info:    { bg: 'bg-sky-50',   text: 'text-sky-700',   border: 'border-sky-200',   dot: 'bg-sky-500',   solid: 'bg-sky-500 text-white' },
  neutral: { bg: 'bg-gray-100', text: 'text-gray-600',  border: 'border-gray-200',  dot: 'bg-gray-400',  solid: 'bg-gray-500 text-white' },
  navy:    { bg: 'bg-navy-50',  text: 'text-navy-700',  border: 'border-navy-100',  dot: 'bg-navy-700',  solid: 'bg-navy-900 text-white' },
} as const satisfies Record<string, StatusToken>

export type SemanticTone = keyof typeof SEMANTIC

/** `${bg} ${text}` — the badge convenience string used in most templates. */
export function tone(t: SemanticTone): string {
  const s = SEMANTIC[t]
  return `${s.bg} ${s.text}`
}

// ─── Lead pipeline stages ────────────────────────────────────────────────────
// Same palette getPipelineStageColor has always returned (100/700 fills), now
// in one place. utils.getPipelineStageColor delegates here.
export const STAGE_BADGE: Record<string, string> = {
  NEW: 'bg-sky-100 text-sky-700',
  QUALIFIED: 'bg-blue-100 text-blue-700',
  CONTACTED: 'bg-purple-100 text-purple-700',
  SHOWING_SCHEDULED: 'bg-orange-100 text-orange-700',
  NEGOTIATION: 'bg-amber-100 text-amber-700',
  CLOSED: 'bg-green-100 text-green-700',
  LOST: 'bg-red-100 text-red-700',
}

export function stageBadge(stage: string): string {
  return STAGE_BADGE[stage] ?? 'bg-gray-100 text-gray-700'
}

// ─── Lead status ─────────────────────────────────────────────────────────────
// utils.getStatusColor delegates here.
export const STATUS_BADGE: Record<string, string> = {
  new: 'bg-sky-100 text-sky-700',
  contacted: 'bg-blue-100 text-blue-700',
  qualified: 'bg-purple-100 text-purple-700',
  active: 'bg-green-100 text-green-700',
  closed: 'bg-navy-100 text-navy-700',
  lost: 'bg-red-100 text-red-700',
  unread: 'bg-wine-50 text-wine-600',
  read: 'bg-gray-100 text-gray-600',
  replied: 'bg-green-100 text-green-700',
  archived: 'bg-gray-100 text-gray-500',
}

export function statusBadge(status: string): string {
  return STATUS_BADGE[status] ?? 'bg-gray-100 text-gray-700'
}

// ─── Temperature (hot_score 1–3) ─────────────────────────────────────────────
export const TEMPERATURE = {
  3: { label: 'Hot',  emoji: '🔥', tone: 'error' as SemanticTone,   solid: 'bg-red-500 text-white',   dot: 'bg-red-500' },
  2: { label: 'Warm', emoji: '🌤️', tone: 'warning' as SemanticTone, solid: 'bg-amber-400 text-white', dot: 'bg-amber-400' },
  1: { label: 'Cold', emoji: '❄️', tone: 'info' as SemanticTone,    solid: 'bg-sky-300 text-white',   dot: 'bg-sky-300' },
} as const

// ─── Smart Score bands ───────────────────────────────────────────────────────
// Mirrors scoreLead()'s banding. Returns the badge/border classes and the small
// numeric-pill colours the leads table draws.
export function scoreBand(score: number): { label: string; emoji: string; badge: string; pillBg: string; pillText: string } {
  if (score >= 75) return { label: 'Hot',  emoji: '🔥', badge: 'bg-red-50 text-red-600 border-red-200',       pillBg: '#FEE2E2', pillText: '#DC2626' }
  if (score >= 50) return { label: 'Warm', emoji: '🌤️', badge: 'bg-amber-50 text-amber-600 border-amber-200', pillBg: '#FEF3C7', pillText: '#D97706' }
  if (score >= 30) return { label: 'Cool', emoji: '🌥️', badge: 'bg-sky-50 text-sky-600 border-sky-200',       pillBg: '#E8F1F7', pillText: '#46779A' }
  return { label: 'Cold', emoji: '❄️', badge: 'bg-slate-50 text-slate-500 border-slate-200',                  pillBg: '#F1F5F9', pillText: '#64748B' }
}

// ─── Risk (deal at risk / freshness escalation) ──────────────────────────────
// fresh → success, aging → warning, stale → warning(orange), cold → error.
export const RISK = {
  fresh: { tone: 'success' as SemanticTone, text: 'text-green-600',  dot: 'bg-green-500' },
  aging: { tone: 'warning' as SemanticTone, text: 'text-amber-600',  dot: 'bg-amber-400' },
  stale: { tone: 'warning' as SemanticTone, text: 'text-orange-600', dot: 'bg-orange-500' },
  cold:  { tone: 'error'   as SemanticTone, text: 'text-wine',       dot: 'bg-wine' },
} as const
