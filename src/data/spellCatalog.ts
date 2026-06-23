import type { DurationKey, SpellType } from '../schema'

/** Magia pré-criada do catálogo (semeada do Livro Básico). */
export interface CatalogSpell {
  id: string
  name: string
  circle: number
  type: Exclude<SpellType, ''>
  /** Escola de magia (Abjuração, Evocação, Necromancia…). */
  school: string
  /** Execução (ação de conjuração). */
  action: string
  /** Alcance (Pessoal, Toque, Curto, Médio, Longo). */
  range: string
  /** Alvo, Área ou Efeito. */
  target: string
  duration: DurationKey
  /** Resistência (ex.: "Vontade anula"). Vazio = nenhuma. */
  resistance: string
}

/** Escolas de magia do T20 (para o filtro do catálogo). */
export const SPELL_SCHOOLS = [
  'Abjuração',
  'Adivinhação',
  'Convocação',
  'Encantamento',
  'Evocação',
  'Ilusão',
  'Necromancia',
  'Transmutação',
] as const

/**
 * Catálogo de magias de 1º círculo (arcanas, divinas e universais) do Livro
 * Básico. Os campos (tipo, escola, execução, alcance, alvo/área, duração,
 * resistência) vêm da descrição de cada magia. Durações fora do enum (1 turno,
 * permanente) são mapeadas para o valor mais próximo (Rodada/Dia).
 */
