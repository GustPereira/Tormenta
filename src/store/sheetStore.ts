import { create } from 'zustand'
import { getCharacter, saveCharacter } from '../db'
import type { Character } from '../schema'

export type SheetStatus = 'idle' | 'loading' | 'notfound' | 'saving' | 'saved'

interface SheetState {
  character: Character | null
  status: SheetStatus
  load: (id: string) => Promise<void>
  /** Aplica uma transformação na ficha e agenda o autosave. */
  update: (updater: (c: Character) => Character) => void
  reset: () => void
}

const SAVE_DEBOUNCE_MS = 600
let saveTimer: ReturnType<typeof setTimeout> | null = null

export const useSheetStore = create<SheetState>((set, get) => ({
  character: null,
  status: 'idle',

  async load(id) {
    set({ status: 'loading', character: null })
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
  },

  reset() {
    if (saveTimer) clearTimeout(saveTimer)
    set({ character: null, status: 'idle' })
  },
}))
