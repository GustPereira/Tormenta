import { ATTRIBUTE_ABBR, SKILLS_BY_ID } from '../data'
import {
  ATTRIBUTE_KEYS,
  type Character,
  type EffectData,
  type InventoryItem,
  type ItemModifiers,
} from '../schema'

/**
 * Um efeito nomeado e ativável que altera valores derivados.
 * Classe base de comportamento sobre os dados de modificadores. Itens herdam
 * via `ItemEffect`; efeitos avulsos usam `Effect` diretamente.
 */
export class Effect {
  readonly id: string
  readonly name: string
  readonly active: boolean
  readonly modifiers: ItemModifiers

  constructor(data: EffectData) {
    this.id = data.id
    this.name = data.name
    this.active = data.active
    this.modifiers = data.modifiers
  }

  isActive(): boolean {
    return this.active
  }

  /** Se o efeito pode ser editado nesta tela (avulsos sim; de itens não). */
  get editable(): boolean {
    return true
  }

  /** Rótulo de origem do efeito. */
  get sourceLabel(): string {
    return 'Efeito'
  }
}

/** Efeito proveniente de um item do inventário (somente leitura na aba de efeitos). */
export class ItemEffect extends Effect {
  constructor(item: InventoryItem) {
    super({
      id: item.id,
      name: item.name || 'Item sem nome',
      active: item.activeEffect,
      modifiers: item.modifiers,
    })
  }

  override get editable(): boolean {
    return false
  }

  override get sourceLabel(): string {
    return 'Item'
  }
}

export interface AggregatedModifiers {
  attributes: Record<string, number>
  skills: Record<string, number>
  hitPoints: number
  mana: number
  defense: number
  /** Penalidade de armadura total (aplicada às perícias com penalidade de armadura). */
  penalty: number
  /** Alteração total de deslocamento (em metros). */
  movement: number
}

/** Coleta todos os efeitos da ficha: os dos itens (ItemEffect) e os avulsos (Effect). */
export function collectEffects(character: Character): Effect[] {
  return [
    ...character.inventory.map((item) => new ItemEffect(item)),
    ...character.effects.map((data) => new Effect(data)),
  ]
}

/** Soma os modificadores de todos os efeitos ativos. */
export function aggregateActiveModifiers(effects: Effect[]): AggregatedModifiers {
  const acc: AggregatedModifiers = { attributes: {}, skills: {}, hitPoints: 0, mana: 0, defense: 0, penalty: 0, movement: 0 }
  for (const effect of effects) {
    if (!effect.isActive()) continue
    const m = effect.modifiers
    for (const [k, v] of Object.entries(m.attributes)) acc.attributes[k] = (acc.attributes[k] ?? 0) + v
    for (const [k, v] of Object.entries(m.skills)) acc.skills[k] = (acc.skills[k] ?? 0) + v
    acc.hitPoints += m.hitPoints
    acc.mana += m.mana
    acc.defense += m.defense
    acc.penalty += m.penalty ?? 0
    acc.movement += m.movement ?? 0
  }
  return acc
}

/** Resumo textual curto dos modificadores de um efeito (ex.: "For +2, Defesa +1, PV +5"). */
export function describeModifiers(m: ItemModifiers): string {
  const parts: string[] = []
  for (const key of ATTRIBUTE_KEYS) {
    const v = m.attributes[key]
    if (v) parts.push(`${ATTRIBUTE_ABBR[key]} ${v >= 0 ? '+' : ''}${v}`)
  }
  if (m.hitPoints) parts.push(`PV ${m.hitPoints >= 0 ? '+' : ''}${m.hitPoints}`)
  if (m.mana) parts.push(`PM ${m.mana >= 0 ? '+' : ''}${m.mana}`)
  if (m.defense) parts.push(`Defesa ${m.defense >= 0 ? '+' : ''}${m.defense}`)
  if (m.penalty) parts.push(`Penal. ${m.penalty >= 0 ? '+' : ''}${m.penalty}`)
  if (m.movement) parts.push(`Desloc. ${m.movement >= 0 ? '+' : ''}${m.movement}m`)
  for (const [id, v] of Object.entries(m.skills)) {
    if (v) parts.push(`${SKILLS_BY_ID[id]?.name ?? id} ${v >= 0 ? '+' : ''}${v}`)
  }
  return parts.join(', ') || 'sem modificadores'
}
