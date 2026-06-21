import { useState } from 'react'
import { Button } from '../../components/Button'
import { EditableCard } from '../../components/EditableCard'
import { Panel } from '../../components/Panel'
import { inputClass } from '../../components/ui'
import { describeModifiers } from '../../rules'
import {
  EMPTY_ITEM_MODIFIERS,
  type Character,
  type EffectData,
  type ItemModifiers,
} from '../../schema'
import { ModifiersEditor } from './ModifiersEditor'

interface Props {
  character: Character
  update: (updater: (c: Character) => Character) => void
}

export function EffectsPanel({ character, update }: Props) {
  const [lastAddedId, setLastAddedId] = useState<string | null>(null)
  const activeItemEffects = character.inventory.filter((i) => i.activeEffect)
  const abilityEffects = character.abilities.filter((a) => a.hasEffect)

  const setAbilityActive = (id: string, active: boolean) =>
    update((c) => ({
      ...c,
      abilities: c.abilities.map((a) => (a.id === id ? { ...a, effectActive: active } : a)),
    }))

  const setEffect = (id: string, patch: Partial<EffectData>) =>
    update((c) => ({
      ...c,
      effects: c.effects.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }))

  const setModifiers = (id: string, modifiers: ItemModifiers) => setEffect(id, { modifiers })

  const add = () => {
    const id = crypto.randomUUID()
    setLastAddedId(id)
    update((c) => ({
      ...c,
      effects: [
        ...c.effects,
        { id, name: '', active: true, modifiers: { ...EMPTY_ITEM_MODIFIERS, attributes: {}, skills: {} } },
      ],
    }))
  }

  const remove = (id: string) =>
    update((c) => ({ ...c, effects: c.effects.filter((e) => e.id !== id) }))

  return (
    <div className="space-y-4">
      <Panel title="Efeitos de itens (ativos)">
        {activeItemEffects.length === 0 ? (
          <p className="text-sm text-stone-500">
            Nenhum item com efeito ativo. Ative o efeito de um item na aba Inventário.
          </p>
        ) : (
          <ul className="space-y-2">
            {activeItemEffects.map((item) => (
              <li
                key={item.id}
                className="rounded-md border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-2"
              >
                <div className="font-medium text-[var(--text)]">
                  {item.name || 'Item sem nome'}
                  <span className="ml-2 text-xs uppercase text-stone-500">item</span>
                </div>
                <div className="text-sm text-stone-400">{describeModifiers(item.modifiers)}</div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Efeitos de habilidades">
        {abilityEffects.length === 0 ? (
          <p className="text-sm text-stone-500">
            Nenhuma habilidade com efeito. Marque "Tem efeito" numa habilidade na aba Principal.
          </p>
        ) : (
          <ul className="space-y-2">
            {abilityEffects.map((a) => (
              <li
                key={a.id}
                className="flex items-center gap-2 rounded-md border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-2"
              >
                <input
                  type="checkbox"
                  checked={a.effectActive}
                  onChange={(e) => setAbilityActive(a.id, e.target.checked)}
                  className="h-4 w-4 accent-tormenta-500"
                  aria-label={`Ativar efeito de ${a.name || 'habilidade'}`}
                />
                <div className="flex-1">
                  <div className="font-medium text-[var(--text)]">
                    {a.name || 'Habilidade sem nome'}
                    <span className="ml-2 text-xs uppercase text-stone-500">habilidade</span>
                  </div>
                  <div className="text-sm text-stone-400">{describeModifiers(a.modifiers)}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel
        title="Outros efeitos"
        action={<Button variant="ghost" className="text-xs" onClick={add}>+ efeito</Button>}
      >
        {character.effects.length === 0 ? (
          <p className="text-sm text-stone-500">
            Nenhum efeito avulso. Use "+ efeito" para criar (ex.: bênçãos, condições, magias de melhoria).
          </p>
        ) : (
          <ul className="space-y-2">
            {character.effects.map((effect) => (
              <EditableCard
                key={effect.id}
                active={effect.active}
                onActiveChange={(v) => setEffect(effect.id, { active: v })}
                activeLabel="Ativo"
                title={effect.name || 'Efeito sem nome'}
                summary={describeModifiers(effect.modifiers)}
                onDelete={() => remove(effect.id)}
                deleteName={effect.name}
                startEditing={effect.id === lastAddedId}
              >
                <input
                  type="text"
                  value={effect.name}
                  placeholder="Nome do efeito"
                  onChange={(e) => setEffect(effect.id, { name: e.target.value })}
                  className={inputClass + ' mb-2 w-full font-medium'}
                  aria-label="Nome do efeito"
                />
                <ModifiersEditor
                  modifiers={effect.modifiers}
                  onChange={(m) => setModifiers(effect.id, m)}
                />
              </EditableCard>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}
