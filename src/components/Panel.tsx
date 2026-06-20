import type { ReactNode } from 'react'
import { sectionTitle } from './ui'

interface PanelProps {
  title: string
  children: ReactNode
  className?: string
  action?: ReactNode
}

/** Caixa de seção da ficha, com título e conteúdo. */
export function Panel({ title, children, className = '', action }: PanelProps) {
  return (
    <section
      className={`rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <h2 className={sectionTitle}>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}
