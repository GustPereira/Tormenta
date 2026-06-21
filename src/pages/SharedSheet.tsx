import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { Tabs } from '../components/Tabs'
import { MainSheet } from '../features/MainSheet'
import { EffectsPanel } from '../features/sections/EffectsPanel'
import { InventoryPanel } from '../features/sections/InventoryPanel'
import { saveCharacter } from '../db'
import { buildThemeStyle } from '../lib/theme'
import { getSharedCharacter, subscribeSharedCharacter } from '../share'
import type { Character } from '../schema'

const noop = () => {}

const TABS = [
  { id: 'principal', label: 'Principal' },
  { id: 'inventario', label: 'Inventário' },
  { id: 'efeitos', label: 'Efeitos' },
]

export function SharedSheet() {
  const { shareId } = useParams<{ shareId: string }>()
  const navigate = useNavigate()
  const [character, setCharacter] = useState<Character | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [tab, setTab] = useState('principal')

  useEffect(() => {
    if (!shareId) return
    let active = true
    // Carga inicial.
    getSharedCharacter(shareId)
      .then((c) => {
        if (!active) return
        setCharacter(c)
        setStatus('ready')
      })
      .catch((e: unknown) => {
        if (!active) return
        setErrorMsg(e instanceof Error ? e.message : 'Falha ao carregar a ficha compartilhada.')
        setStatus('error')
      })
    // Atualizações em tempo real (link vivo).
    const unsubscribe = subscribeSharedCharacter(shareId, (c) => {
      if (active) setCharacter(c)
    })
    return () => {
      active = false
      unsubscribe()
    }
  }, [shareId])

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

        <Tabs tabs={TABS} active={tab} onChange={setTab} />

        {/* fieldset disabled desabilita nativamente todos os campos/botões internos. */}
        <fieldset disabled className="m-0 min-w-0 border-0 p-0 py-6">
          {tab === 'principal' && <MainSheet character={character} update={noop} />}
          {tab === 'inventario' && <InventoryPanel character={character} update={noop} />}
          {tab === 'efeitos' && <EffectsPanel character={character} update={noop} />}
        </fieldset>
      </div>
    </div>
  )
}
