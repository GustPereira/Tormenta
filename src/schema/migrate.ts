import {
  CURRENT_SCHEMA_VERSION,
  characterSchema,
  type Character,
} from './character'

/**
 * Erro lançado quando um JSON importado não pode ser interpretado como ficha.
 */
export class CharacterParseError extends Error {
  readonly cause?: unknown

  constructor(message: string, cause?: unknown) {
    super(message)
    this.name = 'CharacterParseError'
    this.cause = cause
  }
}

/**
 * Migra um objeto de ficha de versões antigas do schema até a versão atual.
 * Cada passo migra de N para N+1. Hoje só existe a v1, então é identidade —
 * novas versões adicionam um `case` aqui.
 */
function migrateToCurrent(raw: Record<string, unknown>): Record<string, unknown> {
  let data = raw
  let version = typeof data.schemaVersion === 'number' ? data.schemaVersion : 1

  while (version < CURRENT_SCHEMA_VERSION) {
    switch (version) {
      case 1:
        data = migrateV1toV2(data)
        break
      default:
        throw new CharacterParseError(
          `Versão de schema desconhecida: ${version}`,
        )
    }
    version = data.schemaVersion as number
  }

  return data
}

/**
 * v1 → v2: `spells` deixou de ser `{ known, prepared }` e passou a ser uma lista
 * de magias por círculo; `powers` (string[]) virou `abilities`. Campos novos
 * (attacks, conditions, etc.) ganham default pelo schema.
 */
function migrateV1toV2(
  data: Record<string, unknown>,
): Record<string, unknown> {
  const next = { ...data }

  // spells: objeto antigo -> lista
  const oldSpells = data.spells as { known?: unknown; prepared?: unknown } | undefined
  if (oldSpells && !Array.isArray(oldSpells)) {
    const known = Array.isArray(oldSpells.known) ? (oldSpells.known as string[]) : []
    const prepared = Array.isArray(oldSpells.prepared) ? (oldSpells.prepared as string[]) : []
    next.spells = known.map((name) => ({
      id: crypto.randomUUID(),
      name,
      circle: 1,
      prepared: prepared.includes(name),
      notes: '',
    }))
  }

  // powers (string[]) -> abilities
  if (Array.isArray(data.powers)) {
    next.abilities = (data.powers as string[]).map((name) => ({
      id: crypto.randomUUID(),
      name,
      group: 'classe' as const,
      notes: '',
    }))
  }
  delete next.powers

  next.schemaVersion = 2
  return next
}

/**
 * Interpreta dados desconhecidos (JSON importado ou registro do banco) como uma
 * `Character` válida: migra para a versão atual e valida com o schema Zod.
 * Lança `CharacterParseError` com mensagem amigável em caso de falha.
 */
export function parseCharacter(input: unknown): Character {
  if (input === null || typeof input !== 'object') {
    throw new CharacterParseError('O conteúdo não é um objeto de ficha válido.')
  }

  const migrated = migrateToCurrent(input as Record<string, unknown>)
  const result = characterSchema.safeParse(migrated)

  if (!result.success) {
    throw new CharacterParseError(
      'A ficha não passou na validação do schema.',
      result.error,
    )
  }

  return result.data
}
