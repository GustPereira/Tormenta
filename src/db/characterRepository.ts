import { createBlankCharacter, parseCharacter, type Character } from '../schema'
import { db } from './database'

/** Resumo leve para a tela de lista (sem carregar a ficha inteira no render). */
export interface CharacterSummary {
  id: string
  name: string
  updatedAt: string
  createdAt: string
}

function toSummary(c: Character): CharacterSummary {
  return {
    id: c.id,
    name: c.name,
    updatedAt: c.meta.updatedAt,
    createdAt: c.meta.createdAt,
  }
}

/** Lista todas as fichas, mais recentes primeiro. */
export async function listCharacters(): Promise<CharacterSummary[]> {
  const all = await db.characters.orderBy('meta.updatedAt').reverse().toArray()
  return all.map(toSummary)
}

/** Carrega uma ficha pelo id, validando o registro contra o schema atual. */
export async function getCharacter(id: string): Promise<Character | undefined> {
  const raw = await db.characters.get(id)
  if (!raw) return undefined
  return parseCharacter(raw)
}

/**
 * Persiste uma ficha (insere ou atualiza), tocando `meta.updatedAt`.
 * Retorna a ficha salva (com o timestamp atualizado).
 */
export async function saveCharacter(character: Character): Promise<Character> {
  const toSave: Character = {
    ...character,
    meta: { ...character.meta, updatedAt: new Date().toISOString() },
  }
  await db.characters.put(toSave)
  return toSave
}

/** Cria uma ficha em branco já persistida. */
export async function createCharacter(name?: string): Promise<Character> {
  const character = createBlankCharacter(name)
  await db.characters.put(character)
  return character
}

/** Duplica uma ficha existente com novo id e sufixo "(cópia)". */
export async function duplicateCharacter(id: string): Promise<Character> {
  const source = await getCharacter(id)
  if (!source) throw new Error(`Ficha não encontrada: ${id}`)
  const now = new Date().toISOString()
  const copy: Character = {
    ...source,
    id: crypto.randomUUID(),
    name: `${source.name} (cópia)`,
    meta: { createdAt: now, updatedAt: now },
  }
  await db.characters.put(copy)
  return copy
}

/** Remove uma ficha pelo id. */
export async function deleteCharacter(id: string): Promise<void> {
  await db.characters.delete(id)
}
