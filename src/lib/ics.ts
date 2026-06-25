// Build a standards-compliant iCalendar (.ics) invite that Gmail / Apple
// Calendar / Outlook recognize as an appointment the client can add with one tap.

function fmt(d: Date): string {
  // → YYYYMMDDTHHMMSSZ (UTC)
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function escText(s: unknown): string {
  return String(s ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

export interface IcsOptions {
  uid: string
  title: string
  description?: string
  location?: string // physical address OR a video-call URL
  start: Date
  durationMinutes: number
  organizerName: string
  organizerEmail: string
  attendeeName?: string
  attendeeEmail: string
}

export function buildIcs(o: IcsOptions): string {
  const end = new Date(o.start.getTime() + o.durationMinutes * 60000)
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Jordan Padierne//CRM//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${o.uid}`,
    `DTSTAMP:${fmt(new Date(o.start.getTime()))}`,
    `DTSTART:${fmt(o.start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${escText(o.title)}`,
    o.description ? `DESCRIPTION:${escText(o.description)}` : '',
    o.location ? `LOCATION:${escText(o.location)}` : '',
    `ORGANIZER;CN=${escText(o.organizerName)}:mailto:${o.organizerEmail}`,
    `ATTENDEE;CN=${escText(o.attendeeName || o.attendeeEmail)};RSVP=TRUE:mailto:${o.attendeeEmail}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n')
}
