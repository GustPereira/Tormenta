import type { Attributes } from '../schema'

/** Contexto para resolver referências dinâmicas (ex.: @car). */
export interface FormulaContext {
  attributes: Attributes
  level: number
  /** Valor de defesa do escudo equipado (token @escudo). */
  shieldDefense?: number
}

const ATTR_TOKENS: Record<string, keyof Attributes> = {
  for: 'forca',
  des: 'destreza',
  con: 'constituicao',
  int: 'inteligencia',
  sab: 'sabedoria',
  car: 'carisma',
}

/** Tokens disponíveis para referências (para dicas na UI). */
export const FORMULA_TOKENS = ['@for', '@des', '@con', '@int', '@sab', '@car', '@nivel', '@meionivel', '@escudo']

function tokenValue(raw: string, ctx: FormulaContext): number {
  const t = raw.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
  if (t === 'nivel') return ctx.level
  if (t === 'meionivel') return Math.floor(ctx.level / 2)
  if (t === 'escudo') return ctx.shieldDefense ?? 0
  const attr = ATTR_TOKENS[t]
  return attr ? ctx.attributes[attr] : 0
}

/**
 * Resolve um valor de modificador. Números passam direto; strings são fórmulas
 * com tokens (@car, @nivel…) e soma/subtração (ex.: "@car + 2"). `*`/`/` não são
 * suportados nesta fase.
 */
export function resolveValue(value: number | string, ctx: FormulaContext): number {
  if (typeof value === 'number') return value
  const expr = value.trim()
  if (!expr) return 0
  const replaced = expr.replace(/@([a-zA-ZÀ-ú]+)/g, (_, raw) => String(tokenValue(raw, ctx)))

  let total = 0
  let matched = false
  const re = /([+-]?)\s*(\d+(?:\.\d+)?)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(replaced))) {
    matched = true
    total += (m[1] === '-' ? -1 : 1) * Number(m[2])
  }
  return matched ? Math.trunc(total) : 0
}

/** Verdadeiro se o valor é uma fórmula (string), não um número fixo. */
export function isFormula(value: number | string): value is string {
  return typeof value === 'string'
}

/**
 * Mescla várias expressões de **dano** numa só: agrupa os dados por tipo
 * (`NdM`) somando as quantidades, e soma tokens (`@for`)/números num modificador
 * final. Os dados saem ordenados por tamanho (maior primeiro).
 * Ex.: `mergeDamage(['1d8', '1d8'])` → `"2d8"`;
 *      `mergeDamage(['1d8', '1d8+1d4+@car'])` com Car 3 → `"2d8+1d4+3"`.
 */
export function mergeDamage(parts: Array<string | number>, ctx: FormulaContext): string {
  const dice = new Map<number, number>() // tamanho do dado -> quantidade
  let numeric = 0
  let sawNumeric = false

  for (const part of parts) {
    const trimmed = String(part).trim()
    if (!trimmed) continue
    const chunks = trimmed.match(/[+-]?\s*[^+-]+/g)
    if (!chunks) continue
    for (const chunk of chunks) {
      const sign = chunk.trim().startsWith('-') ? -1 : 1
      const body = chunk.replace(/^\s*[+-]\s*/, '').trim()
      if (!body) continue
      const d = body.match(/^(\d*)d(\d+)$/i)
      if (d) {
        const count = d[1] === '' ? 1 : Number(d[1])
        const size = Number(d[2])
        dice.set(size, (dice.get(size) ?? 0) + sign * count)
      } else if (/^@?[a-zA-ZÀ-ú]+$/.test(body) || /^\d+(?:\.\d+)?$/.test(body)) {
        numeric += sign * resolveValue(body, ctx)
        sawNumeric = true
      }
      // termos desconhecidos são ignorados
    }
  }

  const sizes = [...dice.keys()].filter((s) => (dice.get(s) ?? 0) !== 0).sort((a, b) => b - a)
  let result = ''
  for (const size of sizes) {
    const count = dice.get(size)!
    result += `${count < 0 ? '-' : result ? '+' : ''}${Math.abs(count)}d${size}`
  }
  if (numeric !== 0) {
    result += result ? (numeric > 0 ? `+${numeric}` : `-${Math.abs(numeric)}`) : String(numeric)
  } else if (!result && sawNumeric) {
    result = '0'
  }
  return result
}

/**
 * Resolve uma expressão de dano isolada (preserva os dados, resolve tokens/
 * números). Ex.: `"1d8+@for+3"` com Força 2 → `"1d8+5"`.
 */
export function resolveDamage(expr: string, ctx: FormulaContext): string {
  return mergeDamage([expr], ctx)
}
