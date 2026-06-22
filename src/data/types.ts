import type { AttributeKey } from '../schema'

/** Definição de uma perícia do T20 (Tabela 2-1: Perícias). */
export interface SkillDef {
  id: string
  name: string
  /** Atributo-chave da perícia. */
  attribute: AttributeKey
  /** Só pode ser usada se o personagem for treinado nela. */
  onlyTrained: boolean
  /** Sofre penalidade de armadura. */
  armorPenalty: boolean
}

/** Definição de uma classe do T20. */
export interface ClassDef {
  id: string
  name: string
  /** PV no 1º nível (somado ao mod. de Constituição). */
  pvInicial: number
  /** PV ganhos por nível após o 1º (somados ao mod. de Constituição). */
  pvPorNivel: number
  /** PM ganhos por nível. */
  pmPorNivel: number
  /** Quantas perícias treinadas a classe concede (além das fixas e de Int). */
  pericasEscolha: number
  /** Perícias treinadas fixas concedidas pela classe (ids). */
  pericasFixas: string[]
}

/** Bônus/penalidade fixos de atributo concedidos por uma raça. */
export type AttributeModifiers = Partial<Record<AttributeKey, number>>

/**
 * Escolha livre de atributos da raça (ex.: humano "+1 em três atributos
 * diferentes"), resolvida pelo jogador na UI.
 */
export interface FreeAttributeChoice {
  /** Quantos atributos diferentes recebem o bônus. */
  count: number
  /** Valor do bônus em cada atributo escolhido. */
  value: number
  /** Atributos que não podem ser escolhidos. */
  except?: AttributeKey[]
}

/** Definição de uma raça do T20. */
export interface RaceDef {
  id: string
  name: string
  /** Modificadores fixos de atributo. */
  attributeModifiers: AttributeModifiers
  /** Escolha livre "+1 em N atributos diferentes", se a raça tiver. */
  freeChoice?: FreeAttributeChoice
  /**
   * Perícias treinadas à escolha concedidas pela raça (ex.: Humano "Versátil" = 2,
   * Osteon/Kliren = 1). A maioria das raças não concede e omite este campo.
   */
  pericasEscolha?: number
  /**
   * Se uma das perícias da raça pode ser trocada por um poder geral
   * (Humano "Versátil", Osteon "Memória Póstuma"). Quando trocada, o limite de
   * perícias diminui em 1. Kliren concede perícia mas não permite a troca.
   */
  podeTrocarPericiaPorPoder?: boolean
}
