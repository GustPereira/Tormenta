import type { SkillDef } from './types'

/**
 * Catálogo de perícias do Tormenta T20 — Tabela 2-1 (Livro Básico).
 * Fonte de verdade para a aba de Perícias e para os cálculos de bônus.
 */
export const SKILLS: SkillDef[] = [
  { id: 'acrobacia', name: 'Acrobacia', attribute: 'destreza', onlyTrained: false, armorPenalty: true },
  { id: 'adestramento', name: 'Adestramento', attribute: 'carisma', onlyTrained: true, armorPenalty: false },
  { id: 'atletismo', name: 'Atletismo', attribute: 'forca', onlyTrained: false, armorPenalty: false },
  { id: 'atuacao', name: 'Atuação', attribute: 'carisma', onlyTrained: true, armorPenalty: false },
  { id: 'cavalgar', name: 'Cavalgar', attribute: 'destreza', onlyTrained: false, armorPenalty: false },
  { id: 'conhecimento', name: 'Conhecimento', attribute: 'inteligencia', onlyTrained: true, armorPenalty: false },
  { id: 'cura', name: 'Cura', attribute: 'sabedoria', onlyTrained: false, armorPenalty: false },
  { id: 'diplomacia', name: 'Diplomacia', attribute: 'carisma', onlyTrained: false, armorPenalty: false },
  { id: 'enganacao', name: 'Enganação', attribute: 'carisma', onlyTrained: false, armorPenalty: false },
  { id: 'fortitude', name: 'Fortitude', attribute: 'constituicao', onlyTrained: false, armorPenalty: false },
  { id: 'furtividade', name: 'Furtividade', attribute: 'destreza', onlyTrained: false, armorPenalty: true },
  { id: 'guerra', name: 'Guerra', attribute: 'inteligencia', onlyTrained: true, armorPenalty: false },
  { id: 'iniciativa', name: 'Iniciativa', attribute: 'destreza', onlyTrained: false, armorPenalty: false },
  { id: 'intimidacao', name: 'Intimidação', attribute: 'carisma', onlyTrained: false, armorPenalty: false },
  { id: 'intuicao', name: 'Intuição', attribute: 'sabedoria', onlyTrained: false, armorPenalty: false },
  { id: 'investigacao', name: 'Investigação', attribute: 'inteligencia', onlyTrained: false, armorPenalty: false },
  { id: 'jogatina', name: 'Jogatina', attribute: 'carisma', onlyTrained: true, armorPenalty: false },
  { id: 'ladinagem', name: 'Ladinagem', attribute: 'destreza', onlyTrained: true, armorPenalty: true },
  { id: 'luta', name: 'Luta', attribute: 'forca', onlyTrained: false, armorPenalty: false },
  { id: 'misticismo', name: 'Misticismo', attribute: 'inteligencia', onlyTrained: true, armorPenalty: false },
  { id: 'nobreza', name: 'Nobreza', attribute: 'inteligencia', onlyTrained: true, armorPenalty: false },
  { id: 'oficio', name: 'Ofício', attribute: 'inteligencia', onlyTrained: true, armorPenalty: false },
  { id: 'percepcao', name: 'Percepção', attribute: 'sabedoria', onlyTrained: false, armorPenalty: false },
  { id: 'pilotagem', name: 'Pilotagem', attribute: 'destreza', onlyTrained: true, armorPenalty: false },
  { id: 'pontaria', name: 'Pontaria', attribute: 'destreza', onlyTrained: false, armorPenalty: false },
  { id: 'reflexos', name: 'Reflexos', attribute: 'destreza', onlyTrained: false, armorPenalty: false },
  { id: 'religiao', name: 'Religião', attribute: 'sabedoria', onlyTrained: true, armorPenalty: false },
  { id: 'sobrevivencia', name: 'Sobrevivência', attribute: 'sabedoria', onlyTrained: false, armorPenalty: false },
  { id: 'vontade', name: 'Vontade', attribute: 'sabedoria', onlyTrained: false, armorPenalty: false },
]

/** Índice de perícia por id, para lookup rápido. */
export const SKILLS_BY_ID: Record<string, SkillDef> = Object.fromEntries(
  SKILLS.map((s) => [s.id, s]),
)

/**
 * Perícias de resistência (testes de resistência do T20). Recebem o bônus
 * geral de resistência dos efeitos e são exibidas em destaque nos Vitais.
 */
export const RESISTANCE_SKILL_IDS = ['fortitude', 'reflexos', 'vontade'] as const
