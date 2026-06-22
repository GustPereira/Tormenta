import {
  CLASSES_BY_ID,
  CLASS_PROFICIENCIES_BY_ID,
  ORIGINS_BY_ID,
  RACES_BY_ID,
  RACE_TRAITS_BY_ID,
  RESISTANCE_SKILL_IDS,
  SKILLS,
} from '../data'
import {
  ATTRIBUTE_KEYS,
  type AttributeKey,
  type Attributes,
  type Character,
} from '../schema'
import { defense } from './defense'
import { aggregateActiveModifiers, collectEffects } from './effect'
import { maxHitPoints, maxMana } from './health'
import { skillBonus } from './skills'

export interface DerivedSkill {
  id: string
  name: string
  attribute: AttributeKey
  attributeMod: number
  trained: boolean
  /** Treinada automaticamente por ser perícia fixa da classe (não pode desmarcar). */
  granted: boolean
  onlyTrained: boolean
  /** Se a perícia sofre penalidade de armadura. */
  armorPenalty: boolean
  /** Bônus total da perícia. */
  total: number
  /** Verdadeiro quando a perícia só pode ser usada treinada e não está treinada. */
  unusable: boolean
}

export interface Proficiencies {
  armaduraMarcial: boolean
  armaduraPesada: boolean
  escudo: boolean
}

export interface DerivedCharacter {
  totalLevel: number
  /** Atributos finais = base + modificadores de raça + escolhas livres. */
  finalAttributes: Attributes
  maxHitPoints: number
  maxMana: number
  defense: number
  /** Deslocamento em metros (da raça; padrão 9). */
  deslocamento: number
  /** Redução de dano (soma dos efeitos ativos). */
  damageReduction: number
  /** União das proficiências de armadura/escudo das classes do personagem. */
  proficiencies: Proficiencies
  /** Bônus global resolvido somado a todas as perícias (já incluso em cada `total`). */
  globalSkillBonus: number
  /** Bônus global resolvido somado a todos os ataques. */
  globalAttackBonus: number
  /** Bônus global resolvido somado ao dano de todos os ataques. */
  globalDamageBonus: number
  skills: DerivedSkill[]
}

/** Soma os níveis de todas as classes (nível de personagem). */
export function totalLevel(character: Character): number {
  return character.classes.reduce((sum, c) => sum + c.level, 0)
}

export interface ResolvedOrigin {
  pericasFixas: string[]
  pericasEscolha: number
}

/** Resolve a origem selecionada (catálogo ou personalizada). */
export function resolveOrigin(character: Character): ResolvedOrigin | undefined {
  if (!character.originId) return undefined
  return (
    ORIGINS_BY_ID[character.originId] ??
    character.customOrigins.find((o) => o.id === character.originId)
  )
}

/** Calcula os atributos finais aplicando os modificadores da raça e as escolhas livres. */
export function finalAttributes(character: Character): Attributes {
  const result: Attributes = { ...character.attributes }
  const race = character.race ? RACES_BY_ID[character.race.raceId] : undefined
  if (!race) return result

  for (const key of ATTRIBUTE_KEYS) {
    const mod = race.attributeModifiers[key]
    if (mod) result[key] += mod
  }

  if (race.freeChoice) {
    const picks = character.attributeChoices.slice(0, race.freeChoice.count)
    for (const key of picks) result[key] += race.freeChoice.value
  }

  return result
}

/**
 * Soma os modificadores de todos os efeitos ativos (itens, habilidades e avulsos),
 * resolvendo as fórmulas (ex.: @car, @nivel). Faz dois passes para evitar
 * dependência circular: as fórmulas de **atributo** resolvem contra os atributos
 * base (raça + escolhas); as demais (perícias, defesa, PV…), contra os atributos
 * finais (já com os bônus de atributo dos efeitos aplicados).
 */
export function activeModifiers(character: Character) {
  const effects = collectEffects(character)
  const level = totalLevel(character)
  const baseAttrs = finalAttributes(character)
  // Passe 1: fórmulas de atributo resolvidas contra os atributos base.
  const pass1 = aggregateActiveModifiers(effects, { attributes: baseAttrs, level })
  const attrs = { ...baseAttrs }
  for (const key of ATTRIBUTE_KEYS) attrs[key] += pass1.attributes[key] ?? 0
  // Passe 2: demais fórmulas resolvidas contra os atributos finais.
  const pass2 = aggregateActiveModifiers(effects, { attributes: attrs, level })
  return { ...pass2, attributes: pass1.attributes }
}

