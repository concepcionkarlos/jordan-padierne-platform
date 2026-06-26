'use client'

import { useEffect, useState } from 'react'
import { X, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react'
import { LESSONS } from '@/lib/lessons'
import { fireConfetti } from '@/lib/confetti'

const SEEN_KEY = 'jp-tour-seen-v1'

// Listen for a global "replay" event so the sidebar button can re-open the tour.
const REPLAY_EVENT = 'jp-replay-tour'
export function replayTour() {
  window.dispatchEvent(new Event(REPLAY_EVENT))
}

export default function WelcomeTour() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!localStorage.getItem(SEEN_KEY)) {
      // small delay so the dashboard paints first
      const t = setTimeout(() => setOpen(true), 800)
      return () => clearTimeout(t)
    }
  }, [])

  useEffect(() => {
    const handler = () => { setStep(0); setOpen(true) }
    window.addEventListener(REPLAY_EVENT, handler)
    return () => window.removeEventListener(REPLAY_EVENT, handler)
  }, [])

  function finish() {
    localStorage.setItem(SEEN_KEY, '1')
    setOpen(false)
    fireConfetti({ count: 90 })
  }

  if (!open) return null

  const lesson = LESSONS[step]
  const isLast = step === LESSONS.length - 1

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-900/70 backdrop-blur-sm" />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-premium overflow-hidden animate-modal-pop">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-navy-900 to-navy-700 px-7 pt-8 pb-12 text-center overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-500/15 rounded-full blur-2xl" />
          <button type="button" onClick={finish} className="absolute top-4 right-4 text-white/50 hover:text-white" aria-label="Close">
            <X size={18} />
          </button>
          <div className="relative">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-300 uppercase tracking-widest mb-3">
              <Sparkles size={12} /> Training · {step + 1} of {LESSONS.length}
            </span>
            <div className="text-5xl mb-2">{lesson.emoji}</div>
            <h2 className="font-serif text-2xl font-bold text-white leading-tight">{lesson.title}</h2>
          </div>
        </div>

        {/* Body */}
        <div className="px-7 py-6 -mt-6">
          <div className="bg-white rounded-2xl">
            <p className="text-gray-600 text-base leading-relaxed text-center">{lesson.short}</p>
            {lesson.tip && (
              <div className="mt-4 flex items-start gap-2.5 bg-sky-50 border border-sky-100 rounded-xl px-4 py-3">
                <span className="text-base">💡</span>
                <p className="text-sm text-navy-700 leading-snug">{lesson.tip}</p>
              </div>
            )}
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mt-6">
            {LESSONS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setStep(i)}
                aria-label={`Go to step ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-wine' : 'w-1.5 bg-gray-200 hover:bg-gray-300'}`}
              />
            ))}
          </div>

          {/* Nav */}
          <div className="flex items-center gap-3 mt-6">
            {step > 0 ? (
              <button type="button" onClick={() => setStep((s) => s - 1)} className="btn-secondary px-4"><ArrowLeft size={16} /></button>
            ) : (
              <button type="button" onClick={finish} className="text-gray-400 hover:text-navy-700 text-sm font-medium px-4 py-3">Skip</button>
            )}
            {isLast ? (
              <button type="button" onClick={finish} className="btn-wine cta-shine flex-1 justify-center py-3.5">Let&apos;s go! 🚀</button>
            ) : (
              <button type="button" onClick={() => setStep((s) => s + 1)} className="btn-wine flex-1 justify-center py-3.5">Next <ArrowRight size={16} /></button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
