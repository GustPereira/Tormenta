import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createBlankCharacter, EMPTY_ITEM_MODIFIERS, type Ability, type Character } from '../../schema'
import { AbilitiesPanel } from './AbilitiesPanel'

function ability(id: string, name: string): Ability {
  return {
    id, name, group: 'racial', notes: '', level: 1, mp: 0, acao: ['Ação Padrão'],
    duration: 'Cena', hasEffect: false, effectActive: false, alwaysActive: false,
    modifiers: { ...EMPTY_ITEM_MODIFIERS },
  }
}

function Harness({ initial }: { initial: Character }) {
  const [character, setCharacter] = useState<Character>(initial)
  return <AbilitiesPanel character={character} update={(fn) => setCharacter((c) => fn(c))} />
}

describe('AbilitiesPanel — reordenar arrastando', () => {
  it('move um poder ao soltar sobre outro do mesmo grupo', () => {
    const initial: Character = {
      ...createBlankCharacter(),
      abilities: [ability('a', 'Alfa'), ability('b', 'Beta'), ability('c', 'Gama')],
    }
    render(<Harness initial={initial} />)

    const cardOf = (name: string) => screen.getByText(name).closest('li')!
    const names = ['Alfa', 'Beta', 'Gama']
    const order = () =>
      screen.getAllByRole('listitem').map((li) => names.find((n) => li.textContent?.includes(n)))

    expect(order()).toEqual(['Alfa', 'Beta', 'Gama'])

    // Arrasta "Alfa" e solta sobre "Gama".
    fireEvent.dragStart(cardOf('Alfa'))
    fireEvent.drop(cardOf('Gama'))

    // arrayMove: Alfa vai para a posição de Gama → Beta, Gama, Alfa.
    expect(order()).toEqual(['Beta', 'Gama', 'Alfa'])
  })
})
