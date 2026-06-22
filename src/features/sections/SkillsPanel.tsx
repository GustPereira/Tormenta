import { Check, Pencil, Star } from 'lucide-react'
import { useState } from 'react'
import { ATTRIBUTE_ABBR, ATTRIBUTE_LABELS, RACES_BY_ID, RESISTANCE_SKILL_IDS } from '../../data'
import { Button } from '../../components/Button'
import { EffectsTooltip } from '../../components/EffectsTooltip'
import { Panel } from '../../components/Panel'
import { signed } from '../../lib/format'
import {
  deriveCharacter,
  effectContributions,
  halfLevel,
  resolveValue,
  skillChoiceLimit,
  trainingBonus,
} from '../../rules'
import type { Character } from '../../schema'

interface Props {
  character: Character
  update: (updater: (c: Character) => Character) => void
}

export function SkillsPanel({ character, update }: Props) {
  const [editing, setEditing] = useState(false)
  const derived = deriveCharacter(character)

  // Quantas perícias o jogador pode escolher (1ª classe + origem + raça + Int +
  // fixas repetidas). Multiclasse (T20): a nova classe não concede perícias.
  const { limit: chooseLimit, sources: limitSources } = skillChoiceLimit(
    character,
    derived.finalAttributes.inteligencia,
  )
  const chosen = derived.skills.filter((s) => s.trained && !s.granted).length

  // Raça que permite trocar uma perícia por um poder geral (Humano, Osteon).
  const race = character.race ? RACES_BY_ID[character.race.raceId] : undefined
  const canTradeSkillForPower = Boolean(race?.podeTrocarPericiaPorPoder)

  const ctx = {
    attributes: derived.finalAttributes,
    level: derived.totalLevel,
    shieldDefense: derived.shieldDefense,
  }

  const toggle = (skillId: string) =>
    update((c) => ({
      ...c,
      trainedSkills: c.trainedSkills.includes(skillId)
        ? c.trainedSkills.filter((s) => s !== skillId)
        : [...c.trainedSkills, skillId],
    }))

  return (
    <Panel
      title="Perícias"
      action={
        <Button
          variant="ghost"
          className="text-xs"
          onClick={() => setEditing((e) => !e)}
          aria-label={editing ? 'Concluir' : 'Editar perícias'}
          title={editing ? 'Concluir' : 'Editar perícias'}
        >
          {editing ? <Check size={14} /> : <Pencil size={14} />}
        </Button>
      }
    >
      <p className="mb-2 text-xs text-stone-400">
        Escolhidas:{' '}
        <EffectsTooltip contributions={limitSources}>
          <span className="text-tormenta-300">{chosen}/{chooseLimit}</span>
        </EffectsTooltip>
        {' '}<span className="text-stone-500">(guia; perícias da classe são automáticas)</span>
      </p>
      {editing && canTradeSkillForPower && (
        <label className="mb-2 flex items-start gap-2 text-xs text-stone-300">
          <input
            type="checkbox"
            checked={character.racePowerForSkill}
            onChange={(e) =>
              update((c) => ({ ...c, racePowerForSkill: e.target.checked }))
            }
            className="mt-0.5 h-3.5 w-3.5 accent-tormenta-500"
          />
          <span>
            Troquei uma perícia da raça por um poder geral
            <span className="text-stone-500"> (reduz 1 perícia; adicione o poder em Habilidades)</span>
          </span>
        </label>
      )}
      <ul className="grid grid-cols-1 gap-x-4">
        {derived.skills.map((skill) => {
          const disabled = !editing || skill.granted
          // Cálculo completo da perícia (para o tooltip).
          const breakdown = skill.unusable
            ? []
            : [
                { name: '½ nível', value: halfLevel(derived.totalLevel) },
                { name: ATTRIBUTE_LABELS[skill.attribute], value: skill.attributeMod },
                ...(skill.trained
                  ? [{ name: 'Treino', value: trainingBonus(derived.totalLevel, true) }]
                  : []),
                ...effectContributions(
                  character,
                  (m) =>
                    resolveValue(m.skills[skill.id] ?? 0, ctx) +
                    resolveValue(m.allSkills ?? 0, ctx) +
                    (RESISTANCE_SKILL_IDS.includes(skill.id as (typeof RESISTANCE_SKILL_IDS)[number])
                      ? resolveValue(m.resistance ?? 0, ctx)
                      : 0) +
                    (skill.armorPenalty ? resolveValue(m.penalty, ctx) : 0),
                  ctx,
                ),
              ].filter((c) => c.value !== 0)
          return (
            <li
              key={skill.id}
              className="flex items-center gap-2 border-b border-stone-800/60 py-0.5 text-sm"
            >
              <input
                type="checkbox"
                checked={skill.trained}
                disabled={disabled}
                onChange={() => toggle(skill.id)}
                className="h-3.5 w-3.5 accent-tormenta-500 disabled:opacity-50"
                aria-label={`Treinar ${skill.name}`}
                title={skill.granted ? 'Concedida pela classe' : undefined}
              />
              <EffectsTooltip contributions={breakdown}>
                <span className="w-9 text-right font-display font-bold text-tormenta-300">
                  {skill.unusable ? '—' : signed(skill.total)}
                </span>
              </EffectsTooltip>
              <span className={`flex-1 ${skill.unusable ? 'text-stone-500' : 'text-[var(--text)]'}`}>
                {skill.name}
                {skill.onlyTrained && (
                  <Star
                    size={12}
                    fill="currentColor"
                    className="ml-1 inline-block align-[-1px] text-amber-400"
                    aria-label="Somente treinada"
                  />
                )}
                {skill.granted && (
                  <span className="ml-1 text-[10px] uppercase text-stone-500">fixa</span>
                )}
              </span>
              <span className="text-[10px] uppercase text-stone-500">
                {ATTRIBUTE_ABBR[skill.attribute]}
              </span>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}
