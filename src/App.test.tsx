import 'fake-indexeddb/auto'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renderiza a lista de fichas', async () => {
    render(<App />)
    expect(
      await screen.findByRole('heading', { name: /minhas fichas/i }),
    ).toBeInTheDocument()
  })
})
