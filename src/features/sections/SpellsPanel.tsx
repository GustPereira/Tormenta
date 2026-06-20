import { Button } from '../../components/Button'
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
                <ul className="space-y-1">
                  {spells.map((s) => (
                    <li key={s.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={s.prepared}
                        onChange={(e) => setField(s.id, { prepared: e.target.checked })}
                        className="h-3.5 w-3.5 accent-tormenta-500"
                        aria-label="Preparada"
                        title="Preparada"
                      />
                      <input
                        type="text"
                        value={s.name}
                        placeholder="Nome da magia"
                        onChange={(e) => setField(s.id, { name: e.target.value })}
                        className={inputClass + ' flex-1'}
                        aria-label="Nome da magia"
                      />
                      <Button variant="ghost" onClick={() => remove(s.id)} aria-label="Remover magia">✕</Button>
                    </li>
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
