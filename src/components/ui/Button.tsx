import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'wine'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  children: ReactNode
}

// 7.3 — thin wrapper over the established .btn-* classes so new buttons stay on
// the three canonical variants (the classes already carry the focus, hover and
// active states from globals.css).
const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  wine: 'btn-wine',
}

export default function Button({ variant = 'primary', className, children, type = 'button', ...rest }: ButtonProps) {
  return (
    <button type={type} className={cn(VARIANT_CLASS[variant], className)} {...rest}>
      {children}
    </button>
  )
}
