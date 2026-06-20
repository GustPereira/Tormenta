import { Button } from '../../components/Button'
import { Panel } from '../../components/Panel'
import { inputClass } from '../../components/ui'
import type { Attack, Character } from '../../schema'

interface Props {
  character: Character
  update: (updater: (c: Character) => Character) => void
}

const COLS: { key: keyof Attack; label: string; w: string }[] = [
  { key: 'name', label: 'Nome', w: 'w-40' },
  { key: 'attackBonus', label: 'Bônus', w: 'w-16' },
  { key: 'damage', label: 'Dano', w: 'w-24' },
  { key: 'critical', label: 'Crítico', w: 'w-20' },
  { key: 'damageType', label: 'Tipo', w: 'w-24' },
  { key: 'range', label: 'Alcance', w: 'w-24' },
]

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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-stone-400">
                {COLS.map((col) => (
                  <th key={col.key} className="px-1 pb-1 font-medium">{col.label}</th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {character.attacks.map((a) => (
                <tr key={a.id}>
                  {COLS.map((col) => (
                    <td key={col.key} className="px-1 py-0.5">
                      <input
                        type="text"
                        value={a[col.key]}
                        onChange={(e) => setField(a.id, col.key, e.target.value)}
                        className={`${inputClass} ${col.w} max-w-full`}
                        aria-label={`${col.label} do ataque`}
                      />
                    </td>
                  ))}
                  <td className="px-1">
                    <Button variant="ghost" onClick={() => remove(a.id)} aria-label="Remover ataque">✕</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  )
}
