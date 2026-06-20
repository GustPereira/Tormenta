import { describe, expect, it } from 'vitest'
import { ATTRIBUTE_KEYS } from '../schema'
import {
  CLASSES,
  ORIGINS,
  RACES,
  RACES_BY_ID,
  RACE_TRAITS,
  SKILLS,
  SKILLS_BY_ID,
} from './index'

describe('catálogo de perícias', () => {
  it('tem 29 perícias com ids únicos', () => {
    expect(SKILLS).toHaveLength(29)
    expect(new Set(SKILLS.map((s) => s.id)).size).toBe(29)
  })
  it('usa apenas atributos válidos', () => {
    for (const s of SKILLS) {
      expect(ATTRIBUTE_KEYS).toContain(s.attribute)
    }
  })
})

describe('catálogo de classes', () => {
  it('tem 14 classes com ids únicos', () => {
    expect(CLASSES).toHaveLength(14)
    expect(new Set(CLASSES.map((c) => c.id)).size).toBe(14)
  })
  it('todas as perícias fixas existem no catálogo de perícias', () => {
    for (const c of CLASSES) {
      for (const skillId of c.pericasFixas) {
        expect(SKILLS_BY_ID[skillId], `${c.id} -> ${skillId}`).toBeDefined()
      }
    }
  })
  it('tem PV e PM positivos', () => {
    for (const c of CLASSES) {
      expect(c.pvInicial).toBeGreaterThan(0)
      expect(c.pvPorNivel).toBeGreaterThan(0)
      expect(c.pmPorNivel).toBeGreaterThan(0)
    }
  })
})

describe('catálogo de raças', () => {
  it('tem ids únicos', () => {
    expect(new Set(RACES.map((r) => r.id)).size).toBe(RACES.length)
  })
  it('usa apenas atributos válidos nos modificadores', () => {
    for (const r of RACES) {
      for (const key of Object.keys(r.attributeModifiers)) {
        expect(ATTRIBUTE_KEYS).toContain(key)
      }
    }
  })
})

describe('catálogo de origens', () => {
  it('tem origens com ids únicos', () => {
    expect(ORIGINS.length).toBeGreaterThan(50)
    expect(new Set(ORIGINS.map((o) => o.id)).size).toBe(ORIGINS.length)
  })
})

describe('traços de raça', () => {
  it('todo traço corresponde a uma raça do catálogo', () => {
    for (const t of RACE_TRAITS) {
      expect(RACES_BY_ID[t.id], t.id).toBeDefined()
    }
  })
  it('cobre todas as 18 raças do catálogo', () => {
    for (const r of RACES) {
      expect(RACE_TRAITS.find((t) => t.id === r.id), r.id).toBeDefined()
    }
  })
})
