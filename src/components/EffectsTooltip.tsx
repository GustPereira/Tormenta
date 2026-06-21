import type { ReactNode } from 'react'
import type { EffectContribution } from '../rules'
import { signed } from '../lib/format'

interface Props {
  contributions: EffectContribution[]
  children: ReactNode
}

/**
 * Envolve um valor e, ao passar o mouse, mostra a lista de efeitos ativos que o
 * estão alterando (cada um como "+N nome"). Sem efeitos, não mostra tooltip.
 */
export function EffectsTooltip({ contributions, children }: Props) {
  if (contributions.length === 0) return <>{children}</>
  return (
    <span className="group relative inline-flex cursor-help">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-[var(--card-border)] bg-stone-900 px-2 py-1 text-left text-xs font-normal text-stone-200 shadow-lg group-hover:block">
        {contributions.map((c, i) => (
          <div key={i}>
            <span className="font-semibold text-tormenta-300">{signed(c.value)}</span> {c.name}
          </div>
        ))}
      </span>
    </span>
  )
}
