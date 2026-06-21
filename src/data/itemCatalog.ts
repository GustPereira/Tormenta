import type { ItemModifiers } from '../schema'

/** Item pré-criado do catálogo (semeado a partir da planilha de referência). */
export interface CatalogItem {
  id: string
  name: string
  category: string
  spaces?: number
  proficiency?: string
  description?: string
  /** Modificadores aplicados quando o item estiver com efeito ativo. */
  modifiers?: Partial<ItemModifiers>
}

/**
 * Catálogo de itens prontos para copiar ao inventário.
 * Armaduras e escudos da planilha de referência: Defesa, Penalidade e
 * Deslocamento viram modificadores; proficiência vira o campo do item.
 */
export const ITEM_CATALOG: CatalogItem[] = [
  // Armaduras leves
  { id: 'acolchoada', name: 'Acolchoada', category: 'Armaduras', proficiency: 'Leves', modifiers: { defense: 1, penalty: 0 } },
  { id: 'couro', name: 'Couro', category: 'Armaduras', proficiency: 'Leves', modifiers: { defense: 2, penalty: 0 } },
  { id: 'couro-batido', name: 'Couro Batido', category: 'Armaduras', proficiency: 'Leves', modifiers: { defense: 3, penalty: -1 } },
  { id: 'gibao-de-peles', name: 'Gibão de Peles', category: 'Armaduras', proficiency: 'Leves', modifiers: { defense: 4, penalty: -3 } },
  { id: 'couraca', name: 'Couraça', category: 'Armaduras', proficiency: 'Leves', modifiers: { defense: 5, penalty: -4 } },
  { id: 'armadura-de-ossos', name: 'Armadura de Ossos', category: 'Armaduras', proficiency: 'Leves', modifiers: { defense: 3, penalty: -2 } },
  { id: 'veste-de-teia-de-aranhas', name: 'Veste de Teia de Aranhas', category: 'Armaduras', proficiency: 'Leves', modifiers: { defense: 4, penalty: 0 } },
  // Armaduras pesadas
  { id: 'brunea', name: 'Brunea', category: 'Armaduras', proficiency: 'Pesadas', modifiers: { defense: 5, penalty: -2, movement: -3 } },
  { id: 'cota-de-malha', name: 'Cota de Malha', category: 'Armaduras', proficiency: 'Pesadas', modifiers: { defense: 6, penalty: -2, movement: -3 } },
  { id: 'loriga-segmentada', name: 'Loriga Segmentada', category: 'Armaduras', proficiency: 'Pesadas', modifiers: { defense: 7, penalty: -3, movement: -3 } },
  { id: 'meia-armadura', name: 'Meia Armadura', category: 'Armaduras', proficiency: 'Pesadas', modifiers: { defense: 8, penalty: -4, movement: -3 } },
  { id: 'completa', name: 'Completa', category: 'Armaduras', proficiency: 'Pesadas', modifiers: { defense: 10, penalty: -5, movement: -3 } },
  { id: 'armadura-de-quitina', name: 'Armadura de Quitina', category: 'Armaduras', proficiency: 'Pesadas', modifiers: { defense: 7, penalty: -3, movement: -3 } },
  { id: 'armadura-arcana', name: 'Armadura Arcana', category: 'Armaduras', proficiency: '—', modifiers: { defense: 5, penalty: 0 } },
  // Escudos
  { id: 'escudo-leve', name: 'Escudo Leve', category: 'Escudos', proficiency: 'Escudos', modifiers: { defense: 1, penalty: -1 } },
  { id: 'escudo-pesado', name: 'Escudo Pesado', category: 'Escudos', proficiency: 'Escudos', modifiers: { defense: 2, penalty: -2 } },
  { id: 'escudo-de-couro', name: 'Escudo de Couro', category: 'Escudos', proficiency: 'Escudos', modifiers: { defense: 1, penalty: -1 } },
  // Geral
  { id: 'mochila', name: 'Mochila', category: 'Geral', spaces: 1 },
  { id: 'saco-de-dormir', name: 'Saco de dormir', category: 'Geral', spaces: 1 },
  { id: 'traje-de-viajante', name: 'Traje de viajante', category: 'Geral', spaces: 1 },
]

/** Categorias na ordem de exibição. */
export const ITEM_CATALOG_CATEGORIES = ['Armaduras', 'Escudos', 'Geral']
