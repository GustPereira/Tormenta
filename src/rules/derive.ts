import {
  CLASSES_BY_ID,
  CLASS_PROFICIENCIES_BY_ID,
  RACES_BY_ID,
  RACE_TRAITS_BY_ID,
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
  onlyTrained: boolean
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
  skills: DerivedSkill[]
}

/** Soma os níveis de todas as classes (nível de personagem). */
export function totalLevel(character: Character): number {
  return character.classes.reduce((sum, c) => sum + c.level, 0)
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

/** Soma os modificadores de todos os efeitos ativos (de itens e avulsos). */
export function activeModifiers(character: Character) {
  return aggregateActiveModifiers(collectEffects(character))
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

  const skills: DerivedSkill[] = SKILLS.map((skill) => {
    const trained = character.trainedSkills.includes(skill.id)
    const attributeMod = attrs[skill.attribute]
    // Perícias com penalidade de armadura recebem a penalidade somada dos itens/efeitos ativos.
    const otherBonus = (mods.skills[skill.id] ?? 0) + (skill.armorPenalty ? mods.penalty : 0)
    return {
      id: skill.id,
      name: skill.name,
      attribute: skill.attribute,
      attributeMod,
      trained,
      onlyTrained: skill.onlyTrained,
      total: skillBonus({ level, attributeMod, trained, otherBonus }),
      unusable: skill.onlyTrained && !trained,
    }
  })

  const proficiencies: Proficiencies = { armaduraMarcial: false, armaduraPesada: false, escudo: false }
  for (const entry of character.classes) {
    const prof = CLASS_PROFICIENCIES_BY_ID[entry.classId]
    if (!prof) continue
    proficiencies.armaduraMarcial ||= prof.armaduraMarcial
    proficiencies.armaduraPesada ||= prof.armaduraPesada
    proficiencies.escudo ||= prof.escudo
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
    skills,
  }
}
