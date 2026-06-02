'use client'

import { createElement, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'up' | 'fade' | 'left' | 'right' | 'scale'

interface RevealProps {
  children: React.ReactNode
  variant?: Variant
  delay?: number
  className?: string
  as?: 'div' | 'section' | 'span' | 'li'
  once?: boolean
}

const variantClass: Record<Variant, string> = {
  up: '',
  fade: 'reveal-fade',
  left: 'reveal-left',
  right: 'reveal-right',
  scale: 'reveal-scale',
}

export default function Reveal({
  children,
  variant = 'up',
  delay = 0,
  className,
  as: Tag = 'div',
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            if (once) observer.unobserve(entry.target)
          } else if (!once) {
            setVisible(false)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [once])

  return createElement(
    Tag,
    {
      ref,
      className: cn('reveal', variantClass[variant], visible && 'is-visible', className),
      style: delay ? { transitionDelay: `${delay}ms` } : undefined,
    },
    children
  )
}
