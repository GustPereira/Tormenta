import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { Tabs } from '../components/Tabs'
import { MainSheet } from '../features/MainSheet'
import { SettingsPanel } from '../features/sections/SettingsPanel'
import { deleteCharacter } from '../db'
import { downloadCharacter } from '../io'
import { buildThemeStyle } from '../lib/theme'
import { useSheetStore } from '../store/sheetStore'

const TABS = [
  { id: 'principal', label: 'Principal' },
  { id: 'config', label: 'Configurações' },
]

const STATUS_LABEL: Record<string, string> = {
  saving: 'Salvando…',
  saved: 'Salvo ✓',
}

export function SheetEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { character, status, load, update, reset } = useSheetStore()
  const [tab, setTab] = useState('principal')

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

  async function handleDelete() {
    if (!character) return
    if (
      !window.confirm(
        `Excluir a ficha "${character.name}"? Esta ação não pode ser desfeita.`,
      )
    ) {
      return
    }
    await deleteCharacter(character.id)
    navigate('/')
  }

  return (
    <div className="min-h-screen" style={buildThemeStyle(character.theme)}>
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

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      <div className="py-6">
        {tab === 'principal' && <MainSheet character={character} update={update} />}
        {tab === 'config' && (
          <SettingsPanel character={character} update={update} onDelete={handleDelete} />
        )}
      </div>
      </div>
    </div>
  )
}
