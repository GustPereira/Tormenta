import { type ReactNode } from 'react'
import { EffectsTooltip } from '../../components/EffectsTooltip'
import { inputClass } from '../../components/ui'
import { ATTRIBUTE_LABELS, SKILLS_BY_ID } from '../../data'
import { signed } from '../../lib/format'
import {
  effectContributions,
  halfLevel,
  resolveValue,
  trainingBonus,
  type DerivedCharacter,
  type EffectContribution,
  type FormulaContext,
} from '../../rules'
import type { AttributeKey, Attack, Character } from '../../schema'

const FIELDS: { key: keyof Attack; label: string }[] = [
  { key: 'damage', label: 'Dano' },
  { key: 'critical', label: 'Crítico' },
]

/** Tipos de dano do T20 (físicos + elementais). */
export const DAMAGE_TYPES = [
  'Corte', 'Impacto', 'Perfuração',
  'Ácido', 'Eletricidade', 'Essência', 'Fogo', 'Frio', 'Luz', 'Psíquico',
]

/** Alcances padrão. */
export const RANGES = ['Pessoal', 'Toque', 'Curto (9m)', 'Médio (30m)', 'Longo (90m)', 'Ilimitado']

/** Bases de ataque: combinação de perícia + atributo somada ao bônus. */
export const ATTACK_BASES: { key: string; label: string }[] = [
  { key: 'luta-for', label: 'Luta + FOR' },
  { key: 'luta-des', label: 'Luta + DES' },
  { key: 'pontaria-des', label: 'Pontaria + DES' },
  { key: 'atuacao', label: 'Atuação' },
  { key: 'magico', label: 'B. Mágico' },
]

const SKILL_BASES: Record<string, { skillId: string; skillName: string; attribute: AttributeKey }> = {
  'luta-for': { skillId: 'luta', skillName: 'Luta', attribute: 'forca' },
  'luta-des': { skillId: 'luta', skillName: 'Luta', attribute: 'destreza' },
  'pontaria-des': { skillId: 'pontaria', skillName: 'Pontaria', attribute: 'destreza' },
  atuacao: { skillId: 'atuacao', skillName: 'Atuação', attribute: 'carisma' },
}

/** Contribuições da base escolhida (½ nível, atributo, treino, efeitos). */
export function baseContributions(
  base: string,
  derived: DerivedCharacter,
  character: Character,
  ctx: FormulaContext,
): EffectContribution[] {
  if (!base) return []
  const level = derived.totalLevel
  const attrs = derived.finalAttributes

  if (base === 'magico') {
    const useInt = attrs.inteligencia >= attrs.carisma
    return [
      { name: '½ nível', value: halfLevel(level) },
      {
        name: useInt ? ATTRIBUTE_LABELS.inteligencia : ATTRIBUTE_LABELS.carisma,
        value: useInt ? attrs.inteligencia : attrs.carisma,
      },
    ].filter((c) => c.value !== 0)
  }

  const cfg = SKILL_BASES[base]
  if (!cfg) return []
  const skill = derived.skills.find((s) => s.id === cfg.skillId)
  const trained = skill?.trained ?? false
  // No T20 o ataque é um teste da perícia (Luta/Pontaria/Atuação), então as
  // parcelas devem bater com o total da perícia: além do bônus específico da
  // perícia, somam-se o bônus geral de perícia (allSkills) e — para perícias com
  // penalidade de armadura — a penalidade. (Resistência não se aplica a ataques.)
  const armorPenalty = SKILLS_BY_ID[cfg.skillId]?.armorPenalty ?? false
  return [
    { name: '½ nível', value: halfLevel(level) },
    { name: ATTRIBUTE_LABELS[cfg.attribute], value: attrs[cfg.attribute] },
    ...(trained ? [{ name: `Treino (${cfg.skillName})`, value: trainingBonus(level, true) }] : []),
    ...effectContributions(
      character,
      (m) =>
        resolveValue(m.skills[cfg.skillId] ?? 0, ctx) +
        resolveValue(m.allSkills ?? 0, ctx) +
        (armorPenalty ? resolveValue(m.penalty ?? 0, ctx) : 0),
      ctx,
    ),
  ].filter((c) => c.value !== 0)
}