/**
 * Calcula todos os valores derivados de uma ficha (read-only na UI).
 * Bônus de armadura/escudo serão somados quando o catálogo de equipamentos
 * for adicionado; por ora são 0.
 */
export function deriveCharacter(character: Character): DerivedCharacter {
  const level = totalLevel(character)
  const mods = activeModifiers(character)

  // Atributos finais = raça + escolhas livres + modificadores de itens ativos.
  const attrs = finalAttributes(character)
  for (const key of ATTRIBUTE_KEYS) attrs[key] += mods.attributes[key] ?? 0

  const hpClasses = character.classes.map((entry) => {
    const def = CLASSES_BY_ID[entry.classId]
    return {
      pvInicial: def?.pvInicial ?? 0,
      pvPorNivel: def?.pvPorNivel ?? 0,
      level: entry.level,
    }
  })

  const mpClasses = character.classes.map((entry) => ({
    pmPorNivel: CLASSES_BY_ID[entry.classId]?.pmPorNivel ?? 0,
    level: entry.level,
  }))

  // Perícias treinadas fixas concedidas pela 1ª classe e pela origem.
  // Multiclasse (T20): ao ganhar o 1º nível numa nova classe você NÃO recebe as
  // perícias treinadas dela — só a classe inicial concede.
  const firstClass = character.classes[0]
  const grantedSkills = new Set<string>()
  if (firstClass) {
    CLASSES_BY_ID[firstClass.classId]?.pericasFixas.forEach((id) => grantedSkills.add(id))
  }
  resolveOrigin(character)?.pericasFixas.forEach((id) => grantedSkills.add(id))
  // Perícias tornadas treinadas por efeitos ativos (mesma regra de perícia de classe).
  mods.trainedSkills.forEach((id) => grantedSkills.add(id))

  // Bônus gerais (de efeitos/itens/habilidades) somados a todas as perícias e ataques.
  const globalSkillBonus = mods.allSkills
  const globalAttackBonus = mods.attack
  const globalDamageBonus = mods.damage
  const resistanceIds = new Set<string>(RESISTANCE_SKILL_IDS)

  const skills: DerivedSkill[] = SKILLS.map((skill) => {
    const granted = grantedSkills.has(skill.id)
    const trained = granted || character.trainedSkills.includes(skill.id)
    const attributeMod = attrs[skill.attribute]
    // Perícias com penalidade de armadura recebem a penalidade somada dos itens/efeitos ativos.
    // O bônus global de perícia entra em todas; o de resistência só nas de resistência.
    const otherBonus =
      (mods.skills[skill.id] ?? 0) +
      (skill.armorPenalty ? mods.penalty : 0) +
      globalSkillBonus +
      (resistanceIds.has(skill.id) ? mods.resistance : 0)
    return {
      id: skill.id,
      name: skill.name,
      attribute: skill.attribute,
      attributeMod,
      trained,
      granted,
      onlyTrained: skill.onlyTrained,
      armorPenalty: skill.armorPenalty,
      total: skillBonus({ level, attributeMod, trained, otherBonus }),
      unusable: skill.onlyTrained && !trained,
    }
  })

  // Proficiências: também só da 1ª classe (multiclasse não concede as da nova classe).
  const proficiencies: Proficiencies = { armaduraMarcial: false, armaduraPesada: false, escudo: false }
  const firstProf = firstClass ? CLASS_PROFICIENCIES_BY_ID[firstClass.classId] : undefined
  if (firstProf) {
    proficiencies.armaduraMarcial = firstProf.armaduraMarcial
    proficiencies.armaduraPesada = firstProf.armaduraPesada
    proficiencies.escudo = firstProf.escudo
  }

  const traits = character.race ? RACE_TRAITS_BY_ID[character.race.raceId] : undefined

  return {
    totalLevel: level,
    finalAttributes: attrs,
    maxHitPoints: maxHitPoints(hpClasses, attrs.constituicao) + mods.hitPoints,
    maxMana: maxMana(mpClasses) + mods.mana,
    defense: defense({ level, dexMod: attrs.destreza, otherBonus: mods.defense }),
    deslocamento: Math.max(0, (traits?.deslocamento ?? 9) + mods.movement),
    damageReduction: mods.damageReduction,
    proficiencies,
    globalSkillBonus,
    globalAttackBonus,
    globalDamageBonus,
    skills,
  }
}
