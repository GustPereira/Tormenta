import { useState } from 'react'
import { Button } from '../../components/Button'
import { EditableCard } from '../../components/EditableCard'
import { Panel } from '../../components/Panel'
import { inputClass } from '../../components/ui'
import {
  deriveCharacter,
  effectDamageContributions,
  mergeDamage,
  type FormulaContext,
} from '../../rules'
import type { Attack, Character } from '../../schema'
import { AttackBoxes, AttackFields, attackContributions, attackTotal } from './attackShared'

interface Props {
  character: Character
  update: (updater: (c: Character) => Character) => void
}

export function AttacksPanel({ character, update }: Props) {
  const derived = deriveCharacter(character)
  const ctx: FormulaContext = {
    attributes: derived.finalAttributes,
    level: derived.totalLevel,
    shieldDefense: derived.shieldDefense,
  }
  const [lastAddedId, setLastAddedId] = useState<string | null>(null)
  const add = () => {
    const id = crypto.randomUUID()
    setLastAddedId(id)
    update((c) => ({
      ...c,
      attacks: [
        ...c.attacks,
        { id, name: '', base: '', attackBonus: '', damage: '', critical: '', damageType: '', range: '' },
      ],
    }))
  }
  const setField = (id: string, key: keyof Attack, value: string) =>
    update((c) => ({
      ...c,
      attacks: c.attacks.map((a) => (a.id === id ? { ...a, [key]: value } : a)),
    }))
  const remove = (id: string) =>
    update((c) => ({ ...c, attacks: c.attacks.filter((a) => a.id !== id) }))

  // Ataques de armas equipadas — aparecem no começo da lista (somente leitura;
  // edite a arma no Inventário).
  const weaponAttacks = character.inventory
    .filter((it) => it.equipped && it.attack)
    .map((it) => ({ item: it, attack: it.attack as Attack }))

  const empty = character.attacks.length === 0 && weaponAttacks.length === 0

  return (
    <Panel
      title="Ataques & Conjurações"
      collapsible
      action={<Button variant="ghost" className="text-xs" onClick={add}>+ ataque</Button>}
    >
      {empty ? (
        <p className="text-sm text-stone-500">Nenhum ataque.</p>
      ) : (
        <ul className="space-y-2">
          {weaponAttacks.map(({ item, attack }) => {
            const contribs = attackContributions(attack, derived, character, ctx)
            return (
              <li
                key={item.id}
                className="rounded-md border border-[var(--card-border)] bg-[var(--card-bg)] p-2"
              >
                <div className="mb-1 font-medium text-[var(--text)]">
                  🗡 {item.name || attack.name || 'Arma'}
                  <span className="ml-2 text-xs uppercase text-stone-500">arma equipada</span>
                </div>
                <AttackBoxes
                  attack={attack}
                  total={attackTotal(contribs)}
                  contributions={contribs}
                  damageText={mergeDamage([attack.damage, derived.globalDamageBonus], ctx)}
                  damageContributions={effectDamageContributions(character, ctx)}
                />
              </li>
            )
          })}

          {character.attacks.map((a) => {
            const contribs = attackContributions(a, derived, character, ctx)
            return (
              <EditableCard
                key={a.id}
                title={a.name || 'Ataque sem nome'}
                summary={
                  <AttackBoxes
                    attack={a}
                    total={attackTotal(contribs)}
                    contributions={contribs}
                    damageText={mergeDamage([a.damage, derived.globalDamageBonus], ctx)}
                    damageContributions={effectDamageContributions(character, ctx)}
                  />
                }
                onDelete={() => remove(a.id)}
                deleteName={a.name}
                startEditing={a.id === lastAddedId}
              >
                <div className="space-y-2">
                  <input
                    type="text"
                    value={a.name}
                    placeholder="Nome do ataque"
                    onChange={(e) => setField(a.id, 'name', e.target.value)}
                    className={inputClass + ' w-full font-medium'}
                    aria-label="Nome do ataque"
                  />
                  <AttackFields attack={a} onChange={(key, value) => setField(a.id, key, value)} />
                </div>
              </EditableCard>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}