export const SPELL_CATALOG: CatalogSpell[] = [
  { id: 'abencoar-alimentos', name: 'Abençoar Alimentos', circle: 1, type: 'Divina', school: 'Transmutação', action: 'Padrão', range: 'Curto', target: 'alimento para 1 criatura', duration: 'Cena', resistance: '' },
  { id: 'acalmar-animal', name: 'Acalmar Animal', circle: 1, type: 'Divina', school: 'Encantamento', action: 'Padrão', range: 'Curto', target: '1 animal', duration: 'Cena', resistance: 'Vontade anula' },
  { id: 'adaga-mental', name: 'Adaga Mental', circle: 1, type: 'Arcana', school: 'Encantamento', action: 'Padrão', range: 'Curto', target: '1 criatura', duration: 'Instantânea', resistance: 'Vontade parcial' },
  { id: 'alarme', name: 'Alarme', circle: 1, type: 'Arcana', school: 'Abjuração', action: 'Padrão', range: 'Curto', target: 'esfera com 9m de raio', duration: 'Dia', resistance: '' },
  { id: 'amedrontar', name: 'Amedrontar', circle: 1, type: 'Arcana', school: 'Necromancia', action: 'Padrão', range: 'Curto', target: '1 animal ou humanoide', duration: 'Cena', resistance: 'Vontade parcial' },
  { id: 'area-escorregadia', name: 'Área Escorregadia', circle: 1, type: 'Arcana', school: 'Convocação', action: 'Padrão', range: 'Curto', target: 'quadrado de 3m ou 1 objeto', duration: 'Cena', resistance: 'Reflexos (veja texto)' },
  { id: 'arma-espiritual', name: 'Arma Espiritual', circle: 1, type: 'Divina', school: 'Convocação', action: 'Padrão', range: 'Pessoal', target: 'você', duration: 'Cena', resistance: '' },
  { id: 'arma-magica', name: 'Arma Mágica', circle: 1, type: 'Universal', school: 'Transmutação', action: 'Padrão', range: 'Toque', target: '1 arma empunhada', duration: 'Cena', resistance: '' },
  { id: 'armadura-arcana', name: 'Armadura Arcana', circle: 1, type: 'Arcana', school: 'Abjuração', action: 'Padrão', range: 'Pessoal', target: 'você', duration: 'Cena', resistance: '' },
  { id: 'armamento-da-natureza', name: 'Armamento da Natureza', circle: 1, type: 'Divina', school: 'Transmutação', action: 'Padrão', range: 'Toque', target: '1 arma (veja texto)', duration: 'Cena', resistance: '' },
  { id: 'aviso', name: 'Aviso', circle: 1, type: 'Universal', school: 'Adivinhação', action: 'Movimento', range: 'Longo', target: '1 criatura', duration: 'Instantânea', resistance: '' },
  { id: 'bencao', name: 'Bênção', circle: 1, type: 'Divina', school: 'Encantamento', action: 'Padrão', range: 'Curto', target: 'aliados', duration: 'Cena', resistance: '' },
  { id: 'caminhos-da-natureza', name: 'Caminhos da Natureza', circle: 1, type: 'Divina', school: 'Convocação', action: 'Padrão', range: 'Curto', target: 'criaturas escolhidas', duration: 'Dia', resistance: '' },
  { id: 'comando', name: 'Comando', circle: 1, type: 'Divina', school: 'Encantamento', action: 'Padrão', range: 'Curto', target: '1 humanoide', duration: 'Rodada', resistance: 'Vontade anula' },
  { id: 'compreensao', name: 'Compreensão', circle: 1, type: 'Universal', school: 'Adivinhação', action: 'Padrão', range: 'Toque', target: '1 criatura ou texto', duration: 'Cena', resistance: 'Vontade anula (veja descrição)' },
  { id: 'concentracao-de-combate', name: 'Concentração de Combate', circle: 1, type: 'Arcana', school: 'Adivinhação', action: 'Livre', range: 'Pessoal', target: 'você', duration: 'Rodada', resistance: '' },
  { id: 'conjurar-monstro', name: 'Conjurar Monstro', circle: 1, type: 'Arcana', school: 'Convocação', action: 'Completa', range: 'Curto', target: '1 criatura conjurada', duration: 'Sustentada', resistance: '' },
  { id: 'consagrar', name: 'Consagrar', circle: 1, type: 'Divina', school: 'Evocação', action: 'Padrão', range: 'Longo', target: 'esfera com 9m de raio', duration: 'Dia', resistance: '' },
  { id: 'controlar-plantas', name: 'Controlar Plantas', circle: 1, type: 'Divina', school: 'Transmutação', action: 'Padrão', range: 'Curto', target: 'quadrado com 9m de lado', duration: 'Cena', resistance: 'Reflexos anula' },
  { id: 'criar-elementos', name: 'Criar Elementos', circle: 1, type: 'Divina', school: 'Convocação', action: 'Padrão', range: 'Curto', target: 'elemento escolhido', duration: 'Instantânea', resistance: '' },
  { id: 'criar-ilusao', name: 'Criar Ilusão', circle: 1, type: 'Arcana', school: 'Ilusão', action: 'Padrão', range: 'Médio', target: 'ilusão que se estende a até 4 cubos de 1,5m', duration: 'Cena', resistance: 'Vontade desacredita' },
  { id: 'curar-ferimentos', name: 'Curar Ferimentos', circle: 1, type: 'Divina', school: 'Evocação', action: 'Padrão', range: 'Toque', target: '1 criatura', duration: 'Instantânea', resistance: '' },
  { id: 'despedacar', name: 'Despedaçar', circle: 1, type: 'Divina', school: 'Evocação', action: 'Padrão', range: 'Curto', target: '1 criatura ou objeto mundano Pequeno', duration: 'Instantânea', resistance: 'Fortitude parcial' },
  { id: 'detectar-ameacas', name: 'Detectar Ameaças', circle: 1, type: 'Divina', school: 'Adivinhação', action: 'Padrão', range: 'Pessoal', target: 'esfera com 18m de raio', duration: 'Cena', resistance: '' },
  { id: 'disfarce-ilusorio', name: 'Disfarce Ilusório', circle: 1, type: 'Arcana', school: 'Ilusão', action: 'Padrão', range: 'Pessoal', target: 'você', duration: 'Cena', resistance: 'Vontade desacredita' },
  { id: 'enfeiticar', name: 'Enfeitiçar', circle: 1, type: 'Arcana', school: 'Encantamento', action: 'Padrão', range: 'Curto', target: '1 humanoide', duration: 'Cena', resistance: 'Vontade anula' },
  { id: 'escudo-da-fe', name: 'Escudo da Fé', circle: 1, type: 'Divina', school: 'Abjuração', action: 'Reação', range: 'Curto', target: '1 criatura', duration: 'Rodada', resistance: '' },
  { id: 'escuridao', name: 'Escuridão', circle: 1, type: 'Universal', school: 'Necromancia', action: 'Padrão', range: 'Curto', target: '1 objeto', duration: 'Cena', resistance: 'Vontade anula (veja texto)' },
  { id: 'explosao-de-chamas', name: 'Explosão de Chamas', circle: 1, type: 'Arcana', school: 'Evocação', action: 'Padrão', range: 'Pessoal', target: 'cone de 6m', duration: 'Instantânea', resistance: 'Reflexos reduz à metade' },
  { id: 'imagem-espelhada', name: 'Imagem Espelhada', circle: 1, type: 'Arcana', school: 'Ilusão', action: 'Padrão', range: 'Pessoal', target: 'você', duration: 'Cena', resistance: '' },
  { id: 'infligir-ferimentos', name: 'Infligir Ferimentos', circle: 1, type: 'Divina', school: 'Necromancia', action: 'Padrão', range: 'Toque', target: '1 criatura', duration: 'Instantânea', resistance: 'Fortitude reduz à metade' },
  { id: 'leque-cromatico', name: 'Leque Cromático', circle: 1, type: 'Arcana', school: 'Ilusão', action: 'Padrão', range: 'Pessoal', target: 'cone de 4,5m', duration: 'Instantânea', resistance: 'Vontade parcial' },
  { id: 'luz', name: 'Luz', circle: 1, type: 'Universal', school: 'Evocação', action: 'Padrão', range: 'Curto', target: '1 objeto', duration: 'Cena', resistance: 'Vontade anula (veja texto)' },
  { id: 'nevoa', name: 'Névoa', circle: 1, type: 'Universal', school: 'Convocação', action: 'Padrão', range: 'Curto', target: 'nuvem com 6m de raio e 6m de altura', duration: 'Cena', resistance: '' },
  { id: 'orientacao', name: 'Orientação', circle: 1, type: 'Divina', school: 'Adivinhação', action: 'Padrão', range: 'Curto', target: '1 criatura', duration: 'Rodada', resistance: '' },
  { id: 'perdicao', name: 'Perdição', circle: 1, type: 'Divina', school: 'Necromancia', action: 'Padrão', range: 'Curto', target: 'criaturas escolhidas', duration: 'Cena', resistance: 'nenhuma' },
  { id: 'primor-atletico', name: 'Primor Atlético', circle: 1, type: 'Arcana', school: 'Transmutação', action: 'Padrão', range: 'Toque', target: '1 criatura', duration: 'Cena', resistance: '' },
  { id: 'profanar', name: 'Profanar', circle: 1, type: 'Divina', school: 'Necromancia', action: 'Padrão', range: 'Longo', target: 'esfera com 9m de raio', duration: 'Dia', resistance: '' },
  { id: 'protecao-divina', name: 'Proteção Divina', circle: 1, type: 'Divina', school: 'Abjuração', action: 'Padrão', range: 'Toque', target: '1 criatura', duration: 'Cena', resistance: '' },
  { id: 'queda-suave', name: 'Queda Suave', circle: 1, type: 'Arcana', school: 'Transmutação', action: 'Reação', range: 'Curto', target: '1 criatura ou objeto Grande ou menor', duration: 'Cena', resistance: '' },
  { id: 'raio-do-enfraquecimento', name: 'Raio do Enfraquecimento', circle: 1, type: 'Arcana', school: 'Necromancia', action: 'Padrão', range: 'Curto', target: '1 criatura', duration: 'Cena', resistance: 'Fortitude parcial' },
  { id: 'resistencia-a-energia', name: 'Resistência a Energia', circle: 1, type: 'Universal', school: 'Abjuração', action: 'Padrão', range: 'Toque', target: '1 criatura', duration: 'Cena', resistance: '' },
  { id: 'santuario', name: 'Santuário', circle: 1, type: 'Divina', school: 'Abjuração', action: 'Padrão', range: 'Toque', target: '1 criatura', duration: 'Cena', resistance: 'Vontade anula' },
  { id: 'seta-infalivel-de-talude', name: 'Seta Infalível de Talude', circle: 1, type: 'Arcana', school: 'Evocação', action: 'Padrão', range: 'Médio', target: 'criaturas escolhidas', duration: 'Instantânea', resistance: '' },
  { id: 'sono', name: 'Sono', circle: 1, type: 'Arcana', school: 'Encantamento', action: 'Padrão', range: 'Curto', target: '1 humanoide', duration: 'Cena', resistance: 'Vontade parcial' },
  { id: 'suporte-ambiental', name: 'Suporte Ambiental', circle: 1, type: 'Divina', school: 'Abjuração', action: 'Padrão', range: 'Toque', target: '1 criatura', duration: 'Dia', resistance: 'Vontade anula' },
  { id: 'teia', name: 'Teia', circle: 1, type: 'Arcana', school: 'Convocação', action: 'Padrão', range: 'Curto', target: 'cubo com 6m de lado', duration: 'Cena', resistance: 'Reflexos anula' },
  { id: 'toque-chocante', name: 'Toque Chocante', circle: 1, type: 'Arcana', school: 'Evocação', action: 'Padrão', range: 'Toque', target: '1 criatura', duration: 'Instantânea', resistance: 'Fortitude reduz à metade' },
  { id: 'tranca-arcana', name: 'Tranca Arcana', circle: 1, type: 'Arcana', school: 'Abjuração', action: 'Padrão', range: 'Toque', target: '1 objeto Grande ou menor', duration: 'Dia', resistance: '' },
  { id: 'tranquilidade', name: 'Tranquilidade', circle: 1, type: 'Divina', school: 'Encantamento', action: 'Padrão', range: 'Curto', target: '1 animal ou humanoide', duration: 'Cena', resistance: 'Vontade parcial' },
  { id: 'transmutar-objetos', name: 'Transmutar Objetos', circle: 1, type: 'Arcana', school: 'Transmutação', action: 'Padrão', range: 'Toque', target: 'matéria-prima, como madeira, rochas, ossos', duration: 'Cena', resistance: '' },
  { id: 'visao-mistica', name: 'Visão Mística', circle: 1, type: 'Universal', school: 'Adivinhação', action: 'Padrão', range: 'Pessoal', target: 'você', duration: 'Cena', resistance: '' },
  { id: 'vitalidade-fantasma', name: 'Vitalidade Fantasma', circle: 1, type: 'Arcana', school: 'Necromancia', action: 'Padrão', range: 'Pessoal', target: 'você', duration: 'Instantânea', resistance: '' },
]
