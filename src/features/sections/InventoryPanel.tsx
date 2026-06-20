import { Button } from '../../components/Button'
import { Panel } from '../../components/Panel'
import { inputClass } from '../../components/ui'
import type { Character, InventoryItem } from '../../schema'

interface Props {
  character: Character
  update: (updater: (c: Character) => Character) => void
}

export function InventoryPanel({ character, update }: Props) {
  const add = () =>
    update((c) => ({
      ...c,
      inventory: [
        ...c.inventory,
        { id: crypto.randomUUID(), name: '', quantity: 1, spaces: 0, equipped: false, notes: '' },
      ],
    }))
  const setField = (id: string, patch: Partial<InventoryItem>) =>
    update((c) => ({
      ...c,
      inventory: c.inventory.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }))
  const remove = (id: string) =>
    update((c) => ({ ...c, inventory: c.inventory.filter((it) => it.id !== id) }))

  const totalSpaces = character.inventory.reduce(
    (sum, it) => sum + it.spaces * it.quantity,
    0,
  )

  return (
    <Panel
      title="Inventário"
      action={<Button variant="ghost" className="text-xs" onClick={add}>+ item</Button>}
    >
      <div className="mb-2 flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-1">
          <span className="text-stone-400">T$</span>
          <input
            type="number"
            min={0}
            value={character.money}
            onChange={(e) => update((c) => ({ ...c, money: Math.max(0, Number(e.target.value) || 0) }))}
            className={inputClass + ' w-24'}
            aria-label="Tibares"
          />
        </label>
        <span className="text-stone-400">
          Espaços usados: <span className="text-stone-200">{totalSpaces}</span>
        </span>
      </div>

      {character.inventory.length === 0 ? (
        <p className="text-sm text-stone-500">Inventário vazio.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-stone-400">
              <th className="px-1 pb-1 font-medium">Qtd</th>
              <th className="px-1 pb-1 font-medium">Item</th>
              <th className="px-1 pb-1 font-medium">Espaços</th>
              <th className="px-1 pb-1 font-medium">Equip.</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {character.inventory.map((it) => (
              <tr key={it.id}>
                <td className="px-1 py-0.5">
                  <input
                    type="number"
                    min={0}
                    value={it.quantity}
                    onChange={(e) => setField(it.id, { quantity: Math.max(0, Number(e.target.value) || 0) })}
                    className={inputClass + ' w-14 text-center'}
                    aria-label="Quantidade"
                  />
                </td>
                <td className="px-1 py-0.5">
                  <input
                    type="text"
                    value={it.name}
                    onChange={(e) => setField(it.id, { name: e.target.value })}
                    className={inputClass + ' w-full'}
                    aria-label="Nome do item"
                  />
                </td>
                <td className="px-1 py-0.5">
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={it.spaces}
                    onChange={(e) => setField(it.id, { spaces: Math.max(0, Number(e.target.value) || 0) })}
                    className={inputClass + ' w-16 text-center'}
                    aria-label="Espaços"
                  />
                </td>
                <td className="px-1 py-0.5 text-center">
                  <input
                    type="checkbox"
                    checked={it.equipped}
                    onChange={(e) => setField(it.id, { equipped: e.target.checked })}
                    className="h-4 w-4 accent-tormenta-500"
                    aria-label="Equipado"
                  />
                </td>
                <td className="px-1">
                  <Button variant="ghost" onClick={() => remove(it.id)} aria-label="Remover item">✕</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Panel>
  )
}
