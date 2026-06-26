export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { safeQuery } from '@/lib/db'
import { getSetting } from '@/lib/settings'
import { isEmailConfigured } from '@/lib/email'
import { formatRelativeTime } from '@/lib/utils'

function parseHeartbeat(raw: string | null): { at: string; sent: number } | null {
  if (!raw) return null
  try { const o = JSON.parse(raw); return o && o.at ? o : null } catch { return null }
}
import {
  Zap, Repeat, Star, CalendarCheck, ArrowRight, CheckCircle2, AlertCircle,
  TrendingUp, Clock, Bell,
} from 'lucide-react'

async function getStats() {
  const now = Date.now()
  const windowStart = new Date(now - 17 * 86400000).toISOString()
  const nowIso = new Date(now).toISOString()

  const [devices, activeNurture, reviewsSent, upcoming, reviewUrl, dripHb, remindersHb] = await Promise.all([
    safeQuery((db) => db.from('push_subscriptions').select('id'), []),
    safeQuery((db) => db.from('leads').select('id').eq('status', 'new').gte('created_at', windowStart), []),
    safeQuery((db) => db.from('leads').select('id').not('metadata->>review_requested_at', 'is', null), []),
    safeQuery((db) => db.from('appointments').select('id, starts_at, status').eq('type', 'consultation').neq('status', 'cancelled').gte('starts_at', nowIso), []),
    getSetting('google_review_url'),
    getSetting('cron_drip_last_run'),
    getSetting('cron_reminders_last_run'),
  ])

  const dripLast = parseHeartbeat(dripHb)
  // Daily cron — if it hasn't recorded a run in >36h, something's wrong.
  const cronStale = dripLast ? (Date.now() - new Date(dripLast.at).getTime()) > 36 * 3600 * 1000 : false

  return {
    devices: (devices as any[]).length,
    activeNurture: (activeNurture as any[]).length,
    reviewsSent: (reviewsSent as any[]).length,
    upcoming: (upcoming as any[]).length,
    reviewConfigured: !!(reviewUrl && reviewUrl.startsWith('http')),
    emailOn: isEmailConfigured(),
    dripLast,
    remindersLast: parseHeartbeat(remindersHb),
    cronStale,
  }
}

