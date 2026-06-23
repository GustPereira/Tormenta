import { useRef, useState, type ReactNode } from 'react'
import { Button } from '../../components/Button'
import { EditableCard } from '../../components/EditableCard'
import { Modal } from '../../components/Modal'
import { Panel } from '../../components/Panel'
import { inputClass } from '../../components/ui'
import { ITEM_CATALOG, ITEM_CATALOG_CATEGORIES, type CatalogItem } from '../../data'
import { arrayMove } from '../../lib/reorder'
import { describeModifiers } from '../../rules'
import {
  EMPTY_ITEM_MODIFIERS,
  type Attack,
  type Character,
  type EquipmentType,
  type InventoryItem,
  type ItemModifiers,
} from '../../schema'
import { AttackFields } from './attackShared'
import { ModifiersEditor } from './ModifiersEditor'

/** Proficiências de itens de defesa. Define também o slot (escudo vs armadura). */
const DEFENSE_PROFICIENCIES = ['Leves', 'Pesadas', 'Escudos'] as const

/** Categorias do catálogo que são itens de defesa (armadura/escudo). */
const DEFENSE_CATEGORIES = ['Armaduras', 'Escudos']
const WEAPON_CATEGORIES = ['Armas']
const OTHER_CATEGORIES = ITEM_CATALOG_CATEGORIES.filter(
  (c) => !DEFENSE_CATEGORIES.includes(c) && !WEAPON_CATEGORIES.includes(c),
)

/** Cria um ataque embutido em branco para uma arma. */
function blankAttack(): Attack {
  return { id: crypto.randomUUID(), name: '', base: '', attackBonus: '', damage: '', critical: '', damageType: '', range: '' }
}

/** Slot do item de defesa a partir da proficiência: Escudos → escudo; demais → armadura. */
function slotForProficiency(proficiency: string): Exclude<EquipmentType, ''> {
  return proficiency === 'Escudos' ? 'escudo' : 'armadura'
}

