import { describe, expect, it } from 'vitest'
import { createBlankCharacter, type Character, type ItemModifiers } from '../schema'
import { deriveCharacter, finalAttributes, skillChoiceLimit, totalLevel } from './derive'

function build(overrides: Partial<Character>): Character {
  return { ...createBlankCharacter(), ...overrides }
}

const ZERO_MODS: ItemModifiers = {
  attributes: {}, skills: {}, attack: 0, damage: 0, allSkills: 0, resistance: 0, trainedSkills: [], hitPoints: 0, mana: 0, defense: 0, penalty: 0, movement: 0, damageReduction: 0, spellDc: 0, maneuver: 0,
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
          equipmentType: '',
          attack: null,
          proficiency: '',
          activeEffect: true,
          notes: '',
          modifiers: { attributes: { forca: 2 }, skills: { atletismo: 3 }, attack: 0, damage: 0, allSkills: 0, resistance: 0, trainedSkills: [], hitPoints: 5, mana: 2, defense: 1, penalty: 0, movement: 0, damageReduction: 2, spellDc: 0, maneuver: 0 },
        },
        {
          id: 'i2',
          name: 'Anel guardado (inativo)',
          quantity: 1,
          spaces: 0,
          equipped: false,
          equipmentType: '',
          attack: null,
          proficiency: '',
          activeEffect: false,
          notes: '',
          modifiers: { attributes: { forca: 99 }, skills: {}, attack: 0, damage: 0, allSkills: 0, resistance: 0, trainedSkills: [], hitPoints: 999, mana: 0, defense: 0, penalty: 0, movement: 0, damageReduction: 0, spellDc: 0, maneuver: 0 },
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
    // Redução de dano do item ativo
    expect(d.damageReduction).toBe(2)
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
          equipmentType: 'armadura',
          attack: null,
          proficiency: 'Pesadas',
          activeEffect: true,
          notes: '',
          modifiers: { attributes: {}, skills: {}, attack: 0, damage: 0, allSkills: 0, resistance: 0, trainedSkills: [], hitPoints: 0, mana: 0, defense: 10, penalty: -5, movement: -3, damageReduction: 0, spellDc: 0, maneuver: 0 },
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

  it('armadura pesada equipada não aplica Destreza na Defesa', () => {
    const c = build({
      attributes: { forca: 0, destreza: 3, constituicao: 0, inteligencia: 0, sabedoria: 0, carisma: 0 },
      classes: [{ classId: 'guerreiro', level: 1 }],
      inventory: [
        {
          id: 'arm', name: 'Cota de Malha', quantity: 1, spaces: 0,
          equipped: true, equipmentType: 'armadura', attack: null, proficiency: 'Pesadas', activeEffect: false,
          notes: '', modifiers: { ...ZERO_MODS, defense: 6 },
        },
      ],
    })
    const d = deriveCharacter(c)
    expect(d.heavyArmorEquipped).toBe(true)
    // Defesa: 10 + ½ nível 0 + Des 0 (ignorada) + armadura 6 = 16 (não 19)
    expect(d.defense).toBe(16)
  })

  it('armadura leve equipada continua aplicando a Destreza na Defesa', () => {
    const c = build({
      attributes: { forca: 0, destreza: 3, constituicao: 0, inteligencia: 0, sabedoria: 0, carisma: 0 },
      classes: [{ classId: 'guerreiro', level: 1 }],
      inventory: [
        {
          id: 'arm', name: 'Couro', quantity: 1, spaces: 0,
          equipped: true, equipmentType: 'armadura', attack: null, proficiency: 'Leves', activeEffect: false,
          notes: '', modifiers: { ...ZERO_MODS, defense: 2 },
        },
      ],
    })
    const d = deriveCharacter(c)
    expect(d.heavyArmorEquipped).toBe(false)
    // Defesa: 10 + ½ nível 0 + Des 3 + armadura 2 = 15
    expect(d.defense).toBe(15)
  })

  it('resolve fórmula de perícia (@car) contra o atributo final', () => {
    const c = build({
      attributes: { forca: 0, destreza: 0, constituicao: 0, inteligencia: 0, sabedoria: 0, carisma: 3 },
      classes: [{ classId: 'guerreiro', level: 1 }],
      effects: [
        {
          id: 'e',
          name: 'Inspiração',
          active: true,
          alwaysActive: false,
          duration: 'Cena',
          modifiers: { attributes: {}, skills: { atletismo: '@car' }, attack: 0, damage: 0, allSkills: 0, resistance: 0, trainedSkills: [], hitPoints: 0, mana: 0, defense: 0, penalty: 0, movement: 0, damageReduction: 0, spellDc: 0, maneuver: 0 },
        },
      ],
    })
    const d = deriveCharacter(c)
    // Atletismo: ½ nível 0 + Força 0 + @car (3) = 3
    expect(d.skills.find((s) => s.id === 'atletismo')!.total).toBe(3)
  })

  it('item de defesa aplica quando equipado, alimenta shieldDefense e o token @escudo', () => {
    const c = build({
      classes: [{ classId: 'guerreiro', level: 1 }],
      inventory: [
        // Escudo equipado: sua defesa (2) entra direto; @escudo = 2.
        {
          id: 's2', name: 'Escudo Pesado', quantity: 1, spaces: 1,
          equipped: true, equipmentType: 'escudo', attack: null, proficiency: 'Escudos', activeEffect: false,
          notes: '', modifiers: { ...ZERO_MODS, defense: 2 },
        },
        // Escudo guardado (não equipado): não conta.
        {
          id: 's1', name: 'Escudo Leve', quantity: 1, spaces: 1,
          equipped: false, equipmentType: 'escudo', attack: null, proficiency: 'Escudos', activeEffect: false,
          notes: '', modifiers: { ...ZERO_MODS, defense: 1 },
        },
      ],
      // Efeito que soma a defesa do escudo equipado de novo, via token @escudo.
      effects: [
        {
          id: 'e', name: 'Bloqueio', active: true, alwaysActive: false, duration: 'Cena',
          modifiers: { ...ZERO_MODS, defense: '@escudo' },
        },
      ],
    })
    const d = deriveCharacter(c)
    // Escolhe o escudo equipado (2); o guardado não conta.
    expect(d.shieldDefense).toBe(2)
    // Defesa: 10 + ½ nível 0 + Des 0 + escudo equipado 2 + efeito (@escudo = 2) = 14
    expect(d.defense).toBe(14)
  })

  it('fórmula em atributo (@nivel) resolve contra os atributos base', () => {
    const c = build({
      classes: [{ classId: 'guerreiro', level: 3 }],
      effects: [{ id: 'e', name: 'Crescimento', active: true, alwaysActive: false, duration: 'Cena', modifiers: { ...ZERO_MODS, attributes: { forca: '@nivel' } } }],
    })
    const d = deriveCharacter(c)
    expect(d.finalAttributes.forca).toBe(3)
  })

  it('fórmula em defesa (@meionivel) soma à defesa', () => {
    const classes = [{ classId: 'guerreiro', level: 8 }]
    const base = deriveCharacter(build({ classes }))
    const withEffect = deriveCharacter(
      build({
        classes,
        effects: [{ id: 'e', name: 'Postura', active: true, alwaysActive: false, duration: 'Cena', modifiers: { ...ZERO_MODS, defense: '@meionivel' } }],
      }),
    )
    expect(withEffect.defense - base.defense).toBe(4)
  })

  it('fórmulas em PV e deslocamento são resolvidas', () => {
    const classes = [{ classId: 'guerreiro', level: 5 }]
    const base = deriveCharacter(build({ classes }))
    const withEffect = deriveCharacter(
      build({
        classes,
        effects: [
          { id: 'e', name: 'Vigor', active: true, alwaysActive: false, duration: 'Cena', modifiers: { ...ZERO_MODS, hitPoints: '@nivel', movement: '@meionivel' } },
        ],
      }),
    )
    expect(withEffect.maxHitPoints - base.maxHitPoints).toBe(5)
    expect(withEffect.deslocamento - base.deslocamento).toBe(2)
  })

  it('a origem concede perícias treinadas (granted)', () => {
    const c = build({ originId: 'acolito', classes: [{ classId: 'clerigo', level: 1 }] })
    const d = deriveCharacter(c)
    const cura = d.skills.find((s) => s.id === 'cura')!
    expect(cura.granted).toBe(true)
    expect(cura.trained).toBe(true)
  })

  it('multiclasse: só a 1ª classe concede perícias treinadas fixas', () => {
    const c = build({
      classes: [
        { classId: 'ladino', level: 2 }, // fixas: ladinagem, reflexos
        { classId: 'guerreiro', level: 1 }, // fixas: luta, pontaria, fortitude
      ],
    })
    const d = deriveCharacter(c)
    const granted = (id: string) => d.skills.find((s) => s.id === id)!.granted
    // Da 1ª classe (ladino): concedidas.
    expect(granted('ladinagem')).toBe(true)
    expect(granted('reflexos')).toBe(true)
    // Da 2ª classe (guerreiro): NÃO concedidas.
    expect(granted('luta')).toBe(false)
    expect(granted('pontaria')).toBe(false)
    expect(granted('fortitude')).toBe(false)
  })

  it('multiclasse: só a 1ª classe concede proficiências (simples+leves são universais)', () => {
    const c = build({
      classes: [
        { classId: 'ladino', level: 2 }, // sem proficiências além do básico
        { classId: 'guerreiro', level: 1 }, // marcial + pesada + escudo (não conta)
      ],
    })
    const d = deriveCharacter(c)
    expect(d.proficiencies).toEqual({
      armaduras: { leves: true, pesadas: false, escudo: false },
      armas: { simples: true, marcial: false, exotica: false, fogo: false },
    })
  })

  it('guerreiro: simples+leves universais + marcial, pesadas e escudo da classe', () => {
    const d = deriveCharacter(build({ classes: [{ classId: 'guerreiro', level: 1 }] }))
    expect(d.proficiencies).toEqual({
      armaduras: { leves: true, pesadas: true, escudo: true },
      armas: { simples: true, marcial: true, exotica: false, fogo: false },
    })
  })

  it('clérigo tem armadura pesada e escudo, mas NÃO armas marciais', () => {
    const p = deriveCharacter(build({ classes: [{ classId: 'clerigo', level: 1 }] })).proficiencies
    expect(p.armaduras.pesadas).toBe(true)
    expect(p.armaduras.escudo).toBe(true)
    expect(p.armas.marcial).toBe(false)
  })

  it('modificador geral de perícia (allSkills) de um efeito soma em todas as perícias', () => {
    const c = build({
      classes: [{ classId: 'guerreiro', level: 1 }],
      effects: [{ id: 'e', name: 'Bênção', active: true, alwaysActive: false, duration: 'Cena', modifiers: { ...ZERO_MODS, allSkills: 2 } }],
    })
    const d = deriveCharacter(c)
    expect(d.globalSkillBonus).toBe(2)
    // Atletismo (não treinada): ½ nível 0 + For 0 + geral 2 = 2
    expect(d.skills.find((s) => s.id === 'atletismo')!.total).toBe(2)
  })

  it('efeito ativo torna uma perícia treinada (regra de perícia de classe)', () => {
    const c = build({
      classes: [{ classId: 'guerreiro', level: 1 }],
      effects: [{ id: 'e', name: 'Foco', active: true, alwaysActive: false, duration: 'Cena', modifiers: { ...ZERO_MODS, trainedSkills: ['ladinagem'] } }],
    })
    const lad = deriveCharacter(c).skills.find((s) => s.id === 'ladinagem')!
    expect(lad.trained).toBe(true)
    expect(lad.granted).toBe(true) // não pode desmarcar, igual perícia de classe
    expect(lad.unusable).toBe(false) // ladinagem é só-treinada, agora utilizável
    // ½ nível 0 + Des 0 + treino +2 => 2
    expect(lad.total).toBe(2)
  })

  it('efeito inativo não torna a perícia treinada', () => {
    const c = build({
      classes: [{ classId: 'guerreiro', level: 1 }],
      effects: [{ id: 'e', name: 'Foco', active: false, alwaysActive: false, duration: 'Cena', modifiers: { ...ZERO_MODS, trainedSkills: ['ladinagem'] } }],
    })
    expect(deriveCharacter(c).skills.find((s) => s.id === 'ladinagem')!.trained).toBe(false)
  })

  it('modificador de resistência só soma em Fortitude, Reflexos e Vontade', () => {
    const c = build({
      classes: [{ classId: 'guerreiro', level: 1 }],
      effects: [{ id: 'e', name: 'Proteção', active: true, alwaysActive: false, duration: 'Cena', modifiers: { ...ZERO_MODS, resistance: 2 } }],
    })
    const d = deriveCharacter(c)
    const total = (id: string) => d.skills.find((s) => s.id === id)!.total
    // Resistências recebem +2 (guerreiro é treinado em fortitude → 0 + treino 2 + res 2 = 4).
    expect(total('reflexos')).toBe(2) // ½ nível 0 + Des 0 + res 2
    expect(total('vontade')).toBe(2) // ½ nível 0 + Sab 0 + res 2
    // Perícia comum não recebe.
    expect(total('atletismo')).toBe(0)
  })

  it('modificador geral aceita fórmula (resolvido contra atributos finais)', () => {
    const c = build({
      attributes: { forca: 0, destreza: 0, constituicao: 0, inteligencia: 0, sabedoria: 0, carisma: 3 },
      classes: [{ classId: 'guerreiro', level: 4 }],
      effects: [{ id: 'e', name: 'Foco', active: true, alwaysActive: false, duration: 'Cena', modifiers: { ...ZERO_MODS, attack: '@car', allSkills: '@meionivel' } }],
    })
    const d = deriveCharacter(c)
    expect(d.globalAttackBonus).toBe(3) // @car = 3
    expect(d.globalSkillBonus).toBe(2) // @meionivel de 4 = 2
  })

  it('efeito "sempre ativo" aplica mesmo com active=false', () => {
    const c = build({
      classes: [{ classId: 'guerreiro', level: 1 }],
      effects: [{ id: 'e', name: 'Aura', active: false, alwaysActive: true, duration: 'Cena', modifiers: { ...ZERO_MODS, allSkills: 2 } }],
    })
    expect(deriveCharacter(c).globalSkillBonus).toBe(2)
  })

  it('bônus global de dano soma de efeitos ativos (numérico)', () => {
    const c = build({
      classes: [{ classId: 'guerreiro', level: 1 }],
      effects: [
        { id: 'a', name: 'Fúria', active: true, alwaysActive: false, duration: 'Cena', modifiers: { ...ZERO_MODS, damage: 2 } },
        { id: 'b', name: 'Bênção', active: true, alwaysActive: false, duration: 'Cena', modifiers: { ...ZERO_MODS, damage: 1 } },
      ],
    })
    expect(deriveCharacter(c).globalDamageBonus).toBe('3')
  })

  it('bônus global de dano mescla dados do mesmo tipo', () => {
    const c = build({
      classes: [{ classId: 'guerreiro', level: 1 }],
      effects: [
        { id: 'a', name: 'A', active: true, alwaysActive: false, duration: 'Cena', modifiers: { ...ZERO_MODS, damage: '1d8' } },
        { id: 'b', name: 'B', active: true, alwaysActive: false, duration: 'Cena', modifiers: { ...ZERO_MODS, damage: '1d8+1d4' } },
      ],
    })
    expect(deriveCharacter(c).globalDamageBonus).toBe('2d8+1d4')
  })

  it('modificadores de ataque de vários efeitos somam (3 + (1+@car) = 4+car)', () => {
    const c = build({
      attributes: { forca: 0, destreza: 0, constituicao: 0, inteligencia: 0, sabedoria: 0, carisma: 2 },
      classes: [{ classId: 'guerreiro', level: 1 }],
      effects: [
        { id: 'a', name: 'A', active: true, alwaysActive: false, duration: 'Cena', modifiers: { ...ZERO_MODS, attack: 3 } },
        { id: 'b', name: 'B', active: true, alwaysActive: false, duration: 'Cena', modifiers: { ...ZERO_MODS, attack: '1+@car' } },
      ],
    })
    const d = deriveCharacter(c)
    // 3 + (1 + car 2) = 6
    expect(d.globalAttackBonus).toBe(6)
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

describe('skillChoiceLimit', () => {
  it('soma perícias à escolha de classe, raça e Inteligência', () => {
    const c = build({
      race: { raceId: 'humano' }, // 2 perícias
      classes: [{ classId: 'guerreiro', level: 1 }], // 2 perícias
    })
    // Int final 0: guerreiro 2 + humano 2 = 4
    expect(skillChoiceLimit(c, 0).limit).toBe(4)
  })

  it('soma a Inteligência final passada (não conta Int negativa)', () => {
    const c = build({ classes: [{ classId: 'guerreiro', level: 1 }] })
    expect(skillChoiceLimit(c, 3).limit).toBe(5) // 2 + 3
    expect(skillChoiceLimit(c, -2).limit).toBe(2) // 2 + 0
  })

  it('desconta 1 quando a raça troca perícia por poder (humano)', () => {
    const c = build({
      race: { raceId: 'humano' },
      classes: [{ classId: 'guerreiro', level: 1 }],
      racePowerForSkill: true,
    })
    // 2 (humano) - 1 (troca) + 2 (guerreiro) = 3
    expect(skillChoiceLimit(c, 0).limit).toBe(3)
  })

  it('ignora a troca para raças que não permitem (kliren)', () => {
    const c = build({ race: { raceId: 'kliren' }, racePowerForSkill: true })
    // kliren concede 1 e não permite troca → 1
    expect(skillChoiceLimit(c, 0).limit).toBe(1)
  })

  it('expõe a raça (e a troca) nas fontes do limite', () => {
    const c = build({
      race: { raceId: 'osteon' }, // 1 perícia, permite troca
      racePowerForSkill: true,
    })
    const { limit, sources } = skillChoiceLimit(c, 0)
    expect(limit).toBe(0) // 1 - 1
    expect(sources).toContainEqual({ name: 'Raça', value: 1 })
    expect(sources).toContainEqual({ name: 'Troca por poder', value: -1 })
  })
})
