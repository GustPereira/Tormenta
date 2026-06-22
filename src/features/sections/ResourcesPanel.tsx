import { useState } from 'react'
import { Button } from '../../components/Button'
import { EditableCard } from '../../components/EditableCard'
import { Panel } from '../../components/Panel'
import { inputClass } from '../../components/ui'
import type { Character, Resource } from '../../schema'

interface Props {
  character: Character
  update: (updater: (c: Character) => Character) => void
}

export function ResourcesPanel({ character, update }: Props) {
  const [lastAddedId, setLastAddedId] = useState<string | null>(null)
  const add = () => {
    const id = crypto.randomUUID()
    setLastAddedId(id)
    update((c) => ({
      ...c,
      resources: [
        ...c.resources,
        { id, title: '', current: 0, max: null, resetsOnScene: false, resetTo: 'zero' },
      ],
    }))
  }
  const setField = (id: string, patch: Partial<Resource>) =>
    update((c) => ({
      ...c,
      resources: c.resources.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }))
  const remove = (id: string) =>
    update((c) => ({ ...c, resources: c.resources.filter((r) => r.id !== id) }))

  return (
    <Panel
      title="Recursos"
      collapsible
      action={<Button variant="ghost" className="text-xs" onClick={add}>+ recurso</Button>}
    >
      {character.resources.length === 0 ? (
        <p className="text-sm text-stone-500">Nenhum recurso.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {character.resources.map((r) => (
            <EditableCard
              key={r.id}
              title={r.title || 'Recurso sem nome'}
              summary={
                <div className="flex items-end justify-center gap-2">
                  <Field caption="Atual">
                    <input
                      type="number"
                      value={r.current}
                      onChange={(e) => setField(r.id, { current: Number(e.target.value) || 0 })}
                      className={inputClass + ' w-16 text-center text-lg font-bold'}
                      aria-label={`${r.title || 'Recurso'} atual`}
                    />
                  </Field>
                  {r.max != null && (
                    <>
                      <span className="pb-5 text-lg text-stone-500">/</span>
                      <Field caption="Máx">
                        <span className="font-display text-2xl font-bold text-tormenta-300">{r.max}</span>
                      </Field>
                    </>
                  )}
                  {r.resetsOnScene && (
                    <span className="pb-5 text-[10px] uppercase text-stone-500" title="Reseta ao encerrar a cena">
                      ↻ cena
                    </span>
                  )}
                </div>
              }
              onDelete={() => remove(r.id)}
              deleteName={r.title}
              startEditing={r.id === lastAddedId}
            >
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={r.title}
                  placeholder="Título do recurso"
                  onChange={(e) => setField(r.id, { title: e.target.value })}
                  className={inputClass + ' w-full font-medium'}
                  aria-label="Título do recurso"
                />
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 text-xs text-stone-400">
                    Atual
                    <input
                      type="number"
                      value={r.current}
                      onChange={(e) => setField(r.id, { current: Number(e.target.value) || 0 })}
                      className={inputClass + ' w-16 text-center'}
                      aria-label="Valor atual"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-xs text-stone-400">
                    Máximo
                    <input
                      type="number"
                      value={r.max ?? ''}
                      placeholder="—"
                      onChange={(e) =>
                        setField(r.id, {
                          max: e.target.value === '' ? null : Number(e.target.value) || 0,
                        })
                      }
                      className={inputClass + ' w-16 text-center'}
                      aria-label="Máximo (opcional)"
                    />
                  </label>
                </div>
                <label className="flex items-center gap-2 text-xs text-stone-400">
                  <input
                    type="checkbox"
                    checked={r.resetsOnScene}
                    onChange={(e) => setField(r.id, { resetsOnScene: e.target.checked })}
                    className="h-4 w-4 accent-tormenta-500"
                  />
                  Reseta ao encerrar a cena
                </label>
                {r.resetsOnScene && (
                  <label className="flex items-center gap-2 text-xs text-stone-400">
                    Resetar para
                    <select
                      value={r.resetTo}
                      onChange={(e) => setField(r.id, { resetTo: e.target.value as Resource['resetTo'] })}
                      className={inputClass}
                      aria-label="Valor ao resetar"
                    >
                      <option value="zero">Zero (0)</option>
                      <option value="max">Máximo</option>
                    </select>
                  </label>
                )}
              </div>
            </EditableCard>
          ))}
        </ul>
      )}
    </Panel>
  )
}

/** Rótulo pequeno abaixo de um valor (atual/máx). */
function Field({ caption, children }: { caption: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      {children}
      <span className="text-[10px] uppercase text-stone-500">{caption}</span>
    </div>
  )
}
