import { Button } from '../../components/Button'
import { EditableCard } from '../../components/EditableCard'
import { Panel } from '../../components/Panel'
import { inputClass } from '../../components/ui'
import type { Attack, Character } from '../../schema'

interface Props {
  character: Character
  update: (updater: (c: Character) => Character) => void
}

const FIELDS: { key: keyof Attack; label: string }[] = [
  { key: 'attackBonus', label: 'Bônus' },
  { key: 'damage', label: 'Dano' },
  { key: 'critical', label: 'Crítico' },
  { key: 'damageType', label: 'Tipo' },
  { key: 'range', label: 'Alcance' },
]

function summarize(a: Attack): string {
  const parts = [
    a.attackBonus && `Bônus ${a.attackBonus}`,
    a.damage && `Dano ${a.damage}`,
    a.critical && `Crít. ${a.critical}`,
    a.damageType,
    a.range,
  ].filter(Boolean)
  return parts.join(' · ') || 'sem detalhes'
}

export function AttacksPanel({ character, update }: Props) {
  const add = () =>
    update((c) => ({
      ...c,
      attacks: [
        ...c.attacks,
        { id: crypto.randomUUID(), name: '', attackBonus: '', damage: '', critical: '', damageType: '', range: '' },
      ],
    }))
  const setField = (id: string, key: keyof Attack, value: string) =>
    update((c) => ({
      ...c,
      attacks: c.attacks.map((a) => (a.id === id ? { ...a, [key]: value } : a)),
    }))
  const remove = (id: string) =>
    update((c) => ({ ...c, attacks: c.attacks.filter((a) => a.id !== id) }))

  return (
    <Panel
      title="Ataques & Conjurações"
      action={<Button variant="ghost" className="text-xs" onClick={add}>+ ataque</Button>}
    >
      {character.attacks.length === 0 ? (
        <p className="text-sm text-stone-500">Nenhum ataque.</p>
      ) : (
        <ul className="space-y-2">
          {character.attacks.map((a) => (
            <EditableCard
              key={a.id}
              title={a.name || 'Ataque sem nome'}
              summary={summarize(a)}
              onDelete={() => remove(a.id)}
              deleteName={a.name}
              startEditing={!a.name}
            >
              <div className="space-y-2">
                <input
                  type="text"
                  value={a.name}
                  placeholder="Nome do ataque"
                  onChange={(e) => setField(a.id, 'name', e.target.value)}
                  className={inputClass + ' w-full font-medium'}
                  aria-label="Nome do ataque"
                />
                <div className="flex flex-wrap gap-3">
                  {FIELDS.map((f) => (
                    <label key={f.key} className="flex items-center gap-1 text-xs text-stone-400">
                      {f.label}
                      <input
                        type="text"
                        value={a[f.key]}
                        onChange={(e) => setField(a.id, f.key, e.target.value)}
                        className={inputClass + ' w-24'}
                        aria-label={`${f.label} do ataque`}
                      />
                    </label>
                  ))}
                </div>
              </div>
            </EditableCard>
          ))}
        </ul>
      )}
    </Panel>
  )
}
