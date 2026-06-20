import { ATTRIBUTE_ABBR } from '../../data'
import { Panel } from '../../components/Panel'
import { signed } from '../../lib/format'
import { deriveCharacter } from '../../rules'
import type { Character } from '../../schema'

interface Props {
  character: Character
  update: (updater: (c: Character) => Character) => void
}

export function SkillsPanel({ character, update }: Props) {
  const derived = deriveCharacter(character)

  const toggle = (skillId: string) =>
    update((c) => ({
      ...c,
      trainedSkills: c.trainedSkills.includes(skillId)
        ? c.trainedSkills.filter((s) => s !== skillId)
        : [...c.trainedSkills, skillId],
    }))

  return (
    <Panel title="Perícias">
      <ul className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        {derived.skills.map((skill) => (
          <li
            key={skill.id}
            className="flex items-center gap-2 border-b border-stone-800/60 py-0.5 text-sm"
          >
            <input
              type="checkbox"
              checked={skill.trained}
              onChange={() => toggle(skill.id)}
              className="h-3.5 w-3.5 accent-tormenta-500"
              aria-label={`Treinar ${skill.name}`}
            />
            <span className="w-9 text-right font-display font-bold text-tormenta-300">
              {signed(skill.total)}
            </span>
            <span className={`flex-1 ${skill.unusable ? 'text-stone-500' : 'text-stone-200'}`}>
              {skill.name}
              {skill.onlyTrained && (
                <span className="ml-1 text-[10px] text-amber-500/80" title="Só treinada">
                  ⚿
                </span>
              )}
            </span>
            <span className="text-[10px] uppercase text-stone-500">
              {ATTRIBUTE_ABBR[skill.attribute]}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
