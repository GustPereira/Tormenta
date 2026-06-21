import { describe, expect, it } from 'vitest'
import { createBlankCharacter, type Character } from '../schema'
import { deriveCharacter, finalAttributes, totalLevel } from './derive'

function build(overrides: Partial<Character>): Character {
  return { ...createBlankCharacter(), ...overrides }
}

describe('totalLevel', () => {
  it('soma os níveis das classes', () => {
    const c = build({
      classes: [
        { classId: 'guerreiro', level: 2 },
        { classId: 'ladino', level: 1 },
      ],
    })
    expect(totalLevel(c)).toBe(3)
  })
})

describe('finalAttributes', () => {
  it('aplica modificadores fixos da raça', () => {
    const c = build({
      attributes: { forca: 1, destreza: 1, constituicao: 0, inteligencia: 0, sabedoria: 0, carisma: 0 },
      race: { raceId: 'anao' }, // Con +2, Sab +1, Des -1
    })
    const a = finalAttributes(c)
    expect(a.constituicao).toBe(2)
    expect(a.sabedoria).toBe(1)
    expect(a.destreza).toBe(0)
    expect(a.forca).toBe(1)
  })

  it('aplica a escolha livre do humano (+1 em três)', () => {
    const c = build({
      race: { raceId: 'humano' },
      attributeChoices: ['forca', 'destreza', 'inteligencia'],
    })
    const a = finalAttributes(c)
    expect(a.forca).toBe(1)
    expect(a.destreza).toBe(1)
    expect(a.inteligencia).toBe(1)
    expect(a.carisma).toBe(0)
  })

  it('respeita o limite de escolhas da raça', () => {
    const c = build({
      race: { raceId: 'humano' },
      attributeChoices: ['forca', 'destreza', 'inteligencia', 'carisma'],
    })
    const a = finalAttributes(c)
    // só 3 escolhas valem
    const total = a.forca + a.destreza + a.inteligencia + a.carisma
    expect(total).toBe(3)
  })
})

describe('deriveCharacter', () => {
  it('calcula PV/PM/Defesa para um guerreiro nível 3', () => {
    const c = build({
      attributes: { forca: 3, destreza: 2, constituicao: 2, inteligencia: 0, sabedoria: 0, carisma: 0 },
      classes: [{ classId: 'guerreiro', level: 3 }],
    })
    const d = deriveCharacter(c)
    // PV: 20 + 2 + 2*(5+2) = 36
    expect(d.maxHitPoints).toBe(36)
    // PM: 3*3 = 9
    expect(d.maxMana).toBe(9)
    // Defesa: 10 + 1 (meio nível) + 2 (Des) = 13
    expect(d.defense).toBe(13)
  })

  it('marca perícias só-treinada não treinadas como inutilizáveis', () => {
    const c = build({ classes: [{ classId: 'guerreiro', level: 1 }] })
    const d = deriveCharacter(c)
    const ladinagem = d.skills.find((s) => s.id === 'ladinagem')!
    expect(ladinagem.unusable).toBe(true)
    const atletismo = d.skills.find((s) => s.id === 'atletismo')!
    expect(atletismo.unusable).toBe(false)
  })

  it('aplica modificadores de itens com efeito ativo (e ignora inativos)', () => {
    const c = build({
      attributes: { forca: 2, destreza: 1, constituicao: 0, inteligencia: 0, sabedoria: 0, carisma: 0 },
      classes: [{ classId: 'guerreiro', level: 1 }],
      inventory: [
        {
          id: 'i1',
          name: 'Espada encantada',
          quantity: 1,
          spaces: 1,
          equipped: true,
          proficiency: '',
          activeEffect: true,
          notes: '',
          modifiers: { attributes: { forca: 2 }, skills: { atletismo: 3 }, hitPoints: 5, mana: 2, defense: 1, penalty: 0, movement: 0 },
        },
        {
          id: 'i2',
          name: 'Anel guardado (inativo)',
          quantity: 1,
          spaces: 0,
          equipped: false,
          proficiency: '',
          activeEffect: false,
          notes: '',
          modifiers: { attributes: { forca: 99 }, skills: {}, hitPoints: 999, mana: 0, defense: 0, penalty: 0, movement: 0 },
        },
      ],
    })
    const d = deriveCharacter(c)
    // Força 2 + item 2 = 4 (item inativo não conta)
    expect(d.finalAttributes.forca).toBe(4)
    // PV guerreiro nv1: 20 + Con(0) = 20, + item 5 = 25
    expect(d.maxHitPoints).toBe(25)
    // PM: 3 + item 2 = 5
    expect(d.maxMana).toBe(5)
    // Defesa: 10 + 0 (meio nível) + Des 1 + item 1 = 12
    expect(d.defense).toBe(12)
    // Atletismo: For final 4 + meio nível 0 + item 3 = 7 (não treinada)
    const atletismo = d.skills.find((s) => s.id === 'atletismo')!
    expect(atletismo.total).toBe(7)
  })

  it('aplica penalidade de armadura só nas perícias com penalidade de armadura', () => {
    const c = build({
      attributes: { forca: 0, destreza: 0, constituicao: 0, inteligencia: 0, sabedoria: 0, carisma: 0 },
      classes: [{ classId: 'guerreiro', level: 1 }],
      inventory: [
        {
          id: 'arm',
          name: 'Completa',
          quantity: 1,
          spaces: 0,
          equipped: true,
          proficiency: 'Pesadas',
          activeEffect: true,
          notes: '',
          modifiers: { attributes: {}, skills: {}, hitPoints: 0, mana: 0, defense: 10, penalty: -5, movement: -3 },
        },
      ],
    })
    const d = deriveCharacter(c)
    // Acrobacia tem penalidade de armadura → recebe -5
    expect(d.skills.find((s) => s.id === 'acrobacia')!.total).toBe(-5)
    // Atletismo não tem penalidade de armadura → 0
    expect(d.skills.find((s) => s.id === 'atletismo')!.total).toBe(0)
    // Deslocamento base 9 (sem raça) com -3 da armadura → 6
    expect(d.deslocamento).toBe(6)
  })

  it('calcula o bônus de perícia treinada com atributo final da raça', () => {
    const c = build({
      attributes: { forca: 2, destreza: 0, constituicao: 0, inteligencia: 0, sabedoria: 0, carisma: 0 },
      race: { raceId: 'minotauro' }, // For +2
      classes: [{ classId: 'guerreiro', level: 1 }],
      trainedSkills: ['atletismo'],
    })
    const d = deriveCharacter(c)
    const atletismo = d.skills.find((s) => s.id === 'atletismo')!
    // For final 4, meio nível 0, treino +2 => 6
    expect(atletismo.attributeMod).toBe(4)
    expect(atletismo.total).toBe(6)
  })
})
