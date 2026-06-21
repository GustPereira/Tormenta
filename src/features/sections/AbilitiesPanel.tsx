import { Button } from '../../components/Button'
import { EditableCard } from '../../components/EditableCard'
import { Panel } from '../../components/Panel'
import { inputClass } from '../../components/ui'
import { ORIGINS_BY_ID } from '../../data'
import { ACTION_KEYS, type Ability, type Character } from '../../schema'

interface Props {
  character: Character
  update: (updater: (c: Character) => Character) => void
}

function summarize(a: Ability): string {
  const parts = [a.acao.join(', '), a.mp ? `${a.mp} PM` : null].filter(Boolean)
  return parts.join(' · ') || 'sem detalhes'
}

export function AbilitiesPanel({ character, update }: Props) {
  const add = (group: Ability['group']) =>
    update((c) => ({
      ...c,
      abilities: [
        ...c.abilities,
        { id: crypto.randomUUID(), name: '', group, notes: '', mp: 0, acao: ['Ação Padrão'] },
      ],
    }))
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
        <Group label="Racial & Origem" group="racial" character={character} setAbility={setAbility} remove={remove} add={add} />
        <Group label="Classe & Geral" group="classe" character={character} setAbility={setAbility} remove={remove} add={add} />
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
}: {
  label: string
  group: Ability['group']
  character: Character
  setAbility: (id: string, patch: Partial<Ability>) => void
  remove: (id: string) => void
  add: (group: Ability['group']) => void
}) {
  const items = character.abilities.filter((a) => a.group === group)

  const toggleAcao = (a: Ability, action: (typeof ACTION_KEYS)[number]) =>
    setAbility(a.id, {
      acao: a.acao.includes(action)
        ? a.acao.filter((x) => x !== action)
        : [...a.acao, action],
    })

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
              onDelete={() => remove(a.id)}
              deleteName={a.name}
              startEditing={!a.name}
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
                <div>
                  <span className="mb-1 block text-xs text-stone-400">Ação</span>
                  <div className="flex flex-wrap gap-1">
                    {ACTION_KEYS.map((action) => {
                      const selected = a.acao.includes(action)
                      return (
                        <button
                          key={action}
                          type="button"
                          onClick={() => toggleAcao(a, action)}
                          className={`rounded-full px-2 py-0.5 text-xs transition-colors ${
                            selected
                              ? 'bg-tormenta-600 text-white'
                              : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                          }`}
                        >
                          {action}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <textarea
                  value={a.notes}
                  placeholder="Descrição / efeito"
                  onChange={(e) => setAbility(a.id, { notes: e.target.value })}
                  className={inputClass + ' w-full resize-y text-sm'}
                  rows={4}
                  aria-label="Descrição do poder"
                />
              </div>
            </EditableCard>
          ))}
        </ul>
      )}
    </div>
  )
}
