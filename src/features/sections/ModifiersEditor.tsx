import { Button } from '../../components/Button'
import { inputClass } from '../../components/ui'
import { ATTRIBUTE_ABBR, SKILLS, SKILLS_BY_ID } from '../../data'
import { ATTRIBUTE_KEYS, type ItemModifiers } from '../../schema'

interface Props {
  modifiers: ItemModifiers
  onChange: (modifiers: ItemModifiers) => void
}

/**
 * Editor reutilizável dos modificadores de um efeito/item: atributos, vitais &
 * defesa e perícias.
 */
export function ModifiersEditor({ modifiers, onChange }: Props) {
  const setAttr = (key: string, value: number) =>
    onChange({ ...modifiers, attributes: { ...modifiers.attributes, [key]: value } })

  const setSkill = (skillId: string, value: number) =>
    onChange({ ...modifiers, skills: { ...modifiers.skills, [skillId]: value } })

  const removeSkill = (skillId: string) => {
    const skills = { ...modifiers.skills }
    delete skills[skillId]
    onChange({ ...modifiers, skills })
  }

  return (
    <div className="space-y-3">
      <Group label="Atributos">
        {ATTRIBUTE_KEYS.map((key) => (
          <ModInput
            key={key}
            label={ATTRIBUTE_ABBR[key]}
            value={modifiers.attributes[key] ?? 0}
            onChange={(v) => setAttr(key, v)}
          />
        ))}
      </Group>

      <Group label="Vitais & Defesa">
        <ModInput label="PV" value={modifiers.hitPoints} onChange={(v) => onChange({ ...modifiers, hitPoints: v })} />
        <ModInput label="PM" value={modifiers.mana} onChange={(v) => onChange({ ...modifiers, mana: v })} />
        <ModInput label="Defesa" value={modifiers.defense} onChange={(v) => onChange({ ...modifiers, defense: v })} />
      </Group>

      <div>
        <div className="mb-1 text-xs font-medium uppercase tracking-wide text-stone-400">Perícias</div>
        <div className="space-y-1">
          {Object.entries(modifiers.skills).map(([skillId, value]) => (
            <div key={skillId} className="flex items-center gap-2">
              <span className="flex-1 text-sm text-[var(--text)]">
                {SKILLS_BY_ID[skillId]?.name ?? skillId}
              </span>
              <ModInput label="" value={value} onChange={(v) => setSkill(skillId, v)} />
              <Button variant="ghost" onClick={() => removeSkill(skillId)} aria-label="Remover perícia">✕</Button>
            </div>
          ))}
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) setSkill(e.target.value, 0)
            }}
            className={inputClass + ' text-sm'}
            aria-label="Adicionar perícia"
          >
            <option value="">+ adicionar perícia…</option>
            {SKILLS.filter((s) => !(s.id in modifiers.skills)).map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-stone-400">{label}</div>
      <div className="flex flex-wrap gap-3">{children}</div>
    </div>
  )
}

function ModInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <label className="flex items-center gap-1 text-xs text-stone-400">
      {label}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className={inputClass + ' w-14 text-center'}
        aria-label={label || 'modificador'}
      />
    </label>
  )
}
