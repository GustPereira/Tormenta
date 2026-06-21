import { Check, Pencil, Star } from 'lucide-react'
import { useState } from 'react'
import { ATTRIBUTE_ABBR, ATTRIBUTE_LABELS, CLASSES_BY_ID } from '../../data'
import { Button } from '../../components/Button'
import { EffectsTooltip } from '../../components/EffectsTooltip'
import { Panel } from '../../components/Panel'
import { signed } from '../../lib/format'
import {
  deriveCharacter,
  effectContributions,
  halfLevel,
  resolveOrigin,
  resolveValue,
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

  // Quantas perícias o jogador pode escolher: as "à escolha" da 1ª classe +
  // Inteligência. Multiclasse (T20): a nova classe não concede perícias.
  const firstClass = character.classes[0]
  const fromClasses = firstClass ? (CLASSES_BY_ID[firstClass.classId]?.pericasEscolha ?? 0) : 0
  const intBonus = Math.max(0, derived.finalAttributes.inteligencia)
  const origin = resolveOrigin(character)

  // Perícias fixas concedidas (com repetição) pela 1ª classe + origem. Cada
  // repetição vira uma escolha extra (a perícia já treinada por outra fonte).
  const grantedList = [
    ...(firstClass ? (CLASSES_BY_ID[firstClass.classId]?.pericasFixas ?? []) : []),
    ...(origin?.pericasFixas ?? []),
  ]
  const duplicateBonus = grantedList.length - new Set(grantedList).size

  const chooseLimit = fromClasses + intBonus + (origin?.pericasEscolha ?? 0) + duplicateBonus
  const chosen = derived.skills.filter((s) => s.trained && !s.granted).length

  const ctx = { attributes: derived.finalAttributes, level: derived.totalLevel }

  // De onde vem o limite (para o tooltip).
  const limitSources = [
    ...(firstClass
      ? [{
          name: `${CLASSES_BY_ID[firstClass.classId]?.name ?? 'Classe'} (classe)`,
          value: CLASSES_BY_ID[firstClass.classId]?.pericasEscolha ?? 0,
        }]
      : []),
    { name: 'Origem', value: origin?.pericasEscolha ?? 0 },
    { name: 'Inteligência', value: intBonus },
    { name: 'Perícias fixas repetidas', value: duplicateBonus },
  ].filter((s) => s.value !== 0)

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
