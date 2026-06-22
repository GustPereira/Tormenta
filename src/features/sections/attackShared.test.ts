import { describe, expect, it } from 'vitest'
import { createBlankCharacter, EMPTY_ITEM_MODIFIERS, type Character } from '../../schema'
import { deriveCharacter, type FormulaContext } from '../../rules'
import { attackTotal, baseContributions } from './attackShared'

function build(overrides: Partial<Character>): Character {
  return { ...createBlankCharacter(), ...overrides }
}

describe('baseContributions (ataque com base de perícia)', () => {
  it('ataque corpo a corpo (Luta + FOR) iguala o total da perícia Luta', () => {
    const c = build({
      attributes: { forca: 5, destreza: 0, constituicao: 0, inteligencia: 0, sabedoria: 0, carisma: 0 },
      classes: [{ classId: 'guerreiro', level: 8 }], // treina Luta; ½ nível 4, treino +4
      // Efeito que dá +1 em todas as perícias (entra no total de Luta).
      effects: [
        {
          id: 'e', name: 'Bênção', active: true, alwaysActive: false, duration: 'Cena',
          modifiers: { ...EMPTY_ITEM_MODIFIERS, allSkills: 1 },
        },
      ],
    })
    const d = deriveCharacter(c)
    const luta = d.skills.find((s) => s.id === 'luta')!
    const ctx: FormulaContext = {
      attributes: d.finalAttributes,
      level: d.totalLevel,
      shieldDefense: d.shieldDefense,
    }
    // Luta: ½ nível 4 + Força 5 + treino 4 + geral 1 = 14
    expect(luta.total).toBe(14)
    // O ataque da arma deve bater com a perícia Luta.
    expect(attackTotal(baseContributions('luta-for', d, c, ctx))).toBe(14)
  })
})
