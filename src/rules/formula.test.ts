import { describe, expect, it } from 'vitest'
import { resolveDamage, resolveValue, type FormulaContext } from './formula'

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

describe('resolveDamage', () => {
  const dmgCtx: FormulaContext = {
    attributes: { forca: 2, destreza: 1, constituicao: 0, inteligencia: 0, sabedoria: 0, carisma: 3 },
    level: 4,
  }

  it('mantém os dados e soma tokens/números num modificador', () => {
    expect(resolveDamage('1d8+@for+3', dmgCtx)).toBe('1d8+5') // For 2 + 3
    expect(resolveDamage('2d6+@for', dmgCtx)).toBe('2d6+2')
    expect(resolveDamage('1d12', dmgCtx)).toBe('1d12')
  })

  it('subtração e modificador zero', () => {
    expect(resolveDamage('1d8-1', dmgCtx)).toBe('1d8-1')
    expect(resolveDamage('1d8+@for-2', dmgCtx)).toBe('1d8') // 2 - 2 = 0, sem modificador
  })

  it('vários dados e fórmula só numérica', () => {
    expect(resolveDamage('1d6+1d4+@des', dmgCtx)).toBe('1d6+1d4+1')
    expect(resolveDamage('@for+3', dmgCtx)).toBe('5') // sem dados → número
    expect(resolveDamage('', dmgCtx)).toBe('')
  })
})
