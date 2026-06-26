'use client'

import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'

// Accessible-dialog behavior for any modal: ESC to close, Tab focus-trap inside
// the dialog, background scroll lock, and focus restored to the trigger on close.
// Pass the modal's open state, a close callback, and a ref to the dialog panel.
export function useModalA11y(open: boolean, onClose: () => void, containerRef: RefObject<HTMLElement>) {
  // Keep the latest onClose without re-running the effect every render.
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return
    const container = containerRef.current
    const prevActive = document.activeElement as HTMLElement | null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusables = () =>
      container
        ? Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null)
        : []

    // Move focus into the dialog unless something inside is already focused
    // (e.g. an input with autoFocus).
    if (!container?.contains(document.activeElement)) {
      ;(focusables()[0] ?? container)?.focus?.()
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onCloseRef.current(); return }
      if (e.key !== 'Tab' || !container) return
      const els = focusables()
      if (els.length === 0) { e.preventDefault(); return }
      const first = els[0]
      const last = els[els.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      prevActive?.focus?.()
    }
  }, [open, containerRef])
}
