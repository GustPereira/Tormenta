import type { CSSProperties } from 'react'
import type { Theme } from '../schema'

/** Opções de fonte da ficha (a fonte escolhida estiliza toda a ficha). */
export const FONT_OPTIONS = [
  { id: 'cinzel', label: 'Cinzel (medieval)', stack: "'Cinzel', serif" },
  { id: 'medievalsharp', label: 'MedievalSharp', stack: "'MedievalSharp', cursive" },
  { id: 'serif', label: 'Serifada', stack: "Georgia, 'Times New Roman', serif" },
  { id: 'sans', label: 'Moderna', stack: "Inter, system-ui, sans-serif" },
  { id: 'lexend', label: 'Lexend', stack: "'Lexend', sans-serif" },
] as const

export const DEFAULT_FONT_ID = 'cinzel'
export const DEFAULT_ACCENT = '#c23434'

/** Tons (lightness 0–1) de cada degrau da escala, do mais claro ao mais escuro. */
const LIGHTNESS: Record<number, number> = {
  50: 0.96, 100: 0.92, 200: 0.84, 300: 0.74, 400: 0.64,
  500: 0.55, 600: 0.47, 700: 0.4, 800: 0.33, 900: 0.27, 950: 0.18,
}

export function getFontStack(fontId: string): string {
  return FONT_OPTIONS.find((f) => f.id === fontId)?.stack ?? FONT_OPTIONS[0].stack
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

/** #rgb ou #rrggbb -> [r,g,b] 0–255, ou null se inválido. */
function hexToRgb(hex: string): [number, number, number] | null {
  let h = hex.trim().replace(/^#/, '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0
  const l = (max + min) / 2
  const d = max - min
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  return [h, s, l]
}

function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let [r, g, b] = [0, 0, 0]
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  const to = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, '0')
  return `#${to(r)}${to(g)}${to(b)}`
}

/**
 * Gera a escala `--color-tormenta-50..950` a partir de uma cor base, preservando
 * matiz e saturação e variando a luminosidade. Assim, escolher uma cor recolore
 * toda a ficha (que usa as utilidades `tormenta-*`).
 */
export function generateAccentVars(hex: string): Record<string, string> {
  const rgb = hexToRgb(hex) ?? hexToRgb(DEFAULT_ACCENT)!
  const [h, s] = rgbToHsl(...rgb)
  const sat = clamp(s, 0.15, 0.95)
  const vars: Record<string, string> = {}
  for (const [step, l] of Object.entries(LIGHTNESS)) {
    vars[`--color-tormenta-${step}`] = hslToHex(h, sat, l)
  }
  return vars
}

/**
 * Monta o style aplicado ao container do editor: fundo da página, fonte e as
 * variáveis CSS que os cards/seções usam (`--card-bg`, `--card-border`) e a
 * escala de destaque (`--color-tormenta-*`).
 */
export function buildThemeStyle(theme: Theme): CSSProperties {
  const stack = getFontStack(theme.fontId)
  return {
    ...generateAccentVars(theme.accent),
    '--card-bg': theme.cardBg,
    '--card-border': theme.cardBorder,
    '--text': theme.textColor,
    '--btn-bg': theme.buttonColor,
    '--btn-text': theme.buttonTextColor,
    '--input-bg': theme.inputBg,
    '--input-text': theme.inputText,
    // Rótulos e textos secundários (Tailwind compila text-stone-* para essas vars).
    '--color-stone-300': theme.mutedColor,
    '--color-stone-400': theme.mutedColor,
    '--color-stone-500': theme.mutedColor,
    '--font-display': stack,
    fontFamily: stack,
    color: theme.textColor,
    backgroundColor: theme.pageBg,
  } as CSSProperties
}
