'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, ChevronDown, GraduationCap, PlayCircle, Trophy } from 'lucide-react'
import { LESSONS } from '@/lib/lessons'
import { replayTour } from './WelcomeTour'
import { fireConfetti } from '@/lib/confetti'
import { toast } from '@/lib/toast'

const KEY = 'jp-lessons-learned'

export default function TrainingCenter() {
  const [learned, setLearned] = useState<string[]>([])
  const [openId, setOpenId] = useState<string | null>(LESSONS[0].id)

  useEffect(() => {
    try { setLearned(JSON.parse(localStorage.getItem(KEY) || '[]')) } catch { /* ignore */ }
  }, [])

  function toggleLearned(id: string) {
    setLearned((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      localStorage.setItem(KEY, JSON.stringify(next))
      if (next.length === LESSONS.length && prev.length < LESSONS.length) {
        setTimeout(() => { fireConfetti({ count: 140 }); toast('Training complete — you\'re a pro now! 🎓', { type: 'celebrate', duration: 4000 }) }, 300)
      }
      return next
    })
  }

  const doneCount = learned.length
  const pct = Math.round((doneCount / LESSONS.length) * 100)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy-900 flex items-center gap-2">
            <GraduationCap size={24} className="text-wine" /> Training Center
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Learn the CRM at your own pace — {doneCount}/{LESSONS.length} lessons completed</p>
        </div>
        <button type="button" onClick={() => replayTour()} className="btn-primary text-sm px-4 py-2.5"><PlayCircle size={15} /> Replay Quick Tour</button>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${pct === 100 ? 'bg-green-50' : 'bg-wine-50'}`}>
            <Trophy size={20} className={pct === 100 ? 'text-green-600' : 'text-wine'} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <p className="font-semibold text-navy-900 text-sm">{pct === 100 ? 'You mastered the CRM! 🎓' : 'Your progress'}</p>
              <span className="text-sm font-bold text-navy-700">{pct}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? 'bg-green-500' : 'bg-wine'}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Lessons */}
      <div className="space-y-3">
        {LESSONS.map((lesson, i) => {
          const done = learned.includes(lesson.id)
          const isOpen = openId === lesson.id
          return (
            <div key={lesson.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : lesson.id)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="text-2xl shrink-0">{lesson.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-300">{String(i + 1).padStart(2, '0')}</span>
                    <p className={`font-semibold text-sm ${done ? 'text-gray-400' : 'text-navy-900'}`}>{lesson.title}</p>
                  </div>
                  {!isOpen && <p className="text-gray-400 text-xs mt-0.5 truncate">{lesson.short}</p>}
                </div>
                {done && <CheckCircle2 size={16} className="text-green-500 shrink-0" />}
                <ChevronDown size={16} className={`text-gray-300 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pl-16 animate-fade-in">
                  {lesson.body.map((p, j) => (
                    <p key={j} className="text-gray-600 text-sm leading-relaxed mb-3">{p}</p>
                  ))}
                  {lesson.tip && (
                    <div className="flex items-start gap-2.5 bg-sky-50 border border-sky-100 rounded-xl px-4 py-3 mb-4">
                      <span className="text-base">💡</span>
                      <p className="text-sm text-navy-700 leading-snug"><strong>Pro tip:</strong> {lesson.tip}</p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleLearned(lesson.id)}
                    className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${
                      done ? 'bg-green-50 text-green-700' : 'bg-navy-900 text-white hover:bg-navy-700'
                    }`}
                  >
                    {done ? <><CheckCircle2 size={15} /> Learned</> : <><Circle size={15} /> Mark as learned</>}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
