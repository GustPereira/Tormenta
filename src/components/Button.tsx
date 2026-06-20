import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

const base =
  'inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-tormenta-400 disabled:opacity-50 disabled:cursor-not-allowed'

const variants: Record<Variant, string> = {
  primary: 'bg-tormenta-600 text-[var(--btn-text,#ffffff)] hover:bg-tormenta-500',
  secondary: 'bg-[var(--btn-bg,#44403c)] text-[var(--btn-text,#f5f5f4)] hover:brightness-110',
  danger: 'bg-red-900 text-red-100 hover:bg-red-800',
  ghost: 'text-stone-300 hover:bg-stone-800',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

export function Button({ variant = 'secondary', className = '', ...props }: ButtonProps) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />
}
