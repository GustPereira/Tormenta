import originsJson from './generated/origins.json'

/** Origem do personagem (Tabela de Origens — extraída da planilha de referência). */
export interface OriginDef {
  id: string
  name: string
  /** Poder concedido pela origem (nome). */
  power: string | null
  /** Itens iniciais concedidos pela origem. */
  items: string | null
  /** Perícias treinadas concedidas pela origem (ids). */
  pericasFixas: string[]
  /** Perícias à escolha concedidas pela origem. */
  pericasEscolha: number
}

export const ORIGINS: OriginDef[] = originsJson as OriginDef[]

export const ORIGINS_BY_ID: Record<string, OriginDef> = Object.fromEntries(
  ORIGINS.map((o) => [o.id, o]),
)
