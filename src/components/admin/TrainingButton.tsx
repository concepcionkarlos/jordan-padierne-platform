'use client'

import Link from 'next/link'
import { GraduationCap, PlayCircle } from 'lucide-react'
import { replayTour } from './WelcomeTour'

export default function TrainingButton() {
  return (
    <div className="px-4 py-3 rounded-xl bg-navy-800/50 space-y-2">
      <p className="text-navy-400 text-xs flex items-center gap-1.5"><GraduationCap size={12} /> Training</p>
      <button
        type="button"
        onClick={() => replayTour()}
        className="flex items-center gap-2 text-sky-400 text-sm font-medium hover:text-sky-300 w-full"
      >
        <PlayCircle size={14} /> Replay quick tour
      </button>
      <Link href="/admin/training" className="flex items-center gap-2 text-navy-300 text-sm hover:text-white">
        <GraduationCap size={14} /> All lessons
      </Link>
    </div>
  )
}
