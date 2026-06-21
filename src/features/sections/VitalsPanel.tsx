import { RACE_TRAITS_BY_ID } from '../../data'
import { EffectsTooltip } from '../../components/EffectsTooltip'
import { Panel } from '../../components/Panel'
import { inputClass } from '../../components/ui'
import { deriveCharacter, effectContributions, type EffectContribution } from '../../rules'
import type { Character } from '../../schema'

interface Props {
  character: Character
  update: (updater: (c: Character) => Character) => void
}

export function VitalsPanel({ character, update }: Props) {
  const d = deriveCharacter(character)
  const ctx = { attributes: d.finalAttributes, level: d.totalLevel }
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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Pool
          label="Pontos de Vida"
          current={character.currentHitPoints}
          max={d.maxHitPoints}
          temp={character.temporaryHitPoints}
          contributions={effectContributions(character, (m) => m.hitPoints, ctx)}
          onChange={(v) => update((c) => ({ ...c, currentHitPoints: v }))}
          onTempChange={(v) => update((c) => ({ ...c, temporaryHitPoints: v }))}
        />
        <Pool
          label="Pontos de Mana"
          current={character.currentMana}
          max={d.maxMana}
          temp={character.temporaryMana}
          contributions={effectContributions(character, (m) => m.mana, ctx)}
          onChange={(v) => update((c) => ({ ...c, currentMana: v }))}
          onTempChange={(v) => update((c) => ({ ...c, temporaryMana: v }))}
        />
        <Big label="Defesa" value={d.defense} contributions={effectContributions(character, (m) => m.defense, ctx)} />
        <Big label="Red. de Dano" value={d.damageReduction} contributions={effectContributions(character, (m) => m.damageReduction, ctx)} />
        <Big label="Deslocamento" value={`${d.deslocamento}m`} contributions={effectContributions(character, (m) => m.movement, ctx)} />
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
  temp,
  contributions,
  onChange,
  onTempChange,
}: {
  label: string
  current: number | null
  max: number
  temp: number
  contributions: EffectContribution[]
  onChange: (v: number | null) => void
  onTempChange: (v: number) => void
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
        <EffectsTooltip contributions={contributions}>
          <span className="text-stone-500">/ {max}</span>
        </EffectsTooltip>
      </div>
      <label className="mt-1 flex items-center justify-center gap-1 text-[11px] text-stone-400">
        Temp
        <input
          type="number"
          value={temp}
          onChange={(e) => onTempChange(Number(e.target.value) || 0)}
          className={inputClass + ' w-12 text-center'}
          aria-label={`${label} temporários`}
        />
      </label>
    </div>
  )
}

function Big({
  label,
  value,
  contributions = [],
}: {
  label: string
  value: number | string
  contributions?: EffectContribution[]
}) {
  return (
    <div className="rounded-md border border-[var(--card-border)] bg-[var(--card-bg)] p-2 text-center">
      <div className="text-[11px] uppercase text-stone-400">{label}</div>
      <EffectsTooltip contributions={contributions}>
        <span className="font-display text-2xl font-bold text-tormenta-300">{value}</span>
      </EffectsTooltip>
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
