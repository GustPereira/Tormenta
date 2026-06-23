import { useRef, useState } from 'react'
import { Button } from '../../components/Button'
import { EditableCard } from '../../components/EditableCard'
import { Panel } from '../../components/Panel'
import { inputClass } from '../../components/ui'
import { ORIGINS_BY_ID } from '../../data'
import { arrayMove } from '../../lib/reorder'
import {
  ACTION_KEYS,
  DURATION_KEYS,
  EMPTY_ITEM_MODIFIERS,
  type Ability,
  type ActionKey,
  type Character,
  type DurationKey,
  type ItemModifiers,
} from '../../schema'
import { ModifiersEditor } from './ModifiersEditor'

interface Props {
  character: Character
  update: (updater: (c: Character) => Character) => void
}

function summarize(a: Ability): string {
  return [
    `Nível ${a.level}`,
    a.mp > 0 ? `${a.mp} PM` : null,
    a.acao[0] ?? 'Ação Padrão',
    a.duration,
  ]
    .filter(Boolean)
    .join(' · ')
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
          duration: 'Cena',
          hasEffect: false,
          effectActive: false,
          alwaysActive: false,
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

  // Reordenação por arrastar: guarda o id arrastado e move ao soltar sobre outro.
  const draggingId = useRef<string | null>(null)
  const reorder = (overId: string) => {
    const activeId = draggingId.current
    if (activeId) update((c) => ({ ...c, abilities: arrayMove(c.abilities, activeId, overId) }))
  }

  const originPower = character.originId ? ORIGINS_BY_ID[character.originId]?.power : null

  return (
    <Panel title="Habilidades & Poderes" collapsible>
      {originPower && (
        <p className="mb-2 text-xs text-stone-400">
          Poder de origem: <span className="text-tormenta-300">{originPower}</span>
        </p>
      )}
      <div className="space-y-4">
        <Group label="Racial & Origem" group="racial" character={character} setAbility={setAbility} remove={remove} add={add} lastAddedId={lastAddedId} onDragStart={(id) => (draggingId.current = id)} onDrop={reorder} />
        <Group label="Classe & Geral" group="classe" character={character} setAbility={setAbility} remove={remove} add={add} lastAddedId={lastAddedId} onDragStart={(id) => (draggingId.current = id)} onDrop={reorder} />
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
  onDragStart,
  onDrop,
}: {
  label: string
  group: Ability['group']
  character: Character
  setAbility: (id: string, patch: Partial<Ability>) => void
  remove: (id: string) => void
  add: (group: Ability['group']) => void
  lastAddedId: string | null
  onDragStart: (id: string) => void
  onDrop: (id: string) => void
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
              reorderable
              onReorderStart={() => onDragStart(a.id)}
              onReorderDrop={() => onDrop(a.id)}
              title={a.name || 'Poder sem nome'}
              summary={summarize(a)}
              details={a.notes || 'Sem descrição.'}
              active={a.hasEffect && !a.alwaysActive ? a.effectActive : undefined}
              onActiveChange={
                a.hasEffect && !a.alwaysActive ? (v) => setAbility(a.id, { effectActive: v }) : undefined
              }
              activeLabel="Ativo"
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
                <div className="flex flex-wrap gap-3">
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
                  <label className="flex items-center gap-2 text-xs text-stone-400">
                    Duração
                    <select
                      value={a.duration}
                      onChange={(e) => setAbility(a.id, { duration: e.target.value as DurationKey })}
                      className={inputClass}
                      aria-label="Duração"
                    >
                      {DURATION_KEYS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </label>
                </div>
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
                  <label className="flex items-center gap-2 text-xs text-stone-400">
                    <input
                      type="checkbox"
                      checked={a.alwaysActive}
                      onChange={(e) => setAbility(a.id, { alwaysActive: e.target.checked })}
                      className="h-4 w-4 accent-tormenta-500"
                    />
                    Sempre ativo (não precisa ativar/desativar)
                  </label>
                )}
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
