import Dexie, { type EntityTable } from 'dexie'
import type { Character } from '../schema'

/**
 * Banco local (IndexedDB) das fichas. Cada ficha é armazenada como um objeto
 * `Character` completo, com `id` como chave primária.
 */
export class TormentaDB extends Dexie {
  characters!: EntityTable<Character, 'id'>

  constructor() {
    super('tormenta-t20')
    this.version(1).stores({
      // Índices: chave primária `id` e `meta.updatedAt` para ordenar a lista.
      characters: 'id, meta.updatedAt',
    })
  }
}

export const db = new TormentaDB()
