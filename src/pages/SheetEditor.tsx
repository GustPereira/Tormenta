import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { AbilitiesPanel } from '../features/sections/AbilitiesPanel'
import { AttacksPanel } from '../features/sections/AttacksPanel'
import { AttributesPanel } from '../features/sections/AttributesPanel'
import { IdentityHeader } from '../features/sections/IdentityHeader'
import { InventoryPanel } from '../features/sections/InventoryPanel'
import { NotesPanel } from '../features/sections/NotesPanel'
import { SkillsPanel } from '../features/sections/SkillsPanel'
import { SpellsPanel } from '../features/sections/SpellsPanel'
import { VitalsPanel } from '../features/sections/VitalsPanel'
import { downloadCharacter } from '../io'
import { useSheetStore } from '../store/sheetStore'

const STATUS_LABEL: Record<string, string> = {
  saving: 'Salvando…',
  saved: 'Salvo ✓',
}

export function SheetEditor() {
  const { id } = useParams<{ id: string }>()
  const { character, status, load, update, reset } = useSheetStore()

  useEffect(() => {
    if (id) void load(id)
    return () => reset()
  }, [id, load, reset])

  if (status === 'notfound') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 text-center">
        <p className="mb-2 text-stone-300">Ficha não encontrada.</p>
        <Link to="/" className="text-tormenta-400 hover:underline">
          ← Voltar para a lista
        </Link>
      </div>
    )
  }

  if (!character) {
    return <p className="px-4 py-8 text-stone-400">Carregando…</p>
  }

  const props = { character, update }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link to="/" className="text-sm text-tormenta-400 hover:underline">
          ← Minhas Fichas
        </Link>
        <div className="flex items-center gap-3">
          <span className="w-20 text-right text-xs text-stone-500">
            {STATUS_LABEL[status] ?? ''}
          </span>
          <Button variant="secondary" onClick={() => downloadCharacter(character)}>
            Exportar JSON
          </Button>
        </div>
      </header>

      <div className="space-y-4">
        <IdentityHeader {...props} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <AttributesPanel {...props} />
            <VitalsPanel {...props} />
            <AttacksPanel {...props} />
          </div>
          <SkillsPanel {...props} />
        </div>

        <AbilitiesPanel {...props} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SpellsPanel {...props} />
          <InventoryPanel {...props} />
        </div>

        <NotesPanel {...props} />
      </div>
    </div>
  )
}
