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
  // (item vestido / não conta carga) viram 0. Descrições do próprio livro.
  // Equipamento de Aventura
  { id: 'agua-benta', name: 'Água benta', category: 'Geral', spaces: 0.5, description: 'Produzida com a magia Abençoar Alimentos, esta água sagrada é um poderoso recurso na luta contra o mal. Para usar a água benta, você gasta uma ação padrão e escolhe um morto-vivo, demônio ou diabo em alcance curto (a água benta é inofensiva contra outras criaturas). O alvo sofre 2d10 pontos de dano de luz (Reflexos CD Sab reduz à metade).' },
  { id: 'algemas', name: 'Algemas', category: 'Geral', spaces: 1, description: 'Um par de algemas para criaturas Médias. Prender uma criatura que não esteja indefesa exige empunhar a algema, agarrar o alvo (veja "Manobras de Combate", no Capítulo 5) e vencer um novo teste de agarrar contra ela. Você pode prender os dois pulsos da pessoa (–5 em testes que exijam o uso das mãos, impede conjuração) ou um dos pulsos dela em um objeto imóvel adjacente, caso haja, para impedir que ela se mova. Escapar das algemas exige uma ação completa e um teste de Acrobacia contra CD 30 ou de Força contra CD 25 — ou ter as chaves...' },
  { id: 'arpeu', name: 'Arpéu', category: 'Geral', spaces: 1, description: 'Um gancho de aço amarrado na ponta de uma corda para se fixar em muros, janelas, parapeitos de prédios... Prender um arpéu exige um teste de Pontaria (CD 15). Subir um muro com a ajuda de uma corda fornece +5 no teste de Atletismo.' },
  { id: 'bandoleira-de-pocoes', name: 'Bandoleira de poções', category: 'Geral', spaces: 1, description: 'Um cinto de couro com bolsos que comportam pequenos frascos. Se você estiver vestindo uma bandoleira, pode sacar itens alquímicos e poções como uma ação livre.' },
  { id: 'barraca', name: 'Barraca', category: 'Geral', spaces: 1, description: 'Esta barraca de lona conta como um saco de dormir para duas pessoas e fornece +2 em testes de Sobrevivência para acampar.' },
  { id: 'corda', name: 'Corda', category: 'Geral', spaces: 1, description: 'Um rolo com 10 metros de corda de cânhamo, o mesmo tipo usado em navios. Possui diversas utilidades: pode ajudar a descer um buraco ou muro (+5 em testes de Atletismo nessas situações), amarrar pessoas etc. Dar um nó firme ou especial (por exemplo, capaz de deslizar, se desfazer com um puxão etc.) exige um teste de Destreza (CD 15). Arrebentar a corda exige 2 pontos de dano de corte ou uma ação padrão e um teste de Força (CD 20).' },
  { id: 'espelho', name: 'Espelho', category: 'Geral', spaces: 1, description: 'Este pequeno espelho possui diversas utilidades: observar cantos, fazer sinais de luz e, claro, garantir que você esteja apresentável.' },
  { id: 'lampiao', name: 'Lampião', category: 'Geral', spaces: 1, description: 'Um cilindro com uma alça e duas portinholas. Uma chama alimentada por óleo é acesa dentro do cilindro e uma das portinholas aberta deixa a luz sair. Acender um lampião é uma ação padrão e sua luz ilumina um raio com 15m. Carregar um lampião com óleo é uma ação padrão e ele dura uma cena.' },
  { id: 'mochila', name: 'Mochila', category: 'Geral', spaces: 0, description: 'Uma bolsa de lona com tiras para ser carregada nas costas. Não conta como item vestido.' },
  { id: 'mochila-de-aventureiro', name: 'Mochila de aventureiro', category: 'Geral', spaces: 0, description: 'Feita de couro resistente, esta mochila é repleta de bolsos para prender equipamento. Vestir uma mochila de aventureiro aumenta sua capacidade de carga em 2 espaços (ela própria não gasta um espaço).' },
  { id: 'oleo', name: 'Óleo', category: 'Geral', spaces: 0.5, description: 'Um frasco com óleo inflamável para lampião. Você pode atirar o frasco em uma criatura em alcance curto com uma ação padrão. Se ela sofrer dano de fogo até o fim do seu próximo turno, sofre 1d6 pontos de dano extra e fica em chamas.' },
  { id: 'organizador-de-pergaminhos', name: 'Organizador de pergaminhos', category: 'Geral', spaces: 1, description: 'Um estojo de madeira ou couro rígido. Se você estiver vestindo um organizador de pergaminhos, pode sacar pergaminhos como uma ação livre.' },
  { id: 'pe-de-cabra', name: 'Pé de cabra', category: 'Geral', spaces: 1, description: 'Esta barra de ferro fornece +5 em testes de Força para abrir portas, janelas e baús fechados. Um pé de cabra pode ser usado como arma, com as estatísticas de uma clava.' },
  { id: 'saco-de-dormir', name: 'Saco de dormir', category: 'Geral', spaces: 1, description: 'Um colchão com uma coberta fina o bastante para ser enrolada e amarrada, é especialmente útil para aventureiros, que nunca sabem onde vão passar a noite. Dormir ao relento sem um acampamento e um saco de dormir diminui sua recuperação de PV e PM (veja a página 106).' },
  { id: 'simbolo-sagrado', name: 'Símbolo sagrado', category: 'Geral', spaces: 1, description: 'Um medalhão de madeira ou metal com o símbolo de uma divindade. Se você estiver vestindo (normalmente com uma corrente ao redor do pescoço) ou empunhando o símbolo sagrado de um deus do qual é devoto, recebe +1 em testes de resistência.' },
  { id: 'tocha', name: 'Tocha', category: 'Geral', spaces: 1, description: 'Um bastão de madeira com algum combustível na ponta (geralmente trapos embebidos em parafina). Acender uma tocha é uma ação padrão. Ela ilumina um raio de 9m e dura uma cena. Pode ser usada como uma arma simples leve (dano 1d4 de impacto mais 1 de fogo, crítico x2).' },
  { id: 'vara-de-madeira', name: 'Vara de madeira (3m)', category: 'Geral', spaces: 1, description: 'Uma haste com 3m de comprimento. Útil para alcançar pontos distantes, mas frágil demais para servir como arma.' },
  // Ferramentas
  { id: 'alaude-elfico', name: 'Alaúde élfico', category: 'Geral', spaces: 1, description: 'Feito com madeira de alta qualidade e manufatura delicada, este alaúde gera notas vívidas e emocionantes. Enquanto empunha este item, você pode usar a habilidade Inspiração como uma ação de movimento. Conta como um instrumento musical.' },
  { id: 'colecao-de-livros', name: 'Coleção de livros', category: 'Geral', spaces: 1, description: 'Uma pequena coleção de tomos e tratados sobre um assunto. Fornece +1 em Conhecimento, Guerra, Misticismo, Nobreza ou Religião (definido quando o item é comprado ou fabricado).' },
  { id: 'equipamento-de-viagem', name: 'Equipamento de viagem', category: 'Geral', spaces: 1, description: 'Um saco de lona contendo instrumentos úteis para sobreviver nos ermos, como pederneira (pedra para fazer fogo), panelas e talheres para cozinhar, anzól e linha para pescar e uma pequena pá. Um personagem sem este item sofre –5 em testes de Sobrevivência para fazer um acampamento. Não inclui saco de dormir ou barraca.' },
  { id: 'estojo-de-disfarces', name: 'Estojo de disfarces', category: 'Geral', spaces: 1, description: 'Um conjunto de cosméticos, tintas para cabelo e algumas próteses simples (como bigodes e narizes falsos). Um personagem sem este item sofre –5 em testes de Enganação para disfarce.' },
  { id: 'flauta-mistica', name: 'Flauta mística', category: 'Geral', spaces: 1, description: 'Um instrumento delicado, repleto de runas e pequenas gemas místicas. Um bardo que empunhe este item aumenta a CD para resistir às magias lançadas por ele em +1. Conta como um instrumento musical.' },
  { id: 'gazua', name: 'Gazua', category: 'Geral', spaces: 1, description: 'Uma barra fina de ferro, com a ponta torta ou em forma de gancho. Um personagem sem este item sofre –5 em testes de Ladinagem para abrir fechaduras.' },
  { id: 'instrumentos-de-oficio', name: 'Instrumentos de ofício', category: 'Geral', spaces: 1, description: 'Existe uma versão deste item para cada perícia de Ofício. Por exemplo, martelo, pregos e serrote para Ofício (carpinteiro), pergaminhos em branco, tinta e pena para Ofício (escriba) e assim por diante. Um personagem sem os instrumentos de seu Ofício sofre –5 nessa perícia.' },
  { id: 'instrumento-musical', name: 'Instrumento musical', category: 'Geral', spaces: 1, description: 'Um instrumento típico, como um bandolim, flauta ou lira. Você precisa empunhá-lo com as duas mãos para receber seus benefícios e para usar Músicas de Bardo. Pode ser usado como esotérico por bardos.' },
  { id: 'luneta', name: 'Luneta', category: 'Geral', spaces: 1, description: 'Este instrumento valioso consiste de um cilindro metálico com duas lentes. Fornece +5 em testes de Percepção para observar coisas em alcance longo ou além.' },
  { id: 'maleta-de-medicamentos', name: 'Maleta de medicamentos', category: 'Geral', spaces: 1, description: 'Caixa de madeira com ervas, unguentos, bandagens e outros materiais úteis. Um personagem sem este item sofre –5 em Cura.' },
  { id: 'sela', name: 'Sela', category: 'Geral', spaces: 1, description: 'Uma peça de couro e pelego colocada sobre o lombo da montaria, sobre a qual o cavaleiro se senta. Inclui arreios para conduzir o animal. Um personagem montado em uma montaria sem sela sofre –5 em testes de Cavalgar. Usada no animal, a sela não ocupa espaço de carga do personagem.' },
  { id: 'tambor-das-profundezas', name: 'Tambor das profundezas', category: 'Geral', spaces: 1, description: 'Um instrumento típico de anões de Doherimm, capaz de sons graves e retumbantes. Enquanto empunha este item, o alcance da habilidade Inspiração e de qualquer Música de Bardo é dobrado. Conta como um instrumento musical.' },
  // Vestuário
  { id: 'andrajos-de-aldeao', name: 'Andrajos de aldeão', category: 'Geral', spaces: 1, description: 'Roupas típicas de camponês. Consiste de camisa larga e calças soltas ou blusa e saia e não inclui botas — os mais pobres andam descalços. Fornece +2 em testes de Investigação para interrogar (ninguém se importa com o que um aldeão escuta) e, se você possuir o poder Aparência Inofensiva, a CD para resistir a ele aumenta em +2. Porém, impõe –2 em perícias baseadas em Carisma contra pessoas que se importam com classe social.' },
  { id: 'bandana', name: 'Bandana', category: 'Geral', spaces: 1, description: 'Um lenço tipicamente usado por bandidos e piratas. Fornece +1 em Intimidação.' },
  { id: 'botas-reforcadas', name: 'Botas reforçadas', category: 'Geral', spaces: 1, description: 'Grossas e resistentes, estas botas de cano alto protegem contra perigos do terreno. Aumentam seu deslocamento em +1,5m se ele for reduzido por terreno difícil (após a redução).' },
  { id: 'camisa-bufante', name: 'Camisa bufante', category: 'Geral', spaces: 1, description: 'Blusa colorida, com mangas e golas longas e encrespadas. Fornece +1 em Atuação.' },
  { id: 'capa-esvoacante', name: 'Capa esvoaçante', category: 'Geral', spaces: 1, description: 'Favorita entre heróis ousados, esta capa de seda produz movimentos amplos e chamativos, que fornecem +1 em Enganação.' },
  { id: 'capa-pesada', name: 'Capa pesada', category: 'Geral', spaces: 1, description: 'Uma capa de couro grossa e resistente. Protege e aquece o corpo, fornecendo +1 em Fortitude.' },
  { id: 'casaco-longo', name: 'Casaco longo', category: 'Geral', spaces: 1, description: 'Feito de peles ou couro grosso forrado com lã, e impermeabilizado com óleo, este casaco é quente e pesado. Fornece +5 em testes de Fortitude para resistir a efeitos de frio, mas impõe penalidade de armadura de –2.' },
  { id: 'chapeu-arcano', name: 'Chapéu arcano', category: 'Geral', spaces: 1, description: 'Com pinturas e bordados de símbolos místicos, este chapéu pontudo ajuda a canalizar energias mágicas. Ele fornece +1 ponto de mana, mas apenas se você possuir a habilidade de classe Caminho do Arcanista.' },
  { id: 'enfeite-de-elmo', name: 'Enfeite de elmo', category: 'Geral', spaces: 1, description: 'Um adorno chamativo, como crina de cavalo, plumas, asas ou um totem de animal. Fornece resistência a medo +2.' },
  { id: 'farrapos-de-ermitao', name: 'Farrapos de ermitão', category: 'Geral', spaces: 1, description: 'Trapos "adornados" com plantas e raízes. Uma pessoa vestindo farrapos de ermitão não parece muito civilizada, e sofre –2 em Diplomacia e em testes de Investigação para interrogar. Entretanto, recebe +2 em Adestramento.' },
  { id: 'gorro-de-ervas', name: 'Gorro de ervas', category: 'Geral', spaces: 1, description: 'Formado por duas camadas de tecido, este chapéu é preenchido com ervas preparadas para auxiliar a concentração do usuário. Fornece +1 em Vontade.' },
  { id: 'luva-de-pelica', name: 'Luva de pelica', category: 'Geral', spaces: 1, description: 'Estas luvas delicadas preservam o tato e impedem que o suor deixe os dedos escorregadios. Fornecem +1 em Ladinagem.' },
  { id: 'manopla', name: 'Manopla', category: 'Geral', spaces: 1, description: 'Luva metálica que permite socos mais perigosos — o dano de seus ataques desarmados torna-se letal. Uma manopla conta como uma arma para receber melhorias e encantos para usá-los em seus ataques desarmados.' },
  { id: 'manto-camuflado', name: 'Manto camuflado', category: 'Geral', spaces: 1, description: 'Um manto camuflado é feito para um tipo de terreno específico (veja a habilidade Explorador, na página 51). Por exemplo, um manto camuflado para floresta pode ser verde e marrom e coberto de folhas, enquanto um manto urbano pode ser cinza ou negro. Usar um manto camuflado no terreno correto fornece +2 em Furtividade.' },
  { id: 'manto-eclesiastico', name: 'Manto eclesiástico', category: 'Geral', spaces: 1, description: 'Um manto típico de igrejas e templos. Fornece +1 em Religião.' },
  { id: 'robe-mistico', name: 'Robe místico', category: 'Geral', spaces: 1, description: 'Um manto longo, adornado com temas arcanos. Fornece +1 em Misticismo.' },
  { id: 'sapatos-de-camurca', name: 'Sapatos de camurça', category: 'Geral', spaces: 1, description: 'Leves e resistentes, aprimoram o equilíbrio e a firmeza dos pés, fornecendo +1 em Acrobacia.' },
  { id: 'tabardo', name: 'Tabardo', category: 'Geral', spaces: 1, description: 'Uma peça de tecido usada como um colete, cobrindo o peito e as costas. Geralmente ostenta a heráldica de um reino, igreja, casa nobre ou ordem de cavaleiros. Fornece +1 em Diplomacia.' },
  { id: 'traje-da-corte', name: 'Traje da corte', category: 'Geral', spaces: 1, description: 'Roupas de luxo, feitas sob medida e adequadas à nobreza e realeza. Inclui algumas joias, como aneis e colares. Em certos ambientes (um baile, um salão de palácio), um personagem que não esteja vestindo este item sofre –5 em perícias baseadas em Carisma.' },
  { id: 'traje-de-viajante', name: 'Traje de viajante', category: 'Geral', spaces: 0, description: 'Inclui botas, calças ou saias, cinto, camisa de linho e capa com capuz. A roupa padrão de aventureiros.' },
  { id: 'veste-de-seda', name: 'Veste de seda', category: 'Geral', spaces: 1, description: 'Esta roupa leve e elegante deixa seus movimentos os mais livres possíveis. Fornece +1 em Reflexos.' },
  // Esotéricos
  { id: 'bolsa-de-po', name: 'Bolsa de pó', category: 'Geral', spaces: 1, description: 'Uma bolsa com pó multicolorido, fabricado a partir das pétalas trituradas de flores que nascem apenas na Pondsmânia. Quando lança uma magia de encantamento ou ilusão, você recebe +2 PM para gastar em aprimoramentos.' },
  { id: 'cajado-arcano', name: 'Cajado arcano', category: 'Geral', spaces: 2, description: 'Um cajado típico, feito de madeira de boa qualidade e entalhado com runas. O limite de PM que você pode gastar em magias arcanas e a CD para resistir a elas aumentam em +1. Para fornecer seus benefícios, um cajado precisa ser empunhado com as duas mãos. Ele pode ser usado como arma, com as estatísticas de um bordão.' },
  { id: 'cetro-elemental', name: 'Cetro elemental', category: 'Geral', spaces: 1, description: 'Este cetro possui uma pedra preciosa em sua ponta: esmeralda (ácido), topázio (eletricidade), rubi (fogo) ou safira (frio). Quando lança uma magia que causa dano do tipo da pedra, o dano aumenta em um dado do mesmo tipo.' },
  { id: 'costela-de-lich', name: 'Costela de lich', category: 'Geral', spaces: 1, description: 'Esta varinha é feita a partir do osso de um morto-vivo. Suas magias causam +1d6 pontos de dano de trevas. Se estiver empunhando esta varinha você não recupera PV por efeitos mágicos de cura.' },
  { id: 'dedo-de-ente', name: 'Dedo de ente', category: 'Geral', spaces: 1, description: 'Uma varinha feita da madeira de uma árvore senciente. Sempre que gastar pelo menos 1 PM para lançar uma magia, role 1d4. Com um resultado 4, você recupera 1 PM.' },
  { id: 'luva-de-ferro', name: 'Luva de ferro', category: 'Geral', spaces: 1, description: 'Um conjunto de dedais interligados por correntes. Suas magias arcanas pessoais que concedem bônus na Defesa ou em testes de resistências têm esse bônus aumentado em +1.' },
  { id: 'medalhao-de-prata', name: 'Medalhão de prata', category: 'Geral', spaces: 1, description: 'Gravado com uma runa pessoal do conjurador, este medalhão de prata diminui em –1 PM o custo de magias de alcance pessoal.' },
  { id: 'orbe-cristalina', name: 'Orbe cristalina', category: 'Geral', spaces: 1, description: 'Esta esfera perfeita concentra seu poder mágico. O limite de PM que você pode gastar em magias arcanas aumenta em +1.' },
  { id: 'tomo-hermetico', name: 'Tomo hermético', category: 'Geral', spaces: 1, description: 'Um livro de tratados que aumentam a sua compreensão sobre uma escola de magia específica. A CD para resistir a suas magias arcanas dessa escola aumenta em +2.' },
  { id: 'varinha-arcana', name: 'Varinha arcana', category: 'Geral', spaces: 1, description: 'Uma varinha típica, feita de madeira de boa qualidade e entalhada com runas. A CD para resistir a suas magias arcanas aumenta em +1.' },
  // Alquímicos — Preparados
  { id: 'acido', name: 'Ácido', category: 'Geral', spaces: 0.5, description: 'Frasco de vidro contendo um ácido alquímico altamente corrosivo. Para usar o ácido, você gasta uma ação padrão e escolhe uma criatura em alcance curto. Essa criatura sofre 2d4 pontos de dano de ácido (Reflexos CD Des reduz à metade).' },
  { id: 'balsamo-restaurador', name: 'Bálsamo restaurador', category: 'Geral', spaces: 0.5, description: 'Uma pasta verde e fedorenta, feita de ervas medicinais. Usá-la é uma ação completa e recupera 2d4 pontos de vida.' },
  { id: 'bomba', name: 'Bomba', category: 'Geral', spaces: 0.5, description: 'Uma granada rudimentar. Para usar a bomba, você precisa empunhá-la, gastar uma ação de movimento para acender seu pavio e uma ação padrão para arremessá-la em um ponto em alcance curto. Criaturas a até 3m desse ponto sofrem 6d6 pontos de dano de impacto (Reflexos CD Des reduz à metade).' },
  { id: 'cosmetico', name: 'Cosmético', category: 'Geral', spaces: 0.5, description: 'Perfume ou maquiagem. Usá-lo é uma ação completa e fornece +2 em testes de perícias baseadas em Carisma até o fim da cena.' },
  { id: 'elixir-do-amor', name: 'Elixir do amor', category: 'Geral', spaces: 0.5, description: 'Um humanoide que beba este líquido adocicado fica apaixonado pela primeira criatura que enxergar (condição enfeitiçado; Vontade CD Car anula). O efeito dura 1d3 dias.' },
  { id: 'essencia-de-mana', name: 'Essência de mana', category: 'Geral', spaces: 0.5, description: 'Esta poção feita de ervas raras e compostos alquímicos recupera energia pessoal. Beber a essência de mana é uma ação padrão e recupera 1d4 pontos de mana.' },
  { id: 'fogo-alquimico', name: 'Fogo alquímico', category: 'Geral', spaces: 0.5, description: 'Frasco de cerâmica contendo uma substância que entra em combustão em contato com o ar. Para usar o fogo alquímico, você gasta uma ação padrão e escolhe uma criatura em alcance curto. Essa criatura sofre 1d6 pontos de dano de fogo e fica em chamas. Um teste de Reflexos (CD Des) reduz o dano à metade e evita as chamas.' },
  { id: 'po-do-desaparecimento', name: 'Pó do desaparecimento', category: 'Geral', spaces: 0.5, description: 'Uma criatura ou objeto coberto por este pó torna-se invisível (como em Invisibilidade) por 2d6 rodadas. O usuário não sabe quando a invisibilidade vai terminar.' },
  // Alquímicos — Catalisadores
  { id: 'baga-de-fogo', name: 'Baga-de-fogo', category: 'Geral', spaces: 0.5, description: 'Pequeno fruto vermelho, apreciado por seu sabor picante. Usado como catalisador, adiciona +1d6 de dano de fogo a magias.' },
  { id: 'dente-de-dragao', name: 'Dente-de-dragão', category: 'Geral', spaces: 0.5, description: 'Uma flor comum em regiões montanhosas, especialmente nas Sanguinárias, possui formato parecido com uma presa de monstro. Suas propriedades místicas aumentam o dano de magias em um dado do mesmo tipo.' },
  { id: 'essencia-abissal', name: 'Essência abissal', category: 'Geral', spaces: 0.5, description: 'Um líquido espesso, produzido através do sangue de criaturas demoníacas. Aumenta os dados de dano de magias de fogo em uma categoria — d4 para d6, d6 para d8, d8 para d10 e d10 para d12 (o máximo).' },
  { id: 'liquen-lilas', name: 'Líquen lilás', category: 'Geral', spaces: 0.5, description: 'Esta estranha planta tem aspecto cristalino e cresce em abundância na região das Uivantes. Adiciona +1d6 de dano de frio a magias.' },
  { id: 'musgo-purpura', name: 'Musgo púrpura', category: 'Geral', spaces: 0.5, description: 'Encontrado em florestas fechadas, esse fungo cintilante possui propriedades que fornecem +2 na CD de magias de ilusão.' },
  { id: 'ossos-de-monstro', name: 'Ossos de monstro', category: 'Geral', spaces: 0.5, description: 'Pequenas falanges de criaturas monstruosas, tratadas com óleos alquímicos. Fornece +2 na CD de magias de necromancia.' },
  { id: 'po-de-cristal', name: 'Pó de cristal', category: 'Geral', spaces: 0.5, description: 'Uma pitada de pó de um mineral cristalino puro, como quartzo ou topázio. Diminui o custo de magias de encantamento em –1 PM.' },
  { id: 'po-de-giz', name: 'Pó de giz', category: 'Geral', spaces: 0.5, description: 'Calcário esmagado em pó, uma substância comum que, usada como catalisador, diminui o custo de magias de convocação em –1 PM.' },
  { id: 'ramo-verdejante', name: 'Ramo verdejante', category: 'Geral', spaces: 0.5, description: 'Esta combinação de ervas potencializa magias de cura, aumentando sua cura em +1 PV por dado.' },
  { id: 'saco-de-sal', name: 'Saco de sal', category: 'Geral', spaces: 0.5, description: 'Um pequeno saco de couro com sal marinho. Fornece +2 na CD de magias de abjuração.' },
  { id: 'seixo-de-ambar', name: 'Seixo de âmbar', category: 'Geral', spaces: 0.5, description: 'Essa "gema" feita de seiva de árvore fossilizada diminui o custo de magias de transmutação em –1 PM.' },
  { id: 'terra-de-cemiterio', name: 'Terra de cemitério', category: 'Geral', spaces: 0.5, description: 'Um punhado de terra cinzenta, colhida à noite de um cemitério. Adiciona +1d6 de dano de trevas a magias.' },
  // Alquímicos — Venenos
  { id: 'beladona', name: 'Beladona', category: 'Geral', spaces: 0.5, description: 'Planta extremamente tóxica que afeta o sistema nervoso da vítima. Ingestão, vítima fica paralisada (lenta) por 3 rodadas. A CD para fabricar e para resistir a este veneno aumenta em +5.' },
  { id: 'bruma-sonolenta', name: 'Bruma sonolenta', category: 'Geral', spaces: 0.5, description: 'Um gás sonífero. Inalação, vítima fica inconsciente (enjoada por 1 rodada).' },
  { id: 'cicuta', name: 'Cicuta', category: 'Geral', spaces: 0.5, description: 'Planta cuja ingestão pode causar náusea, dores e até morte. Ingestão, perde 1d12 PV por rodada durante 3 rodadas (perde 1d12 PV).' },
  { id: 'essencia-de-sombra', name: 'Essência de sombra', category: 'Geral', spaces: 0.5, description: 'Produzido a partir de compostos alquímicos que canalizam energia de trevas. Contato, vítima fica debilitada (fraca).' },
  { id: 'nevoa-toxica', name: 'Névoa tóxica', category: 'Geral', spaces: 0.5, description: 'Este gás verde queima e corrói a pele e os pulmões. Inalação, perde 1d12 PV por rodada durante 3 rodadas (perde 1d12 PV).' },
  { id: 'peconha-comum', name: 'Peçonha comum', category: 'Geral', spaces: 0.5, description: 'Veneno típico, extraído de animais ou plantas tóxicas. Contato, perde 1d12 PV.' },
  { id: 'peconha-concentrada', name: 'Peçonha concentrada', category: 'Geral', spaces: 0.5, description: 'Dose concentrada da peçonha comum. Contato, perde 1d12 PV por rodada durante 3 rodadas (perde 1d12 PV).' },
  { id: 'peconha-potente', name: 'Peçonha potente', category: 'Geral', spaces: 0.5, description: 'Veneno poderoso, extraído de animais ou plantas perigosos. Contato, perde 2d12 PV por rodada durante 3 rodadas (perde 2d12 PV).' },
  { id: 'po-de-lich', name: 'Pó de lich', category: 'Geral', spaces: 0.5, description: 'Veneno letal, usado para assassinar alvos poderosos. Ingestão, perde 4d12 PV por rodada durante 5 rodadas (perde 4d12 PV). A CD para fabricar e para resistir a este veneno aumenta em +5.' },
  { id: 'riso-de-nimb', name: 'Riso de Nimb', category: 'Geral', spaces: 0.5, description: 'Este gás púrpura faz a vítima rir descontroladamente e agir de forma caótica. Inalação, vítima fica confusa (lenta por 1 rodada).' },
  // Alimentação
  { id: 'batata-valkariana', name: 'Batata valkariana', category: 'Geral', spaces: 0.5, description: 'Batatas cortadas em tiras e mergulhadas em óleo fervente. Gordurentas e pouco nutritivas, são o tipo de prato que só é servido numa metrópole como Valkaria. Apesar disso, são gostosas e deixam qualquer um empolgado. Você recebe +1d6 em um teste a sua escolha realizado até o fim do dia.' },
  { id: 'gorad-quente', name: 'Gorad quente', category: 'Geral', spaces: 0.5, description: 'Gorad e leite, servidos quentes. Não tem erro. O gorad ativa o cérebro, fornecendo +2 PM temporários.' },
  { id: 'macarrao-de-yuvalin', name: 'Macarrão de Yuvalin', category: 'Geral', spaces: 0.5, description: 'Prato reforçado (macarrão, bacon e creme de leite) criado pelos mineradores de Yuvalin, em Zakharov, para encarar árduas jornadas de trabalho. Você recebe +5 PV temporários.' },
  { id: 'prato-do-aventureiro', name: 'Prato do aventureiro', category: 'Geral', spaces: 0.5, description: 'Um cozido de galinha com legumes, esta é uma refeição simples, mas nutritiva. Em sua próxima noite de sono, você aumenta a sua recuperação de pontos de vida em +1 por nível.' },
  { id: 'racao-de-viagem', name: 'Ração de viagem (por dia)', category: 'Geral', spaces: 0.5, description: 'Própria para viagens, uma porção desta ração alimenta uma pessoa por um dia. É feita de alimentos conservados, como carne defumada, frutas secas, pão, queijo e biscoitos. Se mantida seca dura bastante, mas quando molhada se estraga em 24 horas.' },
  { id: 'refeicao-comum', name: 'Refeição comum', category: 'Geral', spaces: 0.5, description: 'Uma refeição típica inclui pão, queijo, cozido de carne ou galinha com legumes e uma caneca de bebida, geralmente cidra, vinho ou cerveja.' },
  { id: 'sopa-de-peixe', name: 'Sopa de peixe', category: 'Geral', spaces: 0.5, description: 'Um cozido de peixe com verduras. É um prato humilde, mas garante um descanso relaxante. Em sua próxima noite de sono, você aumenta a sua recuperação de pontos de mana em +1 por nível.' },
]

/** Categorias na ordem de exibição. */
export const ITEM_CATALOG_CATEGORIES = ['Armas', 'Armaduras', 'Escudos', 'Geral']
