import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import {
  createCharacter,
  deleteCharacter,
  duplicateCharacter,
  getCharacter,
  listCharacters,
  saveCharacter,
  type CharacterSummary,
} from '../db'
import { downloadCharacter, importCharacterFromFile } from '../io'
import { CharacterParseError } from '../schema'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export function SheetList() {
  const navigate = useNavigate()
  const [sheets, setSheets] = useState<CharacterSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const refresh = useCallback(async () => {
    setSheets(await listCharacters())
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  async function handleCreate() {
    const created = await createCharacter()
    navigate(`/ficha/${created.id}`)
  }

  async function handleExport(id: string) {
    const character = await getCharacter(id)
    if (character) downloadCharacter(character)
  }

  async function handleDuplicate(id: string) {
    await duplicateCharacter(id)
    await refresh()
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Excluir a ficha "${name}"? Esta ação não pode ser desfeita.`)) {
      return
    }
    await deleteCharacter(id)
    await refresh()
  }

  async function handleImportFile(file: File) {
    setError(null)
    try {
      const character = await importCharacterFromFile(file)
      await saveCharacter(character)
      await refresh()
    } catch (err) {
      setError(
        err instanceof CharacterParseError
          ? `Falha ao importar: ${err.message}`
          : 'Falha ao importar o arquivo.',
      )
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-tormenta-400">
            Minhas Fichas
          </h1>
          <p className="text-sm text-stone-400">Tormenta T20</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
            Importar JSON
          </Button>
          <Button variant="primary" onClick={handleCreate}>
            + Nova ficha
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleImportFile(file)
              e.target.value = ''
            }}
          />
        </div>
      </header>

      {error && (
        <div className="mb-4 rounded-md border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-stone-400">Carregando…</p>
      ) : sheets.length === 0 ? (
        <div className="rounded-lg border border-dashed border-stone-700 px-6 py-12 text-center text-stone-400">
          Nenhuma ficha ainda. Crie uma nova ou importe um JSON.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {sheets.map((sheet) => (
            <li
              key={sheet.id}
              className="flex flex-col gap-3 rounded-lg border border-stone-700 bg-stone-900/60 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <button
                className="text-left"
                onClick={() => navigate(`/ficha/${sheet.id}`)}
              >
                <span className="block font-medium text-stone-100 hover:text-tormenta-400">
                  {sheet.name}
                </span>
                <span className="block text-xs text-stone-500">
                  Atualizada em {formatDate(sheet.updatedAt)}
                </span>
              </button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => navigate(`/ficha/${sheet.id}`)}>
                  Abrir
                </Button>
                <Button variant="ghost" onClick={() => handleExport(sheet.id)}>
                  Exportar
                </Button>
                <Button variant="ghost" onClick={() => handleDuplicate(sheet.id)}>
                  Duplicar
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(sheet.id, sheet.name)}
                >
                  Excluir
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
