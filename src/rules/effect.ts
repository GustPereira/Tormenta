import { ATTRIBUTE_ABBR, SKILLS_BY_ID } from '../data'
import {
  ATTRIBUTE_KEYS,
  type Ability,
  type Attributes,
  type Character,
  type EffectTypeKey,
  type InventoryItem,
  type ItemModifiers,
  type ModValue,
  type Spell,
} from '../schema'
import { damageAverage, isFormula, mergeDamage, resolveValue, type FormulaContext } from './formula'

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
  readonly effectType: EffectTypeKey
  readonly modifiers: ItemModifiers

  // Só os campos usados na agregação (duration não importa aqui).
  constructor(data: {
    id: string
    name: string
    active: boolean
    modifiers: ItemModifiers
    alwaysActive?: boolean
    effectType?: EffectTypeKey
  }) {
    this.id = data.id
    this.name = data.name
    this.active = data.active
    this.alwaysActive = data.alwaysActive ?? false
    this.effectType = data.effectType ?? 'Outros'
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
      // Equipamentos (armadura/escudo/arma) aplicam quando equipados; demais
      // itens, quando o efeito está marcado como ativo.
      active: item.equipmentType || item.attack ? item.equipped : item.activeEffect,
      effectType: item.effectType,
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
      effectType: ability.effectType,
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

/** Efeito proveniente de uma magia (ativável na aba de efeitos). */
export class SpellEffect extends Effect {
  constructor(spell: Spell) {
    super({
      id: spell.id,
      name: spell.name || 'Magia sem nome',
      active: spell.effectActive,
      effectType: spell.effectType,
      modifiers: spell.modifiers,
    })
  }

  override get editable(): boolean {
    return false
  }

  override get sourceLabel(): string {
    return 'Magia'
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
  /** Bônus total à CD de resistência das magias. */
  spellDc: number
  /** Bônus total aos testes de manobra. */
  maneuver: number
}

/** Coleta todos os efeitos da ficha: os dos itens (ItemEffect) e os avulsos (Effect). */
export function collectEffects(character: Character): Effect[] {
  return [
    ...character.inventory.map((item) => new ItemEffect(item)),
    ...character.abilities.filter((a) => a.hasEffect).map((a) => new AbilityEffect(a)),
    ...character.spells.filter((s) => s.hasEffect).map((s) => new SpellEffect(s)),
    ...character.effects.map((data) => new Effect(data)),
  ]
}

/** Campos numéricos simples de ItemModifiers sujeitos à regra de "usa o maior" por tipo. */
const STACKING_FIELDS = [
  'attack', 'allSkills', 'resistance', 'hitPoints', 'mana', 'defense',
  'penalty', 'movement', 'damageReduction', 'spellDc', 'maneuver',
] as const

/** Tipos de efeito que não somam entre si: dentro do mesmo tipo, usa-se o maior valor por campo. */
const NON_STACKING_TYPES: readonly EffectTypeKey[] = ['Itens', 'Magias']

/**
 * Total de um campo dentro de um grupo de mesmo tipo: só os *bônus* (valores
 * positivos) seguem a regra de "não soma, usa o maior" — penalidades (valores
 * negativos) sempre se acumulam normalmente, mesmo dentro do mesmo tipo (T20).
 */
function maxField(group: Effect[], key: (typeof STACKING_FIELDS)[number], ctx: FormulaContext): number {
  let bestPositive = 0
  let negativeSum = 0
  for (const effect of group) {
    const v = resolveValue(effect.modifiers[key] ?? 0, ctx)
    if (v > bestPositive) bestPositive = v
    else if (v < 0) negativeSum += v
  }
  return bestPositive + negativeSum
}

/** Mesma regra de `maxField`, para uma chave de `attributes`/`skills`. */
function maxKeyed(group: Effect[], pick: (m: ItemModifiers) => Record<string, ModValue>, key: string, ctx: FormulaContext): number {
  let bestPositive = 0
  let negativeSum = 0
  for (const effect of group) {
    const v = resolveValue(pick(effect.modifiers)[key] ?? 0, ctx)
    if (v > bestPositive) bestPositive = v
    else if (v < 0) negativeSum += v
  }
  return bestPositive + negativeSum
}

/** Expressão de dano com a maior média de rolagem dentro do grupo (null se o grupo estiver vazio). */
function bestDamage(group: Effect[], ctx: FormulaContext): string | number | null {
  let best: string | number | null = null
  let bestAvg = -Infinity
  for (const effect of group) {
    const dmg = effect.modifiers.damage ?? 0
    const avg = damageAverage(dmg, ctx)
    if (best === null || avg > bestAvg) {
      best = dmg
      bestAvg = avg
    }
  }
  return best
}

/** Soma os modificadores de um grupo de efeitos que somam entre si normalmente. */
function sumGroup(acc: AggregatedModifiers, group: Effect[], damageParts: Array<string | number>, ctx: FormulaContext): void {
  for (const effect of group) {
    const m = effect.modifiers
    for (const [k, v] of Object.entries(m.attributes)) acc.attributes[k] = (acc.attributes[k] ?? 0) + resolveValue(v, ctx)
    for (const [k, v] of Object.entries(m.skills)) acc.skills[k] = (acc.skills[k] ?? 0) + resolveValue(v, ctx)
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
    acc.spellDc += resolveValue(m.spellDc ?? 0, ctx)
    acc.maneuver += resolveValue(m.maneuver ?? 0, ctx)
  }
}

/**
 * Adiciona ao acumulador o maior valor por campo dentro de um grupo de efeitos
 * do mesmo tipo não-cumulativo (Itens ou Magias): não soma os efeitos entre si,
 * usa o maior valor de cada campo (regra de bônus de mesmo tipo do T20).
 */
function addMaxGroup(acc: AggregatedModifiers, group: Effect[], damageParts: Array<string | number>, ctx: FormulaContext): void {
  if (group.length === 0) return
  const keys = new Set<string>()
  const skillKeys = new Set<string>()
  for (const effect of group) {
    for (const k of Object.keys(effect.modifiers.attributes)) keys.add(k)
    for (const k of Object.keys(effect.modifiers.skills)) skillKeys.add(k)
  }
  for (const k of keys) acc.attributes[k] = (acc.attributes[k] ?? 0) + maxKeyed(group, (m) => m.attributes, k, ctx)
  for (const k of skillKeys) acc.skills[k] = (acc.skills[k] ?? 0) + maxKeyed(group, (m) => m.skills, k, ctx)
  for (const field of STACKING_FIELDS) acc[field] += maxField(group, field, ctx)
  const dmg = bestDamage(group, ctx)
  if (dmg !== null) damageParts.push(dmg)
}

/** Soma os modificadores de todos os efeitos ativos. */
export function aggregateActiveModifiers(
  effects: Effect[],
  ctx: FormulaContext = ZERO_CTX,
): AggregatedModifiers {
  const acc: AggregatedModifiers = { attributes: {}, skills: {}, attack: 0, damage: '', allSkills: 0, resistance: 0, trainedSkills: [], hitPoints: 0, mana: 0, defense: 0, penalty: 0, movement: 0, damageReduction: 0, spellDc: 0, maneuver: 0 }
  const active = effects.filter((e) => e.isActive())
  for (const effect of active) {
    for (const id of effect.modifiers.trainedSkills ?? []) if (!acc.trainedSkills.includes(id)) acc.trainedSkills.push(id)
  }

  const stackingGroups = new Map<EffectTypeKey, Effect[]>()
  const summing: Effect[] = []
  for (const effect of active) {
    if (NON_STACKING_TYPES.includes(effect.effectType)) {
      const group = stackingGroups.get(effect.effectType) ?? []
      group.push(effect)
      stackingGroups.set(effect.effectType, group)
    } else {
      summing.push(effect)
    }
  }

  const damageParts: Array<string | number> = []
  sumGroup(acc, summing, damageParts, ctx)
  for (const group of stackingGroups.values()) addMaxGroup(acc, group, damageParts, ctx)

  acc.damage = mergeDamage(damageParts, ctx)
  return acc
}

export interface EffectContribution {
  name: string
  /** Número (mostrado com sinal) ou texto já formatado (ex.: expressão de dano). */
  value: number | string
  /**
   * Bônus do mesmo tipo (Itens/Magias) que perdeu para outro maior do mesmo
   * grupo e por isso não conta no total (regra de bônus de mesmo tipo do T20).
   * A UI mostra riscado.
   */
  excluded?: boolean
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
 * Monta a lista de contribuições de um grupo de efeitos ativos a partir de um
 * extrator de valor numérico por efeito, respeitando a regra de bônus de mesmo
 * tipo: dentro do mesmo tipo não-cumulativo (Itens/Magias), só o *bônus* (valor
 * positivo) de maior valor do grupo conta — os demais aparecem com `excluded:
 * true` (a UI mostra riscado); penalidades (valores negativos) aparecem todas,
 * já que sempre se acumulam. Igual ao total calculado por `aggregateActiveModifiers`.
 */
function groupedContributions(active: Effect[], getValue: (effect: Effect) => number): EffectContribution[] {
  const stackingGroups = new Map<EffectTypeKey, Effect[]>()
  const summing: Effect[] = []
  for (const effect of active) {
    if (NON_STACKING_TYPES.includes(effect.effectType)) {
      const group = stackingGroups.get(effect.effectType) ?? []
      group.push(effect)
      stackingGroups.set(effect.effectType, group)
    } else {
      summing.push(effect)
    }
  }

  const contributions: EffectContribution[] = []
  for (const effect of summing) {
    const value = getValue(effect)
    if (value !== 0) contributions.push({ name: effect.name, value })
  }
  for (const group of stackingGroups.values()) {
    let bestEffect: Effect | null = null
    let bestValue = 0
    for (const effect of group) {
      const value = getValue(effect)
      if (value > bestValue) {
        bestValue = value
        bestEffect = effect
      }
    }
    for (const effect of group) {
      const value = getValue(effect)
      if (value < 0) {
        contributions.push({ name: effect.name, value })
      } else if (value > 0) {
        contributions.push({ name: effect.name, value, excluded: effect !== bestEffect })
      }
    }
  }
  return contributions
}

/** Lista as contribuições de um campo simples de `ItemModifiers` (defesa, deslocamento, PV, PM etc.). */
export function fieldContributions(
  character: Character,
  field: (typeof STACKING_FIELDS)[number],
  ctx: FormulaContext = ZERO_CTX,
): EffectContribution[] {
  const active = collectEffects(character).filter((e) => e.isActive())
  return groupedContributions(active, (effect) => resolveValue(effect.modifiers[field] ?? 0, ctx))
}

/** Lista as contribuições de uma chave de `attributes`/`skills` (ex.: um atributo ou uma perícia). */
export function keyedFieldContributions(
  character: Character,
  pick: (m: ItemModifiers) => Record<string, ModValue>,
  key: string,
  ctx: FormulaContext = ZERO_CTX,
): EffectContribution[] {
  const active = collectEffects(character).filter((e) => e.isActive())
  return groupedContributions(active, (effect) => resolveValue(pick(effect.modifiers)[key] ?? 0, ctx))
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
  const sdc = formatModValue(m.spellDc ?? 0)
  if (sdc) parts.push(`CD Magia ${sdc}`)
  const man = formatModValue(m.maneuver ?? 0)
  if (man) parts.push(`Manobra ${man}`)
  for (const [id, v] of Object.entries(m.skills)) {
    const s = formatModValue(v)
    if (s) parts.push(`${SKILLS_BY_ID[id]?.name ?? id} ${s}`)
  }
  for (const id of m.trainedSkills ?? []) {
    parts.push(`${SKILLS_BY_ID[id]?.name ?? id} (treinada)`)
  }
  return parts.join(', ') || 'sem modificadores'
}
