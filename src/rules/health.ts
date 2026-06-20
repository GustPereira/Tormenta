export interface ClassHitPoints {
  /** PV inicial da classe (usado só na primeira classe do personagem). */
  pvInicial: number
  /** PV ganhos por nível além do 1º. */
  pvPorNivel: number
  /** Quantos níveis o personagem tem nesta classe. */
  level: number
}

/**
 * PV máximo no T20:
 *  - 1º nível (primeira classe): PV inicial + mod Con
 *  - cada nível seguinte: + (PV por nível da classe daquele nível + mod Con)
 * Em multiclasse, apenas a primeira classe usa o PV inicial.
 */
export function maxHitPoints(classes: ClassHitPoints[], conMod: number): number {
  if (classes.length === 0) return 0
  let hp = classes[0].pvInicial + conMod
  classes.forEach((c, i) => {
    const perLevelCount = i === 0 ? c.level - 1 : c.level
    hp += perLevelCount * (c.pvPorNivel + conMod)
  })
  return hp
}

export interface ClassMana {
  /** PM ganhos por nível nesta classe. */
  pmPorNivel: number
  level: number
}

/** PM máximo: soma de (PM por nível × nível) de cada classe. */
export function maxMana(classes: ClassMana[]): number {
  return classes.reduce((sum, c) => sum + c.pmPorNivel * c.level, 0)
}