export default async function AutomationsPage() {
  const s = await getStats()

  const features = [
    {
      icon: Zap, accent: 'amber',
      title: 'Instant Lead Alerts',
      tagline: 'Your phone rings the second a lead comes in.',
      roi: 'Calling within 5 minutes makes you up to 9× more likely to close. This is the single biggest lever on conversion.',
      stat: s.devices > 0 ? `${s.devices} device${s.devices > 1 ? 's' : ''} receiving alerts` : 'Not enabled yet',
      ok: s.devices > 0,
      action: s.devices > 0 ? null : { label: 'Enable on your phone →', href: '/admin' },
    },
    {
      icon: Repeat, accent: 'sky',
      title: 'Automatic Follow-Up',
      tagline: 'Every new lead gets a 4-email sequence, tailored to buyer / seller / investor.',
      roi: '80% of sales need 5+ touches, but most agents stop after one. This nurtures every lead for two weeks — hands-free.',
      stat: `${s.activeNurture} lead${s.activeNurture === 1 ? '' : 's'} being nurtured right now`,
      ok: s.emailOn,
      action: s.emailOn ? null : { label: 'Connect email →', href: '/admin/settings' },
      lastRun: s.dripLast,
      stale: s.cronStale,
    },
    {
      icon: Star, accent: 'wine',
      title: 'Auto Google Reviews',
      tagline: 'Move a deal to Closed → the client is asked for a 5-star review automatically.',
      roi: 'More reviews push you higher in Google — which brings in free leads. The best time to ask is right at the close.',
      stat: s.reviewConfigured ? `${s.reviewsSent} review request${s.reviewsSent === 1 ? '' : 's'} sent` : 'Add your Google link to turn on',
      ok: s.reviewConfigured,
      action: s.reviewConfigured ? null : { label: 'Add review link →', href: '/admin/settings' },
    },
    {
      icon: CalendarCheck, accent: 'navy',
      title: 'Self-Scheduling',
      tagline: 'Clients book a consultation on your site — day & time — 24/7.',
      roi: 'Kills the back-and-forth. Prospects book while they\'re hot, even at night or on weekends. More meetings = more closings.',
      stat: `${s.upcoming} upcoming consultation${s.upcoming === 1 ? '' : 's'} booked`,
      ok: true,
      action: { label: 'View booking page →', href: '/book' },
    },
  ]

  const accentMap: Record<string, { bg: string; text: string; ring: string }> = {
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100' },
    sky: { bg: 'bg-sky-50', text: 'text-sky-600', ring: 'ring-sky-100' },
    wine: { bg: 'bg-wine/10', text: 'text-wine', ring: 'ring-wine/10' },
    navy: { bg: 'bg-navy-50', text: 'text-navy-700', ring: 'ring-navy-100' },
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 p-8 lg:p-10 mb-8">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-wine/10 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-sky-300 text-xs font-semibold uppercase tracking-widest mb-4">
            <TrendingUp size={13} /> Your Growth Engine
          </span>
          <h1 className="font-serif text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight">
            4 automations working for you<br className="hidden sm:block" /> around the clock
          </h1>
          <p className="text-navy-200 text-lg max-w-2xl">
            These run quietly in the background so no lead slips through the cracks — capturing, following up, and converting while you focus on closing.
          </p>
          <div className="flex flex-wrap gap-6 mt-7">
            <Metric icon={Bell} value={s.devices} label="devices on alert" />
            <Metric icon={Repeat} value={s.activeNurture} label="leads in nurture" />
            <Metric icon={CalendarCheck} value={s.upcoming} label="consultations booked" />
            <Metric icon={Star} value={s.reviewsSent} label="reviews requested" />
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid md:grid-cols-2 gap-5 mb-8">
        {features.map((f) => {
          const a = accentMap[f.accent]
          const Icon = f.icon
          return (
            <div key={f.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl ${a.bg} ${a.text} flex items-center justify-center shrink-0 ring-4 ${a.ring}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-navy-900 text-lg leading-tight">{f.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{f.tagline}</p>
                </div>
              </div>

              <div className="mt-4 flex-1">
                <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <TrendingUp size={11} /> Why it makes money
                  </p>
                  <p className="text-navy-800 text-sm leading-relaxed">{f.roi}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${f.ok ? 'text-green-600' : 'text-amber-600'}`}>
                  {f.ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                  {f.stat}
                </span>
                {f.action && (
                  <Link href={f.action.href} className="text-sm font-semibold text-navy-700 hover:text-wine whitespace-nowrap flex items-center gap-1">
                    {f.action.label}
                  </Link>
                )}
              </div>
              {(f as any).lastRun && (
                <p className={`mt-2 text-xs flex items-center gap-1 ${(f as any).stale ? 'text-amber-600 font-semibold' : 'text-gray-400'}`}>
                  <Clock size={11} /> {(f as any).stale ? 'Heartbeat overdue — ' : 'Cron last ran '}{formatRelativeTime((f as any).lastRun.at)} · {(f as any).lastRun.sent} sent
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* The math */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
        <h2 className="font-serif text-xl font-bold text-navy-900 mb-2 flex items-center gap-2">
          <Clock size={18} className="text-wine" /> The compounding effect
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed mb-5 max-w-3xl">
          Each piece is good on its own — together they compound. A lead lands, you&apos;re alerted in seconds,
          they get nurtured for two weeks if you don&apos;t connect right away, they can book a call themselves,
          and after you close they hand you a 5-star review that brings the next lead in. That&apos;s a flywheel.
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          <MathCard big="< 5 min" small="to first contact — up to 9× more likely to close" />
          <MathCard big="5+ touches" small="automatic follow-up on every single lead" />
          <MathCard big="24 / 7" small="capturing leads & booking calls while you sleep" />
        </div>
      </div>

      <p className="text-center text-gray-400 text-xs mt-6">
        Built for Jordan Padierne · eXp Realty — your platform works even when you&apos;re off the clock.
      </p>
    </div>
  )
}

function Metric({ icon: Icon, value, label }: { icon: any; value: number; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-sky-300">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-white text-xl font-bold leading-none">{value}</p>
        <p className="text-navy-300 text-xs">{label}</p>
      </div>
    </div>
  )
}

function MathCard({ big, small }: { big: string; small: string }) {
  return (
    <div className="rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 p-4 text-center">
      <p className="font-serif text-2xl font-bold text-navy-900">{big}</p>
      <p className="text-gray-500 text-xs mt-1 leading-snug">{small}</p>
    </div>
  )
}