/** Lista completa de parcelas que somam o bônus final do ataque. */
export function attackContributions(
  a: Attack,
  derived: DerivedCharacter,
  character: Character,
  ctx: FormulaContext,
): EffectContribution[] {
  const manual = resolveValue(a.attackBonus, ctx)
  return [
    ...baseContributions(a.base, derived, character, ctx),
    ...(manual !== 0 ? [{ name: 'Bônus', value: manual }] : []),
    ...effectContributions(character, (m) => m.attack ?? 0, ctx),
  ]
}

/** Total numérico das contribuições de ataque. */
export function attackTotal(contributions: EffectContribution[]): number {
  return contributions.reduce((s, c) => s + (typeof c.value === 'number' ? c.value : 0), 0)
}

/** Campos editáveis de um ataque (Base, Bônus, Dano, Crítico, Tipo, Alcance). */
export function AttackFields({
  attack,
  onChange,
}: {
  attack: Attack
  onChange: (key: keyof Attack, value: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <label className="flex items-center gap-1 text-xs text-stone-400">
        Base
        <select
          value={attack.base}
          onChange={(e) => onChange('base', e.target.value)}
          className={inputClass + ' w-36'}
          aria-label="Base do ataque"
        >
          <option value="">Nenhuma</option>
          {ATTACK_BASES.map((b) => (
            <option key={b.key} value={b.key}>{b.label}</option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-1 text-xs text-stone-400">
        Bônus
        <input
          type="text"
          value={attack.attackBonus}
          placeholder="ex.: 4+@car"
          onChange={(e) => onChange('attackBonus', e.target.value)}
          className={inputClass + ' w-24'}
          aria-label="Bônus do ataque"
        />
      </label>
      {FIELDS.map((f) => (
        <label key={f.key} className="flex items-center gap-1 text-xs text-stone-400">
          {f.label}
          <input
            type="text"
            value={attack[f.key]}
            onChange={(e) => onChange(f.key, e.target.value)}
            className={inputClass + ' w-24'}
            aria-label={`${f.label} do ataque`}
          />
        </label>
      ))}
      <label className="flex items-center gap-1 text-xs text-stone-400">
        Tipo
        <select
          value={attack.damageType}
          onChange={(e) => onChange('damageType', e.target.value)}
          className={inputClass + ' w-32'}
          aria-label="Tipo do ataque"
        >
          <option value="">—</option>
          {DAMAGE_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-1 text-xs text-stone-400">
        Alcance
        <select
          value={attack.range}
          onChange={(e) => onChange('range', e.target.value)}
          className={inputClass + ' w-32'}
          aria-label="Alcance do ataque"
        >
          <option value="">—</option>
          {RANGES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </label>
    </div>
  )
}

/** Exibição (read-only): cada campo do ataque num box estilo atributo, fonte maior. */
export function AttackBoxes({
  attack,
  total,
  contributions,
  damageText,
  damageContributions,
}: {
  attack: Attack
  total: number
  contributions: EffectContribution[]
  damageText: string
  damageContributions: EffectContribution[]
}) {
  const boxes: { label: string; value: ReactNode }[] = [
    {
      label: 'Ataque',
      value: (
        <EffectsTooltip contributions={contributions}>
          <span>{signed(total)}</span>
        </EffectsTooltip>
      ),
    },
    {
      label: 'Dano',
      value: (
        <EffectsTooltip contributions={damageContributions}>
          <span>{damageText || '—'}</span>
        </EffectsTooltip>
      ),
    },
    { label: 'Crítico', value: attack.critical || '—' },
    { label: 'Tipo', value: attack.damageType || '—' },
    { label: 'Alcance', value: attack.range || '—' },
  ]
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {boxes.map((b) => (
        <div
          key={b.label}
          className="flex flex-col items-center rounded-md border border-[var(--card-border)] bg-[var(--card-bg)] p-2"
        >
          <span className="text-xs uppercase text-stone-400">{b.label}</span>
          <span className="font-display text-xl font-bold text-tormenta-400">{b.value}</span>
        </div>
      ))}
    </div>
  )
}
