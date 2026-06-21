import { Check, Pencil } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../components/Button'
import { EffectsTooltip } from '../../components/EffectsTooltip'
import { Panel } from '../../components/Panel'
import { ATTRIBUTE_ABBR, RACES_BY_ID } from '../../data'
import { signed } from '../../lib/format'
import { deriveCharacter, effectContributions } from '../../rules'
import { ATTRIBUTE_KEYS, type AttributeKey, type Character } from '../../schema'

interface Props {
  character: Character
  update: (updater: (c: Character) => Character) => void
}

export function AttributesPanel({ character, update }: Props) {
  const derived = deriveCharacter(character)
  const ctx = { attributes: derived.finalAttributes, level: derived.totalLevel }
  const race = character.race ? RACES_BY_ID[character.race.raceId] : undefined
  const freeChoice = race?.freeChoice
  const [editing, setEditing] = useState(false)

  const setBase = (key: AttributeKey, value: number) =>
    update((c) => ({ ...c, attributes: { ...c.attributes, [key]: value } }))

  function toggleChoice(key: AttributeKey) {
    update((c) => {
      const has = c.attributeChoices.includes(key)
      if (has) return { ...c, attributeChoices: c.attributeChoices.filter((k) => k !== key) }
      const limit = freeChoice?.count ?? 0
      return { ...c, attributeChoices: [...c.attributeChoices, key].slice(-limit) }
    })
  }

  return (
    <Panel
      title="Atributos"
      action={
        <Button
          variant="ghost"
          className="text-xs"
          onClick={() => setEditing((e) => !e)}
          aria-label={editing ? 'Concluir' : 'Editar atributos'}
          title={editing ? 'Concluir' : 'Editar atributos'}
        >
          {editing ? <Check size={14} /> : <Pencil size={14} />}
        </Button>
      }
    >
      {/* Valores finais (read-only) */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {ATTRIBUTE_KEYS.map((key) => (
          <div
            key={key}
            className="flex flex-col items-center rounded-md border border-[var(--card-border)] bg-[var(--card-bg)] p-2"
          >
            <span className="text-xs uppercase text-stone-400">{ATTRIBUTE_ABBR[key]}</span>
            <EffectsTooltip contributions={effectContributions(character, (m) => m.attributes[key] ?? 0, ctx)}>
              <span className="font-display text-2xl font-bold text-tormenta-400">
                {signed(derived.finalAttributes[key])}
              </span>
            </EffectsTooltip>
          </div>
        ))}
      </div>

      {/* Edição: valores base + escolha de atributos de raça */}
      {editing && (
        <div className="mt-3 border-t border-stone-800 pt-3">
          <p className="mb-1 text-xs text-stone-400">Valores base</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {ATTRIBUTE_KEYS.map((key) => (
              <label
                key={key}
                className="flex flex-col items-center rounded-md border border-[var(--card-border)] bg-[var(--card-bg)] p-2"
              >
                <span className="text-xs uppercase text-stone-400">{ATTRIBUTE_ABBR[key]}</span>
                <input
                  type="number"
                  value={character.attributes[key]}
                  onChange={(e) => setBase(key, Number(e.target.value) || 0)}
                  className="w-12 bg-transparent text-center font-display text-xl font-bold text-[var(--text)] focus:outline-none"
                  aria-label={`Valor base de ${ATTRIBUTE_ABBR[key]}`}
                />
              </label>
            ))}
          </div>

          {freeChoice && (
            <div className="mt-3">
              <p className="mb-1 text-xs text-stone-400">
                Bônus de raça: escolha {freeChoice.count} ({signed(freeChoice.value)} cada)
              </p>
              <div className="flex flex-wrap gap-1">
                {ATTRIBUTE_KEYS.filter((k) => !freeChoice.except?.includes(k)).map((key) => {
                  const selected = character.attributeChoices.includes(key)
                  return (
                    <button
                      key={key}
                      onClick={() => toggleChoice(key)}
                      className={`rounded-full px-2 py-0.5 text-xs transition-colors ${
                        selected
                          ? 'bg-tormenta-600 text-white'
                          : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                      }`}
                    >
                      {ATTRIBUTE_ABBR[key]}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </Panel>
  )
}
