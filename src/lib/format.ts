/** Formata um número com sinal explícito: 3 → "+3", -1 → "−1", 0 → "+0". */
export function signed(n: number): string {
  return n >= 0 ? `+${n}` : `−${Math.abs(n)}`
}
