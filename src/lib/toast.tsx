'use client'

import { useEffect, useState } from 'react'

// ─── Lightweight global toast system (no provider needed) ───────────────────────

export type ToastType = 'success' | 'info' | 'warn' | 'celebrate'

interface Toast {
  id: number
  message: string
  type: ToastType
  emoji?: string
}

let toasts: Toast[] = []
let listeners: Array<(t: Toast[]) => void> = []
let counter = 0

function emit() {
  listeners.forEach((l) => l(toasts))
}

export function toast(message: string, opts?: { type?: ToastType; emoji?: string; duration?: number }) {
  const id = ++counter
  const t: Toast = { id, message, type: opts?.type ?? 'success', emoji: opts?.emoji }
  toasts = [...toasts, t]
  emit()
  const duration = opts?.duration ?? 2800
  setTimeout(() => {
    toasts = toasts.filter((x) => x.id !== id)
    emit()
  }, duration)
}

const STYLES: Record<ToastType, string> = {
  success: 'bg-navy-900 text-white',
  info: 'bg-sky-600 text-white',
  warn: 'bg-amber-500 text-white',
  celebrate: 'bg-gradient-to-r from-wine to-wine-700 text-white',
}

const DEFAULT_EMOJI: Record<ToastType, string> = {
  success: '✓', info: 'ℹ️', warn: '⚠️', celebrate: '🎉',
}

export function Toaster() {
  const [items, setItems] = useState<Toast[]>(toasts)

  useEffect(() => {
    listeners.push(setItems)
    return () => { listeners = listeners.filter((l) => l !== setItems) }
  }, [])

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] flex flex-col items-center gap-2 pointer-events-none">
      {items.map((t) => (
        <div
          key={t.id}
          className={`animate-modal-pop flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-premium text-sm font-semibold ${STYLES[t.type]}`}
        >
          <span className="text-base">{t.emoji ?? DEFAULT_EMOJI[t.type]}</span>
          {t.message}
        </div>
      ))}
    </div>
  )
}
