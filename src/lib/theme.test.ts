import { describe, expect, it } from 'vitest'
import { buildThemeStyle, generateAccentVars, getFontStack } from './theme'

describe('generateAccentVars', () => {
  it('gera os 11 degraus da escala como hex válidos', () => {
    const vars = generateAccentVars('#2f6fd6')
    const keys = Object.keys(vars)
    expect(keys).toHaveLength(11)
    expect(keys).toContain('--color-tormenta-500')
    for (const v of Object.values(vars)) {
      expect(v).toMatch(/^#[0-9a-f]{6}$/)
    }
  })

  it('degraus baixos são mais claros que degraus altos', () => {
    const v = generateAccentVars('#2f9e57')
    // soma dos canais: 100 (claro) > 900 (escuro)
    const sum = (hex: string) =>
      parseInt(hex.slice(1, 3), 16) + parseInt(hex.slice(3, 5), 16) + parseInt(hex.slice(5, 7), 16)
    expect(sum(v['--color-tormenta-100'])).toBeGreaterThan(sum(v['--color-tormenta-900']))
  })

  it('usa fallback para cor inválida', () => {
    expect(Object.keys(generateAccentVars('não-é-cor'))).toHaveLength(11)
  })
})

describe('getFontStack', () => {
  it('retorna a stack da fonte e cai no padrão se desconhecida', () => {
    expect(getFontStack('sans')).toContain('Inter')
    expect(getFontStack('xpto')).toContain('Cinzel')
  })
})

describe('buildThemeStyle', () => {
  it('inclui variáveis de cor, fundo da página, cards e a fonte', () => {
    const style = buildThemeStyle({
      pageBg: '#101010',
      cardBg: '#202020',
      cardBorder: '#303030',
      accent: '#c23434',
      textColor: '#eeeeee',
      mutedColor: '#999999',
      buttonColor: '#555555',
      buttonTextColor: '#fafafa',
      inputBg: '#111111',
      inputText: '#dddddd',
      fontId: 'lexend',
    }) as Record<string, string>
    expect(style['--color-tormenta-500']).toMatch(/^#/)
    expect(style.backgroundColor).toBe('#101010')
    expect(style['--card-bg']).toBe('#202020')
    expect(style['--card-border']).toBe('#303030')
    expect(style['--text']).toBe('#eeeeee')
    expect(style.color).toBe('#eeeeee')
    expect(style['--color-stone-400']).toBe('#999999')
    expect(style['--btn-bg']).toBe('#555555')
    expect(style['--btn-text']).toBe('#fafafa')
    expect(style['--input-bg']).toBe('#111111')
    expect(style['--input-text']).toBe('#dddddd')
    expect(style.fontFamily).toContain('Lexend')
    expect(style['--font-display']).toContain('Lexend')
  })
})
