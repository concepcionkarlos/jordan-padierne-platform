import { Sparkles } from 'lucide-react'

// The platform's consistent AI motif — a small, premium "AI" pill used wherever
// the product is intelligently assisting (Coach, Lead Brief, Morning Brief, etc.).
export function AiBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-sky-100 text-sky-700 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 ${className}`}>
      <Sparkles size={10} /> AI
    </span>
  )
}

// The gradient sparkle "chip" used as an AI section's leading icon (e.g. the
// Lead Brief / Morning Brief headers). Keeps the AI look consistent.
export function AiMark({ size = 9 }: { size?: number }) {
  const box = size === 9 ? 'w-9 h-9 rounded-xl' : 'w-8 h-8 rounded-lg'
  return (
    <span className={`${box} bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center shadow-sm shrink-0`}>
      <Sparkles size={size === 9 ? 16 : 15} className="text-white" />
    </span>
  )
}
