/**
 * Meio nível (arredondado para baixo) — usado em perícias, Defesa e vários
 * cálculos derivados do Tormenta T20.
 */
export function halfLevel(level: number): number {
  return Math.floor(level / 2)
}
