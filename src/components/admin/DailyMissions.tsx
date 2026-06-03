'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Target, Check, Phone, UserPlus, CalendarPlus, CheckSquare } from 'lucide-react'
import { fireConfetti } from '@/lib/confetti'
import { toast } from '@/lib/toast'

interface MissionData { done: number; target: number }
interface Props {
  missions: {
    activities: MissionData
    newLeads: MissionData
    appointments: MissionData
    tasks: MissionData
  }
}

const DEFS = [
  { key: 'activities', label: 'Log 5 activities', desc: 'Calls, notes, follow-ups', icon: Phone, href: '/admin/leads' },
  { key: 'newLeads', label: 'Add a new lead', desc: 'Prospect or import a contact', icon: UserPlus, href: '/admin/leads' },
  { key: 'appointments', label: 'Schedule an appointment', desc: 'A showing, call, or meeting', icon: CalendarPlus, href: '/admin/calendar' },
  { key: 'tasks', label: 'Complete a task', desc: 'Knock one off your list', icon: CheckSquare, href: '/admin/tasks' },
] as const

export default function DailyMissions({ missions }: Props) {
  const completedCount = DEFS.filter((d) => missions[d.key].done >= missions[d.key].target).length
  const allDone = completedCount === DEFS.length
  const celebrated = useRef(false)

  useEffect(() => {
    if (!allDone) return
    const today = new Date().toDateString()
    if (localStorage.getItem('jp-missions-celebrated') === today) return
    if (celebrated.current) return
    celebrated.current = true
    localStorage.setItem('jp-missions-celebrated', today)
    setTimeout(() => {
      fireConfetti({ count: 160 })
      toast("All daily missions complete! You're unstoppable 🏆", { type: 'celebrate', duration: 4500 })
    }, 600)
  }, [allDone])

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
      <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2 bg-gradient-to-r from-wine-50 to-transparent">
        <Target size={16} className="text-wine" />
        <h2 className="font-semibold text-navy-900 text-sm">Daily Missions</h2>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${allDone ? 'bg-green-100 text-green-700' : 'bg-wine-50 text-wine'}`}>
          {completedCount}/{DEFS.length}
        </span>
        {allDone && <span className="text-xs font-semibold text-green-600 ml-auto">Crushed it today! 🏆</span>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-50">
        {DEFS.map((d) => {
          const m = missions[d.key]
          const pct = Math.min(100, Math.round((m.done / m.target) * 100))
          const done = m.done >= m.target
          const Icon = d.icon
          return (
            <Link key={d.key} href={d.href} className="p-4 hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${done ? 'bg-green-100' : 'bg-navy-50'}`}>
                  {done ? <Check size={15} className="text-green-600" /> : <Icon size={14} className="text-navy-600" />}
                </div>
                <p className={`text-sm font-semibold ${done ? 'text-gray-400 line-through' : 'text-navy-900'}`}>{d.label}</p>
              </div>
              <p className="text-gray-400 text-xs mb-2.5">{d.desc}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${done ? 'bg-green-500' : 'bg-wine'}`} style={{ width: `${pct}%` }} />
                </div>
                <span className={`text-xs font-bold ${done ? 'text-green-600' : 'text-gray-400'}`}>{m.done}/{m.target}</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
