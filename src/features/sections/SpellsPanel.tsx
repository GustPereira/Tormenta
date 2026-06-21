import { Button } from '../../components/Button'
import { EditableCard } from '../../components/EditableCard'
import { Panel } from '../../components/Panel'
import { inputClass } from '../../components/ui'
import type { Character, Spell } from '../../schema'

interface Props {
  character: Character
  update: (updater: (c: Character) => Character) => void
}

/** Custo de PM por círculo (planilha de referência). */
const PM_BY_CIRCLE: Record<number, number> = { 1: 1, 2: 3, 3: 6, 4: 10, 5: 15 }
const CIRCLES = [1, 2, 3, 4, 5]

export function SpellsPanel({ character, update }: Props) {
  const add = (circle: number) =>
    update((c) => ({
      ...c,
      spells: [...c.spells, { id: crypto.randomUUID(), name: '', circle, prepared: false, notes: '' }],
    }))
  const setField = (id: string, patch: Partial<Spell>) =>
    update((c) => ({
      ...c,
      spells: c.spells.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }))
  const remove = (id: string) =>
    update((c) => ({ ...c, spells: c.spells.filter((s) => s.id !== id) }))

  return (
    <Panel title="Magias">
      <div className="space-y-3">
        {CIRCLES.map((circle) => {
          const spells = character.spells.filter((s) => s.circle === circle)
          return (
            <div key={circle}>
              <div className="mb-1 flex items-center justify-between border-b border-stone-800 pb-0.5">
                <h3 className="text-xs font-semibold uppercase text-tormenta-300">
                  {circle}º Círculo <span className="text-stone-500">({PM_BY_CIRCLE[circle]} PM)</span>
                </h3>
                <Button variant="ghost" className="text-xs" onClick={() => add(circle)}>+ magia</Button>
              </div>
              {spells.length === 0 ? (
                <p className="text-xs text-stone-600">—</p>
              ) : (
                <ul className="space-y-2">
                  {spells.map((s) => (
                    <EditableCard
                      key={s.id}
                      active={s.prepared}
                      onActiveChange={(v) => setField(s.id, { prepared: v })}
                      activeLabel="Preparada"
                      title={s.name || 'Magia sem nome'}
                      summary={s.notes || 'sem anotações'}
                      onDelete={() => remove(s.id)}
                      deleteName={s.name}
                      startEditing={!s.name}
                    >
                      <input
                        type="text"
                        value={s.name}
                        placeholder="Nome da magia"
                        onChange={(e) => setField(s.id, { name: e.target.value })}
                        className={inputClass + ' mb-2 w-full font-medium'}
                        aria-label="Nome da magia"
                      />
                      <textarea
                        value={s.notes}
                        placeholder="Anotações / efeito"
                        onChange={(e) => setField(s.id, { notes: e.target.value })}
                        className={inputClass + ' w-full resize-y text-sm'}
                        rows={3}
                        aria-label="Anotações da magia"
                      />
                    </EditableCard>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </Panel>
  )
}
