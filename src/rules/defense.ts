import { halfLevel } from './core'

export interface DefenseInput {
  level: number
  /** Modificador de Destreza. */
  dexMod: number
  armorBonus?: number
  shieldBonus?: number
  /** Bônus de outras fontes (poderes, itens, esquiva, etc.). */
  otherBonus?: number
}

/** Defesa do T20: 10 + meio nível + Des + armadura + escudo + outros. */
export function defense({
  level,
  dexMod,
  armorBonus = 0,
  shieldBonus = 0,
  otherBonus = 0,
}: DefenseInput): number {
  return 10 + halfLevel(level) + dexMod + armorBonus + shieldBonus + otherBonus
}
