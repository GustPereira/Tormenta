import { describe, expect, it } from 'vitest'
import { createBlankCharacter, CURRENT_SCHEMA_VERSION } from './character'
import { CharacterParseError, parseCharacter } from './migrate'

describe('createBlankCharacter', () => {
  it('cria uma ficha válida com a versão atual do schema', () => {
    const c = createBlankCharacter()
    expect(c.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
    expect(c.id).toBeTruthy()
    expect(c.attributes.forca).toBe(0)
    expect(c.classes).toEqual([])
  })

  it('aceita um nome customizado', () => {
    expect(createBlankCharacter('Arsenal').name).toBe('Arsenal')
  })
})

describe('parseCharacter', () => {
  it('faz round-trip de uma ficha em branco serializada para JSON', () => {
    const original = createBlankCharacter('Vladislpolski')
    const json = JSON.parse(JSON.stringify(original))
    const parsed = parseCharacter(json)
    expect(parsed).toEqual(original)
  })

  it('aplica defaults para campos ausentes', () => {
    const minimal = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      id: 'abc',
      name: 'Teste',
      meta: { createdAt: '2020-01-01', updatedAt: '2020-01-01' },
      attributes: {
        forca: 1,
        destreza: 0,
        constituicao: 0,
        inteligencia: 0,
        sabedoria: 0,
        carisma: 0,
      },
    }
    const parsed = parseCharacter(minimal)
    expect(parsed.trainedSkills).toEqual([])
    expect(parsed.money).toBe(0)
    expect(parsed.race).toBeNull()
  })

  it('rejeita conteúdo que não é objeto', () => {
    expect(() => parseCharacter('xpto')).toThrow(CharacterParseError)
    expect(() => parseCharacter(null)).toThrow(CharacterParseError)
  })

  it('rejeita ficha com atributo inválido', () => {
    const bad = { ...createBlankCharacter(), attributes: { forca: 'muito' } }
    expect(() => parseCharacter(JSON.parse(JSON.stringify(bad)))).toThrow(
      CharacterParseError,
    )
  })

  it('migra uma ficha v1 (spells objeto, powers) para v2', () => {
    const v1 = {
      schemaVersion: 1,
      id: 'abc',
      name: 'Antiga',
      meta: { createdAt: '2020-01-01', updatedAt: '2020-01-01' },
      attributes: {
        forca: 0,
        destreza: 0,
        constituicao: 0,
        inteligencia: 0,
        sabedoria: 0,
        carisma: 0,
      },
      powers: ['Ataque Especial'],
      spells: { known: ['Bola de Fogo'], prepared: ['Bola de Fogo'] },
    }
    const parsed = parseCharacter(v1)
    expect(parsed.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
    expect(Array.isArray(parsed.spells)).toBe(true)
    expect(parsed.spells[0]).toMatchObject({ name: 'Bola de Fogo', circle: 1, prepared: true })
    expect(parsed.abilities[0]).toMatchObject({ name: 'Ataque Especial', group: 'classe' })
    expect('powers' in parsed).toBe(false)
  })

  it('rejeita versão de schema desconhecida', () => {
    const future = { ...createBlankCharacter(), schemaVersion: 999 }
    expect(() => parseCharacter(JSON.parse(JSON.stringify(future)))).toThrow(
      CharacterParseError,
    )
  })
})
