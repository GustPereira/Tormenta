import { Panel } from '../../components/Panel'
import { inputClass } from '../../components/ui'
import type { Character } from '../../schema'

interface Props {
  character: Character
  update: (updater: (c: Character) => Character) => void
}

export function NotesPanel({ character, update }: Props) {
  const setField = (field: 'conditions' | 'resistances' | 'notes', value: string) =>
    update((c) => ({ ...c, [field]: value }))

  return (
    <Panel title="Condições, Resistências & Anotações">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Area label="Condições" value={character.conditions} onChange={(v) => setField('conditions', v)} />
        <Area label="Resistências & Imunidades" value={character.resistances} onChange={(v) => setField('resistances', v)} />
      </div>
      <div className="mt-3">
        <Area label="Anotações" value={character.notes} onChange={(v) => setField('notes', v)} rows={4} />
      </div>
    </Panel>
  )
}

function Area({
  label,
  value,
  onChange,
  rows = 2,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  rows?: number
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium uppercase tracking-wide text-stone-400">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className={inputClass + ' w-full resize-y'}
      />
    </label>
  )
}
