import { useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../../components/Button'
import { EditableCard } from '../../components/EditableCard'
import { Modal } from '../../components/Modal'
import { Panel } from '../../components/Panel'
import { inputClass } from '../../components/ui'
import { SPELL_CATALOG, SPELL_SCHOOLS, type CatalogSpell } from '../../data'
import { arrayMove } from '../../lib/reorder'
import {
  DURATION_KEYS,
  EMPTY_ITEM_MODIFIERS,
  SPELL_TYPES,
  type Character,
  type DurationKey,
  type ItemModifiers,
  type Spell,
  type SpellType,
} from '../../schema'
import { ModifiersEditor } from './ModifiersEditor'

interface Props {
  character: Character
  update: (updater: (c: Character) => Character) => void
}

/** Custo de PM por círculo (planilha de referência). */
const PM_BY_CIRCLE: Record<number, number> = { 1: 1, 2: 3, 3: 6, 4: 10, 5: 15 }
const CIRCLES = [1, 2, 3, 4, 5]
/** Ações de execução padrão do T20. */
const SPELL_ACTIONS = ['Padrão', 'Movimento', 'Completa', 'Reação', 'Livre']
/** Alcances comuns do T20. */
const SPELL_RANGES = ['Pessoal', 'Toque', 'Curto', 'Médio', 'Longo', 'Ilimitado']

/** Normaliza texto para busca: minúsculas e sem acentos. */
const normalize = (s: string) =>
  s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

/** Cria uma magia nova a partir de uma entrada do catálogo (cópia). */
function fromCatalog(s: CatalogSpell): Spell {
  return {
    id: crypto.randomUUID(),
    name: s.name,
    circle: s.circle,
    type: s.type,
    school: s.school,
    pm: PM_BY_CIRCLE[s.circle] ?? 1,
    action: s.action,
    range: s.range,
    target: s.target,
    duration: s.duration,
    resistance: s.resistance,
    effect: s.description,
    prepared: false,
    hasEffect: false,
    effectActive: false,
    modifiers: { ...EMPTY_ITEM_MODIFIERS, attributes: {}, skills: {} },
    notes: '',
  }
}

export function SpellsPanel({ character, update }: Props) {
  const [lastAddedId, setLastAddedId] = useState<string | null>(null)
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [catalogCircle, setCatalogCircle] = useState(1)
  const [query, setQuery] = useState('')
  const [schoolFilter, setSchoolFilter] = useState('')
  const [openCatalogId, setOpenCatalogId] = useState<string | null>(null)
  const add = (circle: number) => {
    const id = crypto.randomUUID()
    setLastAddedId(id)
    update((c) => ({
      ...c,
      spells: [
        ...c.spells,
        {
          id,
          name: '',
          circle,
          type: '',
          school: '',
          pm: PM_BY_CIRCLE[circle] ?? 1,
          action: 'Padrão',
          range: '',
          target: '',
          duration: 'Instantânea',
          resistance: '',
          effect: '',
          prepared: false,
          hasEffect: false,
          effectActive: false,
          modifiers: { ...EMPTY_ITEM_MODIFIERS, attributes: {}, skills: {} },
          notes: '',
        },
      ],
    }))
  }

  // Abre o catálogo já filtrado por um círculo.
  const openCatalog = (circle: number) => {
    setCatalogCircle(circle)
    setQuery('')
    setSchoolFilter('')
    setOpenCatalogId(null)
    setCatalogOpen(true)
  }
  const closeCatalog = () => {
    setCatalogOpen(false)
    setQuery('')
    setSchoolFilter('')
    setOpenCatalogId(null)
  }
  // Adiciona a cópia da magia no seu círculo e fecha o catálogo. Não entra em
  // modo de edição (diferente do "+ magia").
  const pickFromCatalog = (s: CatalogSpell) => {
    update((c) => ({ ...c, spells: [...c.spells, fromCatalog(s)] }))
    closeCatalog()
  }
  const q = normalize(query.trim())
  const catalogResults = SPELL_CATALOG.filter(
    (s) =>
      s.circle === catalogCircle &&
      (!q || normalize(s.name).includes(q)) &&
      (!schoolFilter || s.school === schoolFilter),
  )
  const setField = (id: string, patch: Partial<Spell>) =>
    update((c) => ({
      ...c,
      spells: c.spells.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }))
  const remove = (id: string) =>
    update((c) => ({ ...c, spells: c.spells.filter((s) => s.id !== id) }))

  // Reordenação por arrastar (dentro do círculo; o filtro por círculo é estável).
  const draggingId = useRef<string | null>(null)
  const reorder = (overId: string) => {
    const activeId = draggingId.current
    if (activeId) update((c) => ({ ...c, spells: arrayMove(c.spells, activeId, overId) }))
  }

  return (
    <Panel title="Magias" collapsible>
      {catalogOpen && (
        <Modal title={`Catálogo de Magias — ${catalogCircle}º Círculo`} onClose={closeCatalog}>
          <div className=''>
            <p className="mb-2 text-xs text-stone-400">
              {catalogResults.length} {catalogResults.length === 1 ? 'magia' : 'magias'} — clique para adicionar uma cópia.
            </p>
            <div className="mb-3 flex flex-wrap gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar pelo nome…"
                className={inputClass + ' min-w-40 flex-1'}
                aria-label="Buscar magia"
                autoFocus
              />
              <select
                value={schoolFilter}
                onChange={(e) => setSchoolFilter(e.target.value)}
                className={inputClass + ' text-sm'}
                aria-label="Filtrar por escola"
              >
                <option value="">Todas as escolas</option>
                {SPELL_SCHOOLS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          {catalogResults.length === 0 ? (
            <p className="text-sm text-stone-500">Nenhuma magia encontrada.</p>
          ) : (
            <ul className="flex flex-col gap-1 overflow-y-auto max-h-130">
              {catalogResults.map((s) => (
                <li key={s.id} className="rounded border border-stone-800/60">
                  <div className="flex items-center justify-between gap-2 px-2 py-1">
                    <button
                      type="button"
                      onClick={() => setOpenCatalogId((id) => (id === s.id ? null : s.id))}
                      className="min-w-0 flex-1 text-left"
                      title="Ver descrição"
                    >
                      <span className="text-sm text-[var(--text)]">{s.name}</span>
                      <span className="ml-2 text-xs text-stone-500">
                        {s.type} · {s.school} · {s.range}
                      </span>
                    </button>
                    <Button
                      variant="secondary"
                      className="shrink-0 text-xs"
                      onClick={() => pickFromCatalog(s)}
                      aria-label={`Adicionar ${s.name}`}
                      title="Adicionar"
                    >
                      <Plus size={14} />
                    </Button>
                  </div>
                  {openCatalogId === s.id && (
                    <p className="px-2 pb-2 text-xs text-stone-400">{s.description}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Modal>
      )}

      <div className="space-y-3">
        {CIRCLES.map((circle) => {
          const spells = character.spells.filter((s) => s.circle === circle)
          return (
            <div key={circle}>
              <div className="mb-1 flex items-center justify-between border-b border-stone-800 pb-0.5">
                <h3 className="text-xs font-semibold uppercase text-tormenta-300">
                  {circle}º Círculo <span className="text-stone-500">({PM_BY_CIRCLE[circle]} PM)</span>
                </h3>
                <div className="flex gap-1">
                  <Button variant="ghost" className="text-xs" onClick={() => openCatalog(circle)}>
                    Catálogo
                  </Button>
                  <Button variant="ghost" className="text-xs" onClick={() => add(circle)}>+ magia</Button>
                </div>
              </div>
              {spells.length === 0 ? (
                <p className="text-xs text-stone-600">—</p>
              ) : (
                <ul className="space-y-2">
                  {spells.map((s) => (
                    <EditableCard
                      key={s.id}
                      reorderable
                      onReorderStart={() => (draggingId.current = s.id)}
                      onReorderDrop={() => reorder(s.id)}
                      active={s.prepared}
                      onActiveChange={(v) => setField(s.id, { prepared: v })}
                      activeLabel="Preparada"
                      headerExtra={
                        s.hasEffect ? (
                          <label className="flex items-center gap-1 text-xs text-stone-400">
                            <input
                              type="checkbox"
                              checked={s.effectActive}
                              onChange={(e) => setField(s.id, { effectActive: e.target.checked })}
                              className="h-4 w-4 accent-tormenta-500"
                              aria-label="Ativar efeito"
                            />
                            Efeito
                          </label>
                        ) : undefined
                      }
                      title={s.name || 'Magia sem nome'}
                      summary={[
                        [s.type, s.school].filter(Boolean).join(' '),
                        `${s.pm} PM`,
                        s.action,
                        s.range,
                        s.duration,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                      details={
                        <div className="space-y-1">
                          {(s.type || s.school) && (
                            <div>
                              <span className="text-stone-500">Tipo:</span>{' '}
                              {[s.type, s.school].filter(Boolean).join(' · ') || '—'}
                            </div>
                          )}
                          <div>
                            <span className="text-stone-500">Custo:</span> {s.pm} PM
                            <span className="mx-1 text-stone-600">·</span>
                            <span className="text-stone-500">Ação:</span> {s.action}
                            <span className="mx-1 text-stone-600">·</span>
                            <span className="text-stone-500">Duração:</span> {s.duration}
                          </div>
                          {(s.range || s.target) && (
                            <div>
                              {s.range && (
                                <>
                                  <span className="text-stone-500">Alcance:</span> {s.range}
                                </>
                              )}
                              {s.range && s.target && <span className="mx-1 text-stone-600">·</span>}
                              {s.target && (
                                <>
                                  <span className="text-stone-500">Alvo/Área:</span> {s.target}
                                </>
                              )}
                            </div>
                          )}
                          {s.resistance && (
                            <div>
                              <span className="text-stone-500">Resistência:</span> {s.resistance}
                            </div>
                          )}
                          {s.effect && (
                            <div>
                              <span className="text-stone-500">Efeito:</span> {s.effect}
                            </div>
                          )}
                          {s.notes && (
                            <div>
                              <span className="text-stone-500">Anotações:</span> {s.notes}
                            </div>
                          )}
                        </div>
                      }
                      onDelete={() => remove(s.id)}
                      deleteName={s.name}
                      startEditing={s.id === lastAddedId}
                    >
                      <input
                        type="text"
                        value={s.name}
                        placeholder="Nome da magia"
                        onChange={(e) => setField(s.id, { name: e.target.value })}
                        className={inputClass + ' mb-2 w-full font-medium'}
                        aria-label="Nome da magia"
                      />
                      <div className="mb-2 flex flex-wrap gap-3">
                        <label className="flex items-center gap-1 text-xs text-stone-400">
                          Tipo
                          <select
                            value={s.type}
                            onChange={(e) => setField(s.id, { type: e.target.value as SpellType })}
                            className={inputClass + ' text-sm'}
                            aria-label="Tipo de magia"
                          >
                            {SPELL_TYPES.map((t) => (
                              <option key={t} value={t}>{t || '—'}</option>
                            ))}
                          </select>
                        </label>
                        <label className="flex items-center gap-1 text-xs text-stone-400">
                          Escola
                          <select
                            value={s.school}
                            onChange={(e) => setField(s.id, { school: e.target.value })}
                            className={inputClass + ' text-sm'}
                            aria-label="Escola de magia"
                          >
                            <option value="">—</option>
                            {SPELL_SCHOOLS.map((sc) => (
                              <option key={sc} value={sc}>{sc}</option>
                            ))}
                            {s.school && !SPELL_SCHOOLS.includes(s.school as never) && (
                              <option value={s.school}>{s.school}</option>
                            )}
                          </select>
                        </label>
                      </div>
                      <div className="mb-2 flex flex-wrap gap-3">
                        <label className="flex items-center gap-1 text-xs text-stone-400">
                          PM
                          <input
                            type="number"
                            min={0}
                            value={s.pm}
                            onChange={(e) => setField(s.id, { pm: Number(e.target.value) || 0 })}
                            className={inputClass + ' w-16 text-center'}
                            aria-label="Custo de PM"
                          />
                        </label>
                        <label className="flex items-center gap-1 text-xs text-stone-400">
                          Ação
                          <select
                            value={s.action}
                            onChange={(e) => setField(s.id, { action: e.target.value })}
                            className={inputClass + ' text-sm'}
                            aria-label="Ação de execução"
                          >
                            {SPELL_ACTIONS.map((a) => (
                              <option key={a} value={a}>{a}</option>
                            ))}
                            {!SPELL_ACTIONS.includes(s.action) && <option value={s.action}>{s.action}</option>}
                          </select>
                        </label>
                        <label className="flex items-center gap-1 text-xs text-stone-400">
                          Duração
                          <select
                            value={s.duration}
                            onChange={(e) => setField(s.id, { duration: e.target.value as DurationKey })}
                            className={inputClass + ' text-sm'}
                            aria-label="Duração"
                          >
                            {DURATION_KEYS.map((d) => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <div className="mb-2 flex flex-wrap gap-3">
                        <label className="flex items-center gap-1 text-xs text-stone-400">
                          Alcance
                          <input
                            type="text"
                            list="spell-ranges"
                            value={s.range}
                            onChange={(e) => setField(s.id, { range: e.target.value })}
                            className={inputClass + ' w-28 text-sm'}
                            aria-label="Alcance"
                          />
                        </label>
                        <label className="flex flex-1 items-center gap-1 text-xs text-stone-400">
                          Alvo/Área
                          <input
                            type="text"
                            value={s.target}
                            onChange={(e) => setField(s.id, { target: e.target.value })}
                            className={inputClass + ' min-w-32 flex-1 text-sm'}
                            aria-label="Alvo, área ou efeito"
                          />
                        </label>
                        <label className="flex items-center gap-1 text-xs text-stone-400">
                          Resistência
                          <input
                            type="text"
                            value={s.resistance}
                            onChange={(e) => setField(s.id, { resistance: e.target.value })}
                            className={inputClass + ' w-40 text-sm'}
                            aria-label="Resistência"
                          />
                        </label>
                      </div>
                      <datalist id="spell-ranges">
                        {SPELL_RANGES.map((r) => (
                          <option key={r} value={r} />
                        ))}
                      </datalist>
                      <textarea
                        value={s.effect}
                        placeholder="Efeito da magia"
                        onChange={(e) => setField(s.id, { effect: e.target.value })}
                        className={inputClass + ' mb-2 w-full resize-y text-sm'}
                        rows={3}
                        aria-label="Efeito da magia"
                      />
                      <textarea
                        value={s.notes}
                        placeholder="Anotações"
                        onChange={(e) => setField(s.id, { notes: e.target.value })}
                        className={inputClass + ' mb-2 w-full resize-y text-sm'}
                        rows={2}
                        aria-label="Anotações da magia"
                      />
                      <label className="flex items-center gap-2 text-xs text-stone-400">
                        <input
                          type="checkbox"
                          checked={s.hasEffect}
                          onChange={(e) => setField(s.id, { hasEffect: e.target.checked })}
                          className="h-4 w-4 accent-tormenta-500"
                        />
                        Tem efeito (aparece na aba Efeitos)
                      </label>
                      {s.hasEffect && (
                        <div className="mt-2 border-t border-stone-800 pt-2">
                          <ModifiersEditor
                            modifiers={s.modifiers}
                            onChange={(m: ItemModifiers) => setField(s.id, { modifiers: m })}
                          />
                        </div>
                      )}
                    </EditableCard>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </Panel>
  )
}
