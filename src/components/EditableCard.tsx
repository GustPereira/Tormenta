import { useState, type ReactNode } from 'react'
import { Button } from './Button'

interface EditableCardProps {
  /** Título mostrado (como texto) quando colapsado. */
  title: ReactNode
  /** Resumo mostrado abaixo do título quando colapsado. */
  summary?: ReactNode
  /** Detalhe opcional revelado em accordion ao clicar no título (modo colapsado). */
  details?: ReactNode
  /** Conteúdo de edição (campos), mostrado só no modo edição. */
  children: ReactNode
  onDelete: () => void
  /** Nome usado na confirmação de exclusão. */
  deleteName?: string
  /** Checkbox de ativar/desativar (opcional), visível nos dois modos. */
  active?: boolean
  onActiveChange?: (value: boolean) => void
  activeLabel?: string
  /** Conteúdo extra no cabeçalho (ex.: toggles disponíveis sem entrar em edição). */
  headerExtra?: ReactNode
  /** Inicia em modo edição (ex.: item recém-adicionado). */
  startEditing?: boolean
}

/**
 * Card de item de lista com padrão único: colapsado mostra resumo + botão
 * Editar; ao editar, libera os campos e mostra Concluir/Excluir (com confirmação).
 */
export function EditableCard({
  title,
  summary,
  details,
  children,
  onDelete,
  deleteName,
  active,
  onActiveChange,
  activeLabel = 'Ativo',
  headerExtra,
  startEditing = false,
}: EditableCardProps) {
  const [editing, setEditing] = useState(startEditing)
  const [open, setOpen] = useState(false)

  const confirmDelete = () => {
    if (window.confirm(`Excluir "${deleteName || 'este item'}"? Esta ação não pode ser desfeita.`)) {
      onDelete()
    }
  }

  return (
    <li className="rounded-md border border-[var(--card-border)] bg-[var(--card-bg)] p-2">
      <div className="flex items-center gap-2">
        {onActiveChange && (
          <label className="flex items-center gap-1 text-xs text-stone-400">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => onActiveChange(e.target.checked)}
              className="h-4 w-4 accent-tormenta-500"
              aria-label={activeLabel}
            />
            {activeLabel}
          </label>
        )}
        {!editing &&
          (details != null ? (
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="flex flex-1 items-center gap-1 text-left font-medium text-[var(--text)]"
              aria-expanded={open}
            >
              <span className="text-xs text-stone-500">{open ? '▾' : '▸'}</span>
              {title}
            </button>
          ) : (
            <span className="flex-1 font-medium text-[var(--text)]">{title}</span>
          ))}
        {editing && <span className="flex-1" />}
        {headerExtra}
        {!editing ? (
          <Button variant="secondary" onClick={() => setEditing(true)}>Editar</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={() => setEditing(false)}>Concluir</Button>
            <Button variant="danger" onClick={confirmDelete}>Excluir</Button>
          </>
        )}
      </div>

      {!editing && summary != null && (
        <div className="mt-1 text-sm text-stone-400">{summary}</div>
      )}

      {!editing && open && details != null && (
        <div className="mt-1 whitespace-pre-wrap text-sm text-stone-300">{details}</div>
      )}

      {editing && <div className="mt-2 border-t border-stone-800 pt-2">{children}</div>}
    </li>
  )
}
