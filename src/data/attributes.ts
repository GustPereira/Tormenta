import type { AttributeKey } from '../schema'

/** Nome completo de cada atributo. */
export const ATTRIBUTE_LABELS: Record<AttributeKey, string> = {
  forca: 'Força',
  destreza: 'Destreza',
  constituicao: 'Constituição',
  inteligencia: 'Inteligência',
  sabedoria: 'Sabedoria',
  carisma: 'Carisma',
}

/** Abreviação de três letras de cada atributo (For, Des, …). */
export const ATTRIBUTE_ABBR: Record<AttributeKey, string> = {
  forca: 'For',
  destreza: 'Des',
  constituicao: 'Con',
  inteligencia: 'Int',
  sabedoria: 'Sab',
  carisma: 'Car',
}
