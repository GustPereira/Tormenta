import { useEffect, type ReactNode } from 'react'
import { sectionTitle } from './ui'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
  className?: string
}

/**
 * Janela modal genérica: backdrop opaco em tela cheia + card centralizado com as
 * cores do tema. Fecha no ✕, no clique fora (backdrop) e no Esc.
 *
 * Renderiza inline (sem portal) para herdar as variáveis de tema (`--card-bg`
 * etc.) do container da ficha — um portal no body cairia fora desse escopo e o
 * card ficaria sem fundo. As cores têm fallback para nunca ficarem transparentes.
 */
export function Modal({ title, onClose, children, className = '' }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4 sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`my-auto w-full max-w-lg rounded-lg border border-[var(--card-border,#44403c)] bg-[var(--card-bg,#1c1917)] text-[var(--text,#f5efe6)] shadow-xl ${className}`}
      >
        <div className="flex items-center justify-between border-b border-[var(--card-border,#44403c)] px-4 py-3">
          <h2 className={sectionTitle}>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-md px-2 text-lg leading-none text-stone-400 hover:bg-stone-800 hover:text-[var(--text)]"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  )
}
