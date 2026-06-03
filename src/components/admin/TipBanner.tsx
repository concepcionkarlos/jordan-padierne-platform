'use client'

import { useState, useEffect } from 'react'
import { Lightbulb, X } from 'lucide-react'

interface Props {
  id: string        // unique key for localStorage dismissal
  children: React.ReactNode
}

/** Dismissible contextual tip. Remembers dismissal per id. */
export default function TipBanner({ id, children }: Props) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(!localStorage.getItem(`jp-tip-${id}`))
  }, [id])

  if (!show) return null

  return (
    <div className="flex items-start gap-3 bg-gradient-to-r from-sky-50 to-transparent border border-sky-100 rounded-xl px-4 py-3 mb-5">
      <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center shrink-0 mt-0.5">
        <Lightbulb size={14} className="text-sky-600" />
      </div>
      <p className="flex-1 text-sm text-navy-700 leading-relaxed">{children}</p>
      <button
        type="button"
        onClick={() => { localStorage.setItem(`jp-tip-${id}`, '1'); setShow(false) }}
        className="text-sky-300 hover:text-sky-600 shrink-0"
        aria-label="Dismiss tip"
      >
        <X size={15} />
      </button>
    </div>
  )
}
