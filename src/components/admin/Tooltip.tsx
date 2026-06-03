'use client'

import { useState } from 'react'
import { HelpCircle } from 'lucide-react'

interface Props {
  text: string
  children?: React.ReactNode
  side?: 'top' | 'bottom'
}

/** Hover/tap tooltip. Renders a small help icon if no children are passed. */
export default function Tooltip({ text, children, side = 'top' }: Props) {
  const [show, setShow] = useState(false)

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={() => setShow((s) => !s)}
    >
      {children ?? <HelpCircle size={13} className="text-gray-300 hover:text-sky-500 cursor-help" />}
      {show && (
        <span
          className={`absolute z-50 ${side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} left-1/2 -translate-x-1/2 w-52 bg-navy-900 text-white text-xs leading-relaxed rounded-lg px-3 py-2 shadow-premium pointer-events-none animate-fade-in`}
        >
          {text}
          <span className={`absolute ${side === 'top' ? 'top-full' : 'bottom-full'} left-1/2 -translate-x-1/2 border-4 border-transparent ${side === 'top' ? 'border-t-navy-900' : 'border-b-navy-900'}`} />
        </span>
      )}
    </span>
  )
}
