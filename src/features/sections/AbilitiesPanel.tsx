import { Button } from '../../components/Button'
import { Panel } from '../../components/Panel'
import { inputClass } from '../../components/ui'
import { ORIGINS_BY_ID } from '../../data'
import type { Ability, Character } from '../../schema'

interface Props {
  character: Character
  update: (updater: (c: Character) => Character) => void
}

export function AbilitiesPanel({ character, update }: Props) {
  const add = (group: Ability['group']) =>
    update((c) => ({
      ...c,
      abilities: [...c.abilities, { id: crypto.randomUUID(), name: '', group, notes: '' }],
    }))
  const setField = (id: string, key: keyof Ability, value: string) =>
    update((c) => ({
      ...c,
      abilities: c.abilities.map((a) => (a.id === id ? { ...a, [key]: value } : a)),
    }))
  const remove = (id: string) =>
    update((c) => ({ ...c, abilities: c.abilities.filter((a) => a.id !== id) }))

  const originPower = character.originId
    ? ORIGINS_BY_ID[character.originId]?.power
    : null

  return (
    <Panel title="Habilidades & Poderes">
      {originPower && (
        <p className="mb-2 text-xs text-stone-400">
          Poder de origem: <span className="text-tormenta-300">{originPower}</span>
        </p>
      )}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Group label="Racial & Origem" group="racial" character={character} setField={setField} remove={remove} add={add} />
        <Group label="Classe & Geral" group="classe" character={character} setField={setField} remove={remove} add={add} />
      </div>
    </Panel>
  )
}

function Group({
  label,
  group,
  character,
  setField,
  remove,
  add,
}: {
  label: string
  group: Ability['group']
  character: Character
  setField: (id: string, key: keyof Ability, value: string) => void
  remove: (id: string) => void
  add: (group: Ability['group']) => void
}) {
  const items = character.abilities.filter((a) => a.group === group)
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-xs font-medium uppercase text-stone-400">{label}</h3>
        <Button variant="ghost" className="text-xs" onClick={() => add(group)}>+ poder</Button>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-stone-500">—</p>
      ) : (
        <ul className="space-y-2">
          {items.map((a) => (
            <li key={a.id} className="rounded-md border border-[var(--card-border)] bg-[var(--card-bg)] p-2">
              <div className="flex gap-1">
                <input
                  type="text"
                  value={a.name}
                  placeholder="Nome do poder"
                  onChange={(e) => setField(a.id, 'name', e.target.value)}
                  className={inputClass + ' flex-1 font-medium'}
                  aria-label="Nome do poder"
                />
                <Button variant="ghost" onClick={() => remove(a.id)} aria-label="Remover poder">✕</Button>
              </div>
              <textarea
                value={a.notes}
                placeholder="Descrição / efeito"
                onChange={(e) => setField(a.id, 'notes', e.target.value)}
                className={inputClass + ' mt-1 w-full resize-y text-sm'}
                rows={2}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
