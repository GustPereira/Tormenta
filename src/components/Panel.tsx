import { useState, type ReactNode } from 'react'
import { sectionTitle } from './ui'

interface PanelProps {
  title: string
  children: ReactNode
  className?: string
  action?: ReactNode
  /** Permite recolher o conteúdo clicando no título (accordion). */
  collapsible?: boolean
}

/** Caixa de seção da ficha, com título e conteúdo. */
export function Panel({ title, children, className = '', action, collapsible = false }: PanelProps) {
  const [open, setOpen] = useState(true)
  const showBody = !collapsible || open

  return (
    <section
      className={`rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        {collapsible ? (
          <div
            role="button"
            tabIndex={0}
            onClick={() => setOpen((o) => !o)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setOpen((o) => !o)
              }
            }}
            className="flex flex-1 cursor-pointer items-center gap-2"
            aria-expanded={open}
          >
            <span className="text-xs text-stone-500">{open ? '▾' : '▸'}</span>
            <h2 className={sectionTitle}>{title}</h2>
          </div>
        ) : (
          <h2 className={sectionTitle}>{title}</h2>
        )}
        {action}
      </div>
      {showBody && children}
    </section>
  )
}
