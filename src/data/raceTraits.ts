import raceTraitsJson from './generated/race-traits.json'

/** Traços de raça: deslocamento, sentidos, tipo e tamanho (da planilha de referência). */
export interface RaceTraits {
  id: string
  name: string
  /** Deslocamento em metros. */
  deslocamento: number
  visaoPenumbra: boolean
  visaoEscuro: boolean
  faro: boolean
  tipo: string
  tamanho: string
}

// Deduplica por id (a planilha tem entradas repetidas, ex.: Golem).
const seen = new Set<string>()
export const RACE_TRAITS: RaceTraits[] = (raceTraitsJson as RaceTraits[]).filter(
  (t) => (seen.has(t.id) ? false : (seen.add(t.id), true)),
)

export const RACE_TRAITS_BY_ID: Record<string, RaceTraits> = Object.fromEntries(
  RACE_TRAITS.map((t) => [t.id, t]),
)
