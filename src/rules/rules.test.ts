import { describe, expect, it } from 'vitest'
import { halfLevel } from './core'
import { skillBonus, trainingBonus } from './skills'
import { defense } from './defense'
import { maxHitPoints, maxMana } from './health'

describe('halfLevel', () => {
  it('é o nível dividido por 2, arredondado para baixo', () => {
    expect(halfLevel(1)).toBe(0)
    expect(halfLevel(2)).toBe(1)
    expect(halfLevel(7)).toBe(3)
    expect(halfLevel(20)).toBe(10)
  })
})

describe('trainingBonus', () => {
  it('é 0 quando não treinado', () => {
    expect(trainingBonus(10, false)).toBe(0)
  })
  it('escala +2 / +4 / +6 por faixa de nível quando treinado', () => {
    expect(trainingBonus(1, true)).toBe(2)
    expect(trainingBonus(6, true)).toBe(2)
    expect(trainingBonus(7, true)).toBe(4)
    expect(trainingBonus(14, true)).toBe(4)
    expect(trainingBonus(15, true)).toBe(6)
  })
})

describe('skillBonus', () => {
  it('soma meio nível + mod de atributo + treino + outros', () => {
    // nível 1, Des +3, treinada: 0 + 3 + 2 = 5
    expect(
      skillBonus({ level: 1, attributeMod: 3, trained: true }),
    ).toBe(5)
    // nível 8, Int +4, não treinada, +2 de outros: 4 + 4 + 0 + 2 = 10
    expect(
      skillBonus({ level: 8, attributeMod: 4, trained: false, otherBonus: 2 }),
    ).toBe(10)
  })
})

describe('defense', () => {
  it('é 10 + meio nível + Des + armadura + escudo + outros', () => {
    // base nível 1, Des 0: 10
    expect(defense({ level: 1, dexMod: 0 })).toBe(10)
    // nível 10, Des +4, armadura +5, escudo +2: 10 + 5 + 4 + 5 + 2 = 26
    expect(
      defense({ level: 10, dexMod: 4, armorBonus: 5, shieldBonus: 2 }),
    ).toBe(26)
  })
})

describe('maxHitPoints', () => {
  it('nível 1: PV inicial + mod Con', () => {
    expect(
      maxHitPoints([{ pvInicial: 16, pvPorNivel: 4, level: 1 }], 2),
    ).toBe(18)
  })
  it('níveis seguintes somam (PV por nível + mod Con)', () => {
    // Guerreiro nível 3, Con +2: 16 + 2 + 2*(4+2) = 30
    expect(
      maxHitPoints([{ pvInicial: 16, pvPorNivel: 4, level: 3 }], 2),
    ).toBe(30)
  })
  it('multiclasse: só a primeira classe usa PV inicial', () => {
    // Guerreiro 2 / Ladino 1, Con +1
    // base: 16 + 1; guerreiro perLevel (2-1=1): 1*(4+1)=5; ladino (1): 1*(3+1)=4 => 26
    expect(
      maxHitPoints(
        [
          { pvInicial: 16, pvPorNivel: 4, level: 2 },
          { pvInicial: 12, pvPorNivel: 3, level: 1 },
        ],
        1,
      ),
    ).toBe(26)
  })
  it('retorna 0 sem classes', () => {
    expect(maxHitPoints([], 3)).toBe(0)
  })
})

describe('maxMana', () => {
  it('soma PM por nível de cada classe', () => {
    expect(maxMana([{ pmPorNivel: 3, level: 5 }])).toBe(15)
    expect(
      maxMana([
        { pmPorNivel: 3, level: 2 },
        { pmPorNivel: 4, level: 1 },
      ]),
    ).toBe(10)
  })
})
