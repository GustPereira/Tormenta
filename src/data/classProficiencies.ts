import classProfJson from './generated/class-proficiencies.json'

/**
 * Proficiências extras concedidas pela classe (da planilha de referência).
 * Armas simples e armaduras leves são universais (todo personagem sabe usar) e
 * não ficam aqui — são aplicadas direto no motor (ver `Proficiencies`).
 */
export interface ClassProficiency {
  id: string
  name: string
  /** Armas marciais. */
  armaMarcial: boolean
  /** Armaduras pesadas. */
  armaduraPesada: boolean
  escudo: boolean
  /** Armas exóticas (raras; nenhuma classe base concede). */
  armaExotica: boolean
  /** Armas de fogo (raras; nenhuma classe base concede). */
  armaFogo: boolean
}

export const CLASS_PROFICIENCIES: ClassProficiency[] =
  classProfJson as ClassProficiency[]

export const CLASS_PROFICIENCIES_BY_ID: Record<string, ClassProficiency> =
  Object.fromEntries(CLASS_PROFICIENCIES.map((c) => [c.id, c]))
