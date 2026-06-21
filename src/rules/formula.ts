import type { Attributes } from '../schema'

/** Contexto para resolver referências dinâmicas (ex.: @car). */
export interface FormulaContext {
  attributes: Attributes
  level: number
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
export const FORMULA_TOKENS = ['@for', '@des', '@con', '@int', '@sab', '@car', '@nivel', '@meionivel']

function tokenValue(raw: string, ctx: FormulaContext): number {
  const t = raw.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
  if (t === 'nivel') return ctx.level
  if (t === 'meionivel') return Math.floor(ctx.level / 2)
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
 * Resolve a parte numérica de uma expressão de **dano**, preservando os dados.
 * Os termos de dado (`NdM`, ex.: `1d8`, `2d6`) são mantidos; tokens (`@for`) e
 * números são resolvidos e somados num único modificador final.
 * Ex.: `"1d8+@for+3"` com Força 2 → `"1d8+5"`. `"@des+1"` → `"3"` (sem dados).
 */
export function resolveDamage(expr: string, ctx: FormulaContext): string {
  const trimmed = expr.trim()
  if (!trimmed) return ''
  const chunks = trimmed.match(/[+-]?\s*[^+-]+/g)
  if (!chunks) return trimmed

  const kept: string[] = []
  let numeric = 0
  let sawNumeric = false
  for (const chunk of chunks) {
    const sign = chunk.trim().startsWith('-') ? -1 : 1
    const body = chunk.replace(/^\s*[+-]\s*/, '').trim()
    if (!body) continue
    if (/^\d*d\d+$/i.test(body)) {
      // Termo de dado: mantém literal.
      kept.push((sign < 0 ? '-' : kept.length ? '+' : '') + body)
    } else if (/^@?[a-zA-ZÀ-ú]+$/.test(body) || /^\d+(?:\.\d+)?$/.test(body)) {
      // Token (@for) ou número: entra no modificador somado.
      numeric += sign * resolveValue(body, ctx)
      sawNumeric = true
    } else {
      // Termo desconhecido: mantém literal.
      kept.push((sign < 0 ? '-' : kept.length ? '+' : '') + body)
    }
  }

  let result = kept.join('')
  if (!result) return sawNumeric ? String(numeric) : trimmed
  if (sawNumeric && numeric !== 0) {
    result += numeric > 0 ? `+${numeric}` : `-${Math.abs(numeric)}`
  }
  return result
}
