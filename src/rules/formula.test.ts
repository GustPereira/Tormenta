import { describe, expect, it } from 'vitest'
import { resolveValue, type FormulaContext } from './formula'

const ctx: FormulaContext = {
  attributes: { forca: 1, destreza: 2, constituicao: 0, inteligencia: 4, sabedoria: 0, carisma: 3 },
  level: 8,
}

describe('resolveValue', () => {
  it('número passa direto', () => {
    expect(resolveValue(5, ctx)).toBe(5)
    expect(resolveValue(-2, ctx)).toBe(-2)
  })

  it('resolve tokens de atributo', () => {
    expect(resolveValue('@car', ctx)).toBe(3)
    expect(resolveValue('@int', ctx)).toBe(4)
  })

  it('resolve nível e meio nível', () => {
    expect(resolveValue('@nivel', ctx)).toBe(8)
    expect(resolveValue('@meionivel', ctx)).toBe(4)
  })

  it('soma e subtrai', () => {
    expect(resolveValue('@car + 2', ctx)).toBe(5)
    expect(resolveValue('@des - 1', ctx)).toBe(1)
    expect(resolveValue('@car + @des', ctx)).toBe(5)
  })

  it('token desconhecido vira 0; fórmula vazia/invalida vira 0', () => {
    expect(resolveValue('@xyz', ctx)).toBe(0)
    expect(resolveValue('', ctx)).toBe(0)
    expect(resolveValue('abc', ctx)).toBe(0)
  })
})
