import type { Character, EquipmentType, InventoryItem } from '../schema'
import { resolveValue, type FormulaContext } from './formula'

/** Resultado da resolução de um "slot" de equipamento (armadura ou escudo). */
export interface EquippedSlot {
  /** Item escolhido para o slot (o de maior defesa, quando há vários). */
  item: InventoryItem | null
  /** Valor de defesa do efeito do item escolhido (já resolvido). */
  defense: number
  /** Quantos itens desse tipo estão equipados (>1 indica conflito). */
  count: number
}

/** Itens equipados de um tipo, escolhendo o de maior valor de defesa no efeito. */
function equippedOfType(
  character: Character,
  type: Exclude<EquipmentType, ''>,
  ctx: FormulaContext,
): EquippedSlot {
  const items = character.inventory.filter((i) => i.equipped && i.equipmentType === type)
  let item: InventoryItem | null = null
  let defense = 0
  for (const i of items) {
    const def = resolveValue(i.modifiers.defense, ctx)
    if (item === null || def > defense) {
      item = i
      defense = def
    }
  }
  return { item, defense: item ? defense : 0, count: items.length }
}

/** Armadura equipada (a de maior defesa, se houver mais de uma). */
export function equippedArmor(character: Character, ctx: FormulaContext): EquippedSlot {
  return equippedOfType(character, 'armadura', ctx)
}

/** Escudo equipado (o de maior defesa, se houver mais de um). */
export function equippedShield(character: Character, ctx: FormulaContext): EquippedSlot {
  return equippedOfType(character, 'escudo', ctx)
}

/**
 * Verdadeiro se há uma armadura pesada (proficiência "Pesadas") equipada.
 * Regra do T20: usando armadura pesada, você não aplica a Destreza na Defesa.
 */
export function hasHeavyArmorEquipped(character: Character): boolean {
  return character.inventory.some(
    (i) => i.equipped && i.equipmentType === 'armadura' && i.proficiency === 'Pesadas',
  )
}
