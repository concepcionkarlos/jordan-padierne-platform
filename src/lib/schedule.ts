// Self-scheduling helpers. All consultation times are presented and stored in
// Jordan's timezone (America/New_York / Eastern). Pure functions — safe on both
// client and server.

export const BOOKING_TZ = 'America/New_York'
export const SLOT_HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17] // 9am–5pm ET
export const SLOT_MINUTES = 30
export const BOOKING_DAYS_AHEAD = 21
const WORK_DAYS = [1, 2, 3, 4, 5, 6] // Mon–Sat (0 = Sun)

// Offset (minutes) of a timezone at a given instant. ET summer ≈ +240.
function tzOffsetMinutes(timeZone: string, date: Date): number {
  const utc = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }))
  const tz = new Date(date.toLocaleString('en-US', { timeZone }))
  return (utc.getTime() - tz.getTime()) / 60000
}

// Build the real UTC instant for an ET wall-clock date + hour.
export function slotToISO(dateStr: string, hour: number): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const naive = new Date(Date.UTC(y, m - 1, d, hour, 0, 0)) // pretend ET clock is UTC
  const offset = tzOffsetMinutes(BOOKING_TZ, naive)
  return new Date(naive.getTime() + offset * 60000).toISOString()
}

// "YYYY-MM-DD" and ET hour for a stored instant.
export function isoToEtParts(iso: string): { date: string; hour: number } {
  const d = new Date(iso)
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: BOOKING_TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hour12: false,
  })
  const parts = fmt.formatToParts(d)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  let hour = parseInt(get('hour'), 10)
  if (hour === 24) hour = 0
  return { date: `${get('year')}-${get('month')}-${get('day')}`, hour }
}

// Human label like "Tue, Jun 10 · 2:00 PM ET".
export function formatSlotLabel(iso: string): string {
  const d = new Date(iso)
  const day = new Intl.DateTimeFormat('en-US', {
    timeZone: BOOKING_TZ, weekday: 'short', month: 'short', day: 'numeric',
  }).format(d)
  const time = new Intl.DateTimeFormat('en-US', {
    timeZone: BOOKING_TZ, hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(d)
  return `${day} · ${time} ET`
}

export function hourLabel(hour: number): string {
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h = hour % 12 === 0 ? 12 : hour % 12
  return `${h}:00 ${ampm}`
}

// ET "now" as a plain Date whose fields read as ET wall clock.
function nowEt(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: BOOKING_TZ }))
}

// Next N bookable days (Mon–Sat), each as { date, label, weekday, dayNum }.
export function bookableDates(): Array<{ date: string; weekday: string; month: string; dayNum: string }> {
  const out: Array<{ date: string; weekday: string; month: string; dayNum: string }> = []
  const start = nowEt()
  start.setHours(0, 0, 0, 0)
  for (let i = 0; i < BOOKING_DAYS_AHEAD && out.length < 14; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    if (!WORK_DAYS.includes(d.getDay())) continue
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    out.push({
      date: `${y}-${m}-${day}`,
      weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      dayNum: String(d.getDate()),
    })
  }
  return out
}

// Hours still selectable for a date: drop taken hours and (for today) past hours.
export function availableHours(dateStr: string, takenHours: number[]): number[] {
  const now = nowEt()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const minHour = dateStr === todayStr ? now.getHours() + 2 : -1 // 2h lead time today
  return SLOT_HOURS.filter((h) => h > minHour && !takenHours.includes(h))
}
