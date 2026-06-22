import type { Attack, ItemModifiers } from '../schema'

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
  /** Ataque embutido (apenas para a categoria "Armas"). */
  attack?: Partial<Attack>
}

/**
 * Catálogo de itens prontos para copiar ao inventário.
 * Armaduras e escudos da planilha de referência: Defesa, Penalidade e
 * Deslocamento viram modificadores; proficiência vira o campo do item.
 */
export const ITEM_CATALOG: CatalogItem[] = [
  // Armas (Tabela 3-3 do Livro Básico). base: corpo a corpo → Luta+FOR;
  // à distância → Pontaria+DES. Dano de armas duplas usa o primeiro valor.
  // Simples — corpo a corpo
  { id: 'adaga', name: 'Adaga', category: 'Armas', proficiency: 'Simples', spaces: 1, attack: { base: 'luta-for', damage: '1d4', critical: '19', range: 'Curto (9m)', damageType: 'Perfuração' } },
  { id: 'espada-curta', name: 'Espada curta', category: 'Armas', proficiency: 'Simples', spaces: 1, attack: { base: 'luta-for', damage: '1d6', critical: '19', damageType: 'Perfuração' } },
  { id: 'foice', name: 'Foice', category: 'Armas', proficiency: 'Simples', spaces: 1, attack: { base: 'luta-for', damage: '1d6', critical: 'x3', damageType: 'Corte' } },
  { id: 'clava', name: 'Clava', category: 'Armas', proficiency: 'Simples', spaces: 1, attack: { base: 'luta-for', damage: '1d6', critical: 'x2', damageType: 'Impacto' } },
  { id: 'lanca', name: 'Lança', category: 'Armas', proficiency: 'Simples', spaces: 1, attack: { base: 'luta-for', damage: '1d6', critical: 'x2', range: 'Curto (9m)', damageType: 'Perfuração' } },
  { id: 'maca', name: 'Maça', category: 'Armas', proficiency: 'Simples', spaces: 1, attack: { base: 'luta-for', damage: '1d8', critical: 'x2', damageType: 'Impacto' } },
  { id: 'bordao', name: 'Bordão', category: 'Armas', proficiency: 'Simples', spaces: 2, attack: { base: 'luta-for', damage: '1d6', critical: 'x2', damageType: 'Impacto' } },
  { id: 'pique', name: 'Pique', category: 'Armas', proficiency: 'Simples', spaces: 2, attack: { base: 'luta-for', damage: '1d8', critical: 'x2', damageType: 'Perfuração' } },
  { id: 'tacape', name: 'Tacape', category: 'Armas', proficiency: 'Simples', spaces: 2, attack: { base: 'luta-for', damage: '1d10', critical: 'x2', damageType: 'Impacto' } },
  // Simples — à distância
  { id: 'azagaia', name: 'Azagaia', category: 'Armas', proficiency: 'Simples', spaces: 1, attack: { base: 'pontaria-des', damage: '1d6', critical: 'x2', range: 'Médio (30m)', damageType: 'Perfuração' } },
  { id: 'besta-leve', name: 'Besta leve', category: 'Armas', proficiency: 'Simples', spaces: 1, attack: { base: 'pontaria-des', damage: '1d8', critical: '19', range: 'Médio (30m)', damageType: 'Perfuração' } },
  { id: 'funda', name: 'Funda', category: 'Armas', proficiency: 'Simples', spaces: 1, attack: { base: 'pontaria-des', damage: '1d4', critical: 'x2', range: 'Médio (30m)', damageType: 'Impacto' } },
  { id: 'arco-curto', name: 'Arco curto', category: 'Armas', proficiency: 'Simples', spaces: 2, attack: { base: 'pontaria-des', damage: '1d6', critical: 'x3', range: 'Médio (30m)', damageType: 'Perfuração' } },
  // Marciais — corpo a corpo
  { id: 'machadinha', name: 'Machadinha', category: 'Armas', proficiency: 'Marcial', spaces: 1, attack: { base: 'luta-for', damage: '1d6', critical: 'x3', range: 'Curto (9m)', damageType: 'Corte' } },
  { id: 'cimitarra', name: 'Cimitarra', category: 'Armas', proficiency: 'Marcial', spaces: 1, attack: { base: 'luta-for', damage: '1d6', critical: '18', damageType: 'Corte' } },
  { id: 'espada-longa', name: 'Espada longa', category: 'Armas', proficiency: 'Marcial', spaces: 1, attack: { base: 'luta-for', damage: '1d8', critical: '19', damageType: 'Corte' } },
  { id: 'florete', name: 'Florete', category: 'Armas', proficiency: 'Marcial', spaces: 1, attack: { base: 'luta-for', damage: '1d6', critical: '18', damageType: 'Perfuração' } },
  { id: 'machado-de-batalha', name: 'Machado de batalha', category: 'Armas', proficiency: 'Marcial', spaces: 1, attack: { base: 'luta-for', damage: '1d8', critical: 'x3', damageType: 'Corte' } },
  { id: 'mangual', name: 'Mangual', category: 'Armas', proficiency: 'Marcial', spaces: 1, attack: { base: 'luta-for', damage: '1d8', critical: 'x2', damageType: 'Impacto' } },
  { id: 'martelo-de-guerra', name: 'Martelo de guerra', category: 'Armas', proficiency: 'Marcial', spaces: 1, attack: { base: 'luta-for', damage: '1d8', critical: 'x3', damageType: 'Impacto' } },
  { id: 'picareta', name: 'Picareta', category: 'Armas', proficiency: 'Marcial', spaces: 1, attack: { base: 'luta-for', damage: '1d6', critical: 'x4', damageType: 'Perfuração' } },
  { id: 'tridente', name: 'Tridente', category: 'Armas', proficiency: 'Marcial', spaces: 1, attack: { base: 'luta-for', damage: '1d8', critical: 'x2', range: 'Curto (9m)', damageType: 'Perfuração' } },
  { id: 'alabarda', name: 'Alabarda', category: 'Armas', proficiency: 'Marcial', spaces: 2, attack: { base: 'luta-for', damage: '1d10', critical: 'x3', damageType: 'Corte' } },
  { id: 'alfange', name: 'Alfange', category: 'Armas', proficiency: 'Marcial', spaces: 2, attack: { base: 'luta-for', damage: '2d4', critical: '18', damageType: 'Corte' } },
  { id: 'gadanho', name: 'Gadanho', category: 'Armas', proficiency: 'Marcial', spaces: 2, attack: { base: 'luta-for', damage: '2d4', critical: 'x4', damageType: 'Corte' } },
  { id: 'lanca-montada', name: 'Lança montada', category: 'Armas', proficiency: 'Marcial', spaces: 2, attack: { base: 'luta-for', damage: '1d8', critical: 'x3', damageType: 'Perfuração' } },
  { id: 'machado-de-guerra', name: 'Machado de guerra', category: 'Armas', proficiency: 'Marcial', spaces: 2, attack: { base: 'luta-for', damage: '1d12', critical: 'x3', damageType: 'Corte' } },
  { id: 'marreta', name: 'Marreta', category: 'Armas', proficiency: 'Marcial', spaces: 2, attack: { base: 'luta-for', damage: '3d4', critical: 'x2', damageType: 'Impacto' } },
  { id: 'montante', name: 'Montante', category: 'Armas', proficiency: 'Marcial', spaces: 2, attack: { base: 'luta-for', damage: '2d6', critical: '19', damageType: 'Corte' } },
  // Marciais — à distância
  { id: 'arco-longo', name: 'Arco longo', category: 'Armas', proficiency: 'Marcial', spaces: 2, attack: { base: 'pontaria-des', damage: '1d8', critical: 'x3', range: 'Médio (30m)', damageType: 'Perfuração' } },
  { id: 'besta-pesada', name: 'Besta pesada', category: 'Armas', proficiency: 'Marcial', spaces: 2, attack: { base: 'pontaria-des', damage: '1d12', critical: '19', range: 'Médio (30m)', damageType: 'Perfuração' } },
  // Exóticas (dano de armas duplas usa o primeiro valor)
  { id: 'chicote', name: 'Chicote', category: 'Armas', proficiency: 'Exótica', spaces: 1, attack: { base: 'luta-for', damage: '1d3', critical: 'x2', damageType: 'Corte' } },
  { id: 'espada-bastarda', name: 'Espada bastarda', category: 'Armas', proficiency: 'Exótica', spaces: 1, attack: { base: 'luta-for', damage: '1d10', critical: '19', damageType: 'Corte' } },
  { id: 'katana', name: 'Katana', category: 'Armas', proficiency: 'Exótica', spaces: 1, attack: { base: 'luta-for', damage: '1d8', critical: '19', damageType: 'Corte' } },
  { id: 'machado-anao', name: 'Machado anão', category: 'Armas', proficiency: 'Exótica', spaces: 1, attack: { base: 'luta-for', damage: '1d10', critical: 'x3', damageType: 'Corte' } },
  { id: 'corrente-de-espinhos', name: 'Corrente de espinhos', category: 'Armas', proficiency: 'Exótica', spaces: 2, attack: { base: 'luta-for', damage: '2d4', critical: '19', damageType: 'Corte' } },
  { id: 'machado-taurico', name: 'Machado táurico', category: 'Armas', proficiency: 'Exótica', spaces: 2, attack: { base: 'luta-for', damage: '2d8', critical: 'x3', damageType: 'Corte' } },
  { id: 'rede', name: 'Rede', category: 'Armas', proficiency: 'Exótica', spaces: 1, attack: { base: 'pontaria-des', damage: '', range: 'Curto (9m)' } },
  // Armas de Fogo
  { id: 'pistola', name: 'Pistola', category: 'Armas', proficiency: 'de Fogo', spaces: 1, attack: { base: 'pontaria-des', damage: '2d6', critical: '19/x3', range: 'Curto (9m)', damageType: 'Perfuração' } },
  { id: 'mosquete', name: 'Mosquete', category: 'Armas', proficiency: 'de Fogo', spaces: 2, attack: { base: 'pontaria-des', damage: '2d8', critical: '19/x3', range: 'Médio (30m)', damageType: 'Perfuração' } },
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
export const ITEM_CATALOG_CATEGORIES = ['Armas', 'Armaduras', 'Escudos', 'Geral']
