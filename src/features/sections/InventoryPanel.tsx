import { useState } from 'react'
import { Button } from '../../components/Button'
import { EditableCard } from '../../components/EditableCard'
import { Panel } from '../../components/Panel'
import { inputClass } from '../../components/ui'
import { ITEM_CATALOG, ITEM_CATALOG_CATEGORIES, type CatalogItem } from '../../data'
import { describeModifiers } from '../../rules'
import {
  EMPTY_ITEM_MODIFIERS,
  type Character,
  type InventoryItem,
  type ItemModifiers,
} from '../../schema'
import { ModifiersEditor } from './ModifiersEditor'

/** Converte uma entrada do catálogo em um item de inventário novo (cópia). */
function fromCatalog(c: CatalogItem): InventoryItem {
  return {
    id: crypto.randomUUID(),
    name: c.name,
    quantity: 1,
    spaces: c.spaces ?? 0,
    equipped: false,
    proficiency: c.proficiency ?? '',
    activeEffect: false,
    modifiers: { ...EMPTY_ITEM_MODIFIERS, attributes: {}, skills: {}, ...c.modifiers },
    notes: c.description ?? '',
  }
}

interface Props {
  character: Character
  update: (updater: (c: Character) => Character) => void
}

const numClass = inputClass + ' w-16 text-center'

function summarize(item: InventoryItem): string {
  const mods = describeModifiers(item.modifiers)
  const parts = [
    `${item.spaces} esp.`,
    item.equipped && 'Equipado',
    mods !== 'sem modificadores' && mods,
  ].filter(Boolean)
  return parts.join(' · ')
}

export function InventoryPanel({ character, update }: Props) {
  const [lastAddedId, setLastAddedId] = useState<string | null>(null)
  const [showCatalog, setShowCatalog] = useState(false)
  const setItem = (id: string, patch: Partial<InventoryItem>) =>
    update((c) => ({
      ...c,
      inventory: c.inventory.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }))

  const setModifiers = (id: string, modifiers: ItemModifiers) => setItem(id, { modifiers })

  const add = () => {
    const id = crypto.randomUUID()
    setLastAddedId(id)
    update((c) => ({
      ...c,
      inventory: [
        ...c.inventory,
        {
          id,
          name: '',
          quantity: 1,
          spaces: 0,
          equipped: false,
          proficiency: '',
          activeEffect: false,
          modifiers: { ...EMPTY_ITEM_MODIFIERS, attributes: {}, skills: {} },
          notes: '',
        },
      ],
    }))
  }

  const addFromCatalog = (cat: CatalogItem) =>
    update((c) => ({ ...c, inventory: [...c.inventory, fromCatalog(cat)] }))

  const remove = (id: string) =>
    update((c) => ({ ...c, inventory: c.inventory.filter((it) => it.id !== id) }))

  const totalSpaces = character.inventory.reduce((s, it) => s + it.spaces * it.quantity, 0)

  return (
    <Panel
      title="Inventário"
      action={
        <div className="flex gap-1">
          <Button variant="ghost" className="text-xs" onClick={() => setShowCatalog((s) => !s)}>
            {showCatalog ? '▾ Catálogo' : '▸ Catálogo'}
          </Button>
          <Button variant="ghost" className="text-xs" onClick={add}>+ item</Button>
        </div>
      }
    >
      {showCatalog && (
        <div className="mb-3 rounded-md border border-[var(--card-border)] bg-[var(--card-bg)] p-2">
          <p className="mb-2 text-xs text-stone-400">
            Itens prontos — clique para adicionar uma cópia ao inventário.
          </p>
          {ITEM_CATALOG_CATEGORIES.map((cat) => (
            <div key={cat} className="mb-2">
              <h4 className="mb-1 text-xs font-semibold uppercase text-tormenta-300">{cat}</h4>
              <ul className="flex flex-col gap-1">
                {ITEM_CATALOG.filter((i) => i.category === cat).map((item) => (
                  <li key={item.id} className="flex items-center gap-2">
                    <Button variant="secondary" className="text-xs" onClick={() => addFromCatalog(item)}>
                      + Adicionar
                    </Button>
                    <span className="text-sm text-[var(--text)]">{item.name}</span>
                    {item.modifiers?.defense ? (
                      <span className="text-xs text-stone-500">Defesa +{item.modifiers.defense}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <div className="mb-3 flex flex-wrap items-center gap-4 text-sm">
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
          Espaços usados: <span className="text-[var(--text)]">{totalSpaces}</span>
        </span>
      </div>

      {character.inventory.length === 0 ? (
        <p className="text-sm text-stone-500">Inventário vazio.</p>
      ) : (
        <ul className="space-y-2">
          {character.inventory.map((item) => (
            <EditableCard
              key={item.id}
              active={item.activeEffect}
              onActiveChange={(v) => setItem(item.id, { activeEffect: v })}
              activeLabel="Efeito ativo"
              headerExtra={
                <label className="flex items-center gap-1 text-xs text-stone-400">
                  <input
                    type="checkbox"
                    checked={item.equipped}
                    onChange={(e) => setItem(item.id, { equipped: e.target.checked })}
                    className="h-4 w-4 accent-tormenta-500"
                  />
                  Equipado
                </label>
              }
              title={`${item.quantity}× ${item.name || 'Item sem nome'}`}
              summary={summarize(item)}
              details={item.notes || 'Sem descrição.'}
              onDelete={() => remove(item.id)}
              deleteName={item.name}
              startEditing={item.id === lastAddedId}
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-1 text-xs text-stone-400">
                    Qtd
                    <input
                      type="number"
                      min={0}
                      value={item.quantity}
                      onChange={(e) => setItem(item.id, { quantity: Math.max(0, Number(e.target.value) || 0) })}
                      className={numClass}
                      aria-label="Quantidade"
                    />
                  </label>
                  <input
                    type="text"
                    value={item.name}
                    placeholder="Nome do item"
                    onChange={(e) => setItem(item.id, { name: e.target.value })}
                    className={inputClass + ' min-w-40 flex-1 font-medium'}
                    aria-label="Nome do item"
                  />
                  <label className="flex items-center gap-1 text-xs text-stone-400">
                    Espaços
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={item.spaces}
                      onChange={(e) => setItem(item.id, { spaces: Math.max(0, Number(e.target.value) || 0) })}
                      className={numClass}
                      aria-label="Espaços"
                    />
                  </label>
                  <label className="flex items-center gap-1 text-xs text-stone-400">
                    Proficiência
                    <input
                      type="text"
                      value={item.proficiency}
                      onChange={(e) => setItem(item.id, { proficiency: e.target.value })}
                      className={inputClass + ' w-28'}
                      aria-label="Proficiência"
                    />
                  </label>
                </div>
                <textarea
                  value={item.notes}
                  placeholder="Descrição"
                  onChange={(e) => setItem(item.id, { notes: e.target.value })}
                  className={inputClass + ' w-full resize-y text-sm'}
                  rows={3}
                  aria-label="Descrição do item"
                />
                <div className="border-t border-stone-800 pt-2">
                  <ModifiersEditor
                    modifiers={item.modifiers}
                    onChange={(m) => setModifiers(item.id, m)}
                  />
                </div>
              </div>
            </EditableCard>
          ))}
        </ul>
      )}
    </Panel>
  )
}
