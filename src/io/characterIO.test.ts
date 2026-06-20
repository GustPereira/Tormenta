import { describe, expect, it } from 'vitest'
import { createBlankCharacter, CharacterParseError } from '../schema'
import {
  characterFileName,
  exportCharacterToJson,
  importCharacterFromJson,
} from './characterIO'

describe('characterIO', () => {
  it('faz round-trip export -> import', () => {
    const original = createBlankCharacter('Aventureiro')
    const json = exportCharacterToJson(original)
    const back = importCharacterFromJson(json)
    expect(back).toEqual(original)
  })

  it('rejeita JSON malformado', () => {
    expect(() => importCharacterFromJson('{ nao json')).toThrow(
      CharacterParseError,
    )
  })

  it('rejeita JSON válido que não é uma ficha', () => {
    expect(() => importCharacterFromJson('{"foo":1}')).toThrow(
      CharacterParseError,
    )
  })

  it('gera nome de arquivo com slug do nome da ficha', () => {
    const c = createBlankCharacter('Lien Mirkmoor!')
    expect(characterFileName(c)).toBe('lien-mirkmoor.t20.json')
  })

  it('remove acentos no nome de arquivo', () => {
    const c = createBlankCharacter('Inça Vaký')
    expect(characterFileName(c)).toBe('inca-vaky.t20.json')
  })

  it('usa fallback quando o nome não tem caracteres válidos', () => {
    const c = createBlankCharacter('!!!')
    expect(characterFileName(c)).toBe('ficha.t20.json')
  })
})
