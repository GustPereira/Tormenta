import { useState, type ReactNode } from 'react'
import { Button } from '../../components/Button'
import { EditableCard } from '../../components/EditableCard'
import { EffectsTooltip } from '../../components/EffectsTooltip'
import { Panel } from '../../components/Panel'
import { inputClass } from '../../components/ui'
import { ATTRIBUTE_LABELS } from '../../data'
import { signed } from '../../lib/format'
import {
  deriveCharacter,
  effectContributions,
  halfLevel,
  resolveValue,
  trainingBonus,
  type DerivedCharacter,
  type EffectContribution,
  type FormulaContext,
} from '../../rules'
import type { AttributeKey, Attack, Character } from '../../schema'

interface Props {
  character: Character
  update: (updater: (c: Character) => Character) => void
}

const FIELDS: { key: keyof Attack; label: string }[] = [
  { key: 'damage', label: 'Dano' },
  { key: 'critical', label: 'Crítico' },
]

/** Tipos de dano do T20 (físicos + elementais). */
const DAMAGE_TYPES = [
  'Corte', 'Impacto', 'Perfuração',
  'Ácido', 'Eletricidade', 'Essência', 'Fogo', 'Frio', 'Luz', 'Psíquico',
]

/** Alcances padrão. */
const RANGES = ['Pessoal', 'Toque', 'Curto (9m)', 'Médio (30m)', 'Longo (90m)', 'Ilimitado']

/** Bases de ataque: combinação de perícia + atributo somada ao bônus. */
const ATTACK_BASES: { key: string; label: string }[] = [
  { key: 'luta-for', label: 'Luta + FOR' },
  { key: 'luta-des', label: 'Luta + DES' },
  { key: 'pontaria-des', label: 'Pontaria + DES' },
  { key: 'atuacao', label: 'Atuação' },
  { key: 'magico', label: 'B. Mágico' },
]

const BASE_LABELS: Record<string, string> = Object.fromEntries(
  ATTACK_BASES.map((b) => [b.key, b.label]),
)

const SKILL_BASES: Record<string, { skillId: string; skillName: string; attribute: AttributeKey }> = {
  'luta-for': { skillId: 'luta', skillName: 'Luta', attribute: 'forca' },
  'luta-des': { skillId: 'luta', skillName: 'Luta', attribute: 'destreza' },
  'pontaria-des': { skillId: 'pontaria', skillName: 'Pontaria', attribute: 'destreza' },
  atuacao: { skillId: 'atuacao', skillName: 'Atuação', attribute: 'carisma' },
}

/** Contribuições da base escolhida (½ nível, atributo, treino, efeitos). */
function baseContributions(
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
  return [
    { name: '½ nível', value: halfLevel(level) },
    { name: ATTRIBUTE_LABELS[cfg.attribute], value: attrs[cfg.attribute] },
    ...(trained ? [{ name: `Treino (${cfg.skillName})`, value: trainingBonus(level, true) }] : []),
    ...effectContributions(character, (m) => resolveValue(m.skills[cfg.skillId] ?? 0, ctx), ctx),
  ].filter((c) => c.value !== 0)
}

/** Lista completa de parcelas que somam o bônus final do ataque. */
function attackContributions(
  a: Attack,
  derived: DerivedCharacter,
  character: Character,
  ctx: FormulaContext,
): EffectContribution[] {
  const manual = resolveValue(a.attackBonus, ctx)
  return [
    ...baseContributions(a.base, derived, character, ctx),
    ...(manual !== 0 ? [{ name: 'Bônus', value: manual }] : []),
  ]
}

