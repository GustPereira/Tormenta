import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { MainSheet } from '../features/MainSheet'
import { saveCharacter } from '../db'
import { buildThemeStyle } from '../lib/theme'
import { getSharedCharacter } from '../share'
import type { Character } from '../schema'

/** Intervalo de atualização ("link vivo" via polling). */
const POLL_MS = 20000
const noop = () => {}

export function SharedSheet() {
  const { shareId } = useParams<{ shareId: string }>()
  const navigate = useNavigate()
  const [character, setCharacter] = useState<Character | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const loaded = useRef(false)

  const fetchOnce = useCallback(async () => {
    if (!shareId) return
    try {
      const c = await getSharedCharacter(shareId)
      setCharacter(c)
      setStatus('ready')
      loaded.current = true
    } catch (e) {
      // Erros depois de já ter carregado (poll) são ignorados — mantém o último estado bom.
      if (!loaded.current) {
        setErrorMsg(e instanceof Error ? e.message : 'Falha ao carregar a ficha compartilhada.')
        setStatus('error')
      }
    }
  }, [shareId])

  useEffect(() => {
    void fetchOnce()
    const timer = setInterval(() => void fetchOnce(), POLL_MS)
    return () => clearInterval(timer)
  }, [fetchOnce])

  async function importCopy() {
    if (!character) return
    const now = new Date().toISOString()
    const copy: Character = {
      ...character,
      id: crypto.randomUUID(),
      shareId: null,
      meta: { createdAt: now, updatedAt: now },
    }
    await saveCharacter(copy)
    navigate(`/ficha/${copy.id}`)
  }

  if (status === 'loading') {
    return <p className="px-4 py-8 text-stone-400">Carregando ficha compartilhada…</p>
  }

  if (status === 'error' || !character) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 text-center">
        <p className="mb-2 text-stone-300">{errorMsg || 'Ficha compartilhada não encontrada.'}</p>
        <Link to="/" className="text-tormenta-400 hover:underline">
          ← Voltar para a lista
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={buildThemeStyle(character.theme)}>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="text-sm text-tormenta-400 hover:underline">
            ← Minhas Fichas
          </Link>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-stone-800 px-2 py-0.5 text-xs uppercase text-stone-300">
              Somente leitura
            </span>
            <Button variant="secondary" className="text-xs" onClick={importCopy}>
              Importar uma cópia
            </Button>
          </div>
        </header>

        {/* fieldset disabled desabilita nativamente todos os campos/botões internos. */}
        <fieldset disabled className="m-0 min-w-0 border-0 p-0">
          <MainSheet character={character} update={noop} />
        </fieldset>
      </div>
    </div>
  )
}
