import { ATTRIBUTE_ABBR, SKILLS_BY_ID } from '../data'
import {
  ATTRIBUTE_KEYS,
  type Ability,
  type Attributes,
  type Character,
  type InventoryItem,
  type ItemModifiers,
} from '../schema'
import { isFormula, mergeDamage, resolveValue, type FormulaContext } from './formula'

const ZERO_ATTRS: Attributes = {
  forca: 0, destreza: 0, constituicao: 0, inteligencia: 0, sabedoria: 0, carisma: 0,
}
const ZERO_CTX: FormulaContext = { attributes: ZERO_ATTRS, level: 0 }

/**
 * Um efeito nomeado e ativável que altera valores derivados.
 * Classe base de comportamento sobre os dados de modificadores. Itens herdam
 * via `ItemEffect`; efeitos avulsos usam `Effect` diretamente.
 */
export class Effect {
  readonly id: string
  readonly name: string
  readonly active: boolean
  readonly alwaysActive: boolean
  readonly modifiers: ItemModifiers

  // Só os campos usados na agregação (duration não importa aqui).
  constructor(data: {
    id: string
    name: string
    active: boolean
    modifiers: ItemModifiers
    alwaysActive?: boolean
  }) {
    this.id = data.id
    this.name = data.name
    this.active = data.active
    this.alwaysActive = data.alwaysActive ?? false
    this.modifiers = data.modifiers
  }

