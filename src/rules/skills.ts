import { halfLevel } from './core'

/**
 * Bônus de treinamento de perícia no T20: +2 (níveis 1–6), +4 (7–14), +6 (15+).
 * Zero se a perícia não for treinada.
 */
export function trainingBonus(level: number, trained: boolean): number {
  if (!trained) return 0
  if (level >= 15) return 6
  if (level >= 7) return 4
  return 2
}

export interface SkillBonusInput {
  level: number
  /** Modificador do atributo associado à perícia (no T20, o próprio valor do atributo). */
  attributeMod: number
  trained: boolean
  /** Bônus de outras fontes (raça, poderes, itens). */
  otherBonus?: number
}

/** Bônus total de uma perícia: meio nível + atributo + treino + outros. */
export function skillBonus({
  level,
  attributeMod,
  trained,
  otherBonus = 0,
}: SkillBonusInput): number {
  return halfLevel(level) + attributeMod + trainingBonus(level, trained) + otherBonus
}
