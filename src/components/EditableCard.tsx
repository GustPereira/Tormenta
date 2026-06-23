import { useState, type ReactNode } from 'react'
import { Check, GripVertical, Pencil, Trash2 } from 'lucide-react'
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
  /** Habilita reordenação por arrastar (mostra a alça e ativa o drag-and-drop). */
  reorderable?: boolean
  /** Início do arraste deste card (guarda o id na lista pai). */
  onReorderStart?: () => void
  /** Soltou outro card sobre este (reordena na lista pai). */
  onReorderDrop?: () => void
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
  reorderable = false,
  onReorderStart,
  onReorderDrop,
}: EditableCardProps) {
  const [editing, setEditing] = useState(startEditing)
  const [open, setOpen] = useState(false)
  // `grabbed` libera o draggable só ao segurar a alça; `dragOver` destaca o alvo.
  const [grabbed, setGrabbed] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const confirmDelete = () => {
    if (window.confirm(`Excluir "${deleteName || 'este item'}"? Esta ação não pode ser desfeita.`)) {
      onDelete()
    }
  }

  const showHandle = reorderable && !editing

  return (
    <li
      draggable={grabbed}
      onDragStart={(e) => {
        if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
        onReorderStart?.()
      }}
      onDragEnd={() => {
        setGrabbed(false)
        setDragOver(false)
      }}
      onDragOver={
        reorderable
          ? (e) => {
              e.preventDefault()
              setDragOver(true)
            }
          : undefined
      }
      onDragLeave={reorderable ? () => setDragOver(false) : undefined}
      onDrop={
        reorderable
          ? (e) => {
              e.preventDefault()
              setDragOver(false)
              onReorderDrop?.()
            }
          : undefined
      }
      className={`rounded-md border bg-[var(--card-bg)] p-2 ${
        dragOver ? 'border-tormenta-400' : 'border-[var(--card-border)]'
      } ${grabbed ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center gap-2">
        {showHandle && (
          <span
            onMouseDown={() => setGrabbed(true)}
            onMouseUp={() => setGrabbed(false)}
            className="cursor-grab text-stone-500 hover:text-[var(--text)] active:cursor-grabbing"
            aria-label="Arrastar para reordenar"
            title="Arrastar para reordenar"
          >
            <GripVertical size={16} />
          </span>
        )}
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
            // div (não <button>) para o toggle continuar funcionando dentro de um
            // <fieldset disabled> (modo somente leitura do link compartilhado).
            <div
              role="button"
              tabIndex={0}
              onClick={() => setOpen((o) => !o)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setOpen((o) => !o)
                }
              }}
              className="flex flex-1 cursor-pointer items-center gap-1 text-left font-medium text-[var(--text)]"
              aria-expanded={open}
            >
              <span className="text-xs text-stone-500">{open ? '▾' : '▸'}</span>
              {title}
            </div>
          ) : (
            <span className="flex-1 font-medium text-[var(--text)]">{title}</span>
          ))}
        {editing && <span className="flex-1" />}
        {headerExtra}
        {!editing ? (
          <Button variant="secondary" onClick={() => setEditing(true)} aria-label="Editar" title="Editar">
            <Pencil size={14} />
          </Button>
        ) : (
          <>
            <Button variant="secondary" onClick={() => setEditing(false)} aria-label="Concluir" title="Concluir">
              <Check size={14} />
            </Button>
            <Button variant="danger" onClick={confirmDelete} aria-label="Excluir" title="Excluir">
              <Trash2 size={14} />
            </Button>
          </>
        )}
      </div>

      {!editing && summary != null && (
        <div className="mt-1 text-sm text-stone-400">{summary}</div>
      )}

      {!editing && open && details != null && (
        <div className="mt-2 whitespace-pre-wrap border-t border-stone-800 pt-2 text-sm text-stone-300">
          {details}
        </div>
      )}

      {editing && <div className="mt-2 border-t border-stone-800 pt-2">{children}</div>}
    </li>
  )
}
