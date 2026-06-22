import { describe, expect, it } from 'vitest'
import { createBlankCharacter, type Character, type InventoryItem } from '../schema'
import {
  Effect,
  ItemEffect,
  aggregateActiveModifiers,
  collectEffects,
  describeModifiers,
} from './effect'

function item(over: Partial<InventoryItem>): InventoryItem {
  return {
    id: 'i',
    name: 'Item',
    quantity: 1,
    spaces: 0,
    equipped: false,
    equipmentType: '',
    attack: null,
    proficiency: '',
    activeEffect: false,
    modifiers: { attributes: {}, skills: {}, attack: 0, damage: 0, allSkills: 0, resistance: 0, trainedSkills: [], hitPoints: 0, mana: 0, defense: 0, penalty: 0, movement: 0, damageReduction: 0 },
    notes: '',
    ...over,
  }
}

describe('Effect / ItemEffect', () => {
  it('Effect avulso é editável e ativável', () => {
    const e = new Effect({ id: 'e', name: 'Bênção', active: true, modifiers: { attributes: {}, skills: {}, attack: 0, damage: 0, allSkills: 0, resistance: 0, trainedSkills: [], hitPoints: 0, mana: 0, defense: 0, penalty: 0, movement: 0, damageReduction: 0 } })
    expect(e.editable).toBe(true)
    expect(e.isActive()).toBe(true)
    expect(e.sourceLabel).toBe('Efeito')
  })

  it('ItemEffect herda de Effect, não é editável e reflete activeEffect', () => {
    const e = new ItemEffect(item({ name: 'Espada', activeEffect: true }))
    expect(e).toBeInstanceOf(Effect)
    expect(e.editable).toBe(false)
    expect(e.sourceLabel).toBe('Item')
    expect(e.isActive()).toBe(true)
  })
})

describe('collectEffects + aggregateActiveModifiers', () => {
  it('agrega itens ativos e efeitos avulsos ativos, ignora inativos', () => {
    const c: Character = {
      ...createBlankCharacter(),
      inventory: [
        item({ id: 'a', activeEffect: true, modifiers: { attributes: { forca: 2 }, skills: { atletismo: 1 }, attack: 0, damage: 0, allSkills: 0, resistance: 0, trainedSkills: [], hitPoints: 5, mana: 0, defense: 1, penalty: 0, movement: 0, damageReduction: 0 } }),
        item({ id: 'b', activeEffect: false, modifiers: { attributes: { forca: 99 }, skills: {}, attack: 0, damage: 0, allSkills: 0, resistance: 0, trainedSkills: [], hitPoints: 99, mana: 0, defense: 0, penalty: 0, movement: 0, damageReduction: 0 } }),
      ],
      effects: [
        { id: 'e1', name: 'Bênção', active: true, alwaysActive: false, duration: 'Cena', modifiers: { attributes: { forca: 1 }, skills: {}, attack: 0, damage: 0, allSkills: 0, resistance: 0, trainedSkills: [], hitPoints: 0, mana: 3, defense: 0, penalty: 0, movement: 0, damageReduction: 0 } },
        { id: 'e2', name: 'Desligado', active: false, alwaysActive: false, duration: 'Cena', modifiers: { attributes: { forca: 50 }, skills: {}, attack: 0, damage: 0, allSkills: 0, resistance: 0, trainedSkills: [], hitPoints: 0, mana: 0, defense: 0, penalty: 0, movement: 0, damageReduction: 0 } },
      ],
    }
    const agg = aggregateActiveModifiers(collectEffects(c))
    expect(agg.attributes.forca).toBe(3) // 2 (item) + 1 (efeito); inativos ignorados
    expect(agg.hitPoints).toBe(5)
    expect(agg.mana).toBe(3)
    expect(agg.defense).toBe(1)
    expect(agg.skills.atletismo).toBe(1)
  })
})

describe('describeModifiers', () => {
  it('resume os modificadores em texto', () => {
    const txt = describeModifiers({ attributes: { forca: 2 }, skills: {}, attack: 0, damage: 0, allSkills: 0, resistance: 0, trainedSkills: [], hitPoints: 5, mana: 0, defense: -1, penalty: 0, movement: 0, damageReduction: 0 })
    expect(txt).toContain('For +2')
    expect(txt).toContain('PV +5')
    expect(txt).toContain('Defesa -1')
  })
  it('indica quando não há modificadores', () => {
    expect(describeModifiers({ attributes: {}, skills: {}, attack: 0, damage: 0, allSkills: 0, resistance: 0, trainedSkills: [], hitPoints: 0, mana: 0, defense: 0, penalty: 0, movement: 0, damageReduction: 0 })).toBe('sem modificadores')
  })
})
