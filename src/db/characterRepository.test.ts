import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from './database'
import {
  createCharacter,
  deleteCharacter,
  duplicateCharacter,
  getCharacter,
  listCharacters,
  saveCharacter,
} from './characterRepository'

beforeEach(async () => {
  await db.characters.clear()
})

describe('characterRepository', () => {
  it('cria e lista fichas', async () => {
    await createCharacter('Arsenal')
    const list = await listCharacters()
    expect(list).toHaveLength(1)
    expect(list[0].name).toBe('Arsenal')
  })

  it('carrega uma ficha pelo id, validada pelo schema', async () => {
    const created = await createCharacter('Sombra')
    const loaded = await getCharacter(created.id)
    expect(loaded?.name).toBe('Sombra')
    expect(loaded?.id).toBe(created.id)
  })

  it('retorna undefined para id inexistente', async () => {
    expect(await getCharacter('nao-existe')).toBeUndefined()
  })

  it('salva alterações e atualiza updatedAt', async () => {
    const created = await createCharacter('Lien')
    const edited = { ...created, name: 'Lien Mirkmoor' }
    const saved = await saveCharacter(edited)
    expect(saved.name).toBe('Lien Mirkmoor')
    expect(
      new Date(saved.meta.updatedAt).getTime(),
    ).toBeGreaterThanOrEqual(new Date(created.meta.updatedAt).getTime())
    expect((await getCharacter(created.id))?.name).toBe('Lien Mirkmoor')
  })

  it('duplica uma ficha com novo id e sufixo de cópia', async () => {
    const original = await createCharacter('Thwung')
    const copy = await duplicateCharacter(original.id)
    expect(copy.id).not.toBe(original.id)
    expect(copy.name).toBe('Thwung (cópia)')
    expect(await listCharacters()).toHaveLength(2)
  })

  it('remove uma ficha', async () => {
    const created = await createCharacter('Descartável')
    await deleteCharacter(created.id)
    expect(await listCharacters()).toHaveLength(0)
  })

  it('lista mais recentes primeiro', async () => {
    const a = await createCharacter('Primeiro')
    const b = await createCharacter('Segundo')
    // grava timestamps explícitos para evitar empate no mesmo milissegundo
    await db.characters.put({ ...a, meta: { ...a.meta, updatedAt: '2025-01-02T00:00:00.000Z' } })
    await db.characters.put({ ...b, meta: { ...b.meta, updatedAt: '2025-01-01T00:00:00.000Z' } })
    const list = await listCharacters()
    expect(list.map((c) => c.id)).toEqual([a.id, b.id])
  })
})