  isActive(): boolean {
    return this.alwaysActive || this.active
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

/** Efeito proveniente de uma habilidade/poder (ativável na aba de efeitos). */
export class AbilityEffect extends Effect {
  constructor(ability: Ability) {
    super({
      id: ability.id,
      name: ability.name || 'Habilidade sem nome',
      active: ability.effectActive,
      alwaysActive: ability.alwaysActive,
      modifiers: ability.modifiers,
    })
  }

  override get editable(): boolean {
    return false
  }

  override get sourceLabel(): string {
    return 'Habilidade'
  }
}

export interface AggregatedModifiers {
  attributes: Record<string, number>
  skills: Record<string, number>
  /** Bônus somado a todos os ataques. */
  attack: number
  /** Dano extra (expressão mesclada, ex.: "1d8+2") somado a todos os ataques. */
  damage: string
  /** Bônus somado a todas as perícias. */
  allSkills: number
  /** Bônus somado às perícias de resistência (Fortitude, Reflexos, Vontade). */
  resistance: number
  /** Perícias tornadas treinadas pelos efeitos ativos (regra de perícia de classe). */
  trainedSkills: string[]
  hitPoints: number
  mana: number
  defense: number
  /** Penalidade de armadura total (aplicada às perícias com penalidade de armadura). */
  penalty: number
  /** Alteração total de deslocamento (em metros). */
  movement: number
  /** Redução de dano total. */
  damageReduction: number
}

/** Coleta todos os efeitos da ficha: os dos itens (ItemEffect) e os avulsos (Effect). */
export function collectEffects(character: Character): Effect[] {
  return [
    ...character.inventory.map((item) => new ItemEffect(item)),
    ...character.abilities.filter((a) => a.hasEffect).map((a) => new AbilityEffect(a)),
    ...character.effects.map((data) => new Effect(data)),
  ]
}

/** Soma os modificadores de todos os efeitos ativos. */
export function aggregateActiveModifiers(
  effects: Effect[],
  ctx: FormulaContext = ZERO_CTX,
): AggregatedModifiers {
  const acc: AggregatedModifiers = { attributes: {}, skills: {}, attack: 0, damage: '', allSkills: 0, resistance: 0, trainedSkills: [], hitPoints: 0, mana: 0, defense: 0, penalty: 0, movement: 0, damageReduction: 0 }
  const damageParts: Array<string | number> = []
  for (const effect of effects) {
    if (!effect.isActive()) continue
    const m = effect.modifiers
    for (const [k, v] of Object.entries(m.attributes)) acc.attributes[k] = (acc.attributes[k] ?? 0) + resolveValue(v, ctx)
    for (const [k, v] of Object.entries(m.skills)) acc.skills[k] = (acc.skills[k] ?? 0) + resolveValue(v, ctx)
    for (const id of m.trainedSkills ?? []) if (!acc.trainedSkills.includes(id)) acc.trainedSkills.push(id)
    acc.attack += resolveValue(m.attack ?? 0, ctx)
    damageParts.push(m.damage ?? 0)
    acc.allSkills += resolveValue(m.allSkills ?? 0, ctx)
    acc.resistance += resolveValue(m.resistance ?? 0, ctx)
    acc.hitPoints += resolveValue(m.hitPoints, ctx)
    acc.mana += resolveValue(m.mana, ctx)
    acc.defense += resolveValue(m.defense, ctx)
    acc.penalty += resolveValue(m.penalty ?? 0, ctx)
    acc.movement += resolveValue(m.movement ?? 0, ctx)
    acc.damageReduction += resolveValue(m.damageReduction ?? 0, ctx)
  }
  acc.damage = mergeDamage(damageParts, ctx)
  return acc
}

export interface EffectContribution {
  name: string
  /** Número (mostrado com sinal) ou texto já formatado (ex.: expressão de dano). */
  value: number | string
}

/**
 * Lista os efeitos ativos que contribuem para um valor (atributo, perícia,
 * defesa, etc.), com o valor de cada um. `selector` extrai a contribuição do
 * efeito a partir de seus modificadores.
 */
export function effectContributions(
  character: Character,
  selector: (m: ItemModifiers) => number | string,
  ctx: FormulaContext = ZERO_CTX,
): EffectContribution[] {
  return collectEffects(character)
    .filter((e) => e.isActive())
    .map((e) => ({ name: e.name, value: resolveValue(selector(e.modifiers), ctx) }))
    .filter((c) => c.value !== 0)
}

/**
 * Lista os efeitos ativos que somam dano, com a expressão de dano de cada um
 * (ex.: "1d8", "+2"), para o tooltip de proveniência do dano.
 */
export function effectDamageContributions(
  character: Character,
  ctx: FormulaContext = ZERO_CTX,
): EffectContribution[] {
  return collectEffects(character)
    .filter((e) => e.isActive())
    .map((e) => ({ name: e.name, value: mergeDamage([e.modifiers.damage ?? 0], ctx) }))
    .filter((c) => c.value !== '' && c.value !== '0')
}

/**
 * Formata um valor de modificador para o resumo: número com sinal (ex.: "+2") ou
 * a fórmula como texto (ex.: "@car + 2"). Retorna `null` quando vazio/zero.
 */
function formatModValue(value: number | string): string | null {
  if (isFormula(value)) return value.trim() ? value : null
  return value ? `${value >= 0 ? '+' : ''}${value}` : null
}

/** Resumo textual curto dos modificadores de um efeito (ex.: "For +2, Defesa +1, PV +5"). */
export function describeModifiers(m: ItemModifiers): string {
  const parts: string[] = []
  for (const key of ATTRIBUTE_KEYS) {
    const s = formatModValue(m.attributes[key] ?? 0)
    if (s) parts.push(`${ATTRIBUTE_ABBR[key]} ${s}`)
  }
  const atk = formatModValue(m.attack ?? 0)
  if (atk) parts.push(`Ataque ${atk}`)
  const dmg = formatModValue(m.damage ?? 0)
  if (dmg) parts.push(`Dano ${dmg}`)
  const allSk = formatModValue(m.allSkills ?? 0)
  if (allSk) parts.push(`Perícias ${allSk}`)
  const res = formatModValue(m.resistance ?? 0)
  if (res) parts.push(`Resist. ${res}`)
  const hp = formatModValue(m.hitPoints)
  if (hp) parts.push(`PV ${hp}`)
  const pm = formatModValue(m.mana)
  if (pm) parts.push(`PM ${pm}`)
  const def = formatModValue(m.defense)
  if (def) parts.push(`Defesa ${def}`)
  const pen = formatModValue(m.penalty ?? 0)
  if (pen) parts.push(`Penal. ${pen}`)
  const mov = formatModValue(m.movement ?? 0)
  if (mov) parts.push(`Desloc. ${mov}${isFormula(m.movement ?? 0) ? '' : 'm'}`)
  const rd = formatModValue(m.damageReduction ?? 0)
  if (rd) parts.push(`RD ${rd}`)
  for (const [id, v] of Object.entries(m.skills)) {
    const s = formatModValue(v)
    if (s) parts.push(`${SKILLS_BY_ID[id]?.name ?? id} ${s}`)
  }
  for (const id of m.trainedSkills ?? []) {
    parts.push(`${SKILLS_BY_ID[id]?.name ?? id} (treinada)`)
  }
  return parts.join(', ') || 'sem modificadores'
}
