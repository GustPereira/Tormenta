import { useState } from 'react'
import { Button } from '../../components/Button'
import { EditableCard } from '../../components/EditableCard'
import { Panel } from '../../components/Panel'
import { inputClass } from '../../components/ui'
import { ORIGINS_BY_ID } from '../../data'
import {
  ACTION_KEYS,
  EMPTY_ITEM_MODIFIERS,
  type Ability,
  type ActionKey,
  type Character,
  type ItemModifiers,
} from '../../schema'
import { ModifiersEditor } from './ModifiersEditor'

interface Props {
  character: Character
  update: (updater: (c: Character) => Character) => void
}

function summarize(a: Ability): string {
  return `Nível ${a.level} · ${a.mp} PM · ${a.acao[0] ?? 'Ação Padrão'}`
}

export function AbilitiesPanel({ character, update }: Props) {
  const [lastAddedId, setLastAddedId] = useState<string | null>(null)
  const add = (group: Ability['group']) => {
    const id = crypto.randomUUID()
    setLastAddedId(id)
    update((c) => ({
      ...c,
      abilities: [
        ...c.abilities,
        {
          id,
          name: '',
          group,
          notes: '',
          level: 1,
          mp: 0,
          acao: ['Ação Padrão'],
          hasEffect: false,
          effectActive: false,
          modifiers: { ...EMPTY_ITEM_MODIFIERS, attributes: {}, skills: {} },
        },
      ],
    }))
  }
  const setAbility = (id: string, patch: Partial<Ability>) =>
    update((c) => ({
      ...c,
      abilities: c.abilities.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }))
  const remove = (id: string) =>
    update((c) => ({ ...c, abilities: c.abilities.filter((a) => a.id !== id) }))

  const originPower = character.originId ? ORIGINS_BY_ID[character.originId]?.power : null

  return (
    <Panel title="Habilidades & Poderes">
      {originPower && (
        <p className="mb-2 text-xs text-stone-400">
          Poder de origem: <span className="text-tormenta-300">{originPower}</span>
        </p>
      )}
      <div className="space-y-4">
        <Group label="Racial & Origem" group="racial" character={character} setAbility={setAbility} remove={remove} add={add} lastAddedId={lastAddedId} />
        <Group label="Classe & Geral" group="classe" character={character} setAbility={setAbility} remove={remove} add={add} lastAddedId={lastAddedId} />
      </div>
    </Panel>
  )
}

function Group({
  label,
  group,
  character,
  setAbility,
  remove,
  add,
  lastAddedId,
}: {
  label: string
  group: Ability['group']
  character: Character
  setAbility: (id: string, patch: Partial<Ability>) => void
  remove: (id: string) => void
  add: (group: Ability['group']) => void
  lastAddedId: string | null
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
            <EditableCard
              key={a.id}
              title={a.name || 'Poder sem nome'}
              summary={summarize(a)}
              details={a.notes || 'Sem descrição.'}
              onDelete={() => remove(a.id)}
              deleteName={a.name}
              startEditing={a.id === lastAddedId}
            >
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={a.name}
                  placeholder="Nome do poder"
                  onChange={(e) => setAbility(a.id, { name: e.target.value })}
                  className={inputClass + ' w-full font-medium'}
                  aria-label="Nome do poder"
                />
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 text-xs text-stone-400">
                    Nível
                    <input
                      type="number"
                      value={a.level}
                      onChange={(e) => setAbility(a.id, { level: Number(e.target.value) || 0 })}
                      className={inputClass + ' w-16 text-center'}
                      aria-label="Nível"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-xs text-stone-400">
                    Custo em PM
                    <input
                      type="number"
                      value={a.mp}
                      onChange={(e) => setAbility(a.id, { mp: Number(e.target.value) || 0 })}
                      className={inputClass + ' w-16 text-center'}
                      aria-label="Custo em PM"
                    />
                  </label>
                </div>
                <label className="flex items-center gap-2 text-xs text-stone-400">
                  Ação
                  <select
                    value={a.acao[0] ?? 'Ação Padrão'}
                    onChange={(e) => setAbility(a.id, { acao: [e.target.value as ActionKey] })}
                    className={inputClass}
                    aria-label="Ação"
                  >
                    {ACTION_KEYS.map((action) => (
                      <option key={action} value={action}>{action}</option>
                    ))}
                  </select>
                </label>
                <textarea
                  value={a.notes}
                  placeholder="Descrição / efeito"
                  onChange={(e) => setAbility(a.id, { notes: e.target.value })}
                  className={inputClass + ' w-full resize-y text-sm'}
                  rows={4}
                  aria-label="Descrição do poder"
                />
                <label className="flex items-center gap-2 text-xs text-stone-400">
                  <input
                    type="checkbox"
                    checked={a.hasEffect}
                    onChange={(e) => setAbility(a.id, { hasEffect: e.target.checked })}
                    className="h-4 w-4 accent-tormenta-500"
                  />
                  Tem efeito (aparece na aba Efeitos)
                </label>
                {a.hasEffect && (
                  <div className="border-t border-stone-800 pt-2">
                    <ModifiersEditor
                      modifiers={a.modifiers}
                      onChange={(m: ItemModifiers) => setAbility(a.id, { modifiers: m })}
                    />
                  </div>
                )}
              </div>
            </EditableCard>
          ))}
        </ul>
      )}
    </div>
  )
}
