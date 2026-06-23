import { useState } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createBlankCharacter, type Character } from '../../schema'
import { InventoryPanel } from './InventoryPanel'

/** Harness controlado: aplica o updater no estado, como o store faz. */
function Harness() {
  const [character, setCharacter] = useState<Character>(createBlankCharacter())
  return <InventoryPanel character={character} update={(fn) => setCharacter((c) => fn(c))} />
}

describe('InventoryPanel — catálogo em modal', () => {
  it('abre o catálogo num modal, adiciona o item e fecha o modal', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    // Não há modal antes de abrir.
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    // Abre o catálogo do primeiro grupo (Armas).
    await user.click(screen.getAllByRole('button', { name: 'Catálogo' })[0])
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAccessibleName('Catálogo — Armas')

    // Escolhe a Adaga (1ª arma do catálogo) dentro do modal.
    const adaga = within(dialog).getByText('Adaga').closest('li')!
    // Os atributos da arma aparecem ao lado do nome.
    expect(adaga).toHaveTextContent('1d4')
    expect(adaga).toHaveTextContent('Perfuração')
    await user.click(within(adaga).getByRole('button', { name: '+ Adicionar' }))

    // O modal fecha e a Adaga passa a constar no inventário.
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText(/1× Adaga/)).toBeInTheDocument()
  })

  it('fecha o modal pelo ✕ sem adicionar nada', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getAllByRole('button', { name: 'Catálogo' })[0])
    await user.click(screen.getByRole('button', { name: 'Fechar' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByText(/1× Adaga/)).not.toBeInTheDocument()
  })
})
