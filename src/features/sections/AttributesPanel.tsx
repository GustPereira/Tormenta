import { ATTRIBUTE_ABBR, RACES_BY_ID } from '../../data'
import { Panel } from '../../components/Panel'
import { signed } from '../../lib/format'
import { deriveCharacter } from '../../rules'
import { ATTRIBUTE_KEYS, type AttributeKey, type Character } from '../../schema'
import { useState } from 'react'
import { Button } from '../../components/Button'

interface Props {
  character: Character
  update: (updater: (c: Character) => Character) => void
}

export function AttributesPanel({ character, update }: Props) {
  const derived = deriveCharacter(character)
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

  function toggleEditing() {
    setEditing(!editing)
  }

  return (
    <Panel title="Atributos">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {ATTRIBUTE_KEYS.map((key) => {
          const final = derived.finalAttributes[key]
          return (
            <div
              key={key}
              className="flex flex-col items-center rounded-md border border-[var(--card-border)] bg-[var(--card-bg)] p-2"
            >
              <span className="text-xs uppercase text-stone-400">
                {ATTRIBUTE_ABBR[key]}
              </span>
              <span className="text-[var(--text)] text-tormenta-400 text-2xl text-center font-bold">
                {signed(final)}
              </span>
              <input
                type="number"
                value={character.attributes[key]}
                onChange={(e) => setBase(key, Number(e.target.value) || 0)}
                className="w-12 bg-transparent text-center font-display  text-[var(--text)] focus:outline-none"
                aria-label={ATTRIBUTE_ABBR[key]}
              />

            </div>
          )
        })}
      </div>
      <div className="mt-3 flex">

        <div className='flex-1'>
          {editing && (
            <div className='flex flex-col'>
              <div className="flex gap-2">

              {ATTRIBUTE_KEYS.map((key) => {
                return (
                  <div
                  key={key}
                  className="flex flex-col items-center rounded-md border border-[var(--card-border)] bg-[var(--card-bg)] p-2"
                  >
              <span className="text-xs uppercase text-stone-400">
                {ATTRIBUTE_ABBR[key]}
              </span>
              <input
                type="number"
                value={character.attributes[key]}
                onChange={(e) => setBase(key, Number(e.target.value) || 0)}
                className="w-12 bg-transparent text-center font-display  text-[var(--text)] focus:outline-none"
                aria-label={ATTRIBUTE_ABBR[key]}
              />

            </div>
          )
        })}
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
                          className={`rounded-full px-2 py-0.5 text-xs transition-colors ${selected
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
        </div>
        <div className='flex flex-col justify-center'>
        <Button variant="primary" onClick={() => toggleEditing()}>Edit</Button>
        </div>
      </div>
    </Panel>
  )
}
