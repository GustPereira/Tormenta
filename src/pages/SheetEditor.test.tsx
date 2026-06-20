import 'fake-indexeddb/auto'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { db, saveCharacter } from '../db'
import { createBlankCharacter } from '../schema'
import { SheetEditor } from './SheetEditor'

function renderAt(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/ficha/${id}`]}>
      <Routes>
        <Route path="/ficha/:id" element={<SheetEditor />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(async () => {
  await db.characters.clear()
})

describe('SheetEditor (página única)', () => {
  it('mostra PV/PM/Defesa derivados de um guerreiro nível 3', async () => {
    const c = {
      ...createBlankCharacter('Guerreiro Teste'),
      attributes: { forca: 3, destreza: 2, constituicao: 2, inteligencia: 0, sabedoria: 0, carisma: 0 },
      classes: [{ classId: 'guerreiro', level: 3 }],
    }
    await saveCharacter(c)
    renderAt(c.id)

    expect(await screen.findByDisplayValue('Guerreiro Teste')).toBeInTheDocument()
    // PV = 36, PM = 9, Defesa = 13
    expect(screen.getByText('/ 36')).toBeInTheDocument()
    expect(screen.getByText('/ 9')).toBeInTheDocument()
    const def = screen.getByText('Defesa').parentElement!
    expect(within(def).getByText('13')).toBeInTheDocument()
  })

  it('recalcula o bônus de perícia ao treinar', async () => {
    const c = {
      ...createBlankCharacter('Aprendiz'),
      attributes: { forca: 4, destreza: 0, constituicao: 0, inteligencia: 0, sabedoria: 0, carisma: 0 },
      classes: [{ classId: 'guerreiro', level: 1 }],
    }
    await saveCharacter(c)
    const user = userEvent.setup()
    renderAt(c.id)

    const checkbox = await screen.findByLabelText(/treinar atletismo/i)
    const row = checkbox.closest('li')!
    expect(within(row).getByText('+4')).toBeInTheDocument()

    await user.click(checkbox)
    await waitFor(() => expect(within(row).getByText('+6')).toBeInTheDocument())
  })

  it('mostra a aba Configurações com ações da ficha', async () => {
    const c = createBlankCharacter('Config Teste')
    await saveCharacter(c)
    const user = userEvent.setup()
    renderAt(c.id)

    await user.click(await screen.findByRole('tab', { name: /configurações/i }))
    expect(screen.getByRole('button', { name: /restaurar pv\/pm/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /excluir ficha/i })).toBeInTheDocument()
  })

  it('permite selecionar uma origem do catálogo', async () => {
    const c = createBlankCharacter('Origem Teste')
    await saveCharacter(c)
    renderAt(c.id)

    const select = (await screen.findByText('Origem')).parentElement!.querySelector('select')!
    expect(select).toBeInTheDocument()
    // o catálogo de origens deve ter populado as opções
    expect(select.options.length).toBeGreaterThan(50)
  })
})
