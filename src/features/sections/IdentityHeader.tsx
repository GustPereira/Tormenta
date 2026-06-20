import { CLASSES, ORIGINS, RACES } from '../../data'
import { Button } from '../../components/Button'
import { inputClass } from '../../components/ui'
import { totalLevel } from '../../rules'
import type { Character } from '../../schema'

interface Props {
  character: Character
  update: (updater: (c: Character) => Character) => void
}

export function IdentityHeader({ character, update }: Props) {
  const set = (field: keyof Character, value: unknown) =>
    update((c) => ({ ...c, [field]: value }))

  function setClassEntry(i: number, classId: string, level: number) {
    update((c) => ({
      ...c,
      classes: c.classes.map((e, idx) => (idx === i ? { classId, level } : e)),
    }))
  }
  const addClass = () =>
    update((c) => ({ ...c, classes: [...c.classes, { classId: CLASSES[0].id, level: 1 }] }))
  const removeClass = (i: number) =>
    update((c) => ({ ...c, classes: c.classes.filter((_, idx) => idx !== i) }))

  return (
    <div className="rounded-lg border border-tormenta-800/60 bg-stone-900/60 p-4">
      <input
        type="text"
        value={character.name}
        onChange={(e) => set('name', e.target.value)}
        className="w-full bg-transparent font-display text-3xl font-bold text-stone-100 focus:outline-none"
        aria-label="Nome do personagem"
        placeholder="Nome do personagem"
      />

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Labeled label="Raça">
          <select
            value={character.race?.raceId ?? ''}
            onChange={(e) =>
              set('race', e.target.value ? { raceId: e.target.value } : null)
            }
            className={inputClass + ' w-full'}
          >
            <option value="">— Sem raça —</option>
            {RACES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </Labeled>

        <Labeled label="Origem">
          <select
            value={character.originId ?? ''}
            onChange={(e) => set('originId', e.target.value || null)}
            className={inputClass + ' w-full'}
          >
            <option value="">— Sem origem —</option>
            {ORIGINS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </Labeled>

        <Labeled label="Jogador">
          <input
            type="text"
            value={character.player}
            onChange={(e) => set('player', e.target.value)}
            className={inputClass + ' w-full'}
          />
        </Labeled>

        <Labeled label="Divindade">
          <input
            type="text"
            value={character.deity}
            onChange={(e) => set('deity', e.target.value)}
            className={inputClass + ' w-full'}
          />
        </Labeled>

        <Labeled label="Tendência">
          <input
            type="text"
            value={character.alignment}
            onChange={(e) => set('alignment', e.target.value)}
            className={inputClass + ' w-full'}
          />
        </Labeled>

        <Labeled label={`Classes (nível ${totalLevel(character)})`}>
          <div className="space-y-1">
            {character.classes.map((entry, i) => (
              <div key={i} className="flex gap-1">
                <select
                  value={entry.classId}
                  onChange={(e) => setClassEntry(i, e.target.value, entry.level)}
                  className={inputClass + ' flex-1'}
                >
                  {CLASSES.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  value={entry.level}
                  onChange={(e) =>
                    setClassEntry(i, entry.classId, Math.max(1, Number(e.target.value) || 1))
                  }
                  className={inputClass + ' w-14 text-center'}
                  aria-label="Nível"
                />
                <Button variant="ghost" onClick={() => removeClass(i)} aria-label="Remover classe">
                  ✕
                </Button>
              </div>
            ))}
            <Button variant="ghost" onClick={addClass} className="text-xs">
              + classe
            </Button>
          </div>
        </Labeled>
      </div>
    </div>
  )
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium uppercase tracking-wide text-stone-400">
        {label}
      </span>
      {children}
    </label>
  )
}