/** Converte uma entrada do catálogo em um item de inventário novo (cópia). */
function fromCatalog(c: CatalogItem): InventoryItem {
  const equipmentType: EquipmentType =
    c.category === 'Armaduras' ? 'armadura' : c.category === 'Escudos' ? 'escudo' : ''
  const attack: Attack | null =
    c.category === 'Armas' ? { ...blankAttack(), name: c.name, ...c.attack } : null
  return {
    id: crypto.randomUUID(),
    name: c.name,
    quantity: 1,
    spaces: c.spaces ?? 0,
    equipped: false,
    equipmentType,
    attack,
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

function summarizeItem(item: InventoryItem): string {
  const mods = describeModifiers(item.modifiers)
  const parts = [
    `${item.spaces} esp.`,
    item.equipped && 'Equipado',
    mods !== 'sem modificadores' && mods,
  ].filter(Boolean)
  return parts.join(' · ')
}

function num(v: number | string): number {
  return typeof v === 'number' ? v : Number(v) || 0
}

function summarizeDefense(item: InventoryItem): string {
  const parts = [
    `Def ${num(item.modifiers.defense) >= 0 ? '+' : ''}${num(item.modifiers.defense)}`,
    num(item.modifiers.penalty) !== 0 && `Penal. ${num(item.modifiers.penalty)}`,
    num(item.modifiers.movement) !== 0 && `Desloc. ${num(item.modifiers.movement)}m`,
    item.proficiency || null,
    item.equipped && 'Equipado',
  ].filter(Boolean)
  return parts.join(' · ')
}

/** Resumo curto dos atributos de um item do catálogo (mostrado ao lado do nome). */
function catalogStats(item: CatalogItem): string {
  if (item.attack) {
    const a = item.attack
    return [a.damage, a.critical, a.damageType, a.range, item.proficiency].filter(Boolean).join(' · ')
  }
  if (item.modifiers?.defense) return `Defesa +${item.modifiers.defense}`
  return ''
}

function summarizeWeapon(item: InventoryItem): string {
  const a = item.attack
  const parts = [
    a?.damage || null,
    a?.damageType || null,
    a?.range || null,
    item.proficiency || null,
    item.equipped && 'Equipada',
  ].filter(Boolean)
  return parts.join(' · ') || 'Arma'
}

export function InventoryPanel({ character, update }: Props) {
  const [lastAddedId, setLastAddedId] = useState<string | null>(null)
  const setItem = (id: string, patch: Partial<InventoryItem>) =>
    update((c) => ({
      ...c,
      inventory: c.inventory.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }))

  const setModifiers = (id: string, modifiers: ItemModifiers) => setItem(id, { modifiers })
  const setModField = (item: InventoryItem, key: keyof ItemModifiers, value: number) =>
    setItem(item.id, { modifiers: { ...item.modifiers, [key]: value } })
  const setAttackField = (item: InventoryItem, key: keyof Attack, value: string) =>
    setItem(item.id, { attack: { ...(item.attack ?? blankAttack()), [key]: value } })

  // Equipar respeita o limite de 1 armadura + 1 escudo: ao equipar uma peça de
  // defesa, as outras do mesmo slot são desequipadas.
  const setEquipped = (item: InventoryItem, value: boolean) =>
    update((c) => ({
      ...c,
      inventory: c.inventory.map((it) => {
        if (it.id === item.id) return { ...it, equipped: value }
        if (value && item.equipmentType && it.equipmentType === item.equipmentType) {
          return { ...it, equipped: false }
        }
        return it
      }),
    }))

  // Proficiência de um item de defesa também redefine o slot (escudo/armadura).
  const setDefenseProficiency = (item: InventoryItem, proficiency: string) =>
    setItem(item.id, { proficiency, equipmentType: slotForProficiency(proficiency) })

  const addItem = (kind: 'item' | 'defesa' | 'arma') => {
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
          equipmentType: kind === 'defesa' ? 'armadura' : '',
          attack: kind === 'arma' ? blankAttack() : null,
          proficiency: kind === 'defesa' ? 'Leves' : '',
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

  // Reordenação por arrastar (dentro de cada subgrupo; o filtro é estável).
  const draggingId = useRef<string | null>(null)
  const reorder = (overId: string) => {
    const activeId = draggingId.current
    if (activeId) update((c) => ({ ...c, inventory: arrayMove(c.inventory, activeId, overId) }))
  }
  const dragProps = (id: string) => ({
    reorderable: true,
    onReorderStart: () => (draggingId.current = id),
    onReorderDrop: () => reorder(id),
  })

  const defenseItems = character.inventory.filter((it) => it.equipmentType !== '')
  const weaponItems = character.inventory.filter((it) => it.equipmentType === '' && it.attack)
  const otherItems = character.inventory.filter((it) => it.equipmentType === '' && !it.attack)
  const totalSpaces = character.inventory.reduce((s, it) => s + it.spaces * it.quantity, 0)

  const renderDefenseCard = (item: InventoryItem) => (
    <EditableCard
      key={item.id}
      {...dragProps(item.id)}
      headerExtra={<EquippedToggle item={item} onChange={setEquipped} />}
      title={`${item.quantity}× ${item.name || 'Item sem nome'}`}
      summary={summarizeDefense(item)}
      details={item.notes || 'Sem descrição.'}
      onDelete={() => remove(item.id)}
      deleteName={item.name}
      startEditing={item.id === lastAddedId}
    >
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <QtyField item={item} setItem={setItem} />
          <input
            type="text"
            value={item.name}
            placeholder="Nome do item de defesa"
            onChange={(e) => setItem(item.id, { name: e.target.value })}
            className={inputClass + ' min-w-40 flex-1 font-medium'}
            aria-label="Nome do item"
          />
          <SpacesField item={item} setItem={setItem} />
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-md border border-stone-800 p-2">
          <label className="flex items-center gap-1 text-xs text-stone-400">
            Defesa
            <input
              type="number"
              value={num(item.modifiers.defense)}
              onChange={(e) => setModField(item, 'defense', Number(e.target.value) || 0)}
              className={numClass}
              aria-label="Defesa"
            />
          </label>
          <label className="flex items-center gap-1 text-xs text-stone-400">
            Penalidade
            <input
              type="number"
              value={num(item.modifiers.penalty)}
              onChange={(e) => setModField(item, 'penalty', Number(e.target.value) || 0)}
              className={numClass}
              aria-label="Penalidade"
            />
          </label>
          <label className="flex items-center gap-1 text-xs text-stone-400">
            Desloc.
            <input
              type="number"
              value={num(item.modifiers.movement)}
              onChange={(e) => setModField(item, 'movement', Number(e.target.value) || 0)}
              className={numClass}
              aria-label="Deslocamento"
            />
          </label>
          <label className="flex items-center gap-1 text-xs text-stone-400">
            Proficiência
            <select
              value={item.proficiency}
              onChange={(e) => setDefenseProficiency(item, e.target.value)}
              className={inputClass + ' w-28'}
              aria-label="Proficiência"
            >
              {!DEFENSE_PROFICIENCIES.includes(item.proficiency as never) && (
                <option value={item.proficiency}>{item.proficiency || '—'}</option>
              )}
              {DEFENSE_PROFICIENCIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
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
          <p className="mb-2 text-[11px] text-stone-500">
            Efeitos adicionais (aplicados enquanto equipado):
          </p>
          <ModifiersEditor
            modifiers={item.modifiers}
            onChange={(m) => setModifiers(item.id, m)}
            hideDefenseStats
          />
        </div>
      </div>
    </EditableCard>
  )

  const renderItemCard = (item: InventoryItem) => (
    <EditableCard
      key={item.id}
      {...dragProps(item.id)}
      active={item.activeEffect}
      onActiveChange={(v) => setItem(item.id, { activeEffect: v })}
      activeLabel="Efeito ativo"
      headerExtra={<EquippedToggle item={item} onChange={setEquipped} />}
      title={`${item.quantity}× ${item.name || 'Item sem nome'}`}
      summary={summarizeItem(item)}
      details={item.notes || 'Sem descrição.'}
      onDelete={() => remove(item.id)}
      deleteName={item.name}
      startEditing={item.id === lastAddedId}
    >
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <QtyField item={item} setItem={setItem} />
          <input
            type="text"
            value={item.name}
            placeholder="Nome do item"
            onChange={(e) => setItem(item.id, { name: e.target.value })}
            className={inputClass + ' min-w-40 flex-1 font-medium'}
            aria-label="Nome do item"
          />
          <SpacesField item={item} setItem={setItem} />
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
          <ModifiersEditor modifiers={item.modifiers} onChange={(m) => setModifiers(item.id, m)} />
        </div>
      </div>
    </EditableCard>
  )

  const renderWeaponCard = (item: InventoryItem) => {
    const attack = item.attack ?? blankAttack()
    return (
      <EditableCard
        key={item.id}
        {...dragProps(item.id)}
        headerExtra={<EquippedToggle item={item} onChange={setEquipped} />}
        title={`${item.quantity}× ${item.name || 'Arma sem nome'}`}
        summary={summarizeWeapon(item)}
        details={item.notes || 'Sem descrição.'}
        onDelete={() => remove(item.id)}
        deleteName={item.name}
        startEditing={item.id === lastAddedId}
      >
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <QtyField item={item} setItem={setItem} />
            <input
              type="text"
              value={item.name}
              placeholder="Nome da arma"
              onChange={(e) => setItem(item.id, { name: e.target.value })}
              className={inputClass + ' min-w-40 flex-1 font-medium'}
              aria-label="Nome da arma"
            />
            <SpacesField item={item} setItem={setItem} />
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

          <div className="rounded-md border border-stone-800 p-2">
            <p className="mb-2 text-[11px] text-stone-500">Ataque (aparece nos Ataques quando equipada):</p>
            <AttackFields attack={attack} onChange={(key, value) => setAttackField(item, key, value)} />
          </div>

          <textarea
            value={item.notes}
            placeholder="Descrição"
            onChange={(e) => setItem(item.id, { notes: e.target.value })}
            className={inputClass + ' w-full resize-y text-sm'}
            rows={3}
            aria-label="Descrição da arma"
          />
          <div className="border-t border-stone-800 pt-2">
            <p className="mb-2 text-[11px] text-stone-500">
              Efeitos adicionais (aplicados enquanto equipada):
            </p>
            <ModifiersEditor modifiers={item.modifiers} onChange={(m) => setModifiers(item.id, m)} />
          </div>
        </div>
      </EditableCard>
    )
  }

  return (
    <Panel title="Inventário">
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

      <ItemGroup
        title="Armas"
        addLabel="+ arma"
        onAdd={() => addItem('arma')}
        catalogCategories={WEAPON_CATEGORIES}
        onAddFromCatalog={addFromCatalog}
        items={weaponItems}
        renderCard={renderWeaponCard}
        emptyText='Nenhuma arma. Use "+ arma".'
        className="mb-4"
      />

      <ItemGroup
        title="Itens de Defesa"
        addLabel="+ defesa"
        onAdd={() => addItem('defesa')}
        catalogCategories={DEFENSE_CATEGORIES}
        onAddFromCatalog={addFromCatalog}
        items={defenseItems}
        renderCard={renderDefenseCard}
        emptyText='Nenhuma armadura ou escudo. Use "+ defesa".'
        className="mb-4"
      />

      <ItemGroup
        title="Itens"
        addLabel="+ item"
        onAdd={() => addItem('item')}
        catalogCategories={OTHER_CATEGORIES}
        onAddFromCatalog={addFromCatalog}
        items={otherItems}
        renderCard={renderItemCard}
        emptyText="Inventário vazio."
      />
    </Panel>
  )
}

/** Grupo de itens com cabeçalho (título + Catálogo + adicionar) e lista de cards. */
function ItemGroup({
  title,
  addLabel,
  onAdd,
  catalogCategories,
  onAddFromCatalog,
  items,
  renderCard,
  emptyText,
  className = '',
}: {
  title: string
  addLabel: string
  onAdd: () => void
  catalogCategories: string[]
  onAddFromCatalog: (c: CatalogItem) => void
  items: InventoryItem[]
  renderCard: (item: InventoryItem) => ReactNode
  emptyText: string
  className?: string
}) {
  const [catalogOpen, setCatalogOpen] = useState(false)
  // Adiciona a cópia ao inventário e fecha o modal do catálogo.
  const pickFromCatalog = (item: CatalogItem) => {
    onAddFromCatalog(item)
    setCatalogOpen(false)
  }
  return (
    <div className={className}>
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase text-tormenta-300">{title}</h3>
        <div className="flex gap-1">
          <Button variant="ghost" className="text-xs" onClick={() => setCatalogOpen(true)}>
            Catálogo
          </Button>
          <Button variant="ghost" className="text-xs" onClick={onAdd}>{addLabel}</Button>
        </div>
      </div>

      {catalogOpen && (
        <Modal title={`Catálogo — ${title}`} onClose={() => setCatalogOpen(false)}>
          <p className="mb-2 text-xs text-stone-400">
            Itens prontos — clique para adicionar uma cópia ao inventário.
          </p>
          {catalogCategories.map((cat) => (
            <div key={cat} className="mb-2">
              <h4 className="mb-1 text-xs font-semibold uppercase text-tormenta-300">{cat}</h4>
              <ul className="flex flex-col gap-1">
                {ITEM_CATALOG.filter((i) => i.category === cat).map((item) => {
                  const stats = catalogStats(item)
                  return (
                    <li key={item.id} className="flex flex-wrap items-center gap-2">
                      <Button variant="secondary" className="text-xs" onClick={() => pickFromCatalog(item)}>
                        + Adicionar
                      </Button>
                      <span className="text-sm text-[var(--text)]">{item.name}</span>
                      {stats && <span className="text-xs text-stone-500">{stats}</span>}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </Modal>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-stone-500">{emptyText}</p>
      ) : (
        <ul className="space-y-2">{items.map(renderCard)}</ul>
      )}
    </div>
  )
}

function EquippedToggle({
  item,
  onChange,
}: {
  item: InventoryItem
  onChange: (item: InventoryItem, value: boolean) => void
}) {
  return (
    <label className="flex items-center gap-1 text-xs text-stone-400">
      <input
        type="checkbox"
        checked={item.equipped}
        onChange={(e) => onChange(item, e.target.checked)}
        className="h-4 w-4 accent-tormenta-500"
      />
      Equipado
    </label>
  )
}

function QtyField({
  item,
  setItem,
}: {
  item: InventoryItem
  setItem: (id: string, patch: Partial<InventoryItem>) => void
}) {
  return (
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
  )
}

function SpacesField({
  item,
  setItem,
}: {
  item: InventoryItem
  setItem: (id: string, patch: Partial<InventoryItem>) => void
}) {
  return (
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
  )
}