export function AttacksPanel({ character, update }: Props) {
  const derived = deriveCharacter(character)
  const ctx: FormulaContext = { attributes: derived.finalAttributes, level: derived.totalLevel }
  const [lastAddedId, setLastAddedId] = useState<string | null>(null)
  const add = () => {
    const id = crypto.randomUUID()
    setLastAddedId(id)
    update((c) => ({
      ...c,
      attacks: [
        ...c.attacks,
        { id, name: '', base: '', attackBonus: '', damage: '', critical: '', damageType: '', range: '' },
      ],
    }))
  }
  const setField = (id: string, key: keyof Attack, value: string) =>
    update((c) => ({
      ...c,
      attacks: c.attacks.map((a) => (a.id === id ? { ...a, [key]: value } : a)),
    }))
  const remove = (id: string) =>
    update((c) => ({ ...c, attacks: c.attacks.filter((a) => a.id !== id) }))

  return (
    <Panel
      title="Ataques & Conjurações"
      action={<Button variant="ghost" className="text-xs" onClick={add}>+ ataque</Button>}
    >
      {character.attacks.length === 0 ? (
        <p className="text-sm text-stone-500">Nenhum ataque.</p>
      ) : (
        <ul className="space-y-2">
          {character.attacks.map((a) => {
            const contribs = attackContributions(a, derived, character, ctx)
            const total = contribs.reduce((s, c) => s + c.value, 0)
            return (
              <EditableCard
                key={a.id}
                title={a.name || 'Ataque sem nome'}
                summary={<AttackBoxes attack={a} total={total} contributions={contribs} />}
                onDelete={() => remove(a.id)}
                deleteName={a.name}
                startEditing={a.id === lastAddedId}
              >
                <div className="space-y-2">
                  <input
                    type="text"
                    value={a.name}
                    placeholder="Nome do ataque"
                    onChange={(e) => setField(a.id, 'name', e.target.value)}
                    className={inputClass + ' w-full font-medium'}
                    aria-label="Nome do ataque"
                  />
                  <div className="flex flex-wrap gap-3">
                    <label className="flex items-center gap-1 text-xs text-stone-400">
                      Base
                      <select
                        value={a.base}
                        onChange={(e) => setField(a.id, 'base', e.target.value)}
                        className={inputClass + ' w-36'}
                        aria-label="Base do ataque"
                      >
                        <option value="">Nenhuma</option>
                        {ATTACK_BASES.map((b) => (
                          <option key={b.key} value={b.key}>
                            {b.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex items-center gap-1 text-xs text-stone-400">
                      Bônus
                      <input
                        type="text"
                        value={a.attackBonus}
                        placeholder="ex.: 4+@car"
                        onChange={(e) => setField(a.id, 'attackBonus', e.target.value)}
                        className={inputClass + ' w-24'}
                        aria-label="Bônus do ataque"
                      />
                    </label>
                    {FIELDS.map((f) => (
                      <label key={f.key} className="flex items-center gap-1 text-xs text-stone-400">
                        {f.label}
                        <input
                          type="text"
                          value={a[f.key]}
                          onChange={(e) => setField(a.id, f.key, e.target.value)}
                          className={inputClass + ' w-24'}
                          aria-label={`${f.label} do ataque`}
                        />
                      </label>
                    ))}
                    <label className="flex items-center gap-1 text-xs text-stone-400">
                      Tipo
                      <select
                        value={a.damageType}
                        onChange={(e) => setField(a.id, 'damageType', e.target.value)}
                        className={inputClass + ' w-32'}
                        aria-label="Tipo do ataque"
                      >
                        <option value="">—</option>
                        {DAMAGE_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex items-center gap-1 text-xs text-stone-400">
                      Alcance
                      <select
                        value={a.range}
                        onChange={(e) => setField(a.id, 'range', e.target.value)}
                        className={inputClass + ' w-32'}
                        aria-label="Alcance do ataque"
                      >
                        <option value="">—</option>
                        {RANGES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              </EditableCard>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}

/** Exibição (read-only): cada campo do ataque num box estilo atributo, fonte maior. */
function AttackBoxes({
  attack,
  total,
  contributions,
}: {
  attack: Attack
  total: number
  contributions: EffectContribution[]
}) {
  const baseLabel = attack.base ? BASE_LABELS[attack.base] : undefined
  const boxes: { label: string; value: ReactNode }[] = [
    {
      label: baseLabel ? `Ataque (${baseLabel})` : 'Ataque',
      value: (
        <EffectsTooltip contributions={contributions}>
          <span>{signed(total)}</span>
        </EffectsTooltip>
      ),
    },
    { label: 'Dano', value: attack.damage || '—' },
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
