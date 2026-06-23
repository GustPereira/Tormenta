import { ATTRIBUTE_LABELS, RESISTANCE_SKILL_IDS } from '../../data'
import { baseContributions } from './attackShared'
import { EffectsTooltip } from '../../components/EffectsTooltip'
import { Panel } from '../../components/Panel'
import { inputClass } from '../../components/ui'
import { signed } from '../../lib/format'
import {
  deriveCharacter,
  effectContributions,
  halfLevel,
  resolveValue,
  trainingBonus,
  type DerivedCharacter,
  type DerivedSkill,
  type EffectContribution,
  type FormulaContext,
} from '../../rules'
import type { Character } from '../../schema'

interface Props {
  character: Character
  update: (updater: (c: Character) => Character) => void
}

/** Detalhamento completo do bônus de uma perícia (para o tooltip). */
function skillBreakdown(
  skill: DerivedSkill,
  d: DerivedCharacter,
  character: Character,
  ctx: FormulaContext,
): EffectContribution[] {
  const isResistance = RESISTANCE_SKILL_IDS.includes(
    skill.id as (typeof RESISTANCE_SKILL_IDS)[number],
  )
  return [
    { name: '½ nível', value: halfLevel(d.totalLevel) },
    { name: ATTRIBUTE_LABELS[skill.attribute], value: skill.attributeMod },
    ...(skill.trained ? [{ name: 'Treino', value: trainingBonus(d.totalLevel, true) }] : []),
    ...effectContributions(
      character,
      (m) =>
        resolveValue(m.skills[skill.id] ?? 0, ctx) +
        resolveValue(m.allSkills ?? 0, ctx) +
        (isResistance ? resolveValue(m.resistance ?? 0, ctx) : 0) +
        (skill.armorPenalty ? resolveValue(m.penalty, ctx) : 0),
      ctx,
    ),
  ].filter((c) => c.value !== 0)
}

export function VitalsPanel({ character, update }: Props) {
  const d = deriveCharacter(character)
  const ctx: FormulaContext = {
    attributes: d.finalAttributes,
    level: d.totalLevel,
    shieldDefense: d.shieldDefense,
  }

  const resistances = RESISTANCE_SKILL_IDS.map((id) => d.skills.find((s) => s.id === id)).filter(
    (s): s is DerivedSkill => Boolean(s),
  )

  // CD de resistência a magias = 10 + ½ nível + atributo-chave (T20, p. 227).
  // Segue a convenção do app para conjuração: maior entre Inteligência e Carisma.
  const useInt = d.finalAttributes.inteligencia >= d.finalAttributes.carisma
  const spellDcContribs = [
    { name: 'Base', value: 10 },
    { name: '½ nível', value: halfLevel(d.totalLevel) },
    {
      name: useInt ? ATTRIBUTE_LABELS.inteligencia : ATTRIBUTE_LABELS.carisma,
      value: useInt ? d.finalAttributes.inteligencia : d.finalAttributes.carisma,
    },
    ...effectContributions(character, (m) => m.spellDc ?? 0, ctx),
  ].filter((c) => c.value !== 0)

  // Teste de manobra = teste de ataque corpo a corpo (valor de Luta) + bônus de
  // manobra dos efeitos (T20, p. 232).
  const maneuverContribs = [
    ...baseContributions('luta-for', d, character, ctx),
    ...effectContributions(character, (m) => m.maneuver ?? 0, ctx),
  ].filter((c) => c.value !== 0)

  const sumContribs = (cs: EffectContribution[]) =>
    cs.reduce((s, c) => s + (typeof c.value === 'number' ? c.value : 0), 0)

  const initiative = d.skills.find((s) => s.id === 'iniciativa')

  return (
    <Panel title="Vitais & Defesa">
      {/* Pontos de Vida e Mana */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
      </div>

      {/* Defesa, Redução de Dano e Deslocamento */}
      <div className="mt-3 grid grid-cols-3 gap-3">
        <Big
          label="Defesa"
          value={d.defense}
          contributions={[
            { name: 'Base', value: 10 },
            { name: '½ nível', value: halfLevel(d.totalLevel) },
            // Armadura pesada: a Destreza não conta na Defesa (regra do T20).
            ...(d.heavyArmorEquipped
              ? []
              : [{ name: 'Destreza', value: d.finalAttributes.destreza }]),
            ...effectContributions(character, (m) => m.defense, ctx),
          ].filter((c) => c.value !== 0)}
        />
        <Big label="Red. de Dano" value={d.damageReduction} contributions={effectContributions(character, (m) => m.damageReduction, ctx)} />
        <Big label="Deslocamento" value={`${d.deslocamento}m`} contributions={effectContributions(character, (m) => m.movement, ctx)} />
      </div>

      {/* CD de resistência a magias, teste de manobra e iniciativa */}
      <div className="mt-3 grid grid-cols-3 gap-3">
        <Big label="CD Resist. Magia" value={sumContribs(spellDcContribs)} contributions={spellDcContribs} />
        <Big label="Teste de Manobra" value={signed(sumContribs(maneuverContribs))} contributions={maneuverContribs} />
        {initiative && (
          <Big
            label="Iniciativa"
            value={signed(initiative.total)}
            contributions={skillBreakdown(initiative, d, character, ctx)}
          />
        )}
      </div>

      {/* Resistências (testes de resistência) */}
      <div className="mt-3">
        <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-stone-400">
          Resistências
        </div>
        <div className="grid grid-cols-3 gap-3">
          {resistances.map((skill) => (
            <Big
              key={skill.id}
              label={skill.name}
              value={signed(skill.total)}
              contributions={skillBreakdown(skill, d, character, ctx)}
            />
          ))}
        </div>
      </div>
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
    <div className="rounded-md border border-[var(--card-border)] bg-[var(--card-bg)] p-2">
      <div className="text-center text-[11px] uppercase text-stone-400">{label}</div>
      <div className="mt-1 flex items-end justify-center gap-2">
        <Field caption="Atual">
          <input
            type="number"
            value={current ?? max}
            onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
            className={inputClass + ' w-14 text-center text-lg font-bold'}
            aria-label={`${label} atual`}
          />
        </Field>
        <span className="pb-5 text-lg text-stone-500">/</span>
        <Field caption="Máx">
          <EffectsTooltip contributions={contributions}>
            <span className="font-display text-2xl font-bold text-tormenta-300">{max}</span>
          </EffectsTooltip>
        </Field>
        <span className="pb-5 text-lg text-stone-500">/</span>
        <Field caption="Temp">
          <input
            type="number"
            value={temp}
            onChange={(e) => onTempChange(Number(e.target.value) || 0)}
            className={inputClass + ' w-16 text-center text-lg font-bold'}
            aria-label={`${label} temporários`}
          />
        </Field>
      </div>
    </div>
  )
}

/** Rótulo pequeno abaixo de um valor (atual/máx/temp). */
function Field({ caption, children }: { caption: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      {children}
      <span className="text-[10px] uppercase text-stone-500">{caption}</span>
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
