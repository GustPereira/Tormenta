import classProfJson from './generated/class-proficiencies.json'

/** Proficiências de armadura/escudo por classe (da planilha de referência). */
export interface ClassProficiency {
  id: string
  name: string
  armaduraMarcial: boolean
  armaduraPesada: boolean
  escudo: boolean
}

export const CLASS_PROFICIENCIES: ClassProficiency[] =
  classProfJson as ClassProficiency[]

export const CLASS_PROFICIENCIES_BY_ID: Record<string, ClassProficiency> =
  Object.fromEntries(CLASS_PROFICIENCIES.map((c) => [c.id, c]))
