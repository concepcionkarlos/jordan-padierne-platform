'use client'

import { useEffect, useState } from 'react'
import { X, Gift, ArrowRight, CheckCircle2, Phone } from 'lucide-react'

// Smart conversion modal: appears once when the visitor scrolls deep OR shows
// exit-intent on desktop. Offers a free home valuation / consultation.
// Dismissal is remembered so it never nags.

export default function LeadCaptureModal() {
  const [show, setShow] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '', email: '' })

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem('jp-lead-modal-seen')) return

    let fired = false
    const trigger = () => {
      if (fired) return
      fired = true
      sessionStorage.setItem('jp-lead-modal-seen', '1')
      setShow(true)
      cleanup()
    }

    // 1) Scroll depth (~55%)
    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight
      const pct = scrolled / document.documentElement.scrollHeight
      if (pct > 0.55) trigger()
    }
    // 2) Exit intent (desktop — mouse leaves toward top)
    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0) trigger()
    }
    // 3) Fallback timer (35s)
    const timer = window.setTimeout(trigger, 35000)

    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('mouseout', onMouseOut)

    function cleanup() {
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('mouseout', onMouseOut)
      window.clearTimeout(timer)
    }
    return cleanup
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.full_name.trim() || !form.phone.trim()) return
    setLoading(true)
    try {
      await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_type: 'contact',
          full_name: form.full_name,
          phone: form.phone,
          email: form.email || 'no-email@placeholder.com',
          client_type: 'Buyer',
          message: '🎯 Requested FREE consultation via website popup — warm lead, reach out fast!',
          source: 'Website Popup',
        }),
      })
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm" onClick={() => setShow(false)} />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-premium overflow-hidden animate-modal-pop">
        <button type="button" onClick={() => setShow(false)} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-gray-400 hover:text-navy-900 transition-colors" aria-label="Close">
          <X size={18} />
        </button>

        {/* Top accent band */}
        <div className="bg-gradient-to-br from-navy-900 to-navy-700 px-7 pt-8 pb-7 text-center relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-sky-500/20 rounded-full blur-2xl" />
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-wine flex items-center justify-center mx-auto mb-4 animate-float">
              <Gift size={26} className="text-white" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-white leading-tight">
              {submitted ? 'You\'re all set! 🎉' : 'Free Consultation'}
            </h2>
            <p className="text-navy-200 text-sm mt-2">
              {submitted
                ? 'Jordan will reach out shortly. Talk soon!'
                : 'Get expert, no-pressure guidance on buying, selling, or investing in South Florida.'}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-7">
          {submitted ? (
            <div className="text-center">
              <CheckCircle2 size={40} className="text-green-500 mx-auto mb-3" />
              <p className="text-gray-500 text-sm mb-5">Prefer to talk now?</p>
              <a href="tel:+13057996973" className="btn-wine w-full justify-center">
                <Phone size={16} /> Call 305-799-6973
              </a>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="Your name *"
                className="input-field"
                required
              />
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                type="tel"
                placeholder="Phone *"
                className="input-field"
                required
              />
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                type="email"
                placeholder="Email (optional)"
                className="input-field"
              />
              <button type="submit" disabled={loading} className="btn-wine cta-shine w-full justify-center py-3.5 text-base disabled:opacity-60">
                {loading ? 'Sending…' : <>Get My Free Consultation <ArrowRight size={16} /></>}
              </button>
              <p className="text-center text-gray-400 text-xs">100% free · No obligation · English / Español</p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
