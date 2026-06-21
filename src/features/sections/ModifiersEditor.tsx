import { Button } from '../../components/Button'
import { inputClass } from '../../components/ui'
import { ATTRIBUTE_ABBR, SKILLS, SKILLS_BY_ID } from '../../data'
import { ATTRIBUTE_KEYS, type ItemModifiers } from '../../schema'

interface Props {
  modifiers: ItemModifiers
  onChange: (modifiers: ItemModifiers) => void
}

/** Converte o texto de um campo em número (se for inteiro) ou fórmula (texto). */
function parseModValue(input: string): number | string {
  const t = input.trim()
  if (t === '') return 0
  if (/^-?\d+$/.test(t)) return Number(t)
  return t
}

const FORMULA_HINT = 'Número fixo ou fórmula: @for @des @con @int @sab @car @nivel @meionivel (ex.: @car+2)'

/**
 * Editor reutilizável dos modificadores de um efeito/item: atributos, vitais &
 * defesa e perícias. Todo campo aceita número fixo ou fórmula (ex.: @car+2).
 */
export function ModifiersEditor({ modifiers, onChange }: Props) {
  const setAttr = (key: string, value: number | string) =>
    onChange({ ...modifiers, attributes: { ...modifiers.attributes, [key]: value } })

  const setSkill = (skillId: string, value: number | string) =>
    onChange({ ...modifiers, skills: { ...modifiers.skills, [skillId]: value } })

  const removeSkill = (skillId: string) => {
    const skills = { ...modifiers.skills }
    delete skills[skillId]
    onChange({ ...modifiers, skills })
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-stone-500">{FORMULA_HINT}</p>
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

      <Group label="Ataque & Perícias (geral)">
        <ModInput label="Ataque" value={modifiers.attack ?? 0} onChange={(v) => onChange({ ...modifiers, attack: v })} />
        <ModInput label="Perícias" value={modifiers.allSkills ?? 0} onChange={(v) => onChange({ ...modifiers, allSkills: v })} />
      </Group>

      <Group label="Vitais & Defesa">
        <ModInput label="PV" value={modifiers.hitPoints} onChange={(v) => onChange({ ...modifiers, hitPoints: v })} />
        <ModInput label="PM" value={modifiers.mana} onChange={(v) => onChange({ ...modifiers, mana: v })} />
        <ModInput label="Defesa" value={modifiers.defense} onChange={(v) => onChange({ ...modifiers, defense: v })} />
        <ModInput label="Penal." value={modifiers.penalty} onChange={(v) => onChange({ ...modifiers, penalty: v })} />
        <ModInput label="Desloc." value={modifiers.movement} onChange={(v) => onChange({ ...modifiers, movement: v })} />
        <ModInput label="Red. Dano" value={modifiers.damageReduction} onChange={(v) => onChange({ ...modifiers, damageReduction: v })} />
      </Group>

      <div>
        <div className="mb-1 text-xs font-medium uppercase tracking-wide text-stone-400">Perícias</div>
        <div className="space-y-1">
          {Object.entries(modifiers.skills).map(([skillId, value]) => (
            <div key={skillId} className="flex items-center gap-2">
              <span className="flex-1 text-sm text-[var(--text)]">
                {SKILLS_BY_ID[skillId]?.name ?? skillId}
              </span>
              <input
                type="text"
                value={String(value)}
                onChange={(e) => setSkill(skillId, parseModValue(e.target.value))}
                className={inputClass + ' w-24 text-center'}
                aria-label={`Valor de ${SKILLS_BY_ID[skillId]?.name ?? skillId}`}
              />
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
  value: number | string
  onChange: (v: number | string) => void
}) {
  return (
    <label className="flex items-center gap-1 text-xs text-stone-400">
      {label}
      <input
        type="text"
        value={String(value)}
        onChange={(e) => onChange(parseModValue(e.target.value))}
        className={inputClass + ' w-16 text-center'}
        aria-label={label || 'modificador'}
      />
    </label>
  )
}
