import { create } from 'zustand'
import { getCharacter, saveCharacter } from '../db'
import { isShareConfigured, updateSharedCharacter } from '../share'
import type { Character } from '../schema'

export type SheetStatus = 'idle' | 'loading' | 'notfound' | 'saving' | 'saved'
export type ShareSyncStatus = 'idle' | 'syncing' | 'synced' | 'error'

interface SheetState {
  character: Character | null
  status: SheetStatus
  /** Estado da sincronização da ficha publicada (compartilhamento). */
  shareSync: ShareSyncStatus
  load: (id: string) => Promise<void>
  /** Aplica uma transformação na ficha e agenda o autosave (e o sync, se publicada). */
  update: (updater: (c: Character) => Character) => void
  reset: () => void
}

const SAVE_DEBOUNCE_MS = 600
const SHARE_DEBOUNCE_MS = 4000
let saveTimer: ReturnType<typeof setTimeout> | null = null
let shareTimer: ReturnType<typeof setTimeout> | null = null

export const useSheetStore = create<SheetState>((set, get) => ({
  character: null,
  status: 'idle',
  shareSync: 'idle',

  async load(id) {
    set({ status: 'loading', character: null, shareSync: 'idle' })
    const character = await getCharacter(id)
    set(character ? { character, status: 'idle' } : { status: 'notfound' })
  },

  update(updater) {
    const current = get().character
    if (!current) return
    const next = updater(current)
    set({ character: next, status: 'saving' })

    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      void saveCharacter(next).then(() => {
        // só sinaliza "salvo" se a ficha atual ainda for a mesma
        if (get().character?.id === next.id && get().status === 'saving') {
          set({ status: 'saved' })
        }
      })
    }, SAVE_DEBOUNCE_MS)

    // Link vivo: se a ficha está publicada, sincroniza (debounce para não floodar a API).
    if (next.shareId && next.shareToken && isShareConfigured()) {
      if (shareTimer) clearTimeout(shareTimer)
      set({ shareSync: 'syncing' })
      const { shareId, shareToken } = next
      shareTimer = setTimeout(() => {
        void updateSharedCharacter(shareId, shareToken, next)
          .then(() => {
            if (get().character?.id === next.id) set({ shareSync: 'synced' })
          })
          .catch(() => {
            if (get().character?.id === next.id) set({ shareSync: 'error' })
          })
      }, SHARE_DEBOUNCE_MS)
    }
  },

  reset() {
    if (saveTimer) clearTimeout(saveTimer)
    if (shareTimer) clearTimeout(shareTimer)
    set({ character: null, status: 'idle', shareSync: 'idle' })
  },
}))
