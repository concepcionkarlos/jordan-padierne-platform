// ─── Daily activity, streaks & goals ───────────────────────────────────────────
// "Don't break the chain" mechanics to keep Jordan engaged daily.

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * Build a set of day-keys on which any activity happened.
 * Activity = a note logged, an appointment, or a task completed.
 */
export function buildActivityDays(
  notes: { created_at: string }[],
  appointments: { created_at: string }[],
  completedTasks: { completed_at: string | null }[]
): Set<string> {
  const days = new Set<string>()
  for (const n of notes) days.add(dayKey(new Date(n.created_at)))
  for (const a of appointments) days.add(dayKey(new Date(a.created_at)))
  for (const t of completedTasks) if (t.completed_at) days.add(dayKey(new Date(t.completed_at)))
  return days
}

/** Current consecutive-day streak ending today (or yesterday — grace day). */
export function calcStreak(activityDays: Set<string>, today = new Date()): number {
  let streak = 0
  const cursor = new Date(today)

  // Grace: if nothing today yet, start counting from yesterday so the streak
  // doesn't visually reset until the day is actually missed.
  if (!activityDays.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
  }
  while (activityDays.has(dayKey(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function activeToday(activityDays: Set<string>, today = new Date()): boolean {
  return activityDays.has(dayKey(today))
}

/** Count today's activities across notes + appointments + completed tasks. */
export function countTodayActivity(
  notes: { created_at: string }[],
  appointments: { created_at: string }[],
  completedTasks: { completed_at: string | null }[],
  today = new Date()
): number {
  const k = dayKey(today)
  let n = 0
  for (const x of notes) if (dayKey(new Date(x.created_at)) === k) n++
  for (const x of appointments) if (dayKey(new Date(x.created_at)) === k) n++
  for (const x of completedTasks) if (x.completed_at && dayKey(new Date(x.completed_at)) === k) n++
  return n
}

// ─── Commission math ────────────────────────────────────────────────────────────

export function commissionFor(dealValue: number, rate: number): number {
  return Math.round((dealValue * rate) / 100)
}

/** Probability weight per pipeline stage for forecast. */
export const STAGE_PROBABILITY: Record<string, number> = {
  NEW: 0.05,
  QUALIFIED: 0.15,
  CONTACTED: 0.25,
  SHOWING_SCHEDULED: 0.45,
  NEGOTIATION: 0.7,
  CLOSED: 1,
  LOST: 0,
}

export function weightedDealValue(lead: { deal_value?: number | null; budget_max?: number | null; budget_min?: number | null; pipeline_stage: string; close_probability?: number | null }): number {
  const base = lead.deal_value ?? lead.budget_max ?? lead.budget_min ?? 0
  const prob = lead.close_probability != null ? lead.close_probability / 100 : (STAGE_PROBABILITY[lead.pipeline_stage] ?? 0.1)
  return base * prob
}

// ─── Pipeline stage → lead status (single source of truth) ───────────────────
// `pipeline_stage` (the Kanban column) and `status` (used for earnings/active
// filters) must never disagree, no matter which surface moves the deal — the
// Lead Workspace stepper OR the Pipeline board. Both PATCH routes derive these
// fields from the stage so closed deals always count and reopened deals clear.
export const STAGE_TO_STATUS: Record<string, string> = {
  NEW: 'new',
  QUALIFIED: 'qualified',
  CONTACTED: 'active',
  SHOWING_SCHEDULED: 'active',
  NEGOTIATION: 'active',
  CLOSED: 'closed',
  LOST: 'lost',
}

export function statusFieldsForStage(stage: string): { status: string; closed_at: string | null } {
  return {
    status: STAGE_TO_STATUS[stage] ?? 'active',
    // Stamp closed_at only when closing; clear it when a deal is reopened so
    // stale close dates never leak into "earned this month/year".
    closed_at: stage === 'CLOSED' ? new Date().toISOString() : null,
  }
}

// ─── Month helpers ───────────────────────────────────────────────────────────────

export function isThisMonth(dateStr: string | null | undefined, now = new Date()): boolean {
  if (!dateStr) return false
  const d = new Date(dateStr)
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
}

export function isThisYear(dateStr: string | null | undefined, now = new Date()): boolean {
  if (!dateStr) return false
  return new Date(dateStr).getFullYear() === now.getFullYear()
}

export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
