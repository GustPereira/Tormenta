import { RACE_TRAITS_BY_ID } from '../../data'
import { Panel } from '../../components/Panel'
import { inputClass } from '../../components/ui'
import { deriveCharacter } from '../../rules'
import type { Character } from '../../schema'

interface Props {
  character: Character
  update: (updater: (c: Character) => Character) => void
}

export function VitalsPanel({ character, update }: Props) {
  const d = deriveCharacter(character)
  const traits = character.race ? RACE_TRAITS_BY_ID[character.race.raceId] : undefined

  const senses = [
    traits?.visaoPenumbra && 'Visão na penumbra',
    traits?.visaoEscuro && 'Visão no escuro',
    traits?.faro && 'Faro',
  ].filter(Boolean) as string[]

  const profs = [
    d.proficiencies.armaduraMarcial && 'Armaduras marciais',
    d.proficiencies.armaduraPesada && 'Armaduras pesadas',
    d.proficiencies.escudo && 'Escudos',
  ].filter(Boolean) as string[]

  return (
    <Panel title="Vitais & Defesa">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Pool
          label="Pontos de Vida"
          current={character.currentHitPoints}
          max={d.maxHitPoints}
          onChange={(v) => update((c) => ({ ...c, currentHitPoints: v }))}
        />
        <Pool
          label="Pontos de Mana"
          current={character.currentMana}
          max={d.maxMana}
          onChange={(v) => update((c) => ({ ...c, currentMana: v }))}
        />
        <Big label="Defesa" value={d.defense} />
        <Big label="Deslocamento" value={`${d.deslocamento}m`} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <Info label="Tipo" value={traits?.tipo ?? '—'} />
        <Info label="Tamanho" value={traits?.tamanho ?? '—'} />
        <Info label="Sentidos" value={senses.join(', ') || '—'} />
        <Info label="Proficiências" value={profs.join(', ') || '—'} />
      </dl>
    </Panel>
  )
}

function Pool({
  label,
  current,
  max,
  onChange,
}: {
  label: string
  current: number | null
  max: number
  onChange: (v: number | null) => void
}) {
  return (
    <div className="rounded-md border border-[var(--card-border)] bg-[var(--card-bg)] p-2 text-center">
      <div className="text-[11px] uppercase text-stone-400">{label}</div>
      <div className="flex items-center justify-center gap-1">
        <input
          type="number"
          value={current ?? max}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          className={inputClass + ' w-14 text-center text-lg font-bold'}
          aria-label={`${label} atual`}
        />
        <span className="text-stone-500">/ {max}</span>
      </div>
    </div>
  )
}

function Big({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-[var(--card-border)] bg-[var(--card-bg)] p-2 text-center">
      <div className="text-[11px] uppercase text-stone-400">{label}</div>
      <div className="font-display text-2xl font-bold text-tormenta-300">{value}</div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 border-b border-stone-800 py-0.5">
      <dt className="text-stone-400">{label}</dt>
      <dd className="text-right text-[var(--text)]">{value}</dd>
    </div>
  )
}
