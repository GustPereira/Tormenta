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
  // Geral (Tabela 3-6: Itens Gerais do Livro Básico). Espaços "—" no livro
  // (item vestido / não conta carga) viram 0.
  // Equipamento de Aventura
  { id: 'agua-benta', name: 'Água benta', category: 'Geral', spaces: 0.5 },
  { id: 'algemas', name: 'Algemas', category: 'Geral', spaces: 1 },
  { id: 'arpeu', name: 'Arpéu', category: 'Geral', spaces: 1 },
  { id: 'bandoleira-de-pocoes', name: 'Bandoleira de poções', category: 'Geral', spaces: 1 },
  { id: 'barraca', name: 'Barraca', category: 'Geral', spaces: 1 },
  { id: 'corda', name: 'Corda', category: 'Geral', spaces: 1 },
  { id: 'espelho', name: 'Espelho', category: 'Geral', spaces: 1 },
  { id: 'lampiao', name: 'Lampião', category: 'Geral', spaces: 1 },
  { id: 'mochila', name: 'Mochila', category: 'Geral', spaces: 0 },
  { id: 'mochila-de-aventureiro', name: 'Mochila de aventureiro', category: 'Geral', spaces: 0 },
  { id: 'oleo', name: 'Óleo', category: 'Geral', spaces: 0.5 },
  { id: 'organizador-de-pergaminhos', name: 'Organizador de pergaminhos', category: 'Geral', spaces: 1 },
  { id: 'pe-de-cabra', name: 'Pé de cabra', category: 'Geral', spaces: 1 },
  { id: 'saco-de-dormir', name: 'Saco de dormir', category: 'Geral', spaces: 1 },
  { id: 'simbolo-sagrado', name: 'Símbolo sagrado', category: 'Geral', spaces: 1 },
  { id: 'tocha', name: 'Tocha', category: 'Geral', spaces: 1 },
  { id: 'vara-de-madeira', name: 'Vara de madeira (3m)', category: 'Geral', spaces: 1 },
  // Ferramentas
  { id: 'alaude-elfico', name: 'Alaúde élfico', category: 'Geral', spaces: 1 },
  { id: 'colecao-de-livros', name: 'Coleção de livros', category: 'Geral', spaces: 1 },
  { id: 'equipamento-de-viagem', name: 'Equipamento de viagem', category: 'Geral', spaces: 1 },
  { id: 'estojo-de-disfarces', name: 'Estojo de disfarces', category: 'Geral', spaces: 1 },
  { id: 'flauta-mistica', name: 'Flauta mística', category: 'Geral', spaces: 1 },
  { id: 'gazua', name: 'Gazua', category: 'Geral', spaces: 1 },
  { id: 'instrumentos-de-oficio', name: 'Instrumentos de ofício', category: 'Geral', spaces: 1 },
  { id: 'instrumento-musical', name: 'Instrumento musical', category: 'Geral', spaces: 1 },
  { id: 'luneta', name: 'Luneta', category: 'Geral', spaces: 1 },
  { id: 'maleta-de-medicamentos', name: 'Maleta de medicamentos', category: 'Geral', spaces: 1 },
  { id: 'sela', name: 'Sela', category: 'Geral', spaces: 1 },
  { id: 'tambor-das-profundezas', name: 'Tambor das profundezas', category: 'Geral', spaces: 1 },
  // Vestuário
  { id: 'andrajos-de-aldeao', name: 'Andrajos de aldeão', category: 'Geral', spaces: 1 },
  { id: 'bandana', name: 'Bandana', category: 'Geral', spaces: 1 },
  { id: 'botas-reforcadas', name: 'Botas reforçadas', category: 'Geral', spaces: 1 },
  { id: 'camisa-bufante', name: 'Camisa bufante', category: 'Geral', spaces: 1 },
  { id: 'capa-esvoacante', name: 'Capa esvoaçante', category: 'Geral', spaces: 1 },
  { id: 'capa-pesada', name: 'Capa pesada', category: 'Geral', spaces: 1 },
  { id: 'casaco-longo', name: 'Casaco longo', category: 'Geral', spaces: 1 },
  { id: 'chapeu-arcano', name: 'Chapéu arcano', category: 'Geral', spaces: 1 },
  { id: 'enfeite-de-elmo', name: 'Enfeite de elmo', category: 'Geral', spaces: 1 },
  { id: 'farrapos-de-ermitao', name: 'Farrapos de ermitão', category: 'Geral', spaces: 1 },
  { id: 'gorro-de-ervas', name: 'Gorro de ervas', category: 'Geral', spaces: 1 },
  { id: 'luva-de-pelica', name: 'Luva de pelica', category: 'Geral', spaces: 1 },
  { id: 'manopla', name: 'Manopla', category: 'Geral', spaces: 1 },
  { id: 'manto-camuflado', name: 'Manto camuflado', category: 'Geral', spaces: 1 },
  { id: 'manto-eclesiastico', name: 'Manto eclesiástico', category: 'Geral', spaces: 1 },
  { id: 'robe-mistico', name: 'Robe místico', category: 'Geral', spaces: 1 },
  { id: 'sapatos-de-camurca', name: 'Sapatos de camurça', category: 'Geral', spaces: 1 },
  { id: 'tabardo', name: 'Tabardo', category: 'Geral', spaces: 1 },
  { id: 'traje-da-corte', name: 'Traje da corte', category: 'Geral', spaces: 1 },
  { id: 'traje-de-viajante', name: 'Traje de viajante', category: 'Geral', spaces: 0 },
  { id: 'veste-de-seda', name: 'Veste de seda', category: 'Geral', spaces: 1 },
  // Esotéricos
  { id: 'bolsa-de-po', name: 'Bolsa de pó', category: 'Geral', spaces: 1 },
  { id: 'cajado-arcano', name: 'Cajado arcano', category: 'Geral', spaces: 2 },
  { id: 'cetro-elemental', name: 'Cetro elemental', category: 'Geral', spaces: 1 },
  { id: 'costela-de-lich', name: 'Costela de lich', category: 'Geral', spaces: 1 },
  { id: 'dedo-de-ente', name: 'Dedo de ente', category: 'Geral', spaces: 1 },
  { id: 'luva-de-ferro', name: 'Luva de ferro', category: 'Geral', spaces: 1 },
  { id: 'medalhao-de-prata', name: 'Medalhão de prata', category: 'Geral', spaces: 1 },
  { id: 'orbe-cristalina', name: 'Orbe cristalina', category: 'Geral', spaces: 1 },
  { id: 'tomo-hermetico', name: 'Tomo hermético', category: 'Geral', spaces: 1 },
  { id: 'varinha-arcana', name: 'Varinha arcana', category: 'Geral', spaces: 1 },
  // Alquímicos — Preparados
  { id: 'acido', name: 'Ácido', category: 'Geral', spaces: 0.5 },
  { id: 'balsamo-restaurador', name: 'Bálsamo restaurador', category: 'Geral', spaces: 0.5 },
  { id: 'bomba', name: 'Bomba', category: 'Geral', spaces: 0.5 },
  { id: 'cosmetico', name: 'Cosmético', category: 'Geral', spaces: 0.5 },
  { id: 'elixir-do-amor', name: 'Elixir do amor', category: 'Geral', spaces: 0.5 },
  { id: 'essencia-de-mana', name: 'Essência de mana', category: 'Geral', spaces: 0.5 },
  { id: 'fogo-alquimico', name: 'Fogo alquímico', category: 'Geral', spaces: 0.5 },
  { id: 'po-do-desaparecimento', name: 'Pó do desaparecimento', category: 'Geral', spaces: 0.5 },
  // Alquímicos — Catalisadores
  { id: 'baga-de-fogo', name: 'Baga-de-fogo', category: 'Geral', spaces: 0.5 },
  { id: 'dente-de-dragao', name: 'Dente-de-dragão', category: 'Geral', spaces: 0.5 },
  { id: 'essencia-abissal', name: 'Essência abissal', category: 'Geral', spaces: 0.5 },
  { id: 'liquen-lilas', name: 'Líquen lilás', category: 'Geral', spaces: 0.5 },
  { id: 'musgo-purpura', name: 'Musgo púrpura', category: 'Geral', spaces: 0.5 },
  { id: 'ossos-de-monstro', name: 'Ossos de monstro', category: 'Geral', spaces: 0.5 },
  { id: 'po-de-cristal', name: 'Pó de cristal', category: 'Geral', spaces: 0.5 },
  { id: 'po-de-giz', name: 'Pó de giz', category: 'Geral', spaces: 0.5 },
  { id: 'ramo-verdejante', name: 'Ramo verdejante', category: 'Geral', spaces: 0.5 },
  { id: 'saco-de-sal', name: 'Saco de sal', category: 'Geral', spaces: 0.5 },
  { id: 'seixo-de-ambar', name: 'Seixo de âmbar', category: 'Geral', spaces: 0.5 },
  { id: 'terra-de-cemiterio', name: 'Terra de cemitério', category: 'Geral', spaces: 0.5 },
  // Alquímicos — Venenos
  { id: 'beladona', name: 'Beladona', category: 'Geral', spaces: 0.5 },
  { id: 'bruma-sonolenta', name: 'Bruma sonolenta', category: 'Geral', spaces: 0.5 },
  { id: 'cicuta', name: 'Cicuta', category: 'Geral', spaces: 0.5 },
  { id: 'essencia-de-sombra', name: 'Essência de sombra', category: 'Geral', spaces: 0.5 },
  { id: 'nevoa-toxica', name: 'Névoa tóxica', category: 'Geral', spaces: 0.5 },
  { id: 'peconha-comum', name: 'Peçonha comum', category: 'Geral', spaces: 0.5 },
  { id: 'peconha-concentrada', name: 'Peçonha concentrada', category: 'Geral', spaces: 0.5 },
  { id: 'peconha-potente', name: 'Peçonha potente', category: 'Geral', spaces: 0.5 },
  { id: 'po-de-lich', name: 'Pó de lich', category: 'Geral', spaces: 0.5 },
  { id: 'riso-de-nimb', name: 'Riso de Nimb', category: 'Geral', spaces: 0.5 },
  // Alimentação
  { id: 'batata-valkariana', name: 'Batata valkariana', category: 'Geral', spaces: 0.5 },
  { id: 'gorad-quente', name: 'Gorad quente', category: 'Geral', spaces: 0.5 },
  { id: 'macarrao-de-yuvalin', name: 'Macarrão de Yuvalin', category: 'Geral', spaces: 0.5 },
  { id: 'prato-do-aventureiro', name: 'Prato do aventureiro', category: 'Geral', spaces: 0.5 },
  { id: 'racao-de-viagem', name: 'Ração de viagem (por dia)', category: 'Geral', spaces: 0.5 },
  { id: 'refeicao-comum', name: 'Refeição comum', category: 'Geral', spaces: 0.5 },
  { id: 'sopa-de-peixe', name: 'Sopa de peixe', category: 'Geral', spaces: 0.5 },
]

/** Categorias na ordem de exibição. */
export const ITEM_CATALOG_CATEGORIES = ['Armas', 'Armaduras', 'Escudos', 'Geral']
