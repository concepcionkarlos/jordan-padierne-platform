'use client'

import { useEffect, useState } from 'react'
import { Calendar, Clock, Check, Phone } from 'lucide-react'
import { useT } from '@/components/LanguageProvider'
import { bookableDates, availableHours, hourLabel, SLOT_HOURS } from '@/lib/schedule'

type Topic = 'buy' | 'sell' | 'invest' | 'other'

export default function BookingWizard() {
  const { t } = useT()
  const [dates, setDates] = useState<ReturnType<typeof bookableDates>>([])
  const [selectedDate, setSelectedDate] = useState('')
  const [taken, setTaken] = useState<number[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [hour, setHour] = useState<number | null>(null)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [topic, setTopic] = useState<Topic>('buy')
  const [message, setMessage] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState<{ when: string } | null>(null)

  // Build the date list on the client only (avoids SSR/CSR time mismatch).
  useEffect(() => {
    const d = bookableDates()
    setDates(d)
    if (d.length) setSelectedDate(d[0].date)
  }, [])

  // Load taken slots whenever the date changes.
  useEffect(() => {
    if (!selectedDate) return
    setLoadingSlots(true)
    setHour(null)
    fetch(`/api/book?date=${selectedDate}`)
      .then((r) => r.json())
      .then((d) => setTaken(Array.isArray(d.taken) ? d.taken : []))
      .catch(() => setTaken([]))
      .finally(() => setLoadingSlots(false))
  }, [selectedDate])

  const avail = selectedDate ? availableHours(selectedDate, taken) : []

  async function submit() {
    if (!selectedDate || hour == null || !fullName.trim() || !email.trim()) {
      setError(t('book.selectFirst'))
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/book', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName.trim(), email: email.trim(), phone: phone.trim(), date: selectedDate, hour, topic, message: message.trim() }),
      })
      const d = await res.json()
      if (res.status === 409) {
        setError(t('book.takenError'))
        fetch(`/api/book?date=${selectedDate}`).then((r) => r.json()).then((x) => setTaken(x.taken ?? [])).catch(() => {})
        setHour(null)
        return
      }
      if (!d.success) { setError(t('book.genericError')); return }
      setDone({ when: d.when })
    } catch {
      setError(t('book.genericError'))
    } finally {
      setSubmitting(false)
    }
  }

  const header = (
    <div className="text-center max-w-2xl mx-auto mb-8">
      <p className="text-wine font-semibold text-sm uppercase tracking-widest mb-2">{t('book.eyebrow')}</p>
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy-900 mb-3">{t('book.title')}</h1>
      <p className="text-gray-500 text-lg">{t('book.subtitle')}</p>
    </div>
  )

  if (done) {
    return (
      <>
        {header}
        <div className="max-w-lg mx-auto text-center bg-white rounded-2xl shadow-premium border border-gray-100 p-10">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <Check size={30} className="text-green-600" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-navy-900 mb-2">{t('book.thanksTitle')}</h2>
          <p className="text-navy-900 font-semibold text-lg mb-1">{done.when}</p>
          <p className="text-gray-500 mb-6">{t('book.thanksSub')}</p>
          <button
            type="button"
            onClick={() => { setDone(null); setHour(null); setMessage('') }}
            className="text-sky-600 hover:text-sky-700 font-medium text-sm"
          >
            {t('book.bookAnother')}
          </button>
        </div>
      </>
    )
  }

  const topics: Topic[] = ['buy', 'sell', 'invest', 'other']

  return (
    <>
    {header}
    <div className="grid lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {/* Left: date + time */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-3 text-navy-900 font-semibold">
          <Calendar size={18} className="text-wine" /> {t('book.pickDate')}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
          {dates.map((d) => {
            const active = d.date === selectedDate
            return (
              <button
                key={d.date}
                type="button"
                onClick={() => setSelectedDate(d.date)}
                className={`shrink-0 w-16 py-2.5 rounded-xl border text-center transition-all ${
                  active ? 'bg-navy-900 border-navy-900 text-white shadow-md' : 'bg-white border-gray-200 text-navy-700 hover:border-navy-300'
                }`}
              >
                <span className="block text-[10px] uppercase tracking-wide opacity-70">{d.weekday}</span>
                <span className="block text-lg font-bold leading-tight">{d.dayNum}</span>
                <span className="block text-[10px] uppercase opacity-70">{d.month}</span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2 mt-6 mb-3 text-navy-900 font-semibold">
          <Clock size={18} className="text-wine" /> {t('book.pickTime')}
        </div>
        {loadingSlots ? (
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-11 rounded-xl bg-gray-100 animate-pulse" />)}
          </div>
        ) : avail.length === 0 ? (
          <p className="text-gray-400 text-sm py-6 text-center">{t('book.noSlots')}</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {SLOT_HOURS.map((h) => {
              const enabled = avail.includes(h)
              const active = hour === h
              return (
                <button
                  key={h}
                  type="button"
                  disabled={!enabled}
                  onClick={() => setHour(h)}
                  className={`h-11 rounded-xl border text-sm font-semibold transition-all ${
                    active ? 'bg-wine border-wine text-white shadow-md'
                      : enabled ? 'bg-white border-gray-200 text-navy-700 hover:border-wine/50'
                      : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  {hourLabel(h)}
                </button>
              )
            })}
          </div>
        )}
        <p className="text-gray-400 text-xs mt-3">{t('book.tzNote')}</p>
      </div>

      {/* Right: details */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
        <p className="text-navy-900 font-semibold mb-4">{t('book.yourDetails')}</p>
        <div className="space-y-3">
          <div>
            <label htmlFor="b-name" className="label">{t('book.name')}</label>
            <input id="b-name" className="input-field" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="b-email" className="label">{t('book.email')}</label>
              <input id="b-email" type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <div>
              <label htmlFor="b-phone" className="label">{t('book.phone')}</label>
              <input id="b-phone" type="tel" className="input-field" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
            </div>
          </div>
          <div>
            <span className="label">{t('book.topicLabel')}</span>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {topics.map((tp) => (
                <button
                  key={tp}
                  type="button"
                  onClick={() => setTopic(tp)}
                  className={`py-2 rounded-xl border text-sm font-medium transition-all ${
                    topic === tp ? 'bg-navy-900 border-navy-900 text-white' : 'bg-white border-gray-200 text-navy-700 hover:border-navy-300'
                  }`}
                >
                  {t(`book.topic.${tp}`)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="b-msg" className="label">{t('book.message')}</label>
            <textarea id="b-msg" rows={2} className="input-field resize-none" value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
        </div>

        {/* Summary */}
        {selectedDate && hour != null && (
          <div className="mt-4 p-3 rounded-xl bg-sky-50 border border-sky-100 text-sm text-navy-800">
            <span className="font-semibold">{t('book.summary')}:</span>{' '}
            {dates.find((d) => d.date === selectedDate)?.weekday} {dates.find((d) => d.date === selectedDate)?.month} {dates.find((d) => d.date === selectedDate)?.dayNum} · {hourLabel(hour)} ET
          </div>
        )}

        {error && <p className="mt-3 text-sm text-wine font-medium">{error}</p>}

        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="btn-wine w-full mt-4 disabled:opacity-60"
        >
          {submitting ? t('book.confirming') : t('book.confirm')}
        </button>
        <a href="tel:+13057996973" className="flex items-center justify-center gap-1.5 mt-3 text-sm text-gray-500 hover:text-navy-900">
          <Phone size={13} /> 305-799-6973
        </a>
      </div>
    </div>
    </>
  )
}
