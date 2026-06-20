import { ATTRIBUTE_ABBR, RACES_BY_ID } from '../../data'
import { Panel } from '../../components/Panel'
import { signed } from '../../lib/format'
import { deriveCharacter } from '../../rules'
import { ATTRIBUTE_KEYS, type AttributeKey, type Character } from '../../schema'

interface Props {
  character: Character
  update: (updater: (c: Character) => Character) => void
}

export function AttributesPanel({ character, update }: Props) {
  const derived = deriveCharacter(character)
  const race = character.race ? RACES_BY_ID[character.race.raceId] : undefined
  const freeChoice = race?.freeChoice

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
    <Panel title="Atributos">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {ATTRIBUTE_KEYS.map((key) => {
          const final = derived.finalAttributes[key]
          return (
            <div
              key={key}
              className="flex flex-col items-center rounded-md border border-stone-700 bg-stone-800/60 p-2"
            >
              <span className="text-xs uppercase text-stone-400">
                {ATTRIBUTE_ABBR[key]}
              </span>
              <input
                type="number"
                value={character.attributes[key]}
                onChange={(e) => setBase(key, Number(e.target.value) || 0)}
                className="w-12 bg-transparent text-center font-display text-2xl font-bold text-stone-100 focus:outline-none"
                aria-label={ATTRIBUTE_ABBR[key]}
              />
              <span className="text-[11px] text-tormenta-300">
                final {signed(final)}
              </span>
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
    </Panel>
  )
}
