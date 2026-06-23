import { describe, expect, it } from 'vitest'
import { arrayMove } from './reorder'

const ids = (arr: { id: string }[]) => arr.map((x) => x.id).join('')

describe('arrayMove', () => {
  const base = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }]

  it('move um item para a posição do alvo (arrastar para baixo)', () => {
    expect(ids(arrayMove(base, 'a', 'c'))).toBe('bcad')
  })

  it('move um item para a posição do alvo (arrastar para cima)', () => {
    expect(ids(arrayMove(base, 'd', 'b'))).toBe('adbc')
  })

  it('não altera quando origem e alvo são iguais', () => {
    expect(arrayMove(base, 'b', 'b')).toBe(base)
  })

  it('não altera quando algum id não existe', () => {
    expect(arrayMove(base, 'x', 'b')).toBe(base)
    expect(arrayMove(base, 'a', 'z')).toBe(base)
  })

  it('preserva itens fora do subgrupo ao reordenar (filtro estável)', () => {
    // Grupos intercalados: 'r' (racial) e 'c' (classe).
    const list = [
      { id: 'r1', g: 'r' }, { id: 'c1', g: 'c' }, { id: 'r2', g: 'r' }, { id: 'c2', g: 'c' },
    ]
    // Arrasta r2 para cima de r1 (reordenar dentro do grupo racial).
    const moved = arrayMove(list, 'r2', 'r1')
    expect(moved.filter((x) => x.g === 'r').map((x) => x.id)).toEqual(['r2', 'r1'])
    expect(moved.filter((x) => x.g === 'c').map((x) => x.id)).toEqual(['c1', 'c2'])
  })
})
