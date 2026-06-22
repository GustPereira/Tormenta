import type { RaceDef } from './types'

/**
 * Catálogo de raças do Tormenta T20 — Tabela 1-2: Raças (Livro Básico).
 * `freeChoice` representa o "+1 em três atributos diferentes".
 * Suraggel é dividido em suas duas heranças (aggelus / sulfure).
 */
export const RACES: RaceDef[] = [
  { id: 'humano', name: 'Humano', attributeModifiers: {}, freeChoice: { count: 3, value: 1 }, pericasEscolha: 2, podeTrocarPericiaPorPoder: true },
  { id: 'anao', name: 'Anão', attributeModifiers: { constituicao: 2, sabedoria: 1, destreza: -1 } },
  { id: 'dahllan', name: 'Dahllan', attributeModifiers: { sabedoria: 2, destreza: 1, inteligencia: -1 } },
  { id: 'elfo', name: 'Elfo', attributeModifiers: { inteligencia: 2, destreza: 1, constituicao: -1 } },
  { id: 'goblin', name: 'Goblin', attributeModifiers: { destreza: 2, inteligencia: 1, carisma: -1 } },
  { id: 'lefou', name: 'Lefou', attributeModifiers: { carisma: -1 }, freeChoice: { count: 3, value: 1, except: ['carisma'] } },
  { id: 'minotauro', name: 'Minotauro', attributeModifiers: { forca: 2, constituicao: 1, sabedoria: -1 } },
  { id: 'qareen', name: 'Qareen', attributeModifiers: { carisma: 2, inteligencia: 1, sabedoria: -1 } },
  { id: 'golem', name: 'Golem', attributeModifiers: { forca: 2, constituicao: 1, carisma: -1 } },
  { id: 'hynne', name: 'Hynne', attributeModifiers: { destreza: 2, carisma: 1, forca: -1 } },
  { id: 'kliren', name: 'Kliren', attributeModifiers: { inteligencia: 2, carisma: 1, forca: -1 }, pericasEscolha: 1 },
  { id: 'medusa', name: 'Medusa', attributeModifiers: { destreza: 2, carisma: 1 } },
  { id: 'osteon', name: 'Osteon', attributeModifiers: { constituicao: -1 }, freeChoice: { count: 3, value: 1, except: ['constituicao'] }, pericasEscolha: 1, podeTrocarPericiaPorPoder: true },
  { id: 'sereia-tritao', name: 'Sereia/Tritão', attributeModifiers: {}, freeChoice: { count: 3, value: 1 } },
  { id: 'silfide', name: 'Sílfide', attributeModifiers: { carisma: 2, destreza: 1, forca: -2 } },
  { id: 'suraggel-aggelus', name: 'Suraggel (Aggelus)', attributeModifiers: { sabedoria: 2, carisma: 1 } },
  { id: 'suraggel-sulfure', name: 'Suraggel (Sulfure)', attributeModifiers: { destreza: 2, inteligencia: 1 } },
  { id: 'trog', name: 'Trog', attributeModifiers: { constituicao: 2, forca: 1, inteligencia: -1 } },
]

/** Índice de raça por id. */
export const RACES_BY_ID: Record<string, RaceDef> = Object.fromEntries(
  RACES.map((r) => [r.id, r]),
)
